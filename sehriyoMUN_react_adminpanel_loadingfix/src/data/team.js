// You can freely edit names/roles later.
// Images are stored in /public/images/...

export const team = [
  {
    name: 'Abdulloh',
    role: { en: 'Secretary-General', ru: 'Генеральный секретарь' },
    group: 'secretariat',
    groupLabel: { en: 'Secretariat', ru: 'Секретариат' },
    bio: {
      en: 'Leads the conference vision, standards, and overall delegate experience.',
      ru: 'Отвечает за видение конференции, стандарты и общий опыт делегатов.'
    },
    photo: '/images/team/abdulloh.jpg',
  },
  {
    name: 'Mustafo',
    role: { en: 'Deputy Secretary-General', ru: 'Заместитель генерального секретаря' },
    group: 'secretariat',
    groupLabel: { en: 'Secretariat', ru: 'Секретариат' },
    bio: {
      en: 'Operations, coordination, and conference-day management.',
      ru: 'Операции, координация и управление днём конференции.'
    },
    photo: '/images/team/mustafo.jpg',
  },
  {
    name: 'Saidamir',
    role: { en: 'Staff', ru: 'Стафф' },
    group: 'staff',
    groupLabel: { en: 'Staff', ru: 'Стафф' },
    bio: { en: 'Logistics and delegate support.', ru: 'Логистика и поддержка делегатов.' },
    photo: '/images/staff/saidamir.jpg',
  },
  {
    name: 'Dmitriy',
    role: { en: 'Staff', ru: 'Стафф' },
    group: 'staff',
    groupLabel: { en: 'Staff', ru: 'Стафф' },
    bio: { en: 'Technical support and venue coordination.', ru: 'Техническая поддержка и координация площадки.' },
    photo: '/images/staff/dmitriy.jpg',
  },
  {
    name: 'Pavel',
    role: { en: 'Staff', ru: 'Стафф' },
    group: 'staff',
    groupLabel: { en: 'Staff', ru: 'Стафф' },
    bio: { en: 'Registration desk and communication.', ru: 'Регистрация и коммуникация.' },
    photo: '/images/staff/pavel.jpg',
  },
]

