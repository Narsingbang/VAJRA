-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- ENUM TYPES
-- =========================================================
do $$ begin
  create type advisory_module as enum (
    'crop_recommendation','fertilizer_plan','irrigation_schedule',
    'pest_disease_diagnosis','seasonal_calendar','harvest_postharvest'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_language as enum ('en','hi','mr');
exception when duplicate_object then null; end $$;

do $$ begin
  create type advisory_status as enum ('completed','failed');
exception when duplicate_object then null; end $$;

-- =========================================================
-- HELPER: updated_at trigger
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  preferred_language app_language not null default 'en',
  state text,
  district text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'preferred_language')::app_language, 'en')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- FARMS
-- =========================================================
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  state text not null check (char_length(state) between 2 and 60),
  district text not null check (char_length(district) between 2 and 60),
  village text check (char_length(village) <= 80),
  area_acres numeric(10,2) not null check (area_acres > 0 and area_acres <= 10000),
  soil_type text not null default 'unknown'
    check (soil_type in ('black_cotton','red','alluvial','laterite','sandy','loamy','clayey','saline_alkaline','unknown')),
  irrigation_source text not null default 'rainfed'
    check (irrigation_source in ('rainfed','canal','borewell','open_well','drip','sprinkler','farm_pond','other')),
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_farms_user on public.farms(user_id);

create trigger trg_farms_updated_at
before update on public.farms
for each row execute function public.set_updated_at();

-- =========================================================
-- ADVISORIES
-- =========================================================
create table if not exists public.advisories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  module advisory_module not null,
  crop text,
  language app_language not null default 'en',
  input jsonb not null,                -- validated form input (no image bytes)
  result jsonb,                        -- validated AI output
  risk_level text check (risk_level in ('low','medium','high')),
  confidence text check (confidence in ('low','medium','high')),
  status advisory_status not null default 'completed',
  error_message text,
  model text,
  prompt_tokens integer,
  output_tokens integer,
  latency_ms integer,
  image_paths text[] not null default '{}',
  search_vector tsvector generated always as (
    to_tsvector('simple',
      coalesce(crop,'') || ' ' || coalesce(module::text,'') || ' ' ||
      coalesce(result->>'summary',''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_adv_user_created on public.advisories(user_id, created_at desc);
create index if not exists idx_adv_user_module on public.advisories(user_id, module);
create index if not exists idx_adv_farm on public.advisories(farm_id);
create index if not exists idx_adv_search on public.advisories using gin(search_vector);

create trigger trg_advisories_updated_at
before update on public.advisories
for each row execute function public.set_updated_at();

-- =========================================================
-- FOLLOW-UPS
-- =========================================================
create table if not exists public.advisory_followups (
  id uuid primary key default gen_random_uuid(),
  advisory_id uuid not null references public.advisories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null check (char_length(question) between 3 and 500),
  answer jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_followups_advisory on public.advisory_followups(advisory_id, created_at);

-- =========================================================
-- FEEDBACK
-- =========================================================
create table if not exists public.advisory_feedback (
  id uuid primary key default gen_random_uuid(),
  advisory_id uuid not null references public.advisories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating in (-1, 1)),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique (advisory_id, user_id)
);

-- =========================================================
-- AI USAGE LOG (for daily quota)
-- =========================================================
create table if not exists public.ai_usage_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('advisory','followup')),
  created_at timestamptz not null default now()
);

create index if not exists idx_usage_user_day on public.ai_usage_log(user_id, created_at desc);

-- =========================================================
-- STORAGE BUCKET (private) for diagnosis images
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('crop-images', 'crop-images', false, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
