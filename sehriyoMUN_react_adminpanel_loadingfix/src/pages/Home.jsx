import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { i18nText } from '../lib/i18nText'
import { GlowBg } from '../components/GlowBg'
import { Reveal } from '../components/Reveal'
import { committees as staticCommittees } from '../data/committees'
import { CmsText } from '../components/CmsText'
import { useCommittees } from '../lib/cms'

export default function Home() {
  const { t, i18n } = useTranslation()
  const { committees } = useCommittees()
  const committeesToShow = committees && committees.length ? committees : staticCommittees
  return (
    <div className="relative">
      <GlowBg />

      <section className="relative">
        {/* Hero background */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-25 dark:opacity-20"
          style={{ backgroundImage: 'url(/images/hero-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-white/70 via-white/80 to-white dark:from-slate-950/70 dark:via-slate-950/85 dark:to-slate-950" />

        <div className="container-pad py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="grid gap-10 lg:grid-cols-12 lg:items-center"
          >
            <div className="lg:col-span-7">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden">
                  <img src="/images/logo.png" alt="Sehriyo MUN" className="h-full w-full object-contain" />
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="chip">
                    <CmsText
                      page="home"
                      section="hero"
                      keyName="badge_date"
                      fallback={t('home.badges.date')}
                    />
                  </span>
                  <span className="chip">
                    <CmsText
                      page="home"
                      section="hero"
                      keyName="badge_title"
                      fallback={t('hero.title')}
                    />
                  </span>
                  <span className="chip">
                    <CmsText
                      page="home"
                      section="hero"
                      keyName="badge_city"
                      fallback={t('home.badges.city')}
                    />
                  </span>
                </div>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                <span>
                  <CmsText
                    page="home"
                    section="hero"
                    keyName="headline_top"
                    fallback={t('home.headline.top')}
                  />
                </span>
                <span className="block text-brand-900 dark:text-brand-500">
                  <CmsText
                    page="home"
                    section="hero"
                    keyName="headline_bottom"
                    fallback={t('home.headline.bottom')}
                  />
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-100/90">
                <CmsText
                  page="home"
                  section="hero"
                  keyName="paragraph_1"
                  fallback={t('home.hero_p1')}
                />
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-100/90">
                <CmsText
                  page="home"
                  section="hero"
                  keyName="paragraph_2"
                  fallback={t('home.hero_p2')}
                />
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn-primary" to="/apply">
                  <CmsText
                    page="home"
                    section="hero"
                    keyName="cta_primary"
                    fallback={t('hero.cta_primary')}
                  />
                </Link>
                <Link className="btn-ghost" to="/committees">
                  <CmsText
                    page="home"
                    section="hero"
                    keyName="cta_secondary"
                    fallback={t('home.explore_committees')}
                  />
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['6+', t('home.stats.committees')],
                  ['120+', t('home.stats.delegates')],
                  ['1 Day', t('home.stats.day')],
                  ['Training', t('home.stats.training')],
                ].map(([a, b]) => (
                  <div key={a} className="card p-4">
                    <div className="text-2xl font-extrabold">{a}</div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-200/80">{b}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold tracking-tight">{t('home.timeline.title')}</div>
                  <span className="chip">{t('home.timeline.year')}</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    [t('home.timeline.items.reg'), t('home.timeline.when.now')],
                    [t('home.timeline.items.training'), t('home.timeline.when.before')],
                    [t('home.timeline.items.day'), t('home.timeline.when.april11')],
                    [t('home.timeline.items.cert'), t('home.timeline.when.sameday')],
                  ].map(([t, d]) => (
                    <div key={t} className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/60 p-3 dark:border-slate-800/70 dark:bg-slate-900/40">
                      <div className="text-sm font-semibold">{t}</div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-200/80">{d}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-500/20 dark:bg-slate-900/70 dark:ring-brand-500/20">
                  <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">{t('home.ready.title')}</div>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-100/90">
                    {t('home.ready.text')}
                  </p>
                  <Link className="btn-primary mt-4 w-full" to="/apply">{t('nav.apply')}</Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="container-pad py-12 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-6">
            <div>
              <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">
                <CmsText
                  page="home"
                  section="about"
                  keyName="section_title"
                  fallback={t('about.title')}
                />
              </div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                <CmsText
                  page="home"
                  section="about"
                  keyName="headline"
                  fallback={t('home.about.h2')}
                />
              </h2>
              <p className="mt-4 text-slate-700 dark:text-slate-100/90">
                <CmsText
                  page="home"
                  section="about"
                  keyName="paragraph"
                  fallback={t('home.about.p')}
                />
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[[t('home.about.cards.t1'), t('home.about.cards.d1'), 'card1'],
                  [t('home.about.cards.t2'), t('home.about.cards.d2'), 'card2'],
                  [t('home.about.cards.t3'), t('home.about.cards.d3'), 'card3'],
                  [t('home.about.cards.t4'), t('home.about.cards.d4'), 'card4'],
                ].map(([title, desc, keySuffix]) => (
                  <div key={keySuffix} className="card p-4">
                    <div className="text-sm font-extrabold">
                      <CmsText
                        page="home"
                        section="about_cards"
                        keyName={`${keySuffix}_title`}
                        fallback={title}
                      />
                    </div>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-100/90">
                      <CmsText
                        page="home"
                        section="about_cards"
                        keyName={`${keySuffix}_text`}
                        fallback={desc}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-6" delay={0.06}>
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="card overflow-hidden"
              >
                <div className="relative">
                  <img src="/images/about-conference.jpg" alt="Sehriyo MUN" className="h-[320px] w-full object-cover" />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur dark:bg-slate-950/70 dark:text-slate-100">
                      <span className="h-2 w-2 rounded-full bg-brand-500" />
                      <CmsText
                        page="home"
                        section="about"
                        keyName="photo_chip"
                        fallback={t('home.about.photo_chip')}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-pad py-12 sm:py-16">
        <Reveal>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">
                <CmsText
                  page="home"
                  section="committees"
                  keyName="section_title"
                  fallback={t('committees.title')}
                />
              </div>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                <CmsText
                  page="home"
                  section="committees"
                  keyName="headline"
                  fallback={t('home.choose.h2')}
                />
              </h2>
            </div>
            <Link to="/committees" className="btn-ghost">
              <CmsText
                page="home"
                section="committees"
                keyName="view_all"
                fallback={t('home.choose.view_all')}
              />
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {committeesToShow.slice(0, 6).map((c, idx) => (
            <Reveal key={c.slug} delay={0.05 * idx}>
              <Link
                to={`/committees/${c.slug}`}
                className="card group relative flex h-[260px] flex-col overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                <div className="absolute inset-0 -z-10">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-70"
                  style={{ backgroundImage: `url(${c.bg || c.bg_image_url || '/images/hero-background.jpg'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/55 to-slate-950/25" />
              </div>
              <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-100/90">{i18nText(c.language, i18n.language)}</div>
                    <div className="mt-1 text-lg font-extrabold text-white">{c.acronym}</div>
                    <div className="text-sm font-semibold text-slate-100/90">{i18nText(c.title, i18n.language)}</div>
                  </div>
                  <span className="chip group-hover:border-brand-500/40 group-hover:text-brand-900 dark:group-hover:text-brand-500">{t('home.choose.details')}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-100/90 line-clamp-4">
                  {i18nText(c.description, i18n.language)}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-pad pb-16">
        <Reveal>
          <div className="card p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">
                  <CmsText
                    page="home"
                    section="highlight"
                    keyName="section_title"
                    fallback={t('highlights.title')}
                  />
                </div>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
                  <CmsText
                    page="home"
                    section="highlight"
                    keyName="headline"
                    fallback={t('home.highlight_block.h3')}
                  />
                </h3>
                <p className="mt-3 text-slate-700 dark:text-slate-100/90">
                  <CmsText
                    page="home"
                    section="highlight"
                    keyName="paragraph"
                    fallback={t('home.highlight_block.p')}
                  />
                </p>
              </div>
              <div className="lg:col-span-4">
                <Link className="btn-primary w-full" to="/apply">
                  <CmsText
                    page="home"
                    section="highlight"
                    keyName="cta_primary"
                    fallback={t('hero.cta_primary')}
                  />
                </Link>
                <Link className="btn-ghost mt-3 w-full" to="/team">
                  <CmsText
                    page="home"
                    section="highlight"
                    keyName="cta_secondary"
                    fallback={t('home.highlight_block.meet_team')}
                  />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
