-- Optional seed data for Sehriyo MUN CMS
-- Run AFTER SUPABASE_CMS_SCHEMA.sql to pre-fill content based on the current site.

-- 1) Site settings (contacts & social links)
insert into public.site_settings (key, value) values
  ('contact_address', 'Sehriyo School, Tashkent'),
  ('contact_email', 'sehriyo@mun2026.org'),
  ('contact_phone', '+998 90 323 92 00'),
  ('instagram_url', 'https://instagram.com/sehriyomun'),
  ('telegram_url', 'https://t.me/sehriyomun')
on conflict (key) do nothing;

-- 2) Example CMS strings for home hero (EN + RU)
insert into public.cms_strings (page, section, key, locale, value, description) values
  ('home','hero','badge_date','en','April 11','Hero badge: date'),
  ('home','hero','badge_date','ru','11 апреля','Hero badge: date'),
  ('home','hero','badge_title','en','Sehriyo MUN','Hero badge: title'),
  ('home','hero','badge_title','ru','Sehriyo MUN','Hero badge: title'),
  ('home','hero','badge_city','en','Tashkent','Hero badge: city'),
  ('home','hero','badge_city','ru','Ташкент','Hero badge: city'),
  ('home','hero','headline_top','en','Modern. Clean. Confident.','Hero main heading (top)'),
  ('home','hero','headline_top','ru','Современно. Чисто. Уверенно.','Hero main heading (top)'),
  ('home','hero','headline_bottom','en','A new Sehriyo MUN experience.','Hero main heading (bottom)'),
  ('home','hero','headline_bottom','ru','Новый опыт Sehriyo MUN.','Hero main heading (bottom)'),
  ('home','hero','paragraph_1','en','Sehriyo MUN is a Model United Nations conference where delegates debate real-world issues, practice diplomacy, and build leadership through structured, fast-paced sessions.','Hero paragraph 1'),
  ('home','hero','paragraph_1','ru','Sehriyo MUN — это конференция Model United Nations, где делегаты обсуждают реальные мировые проблемы, практикуют дипломатию и развивают лидерство в структурированных, динамичных сессиях.','Hero paragraph 1'),
  ('home','hero','paragraph_2','en','Expect clear procedure, strong chairing, and a premium atmosphere — with training and support for new delegates. Our goal is to make every participant leave with stronger public speaking, negotiation, and teamwork skills.','Hero paragraph 2'),
  ('home','hero','paragraph_2','ru','Вас ждут понятная процедура, сильное председательство и качественная атмосфера — с обучением и поддержкой для новых делегатов. Наша цель — чтобы каждый участник ушёл с улучшенными навыками публичных выступлений, переговоров и командной работы.','Hero paragraph 2'),
  ('home','hero','cta_primary','en','Apply now','Hero primary button'),
  ('home','hero','cta_primary','ru','Подать заявку','Hero primary button'),
  ('home','hero','cta_secondary','en','View committees','Hero secondary button'),
  ('home','hero','cta_secondary','ru','Смотреть комитеты','Hero secondary button')
on conflict do nothing;

-- 3) You can continue seeding about/committees/highlight texts in the same style.

