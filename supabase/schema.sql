create extension if not exists pgcrypto;

create table if not exists public.budget_profiles (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.budget_profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'budget_profiles'
      and policyname = 'Allow anon read/write own device profile'
  ) then
    create policy "Allow anon read/write own device profile"
    on public.budget_profiles
    for all
    to anon
    using (true)
    with check (true);
  end if;
end
$$;

create index if not exists budget_profiles_device_id_idx
on public.budget_profiles (device_id);

create table if not exists public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  item_id text not null unique,
  institution_name text not null default 'Linked Bank',
  access_token text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.bank_item_cursors (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  item_id text not null unique,
  cursor text not null default '',
  last_synced_at timestamptz not null default now()
);

alter table public.bank_connections enable row level security;
alter table public.bank_item_cursors enable row level security;

create index if not exists bank_connections_profile_id_idx
on public.bank_connections (profile_id);

create index if not exists bank_item_cursors_profile_id_idx
on public.bank_item_cursors (profile_id);
