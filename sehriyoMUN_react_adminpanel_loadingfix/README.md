# Dream MUN — React + Tailwind + Animations + Registration (Supabase)

- React (Vite)
- Tailwind (light/dark toggle)
- Framer Motion (scroll animations + micro-interactions)
- Registration saves applications to Supabase (no backend)

## Run
```bash
npm install
npm run dev
```

## Supabase setup (best “admin” without backend)
Run this SQL in Supabase **SQL Editor**:

```sql
create table if not exists public.applications (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  school text,
  grade text,
  preferred_committee text,
  motivation text,
  experience text,
  status text not null default 'new'
);

alter table public.applications enable row level security;

create policy "Allow public insert"
on public.applications for insert
to anon
with check (true);

create policy "Allow authenticated read"
on public.applications for select
to authenticated
using (true);
```

### Env vars
Create `.env` in project root:
```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Restart dev server after adding env vars.

## Edit content
- Committees: `src/data/committees.js`
- Team/chairs: `src/data/team.js`


## Language (RU/EN)
- Use the toggle in the navbar.
- Translations live in `src/locales/en/translation.json` and `src/locales/ru/translation.json`.
