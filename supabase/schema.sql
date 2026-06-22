-- ── Extensions ────────────────────────────────────────────────────────────────
-- uuid_generate_v4() is available by default in Supabase; gen_random_uuid() too

-- ── scan_events ───────────────────────────────────────────────────────────────
-- Immutable rate-limit log. Users can INSERT but never DELETE/UPDATE.
create table if not exists public.scan_events (
  id         uuid        default gen_random_uuid() primary key,
  user_id    uuid        references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

alter table public.scan_events enable row level security;

create policy "Users can insert own scan events"
  on public.scan_events for insert
  with check (auth.uid() = user_id);

create policy "Users can view own scan events"
  on public.scan_events for select
  using (auth.uid() = user_id);

-- Intentionally no DELETE or UPDATE policy — rate limit log is immutable.

create index if not exists scan_events_user_date_idx
  on public.scan_events (user_id, created_at);


-- ── scans ─────────────────────────────────────────────────────────────────────
-- Full scan results. Users can delete their own history.
create table if not exists public.scans (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        references auth.users(id) on delete cascade not null,
  product_name    text,
  raw_ingredients text        not null,
  analysis        jsonb       not null,
  overall_grade   text        not null check (overall_grade in ('A', 'B', 'C', 'D')),
  created_at      timestamptz default now() not null
);

alter table public.scans enable row level security;

create policy "Users can view own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.scans for delete
  using (auth.uid() = user_id);

-- Intentionally no UPDATE policy — scans are immutable once saved.

create index if not exists scans_user_date_idx
  on public.scans (user_id, created_at desc);

-- ── scans: image support ──────────────────────────────────────────────────────
alter table public.scans add column if not exists image_url text;


-- ── profiles ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid        references auth.users(id) on delete cascade primary key,
  age                 int,
  weight_kg           numeric(5,1),
  height_cm           numeric(5,1),
  allergies           text[]      default '{}',
  dietary_preferences text[]      default '{}',
  health_conditions   text[]      default '{}',
  updated_at          timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
