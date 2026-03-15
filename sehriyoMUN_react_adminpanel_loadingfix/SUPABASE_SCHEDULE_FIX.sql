-- Исправление расписания: добавьте недостающие колонки и таблицу, если их нет.
-- Выполните этот скрипт в Supabase: SQL Editor → New query → вставьте код → Run.

-- 1) schedule_days: добавить ВСЕ недостающие колонки под приложение
ALTER TABLE public.schedule_days ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.schedule_days ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.schedule_days ADD COLUMN IF NOT EXISTS date date;
ALTER TABLE public.schedule_days ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE public.schedule_days ADD COLUMN IF NOT EXISTS title_ru text;
ALTER TABLE public.schedule_days ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE public.schedule_days ADD COLUMN IF NOT EXISTS description_ru text;

-- Заполнить обязательные поля для существующих строк
UPDATE public.schedule_days SET slug = 'day-' || id::text WHERE slug IS NULL OR slug = '';
UPDATE public.schedule_days SET title_en = COALESCE(NULLIF(trim(title_en), ''), 'Day') WHERE title_en IS NULL OR trim(title_en) = '';
UPDATE public.schedule_days SET title_ru = COALESCE(NULLIF(trim(title_ru), ''), 'День') WHERE title_ru IS NULL OR trim(title_ru) = '';

-- Сделать slug, title_en, title_ru обязательными (если ещё не NOT NULL)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_days' AND column_name = 'slug' AND is_nullable = 'YES') THEN
    ALTER TABLE public.schedule_days ALTER COLUMN slug SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_days' AND column_name = 'title_en' AND is_nullable = 'YES') THEN
    ALTER TABLE public.schedule_days ALTER COLUMN title_en SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_days' AND column_name = 'title_ru' AND is_nullable = 'YES') THEN
    ALTER TABLE public.schedule_days ALTER COLUMN title_ru SET NOT NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS schedule_days_slug_key ON public.schedule_days(slug);

-- 2) Создать таблицу schedule_events, если её нет
CREATE TABLE IF NOT EXISTS public.schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES public.schedule_days(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  start_time time,
  end_time time,
  title_en text NOT NULL,
  title_ru text NOT NULL,
  description_en text,
  description_ru text
);

ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

-- Политики для чтения всеми и управления админами
DROP POLICY IF EXISTS "Public read schedule_events" ON public.schedule_events;
CREATE POLICY "Public read schedule_events"
  ON public.schedule_events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage schedule_events" ON public.schedule_events;
CREATE POLICY "Admins manage schedule_events"
  ON public.schedule_events FOR ALL
  USING (exists (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (exists (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS schedule_events_day_sort_idx
  ON public.schedule_events (day_id, sort_order ASC, start_time ASC);
