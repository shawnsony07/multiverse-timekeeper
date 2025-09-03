-- Planetary data cache table
create table if not exists public.planetary_data (
  id uuid primary key default gen_random_uuid(),
  body text not null check (body in ('earth','mars','moon')),
  start_time timestamptz not null,
  stop_time timestamptz not null,
  step text not null,
  position jsonb not null,
  distance double precision,
  local_solar_time text,
  julian_date double precision,
  raw_result jsonb,
  created_at timestamptz not null default now()
);

create index if not exists planetary_data_body_created_at_idx on public.planetary_data (body, created_at desc);

alter table public.planetary_data enable row level security;

-- Allow read access to anon (public)
create policy if not exists "planetary_data_read" on public.planetary_data
  for select
  to anon, authenticated
  using (true);

-- Writes should require service role; no insert/update/delete policies are created for anon/authenticated.

