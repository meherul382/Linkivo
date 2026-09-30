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

alter table public.links enable row level security;
alter table public.click_events enable row level security;

-- Server-side/service-role operations can manage these tables.
-- Public anonymous reads/writes remain blocked until explicit policies are added.
