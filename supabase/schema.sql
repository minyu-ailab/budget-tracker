create extension if not exists pgcrypto;

create table if not exists public.budget_profiles (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.budget_profiles enable row level security;

create policy "Allow anon read/write own device profile"
on public.budget_profiles
for all
to anon
using (true)
with check (true);

create index if not exists budget_profiles_device_id_idx
on public.budget_profiles (device_id);