export const chairs = [
  // GA
  { name: 'Yunus', role: { en: 'Chair', ru: 'Председатель' }, committeeSlug: 'ga', bio: { en: 'Leads debate and procedure.', ru: 'Ведёт дебаты и процедуру.' }, photo: '/images/committees/ga-chair-yunus.jpg' },
  { name: 'Amir', role: { en: 'Vice-Chair', ru: 'Вице-председатель' }, committeeSlug: 'ga', bio: { en: 'Supports moderation and flow.', ru: 'Помогает с модерацией и ходом дебатов.' }, photo: '/images/committees/ga-vice-amir.jpg' },
  { name: 'Yusuf', role: { en: 'Rapporteur', ru: 'Раппортер' }, committeeSlug: 'ga', bio: { en: 'Drafts documents and records.', ru: 'Ведёт записи и оформляет документы.' }, photo: '/images/committees/ga-rapporteur-yusuf.jpg' },

  // SC
  { name: 'Shaxboz', role: { en: 'Chair', ru: 'Председатель' }, committeeSlug: 'sc', bio: { en: 'Crisis-ready chairing and structure.', ru: 'Структура дебатов и готовность к кризисным ситуациям.' }, photo: '/images/committees/sc-chair-shaxboz.jpg' },
  { name: 'Eldar', role: { en: 'Vice-Chair', ru: 'Вице-председатель' }, committeeSlug: 'sc', bio: { en: 'Supports crisis flow and motions.', ru: 'Поддерживает ход дебатов и работу с motion-ами.' }, photo: '/images/committees/sc-vice-eldar.jpg' },
  { name: 'Mukhlisa', role: { en: 'Rapporteur', ru: 'Раппортер' }, committeeSlug: 'sc', bio: { en: 'Records and formats draft outputs.', ru: 'Ведёт записи и оформляет проекты документов.' }, photo: '/images/committees/sc-rapporteur-mukhlisa.jpg' },

  // UNODC
  { name: 'Nodirbek', role: { en: 'Chair', ru: 'Председатель' }, committeeSlug: 'unodc', bio: { en: 'Focused, policy-driven debate.', ru: 'Фокус на политике и содержательных дебатах.' }, photo: '/images/committees/unodc-chair-nodirbek.jpg' },
  { name: 'Humoyiddin', role: { en: 'Vice-Chair', ru: 'Вице-председатель' }, committeeSlug: 'unodc', bio: { en: 'Procedure and time management.', ru: 'Процедура и тайм-менеджмент.' }, photo: '/images/committees/unodc-vice-humoyiddin.jpg' },
  { name: 'Temurmalik', role: { en: 'Rapporteur', ru: 'Раппортер' }, committeeSlug: 'unodc', bio: { en: 'Documents and wording consistency.', ru: 'Документы и единый стиль формулировок.' }, photo: '/images/committees/unodc-rapporteur-temurmalik.jpg' },

  // ECOSOC
  { name: 'Azizbek', role: { en: 'Chair', ru: 'Председатель' }, committeeSlug: 'ecosoc', bio: { en: 'Development & policy debate focus.', ru: 'Фокус на развитии и политике.' }, photo: '/images/committees/ecosoc-chair-azizbek.jpg' },
  { name: 'Eldor', role: { en: 'Vice-Chair', ru: 'Вице-председатель' }, committeeSlug: 'ecosoc', bio: { en: 'Supports speakers list and motions.', ru: 'Поддерживает speakers list и motion-ы.' }, photo: '/images/committees/ecosoc-vice-eldor.jpg' },
  { name: 'Masharif', role: { en: 'Rapporteur', ru: 'Раппортер' }, committeeSlug: 'ecosoc', bio: { en: 'Drafts and edits working papers.', ru: 'Оформляет и редактирует working papers.' }, photo: '/images/committees/ecosoc-rapporteur-masharif.jpg' },

  // HSC
  { name: 'Asadbek', role: { en: 'Chair', ru: 'Председатель' }, committeeSlug: 'hsc', bio: { en: 'Historical context & structured debate.', ru: 'Исторический контекст и структурированные дебаты.' }, photo: '/images/committees/hsc-chair-asadbek.jpg' },
  { name: 'Jasmina', role: { en: 'Vice-Chair', ru: 'Вице-председатель' }, committeeSlug: 'hsc', bio: { en: 'Procedure support and moderation.', ru: 'Поддержка процедуры и модерация.' }, photo: '/images/committees/hsc-vice-jasmina.jpg' },
  { name: 'Abdulaziz', role: { en: 'Rapporteur', ru: 'Раппортер' }, committeeSlug: 'hsc', bio: { en: 'Records and finalizes documents.', ru: 'Ведёт записи и финализирует документы.' }, photo: '/images/committees/hsc-rapporteur-abdulaziz.jpg' },

  // HRC
  { name: 'Abdurashid', role: { en: 'Chair', ru: 'Председатель' }, committeeSlug: 'hrc', bio: { en: 'Human rights procedures and debate.', ru: 'Процедуры и дебаты по правам человека.' }, photo: '/images/committees/hrc-chair-abdurashid.jpg' },
  { name: 'Saida', role: { en: 'Vice-Chair', ru: 'Вице-председатель' }, committeeSlug: 'hrc', bio: { en: 'Supports moderation and caucuses.', ru: 'Поддерживает модерацию и caucus-ы.' }, photo: '/images/committees/hrc-vice-saida.jpg' },
  { name: 'Nadiya', role: { en: 'Rapporteur', ru: 'Раппортер' }, committeeSlug: 'hrc', bio: { en: 'Documents and reports.', ru: 'Документы и отчёты.' }, photo: '/images/committees/hrc-rapporteur-nadiya.jpg' },

  // UNCSW
  { name: 'Dilrabo', role: { en: 'Chair', ru: 'Председатель' }, committeeSlug: 'uncsw', bio: { en: 'Empowerment and policy debate.', ru: 'Повестка, расширение прав и возможностей.' }, photo: '/images/committees/uncsw-chair-dilrabo.jpg' },
  { name: 'Dilnoza', role: { en: 'Vice-Chair', ru: 'Вице-председатель' }, committeeSlug: 'uncsw', bio: { en: 'Supports flow and speakers list.', ru: 'Поддерживает flow и speakers list.' }, photo: '/images/committees/uncsw-vice-dilnoza.jpg' },
  { name: 'Mirjakhon', role: { en: 'Rapporteur', ru: 'Раппортер' }, committeeSlug: 'uncsw', bio: { en: 'Drafting and edits.', ru: 'Драфтинг и редактура.' }, photo: '/images/committees/uncsw-rapporteur-mirjakhon.jpg' },

  // WTO
  { name: 'Nilufar', role: { en: 'Chair', ru: 'Председатель' }, committeeSlug: 'wto', bio: { en: 'Trade-focused debate and structure.', ru: 'Структура и фокус на торговой политике.' }, photo: '/images/committees/wto-chair-nilufar.jpg' },
  { name: 'Khadija', role: { en: 'Vice-Chair', ru: 'Вице-председатель' }, committeeSlug: 'wto', bio: { en: 'Procedure support.', ru: 'Поддержка процедуры.' }, photo: '/images/committees/wto-vice-khadija.jpg' },
  { name: 'Bibirobiya', role: { en: 'Rapporteur', ru: 'Раппортер' }, committeeSlug: 'wto', bio: { en: 'Documents and formatting.', ru: 'Документы и оформление.' }, photo: '/images/committees/wto-rapporteur-bibirobiya.jpg' },
]
