create extension if not exists pgcrypto;

create table if not exists public.budget_profiles (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  user_id uuid references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.budget_profiles alter column device_id drop not null;

create unique index if not exists budget_profiles_user_id_key
on public.budget_profiles (user_id)
where user_id is not null;

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

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone_number text,
  two_factor_method text not null default 'sms',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles'
      and policyname = 'Users can manage own profile'
  ) then
    create policy "Users can manage own profile"
    on public.user_profiles
    for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end
$$;

create table if not exists public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  item_id text not null unique,
  institution_name text not null default 'Linked Bank',
  access_token text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.bank_item_cursors (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  item_id text not null unique,
  cursor text not null default '',
  last_synced_at timestamptz not null default now()
);

create table if not exists public.device_migrations (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  migrated_at timestamptz not null default now()
);

alter table public.bank_connections enable row level security;
alter table public.bank_item_cursors enable row level security;

create index if not exists bank_connections_profile_id_idx
on public.bank_connections (profile_id);

create index if not exists bank_connections_user_id_idx
on public.bank_connections (user_id);

create index if not exists bank_item_cursors_profile_id_idx
on public.bank_item_cursors (profile_id);

create index if not exists bank_item_cursors_user_id_idx
on public.bank_item_cursors (user_id);
