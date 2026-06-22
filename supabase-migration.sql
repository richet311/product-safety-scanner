-- =============================================
-- Surfelt — Supabase SQL Migration
-- Paste this into: Dashboard → SQL Editor → New query
-- Run each section in order. If a table already
-- exists the IF NOT EXISTS guard skips it safely.
-- =============================================


-- ─────────────────────────────────────────────
-- 1. PROFILES  (user biometrics + preferences)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  age                 smallint             check (age > 0 and age < 130),
  weight_kg           numeric(6, 2)        check (weight_kg > 0),
  height_cm           numeric(6, 2)        check (height_cm > 0),
  allergies           text[]  not null     default '{}',
  dietary_preferences text[]  not null     default '{}',
  health_conditions   text[]  not null     default '{}',
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Drop and recreate so re-running is safe
drop policy if exists "profiles: users read own"    on public.profiles;
drop policy if exists "profiles: users insert own"  on public.profiles;
drop policy if exists "profiles: users update own"  on public.profiles;

create policy "profiles: users read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: users insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: users update own"
  on public.profiles for update
  using (auth.uid() = id);


-- ─────────────────────────────────────────────
-- 2. SCANS  (scan history)
-- ─────────────────────────────────────────────
create table if not exists public.scans (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  product_name    text,
  raw_ingredients text        not null,
  analysis        jsonb       not null,
  overall_grade   char(1)     not null check (overall_grade in ('A','B','C','D')),
  image_url       text,
  created_at      timestamptz not null default now()
);

alter table public.scans enable row level security;

drop policy if exists "scans: users read own"    on public.scans;
drop policy if exists "scans: users insert own"  on public.scans;
drop policy if exists "scans: users delete own"  on public.scans;

create policy "scans: users read own"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "scans: users insert own"
  on public.scans for insert
  with check (auth.uid() = user_id);

create policy "scans: users delete own"
  on public.scans for delete
  using (auth.uid() = user_id);

create index if not exists scans_user_created_idx
  on public.scans (user_id, created_at desc);


-- ─────────────────────────────────────────────
-- 3. SCAN EVENTS  (rate-limiting log — immutable)
-- Users can INSERT but NOT DELETE.
-- The app counts today's rows to enforce DAILY_SCAN_LIMIT.
-- ─────────────────────────────────────────────
create table if not exists public.scan_events (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.scan_events enable row level security;

drop policy if exists "scan_events: users read own"   on public.scan_events;
drop policy if exists "scan_events: users insert own" on public.scan_events;

create policy "scan_events: users read own"
  on public.scan_events for select
  using (auth.uid() = user_id);

create policy "scan_events: users insert own"
  on public.scan_events for insert
  with check (auth.uid() = user_id);

-- No DELETE policy — intentional. Keeps rate-limit log tamper-proof.

create index if not exists scan_events_user_created_idx
  on public.scan_events (user_id, created_at desc);


-- ─────────────────────────────────────────────
-- 4. STORAGE — scan-images bucket
-- Run AFTER you create the bucket in:
--   Storage → New bucket → name: "scan-images" → Public: ON
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'scan-images',
  'scan-images',
  true,
  10485760,            -- 10 MB max per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "scan-images: authenticated upload"  on storage.objects;
drop policy if exists "scan-images: public read"           on storage.objects;
drop policy if exists "scan-images: owner delete"          on storage.objects;

-- Each user uploads into their own folder: {user_id}/filename
create policy "scan-images: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'scan-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "scan-images: public read"
  on storage.objects for select
  to public
  using (bucket_id = 'scan-images');

create policy "scan-images: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'scan-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
