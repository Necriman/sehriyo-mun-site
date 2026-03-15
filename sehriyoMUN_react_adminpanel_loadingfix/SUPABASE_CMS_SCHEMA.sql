-- CMS & content schema for Sehriyo MUN
-- Run this in Supabase SQL editor after SUPABASE_ADMIN_SETUP.sql

-- 1) Generic CMS strings (page / section / key / locale)
create table if not exists public.cms_strings (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text,
  key text not null,
  locale text not null check (locale in ('en','ru')),
  value text not null,
  description text,
  updated_at timestamptz not null default now()
);

alter table public.cms_strings enable row level security;

-- Public can read all CMS strings
drop policy if exists "Public can read cms_strings" on public.cms_strings;
create policy "Public can read cms_strings"
on public.cms_strings for select
using (true);

-- Only admins can modify CMS strings
drop policy if exists "Admins manage cms_strings" on public.cms_strings;
create policy "Admins manage cms_strings"
on public.cms_strings for all
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create index if not exists cms_strings_page_section_key_locale_idx
  on public.cms_strings (page, section, key, locale);


-- 2) Committees & translations
create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  acronym text not null,
  bg_image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Если таблица committees уже была создана без этих колонок — добавить их
alter table public.committees add column if not exists is_published boolean not null default true;
alter table public.committees add column if not exists sort_order integer not null default 0;
alter table public.committees add column if not exists bg_image_url text;
alter table public.committees add column if not exists created_at timestamptz not null default now();
alter table public.committees add column if not exists updated_at timestamptz not null default now();

create table if not exists public.committee_translations (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  locale text not null check (locale in ('en','ru')),
  title text not null,
  language_label text not null,
  agenda text,
  description text,
  unique (committee_id, locale)
);

alter table public.committees enable row level security;
alter table public.committee_translations enable row level security;

-- Public read access
drop policy if exists "Public read committees" on public.committees;
create policy "Public read committees"
on public.committees for select
using (is_published = true);

drop policy if exists "Public read committee_translations" on public.committee_translations;
create policy "Public read committee_translations"
on public.committee_translations for select
using (true);

-- Admin full access
drop policy if exists "Admins manage committees" on public.committees;
create policy "Admins manage committees"
on public.committees for all
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage committee_translations" on public.committee_translations;
create policy "Admins manage committee_translations"
on public.committee_translations for all
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create index if not exists committees_sort_order_idx
  on public.committees (sort_order asc, created_at desc);

create index if not exists committee_translations_committee_locale_idx
  on public.committee_translations (committee_id, locale);


-- 3) Chairs (bureau)
create table if not exists public.chairs (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  name text not null,
  photo_url text,
  sort_order integer not null default 0,
  role_en text,
  role_ru text,
  bio_en text,
  bio_ru text
);

alter table public.chairs enable row level security;

drop policy if exists "Public read chairs" on public.chairs;
create policy "Public read chairs"
on public.chairs for select
using (true);

drop policy if exists "Admins manage chairs" on public.chairs;
create policy "Admins manage chairs"
on public.chairs for all
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create index if not exists chairs_committee_sort_idx
  on public.chairs (committee_id, sort_order asc);


-- 4) Schedule (days & events)
create table if not exists public.schedule_days (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort_order integer not null default 0,
  date date,
  title_en text not null,
  title_ru text not null,
  description_en text,
  description_ru text
);

create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.schedule_days(id) on delete cascade,
  sort_order integer not null default 0,
  start_time time,
  end_time time,
  title_en text not null,
  title_ru text not null,
  description_en text,
  description_ru text
);

alter table public.schedule_days enable row level security;
alter table public.schedule_events enable row level security;

drop policy if exists "Public read schedule_days" on public.schedule_days;
create policy "Public read schedule_days"
on public.schedule_days for select
using (true);

drop policy if exists "Public read schedule_events" on public.schedule_events;
create policy "Public read schedule_events"
on public.schedule_events for select
using (true);

drop policy if exists "Admins manage schedule_days" on public.schedule_days;
create policy "Admins manage schedule_days"
on public.schedule_days for all
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage schedule_events" on public.schedule_events;
create policy "Admins manage schedule_events"
on public.schedule_events for all
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create index if not exists schedule_days_sort_idx
  on public.schedule_days (sort_order asc, date asc);

create index if not exists schedule_events_day_sort_idx
  on public.schedule_events (day_id, sort_order asc, start_time asc);


-- 5) Team members (secretariat, staff, departments)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  group_key text not null default 'default',
  group_order integer not null default 0,
  sort_order integer not null default 0,
  group_label_en text,
  group_label_ru text,
  role_en text,
  role_ru text,
  bio_en text,
  bio_ru text,
  is_featured boolean not null default false
);

alter table public.team_members enable row level security;

drop policy if exists "Public read team_members" on public.team_members;
create policy "Public read team_members"
on public.team_members for select
using (true);

drop policy if exists "Admins manage team_members" on public.team_members;
create policy "Admins manage team_members"
on public.team_members for all
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create index if not exists team_members_group_sort_idx
  on public.team_members (group_order asc, group_key, sort_order asc);


-- 6) Site-wide settings (contacts, social links, hero logo, etc.)
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null
);

alter table public.site_settings enable row level security;

drop policy if exists "Public read site_settings" on public.site_settings;
create policy "Public read site_settings"
on public.site_settings for select
using (true);

drop policy if exists "Admins manage site_settings" on public.site_settings;
create policy "Admins manage site_settings"
on public.site_settings for all
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

