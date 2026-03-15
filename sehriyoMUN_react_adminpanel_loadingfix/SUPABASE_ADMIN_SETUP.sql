-- Run this in Supabase SQL Editor

-- 1) Admins table (role system)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Users can read ONLY their own admin row (needed to check access)
create policy "Users can read own admin row"
on public.admins for select
using (auth.uid() = user_id);

-- Only admins can manage the admins table (optional, keep strict)
create policy "Admins can insert admins"
on public.admins for insert
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "Admins can delete admins"
on public.admins for delete
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- 2) Applications table RLS
-- If you already have applications table, keep it and just add policies.

alter table public.applications enable row level security;

-- Anyone can insert an application (public form)
create policy "Public can insert applications"
on public.applications for insert
with check (true);

-- Only admins can read applications
create policy "Admins can read applications"
on public.applications for select
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Only admins can update applications
create policy "Admins can update applications"
on public.applications for update
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Only admins can delete applications
create policy "Admins can delete applications"
on public.applications for delete
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- 3) After you create your organizer user in Auth, add them as admin:
-- Replace the email below with your organizer email and run:
insert into public.admins (user_id, role)
select id, 'admin' from auth.users where email = 'necrimanyt@gmail.com'
on conflict (user_id) do nothing;
