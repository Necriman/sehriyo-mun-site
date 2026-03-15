import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { i18nText } from '../lib/i18nText'
import { Reveal } from '../components/Reveal'
import { useCommittees } from '../lib/cms'
import { committees as staticCommittees } from '../data/committees'

export default function Committees() {
  const { t, i18n } = useTranslation()
  const { committees, loading } = useCommittees()
  const committeesToShow = committees?.length ? committees : staticCommittees
  return (
    <div className="container-pad py-12">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('committees.title')}</h1>
        <p className="mt-2 max-w-2xl text-slate-700 dark:text-slate-100/90">
          {t('committees.page_intro')}
        </p>
      </Reveal>

      {loading ? (
        <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
          {t('committees.loading', 'Loading…')}
        </div>
      ) : (
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {committeesToShow.map((c, idx) => (
          <Reveal key={c.slug} delay={0.03 * idx}>
            <Link
              to={`/committees/${c.slug}`}
              className="card relative flex h-[260px] flex-col overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-glow"
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
                  <div className="text-xs font-bold text-slate-100/90">{i18nText(c.language, i18n.language) || c.languageLabel}</div>
                  <div className="mt-1 text-lg font-extrabold text-white">{c.acronym}</div>
                  <div className="text-sm font-semibold text-slate-100/90">{i18nText(c.title, i18n.language)}</div>
                </div>
                <span className="chip">{t('common.open')}</span>
              </div>
              <div className="mt-4 text-sm text-slate-100/90">
                <div className="font-semibold">{t('committees.agenda')}</div>
                <div className="mt-1 line-clamp-4">{i18nText(c.agenda, i18n.language)}</div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      )}
    </div>
  )
}
