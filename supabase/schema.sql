-- Linkivo Supabase schema
create extension if not exists pgcrypto;

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  destination_url text not null,
  title text,
  is_active boolean not null default true,
  clicks bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.click_events (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  referrer text,
  ip_hash text
);

create index if not exists links_slug_idx on public.links(slug);
create index if not exists click_events_link_id_idx on public.click_events(link_id);
create index if not exists click_events_clicked_at_idx on public.click_events(clicked_at desc);

create or replace function public.increment_link_clicks(p_link_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.links
  set clicks = clicks + 1, updated_at = now()
  where id = p_link_id;
$$;

revoke all on function public.increment_link_clicks(uuid) from public, anon, authenticated;
grant execute on function public.increment_link_clicks(uuid) to service_role;

alter table public.links enable row level security;
alter table public.click_events enable row level security;

-- Linkivo uses the server-only Supabase secret key for database operations.
-- No anonymous table policies are created.
