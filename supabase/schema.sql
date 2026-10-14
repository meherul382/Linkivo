-- Linkivo personal URL shortener schema.
-- Safe to re-run; does not drop existing tables or delete existing rows.
create extension if not exists pgcrypto;

alter table public.links add column if not exists is_active boolean not null default true;
alter table public.links add column if not exists clicks bigint not null default 0;
alter table public.links add column if not exists created_at timestamptz not null default now();
alter table public.links add column if not exists updated_at timestamptz not null default now();

create table if not exists public.click_events (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  country text, city text, device_type text, browser text, os text, referrer text, ip_hash text
);
create index if not exists links_slug_idx on public.links(slug);
create index if not exists click_events_link_id_idx on public.click_events(link_id);
create index if not exists click_events_clicked_at_idx on public.click_events(clicked_at desc);

alter table public.links enable row level security;
alter table public.click_events enable row level security;

create or replace function public.linkivo_create_link(p_slug text, p_destination_url text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_user uuid; v_link public.links%rowtype;
begin
  v_user := auth.uid();
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_slug is null or p_slug !~ '^[A-Za-z0-9_-]{3,40}$' then raise exception 'INVALID_SLUG'; end if;
  if p_destination_url is null or length(p_destination_url)>2048 or p_destination_url !~* '^https?://' then raise exception 'INVALID_URL'; end if;
  if exists(select 1 from public.links where slug=p_slug) then raise exception 'ALIAS_TAKEN'; end if;
  insert into public.links(slug,destination_url,title,is_active,clicks)
  values(p_slug,p_destination_url,null,true,0) returning * into v_link;
  return jsonb_build_object('slug',v_link.slug,'destination_url',v_link.destination_url,'created_at',v_link.created_at,'clicks',v_link.clicks);
end; $$;

create or replace function public.linkivo_list_links()
returns table(slug text,destination_url text,created_at timestamptz,clicks bigint,is_active boolean)
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  return query select l.slug,l.destination_url,l.created_at,l.clicks,l.is_active
    from public.links l where l.is_active=true order by l.created_at desc;
end; $$;

create or replace function public.linkivo_update_destination(p_slug text,p_destination_url text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_link public.links%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_destination_url is null or length(p_destination_url)>2048 or p_destination_url !~* '^https?://' then raise exception 'INVALID_URL'; end if;
  update public.links set destination_url=p_destination_url,updated_at=now()
   where slug=p_slug and is_active=true returning * into v_link;
  if not found then raise exception 'LINK_NOT_FOUND'; end if;
  return jsonb_build_object('slug',v_link.slug,'destination_url',v_link.destination_url,'updated_at',v_link.updated_at);
end; $$;

create or replace function public.linkivo_archive_link(p_slug text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  update public.links set is_active=false,updated_at=now() where slug=p_slug and is_active=true;
  return found;
end; $$;

create or replace function public.linkivo_resolve_link(p_slug text)
returns jsonb language sql security definer set search_path=public as $$
  select jsonb_build_object('id',l.id,'slug',l.slug,'destination_url',l.destination_url,'is_active',l.is_active,'clicks',l.clicks)
  from public.links l where l.slug=p_slug and l.is_active=true limit 1;
$$;

create or replace function public.linkivo_record_click(
 p_link_id uuid,p_country text,p_city text,p_device_type text,p_browser text,p_os text,p_referrer text,p_ip_hash text
) returns void language plpgsql security definer set search_path=public as $$
begin
 insert into public.click_events(link_id,country,city,device_type,browser,os,referrer,ip_hash)
 values(p_link_id,p_country,p_city,p_device_type,p_browser,p_os,p_referrer,p_ip_hash);
 update public.links set clicks=clicks+1,updated_at=now() where id=p_link_id;
end; $$;

create or replace function public.linkivo_get_analytics(p_slug text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_link public.links%rowtype; v_base text; v_today bigint; v_events bigint;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 select * into v_link from public.links where slug=p_slug;
 if not found then return null; end if;
 select count(*) into v_today from public.click_events where link_id=v_link.id and clicked_at >= date_trunc('day',now());
 select count(*) into v_events from public.click_events where link_id=v_link.id;
 return jsonb_build_object(
  'link',jsonb_build_object('slug',v_link.slug,'destination_url',v_link.destination_url,'clicks',v_link.clicks,'short_domain',null),
  'todayClicks',v_today,'trackedEvents',v_events,
  'countries',coalesce((select jsonb_agg(jsonb_build_array(country,n)) from (select coalesce(country,'Unknown') country,count(*) n from public.click_events where link_id=v_link.id group by 1 order by 2 desc limit 8) c),'[]'::jsonb),
  'devices',coalesce((select jsonb_agg(jsonb_build_array(device_type,n)) from (select coalesce(device_type,'Unknown') device_type,count(*) n from public.click_events where link_id=v_link.id group by 1 order by 2 desc limit 8) d),'[]'::jsonb),
  'browsers',coalesce((select jsonb_agg(jsonb_build_array(browser,n)) from (select coalesce(browser,'Unknown') browser,count(*) n from public.click_events where link_id=v_link.id group by 1 order by 2 desc limit 8) b),'[]'::jsonb),
  'recent',coalesce((select jsonb_agg(to_jsonb(e)) from (select clicked_at,country,device_type,browser from public.click_events where link_id=v_link.id order by clicked_at desc limit 20) e),'[]'::jsonb)
 );
end; $$;

revoke all on function public.linkivo_create_link(text,text) from public,anon,authenticated;
revoke all on function public.linkivo_list_links() from public,anon,authenticated;
revoke all on function public.linkivo_update_destination(text,text) from public,anon,authenticated;
revoke all on function public.linkivo_archive_link(text) from public,anon,authenticated;
revoke all on function public.linkivo_resolve_link(text) from public,anon,authenticated;
revoke all on function public.linkivo_record_click(uuid,text,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.linkivo_get_analytics(text) from public,anon,authenticated;

grant execute on function public.linkivo_create_link(text,text) to authenticated;
grant execute on function public.linkivo_list_links() to authenticated;
grant execute on function public.linkivo_update_destination(text,text) to authenticated;
grant execute on function public.linkivo_archive_link(text) to authenticated;
grant execute on function public.linkivo_get_analytics(text) to authenticated;
grant execute on function public.linkivo_resolve_link(text) to service_role;
grant execute on function public.linkivo_record_click(uuid,text,text,text,text,text,text,text) to service_role;
