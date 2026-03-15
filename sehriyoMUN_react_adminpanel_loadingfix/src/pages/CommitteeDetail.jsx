import { Link, useParams } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { useTranslation } from 'react-i18next'
import { i18nText } from '../lib/i18nText'
import { useCommitteeBySlug, fetchChairsForCommittee } from '../lib/cms'
import { useEffect, useState } from 'react'

export default function CommitteeDetail() {
  const { t, i18n } = useTranslation()
  const { slug } = useParams()
  const { committee, loading } = useCommitteeBySlug(slug)
  const [bureau, setBureau] = useState([])

  useEffect(() => {
    let alive = true
    if (!committee?.id) {
      setBureau([])
      return
    }
    ;(async () => {
      const rows = await fetchChairsForCommittee(committee.id)
      if (alive) setBureau(rows)
    })()
    return () => {
      alive = false
    }
  }, [committee?.id])

  if (loading) {
    return (
      <div className="container-pad py-12">
        <div className="card p-6">
          <div className="text-lg font-extrabold text-slate-600 dark:text-slate-300">{t('committee_detail.loading', 'Loading…')}</div>
        </div>
      </div>
    )
  }
  if (!committee) {
    return (
      <div className="container-pad py-12">
        <div className="card p-6">
          <div className="text-lg font-extrabold">{t('committee_detail.not_found')}</div>
          <Link className="btn-ghost mt-4" to="/committees">{t('committee_detail.back_to_committees')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-pad py-12">
      
<Reveal>
  <div className="card relative overflow-hidden p-6 sm:p-8">
    <div className="absolute inset-0 -z-10">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-75"
        style={{ backgroundImage: `url(${committee.bg || committee.bg_image_url || '/images/hero-background.jpg'})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/55 to-slate-950/25" />
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-xs font-bold text-slate-200/80">
          {committee.languageLabel || i18nText(committee.language, i18n.language)}
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
          {committee.acronym} — {(committee.title || i18nText(committee.title, i18n.language))}
        </h1>
      </div>
      <Link className="btn-primary" to="/apply">{t('nav.apply')}</Link>
    </div>

    <p className="mt-4 max-w-3xl text-slate-100/85">
      {committee.description || i18nText(committee.description, i18n.language)}
    </p>

    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white/90">{t('committees.agenda')}</div>
        <div className="mt-1 text-sm text-slate-100/85">
          {committee.agenda || i18nText(committee.agenda, i18n.language)}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white/90">{t('committee_detail.bureau')}</div>
        <div className="mt-1 text-sm text-slate-100/85">{t('committee_detail.chairs_count', { count: bureau.length })}</div>
      </div>
    </div>
  </div>
</Reveal>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Reveal>
          <div className="card p-6 lg:col-span-2">
            <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">
              {t('committee_detail.about')}
            </div>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              {committee.description || i18nText(committee.description, i18n.language)}
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white/60 p-5 dark:border-slate-800/70 dark:bg-slate-900/40">
              <div className="text-sm font-extrabold">{t('committees.agenda')}</div>
              <div className="mt-1 text-slate-600 dark:text-slate-300">
                {committee.agenda || i18nText(committee.agenda, i18n.language)}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="card p-6">
            <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">{t('committee_detail.bureau')}</div>
            <div className="mt-4 space-y-3">
              {bureau.length ? bureau.map(b => (
                <div key={b.id ?? b.name} className="group rounded-xl border border-slate-200/60 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:shadow-glow dark:border-slate-800/70 dark:bg-slate-900/40">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl ring-1 ring-slate-200/70 dark:ring-slate-800/70">
                      {(b.photo_url || b.photo) ? (
                        <img src={b.photo_url || b.photo} alt={b.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-brand-50 text-sm font-extrabold text-brand-900 dark:bg-slate-900 dark:text-brand-500">
                          {b.name?.[0] || 'B'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold">{b.name}</div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {i18n.language === 'ru'
                          ? (b.role_ru || i18nText(b.role, i18n.language))
                          : (b.role_en || i18nText(b.role, i18n.language))}
                      </div>
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {i18n.language === 'ru'
                          ? (b.bio_ru || i18nText(b.bio, i18n.language))
                          : (b.bio_en || i18nText(b.bio, i18n.language))}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-slate-600 dark:text-slate-300">{t('committee_detail.bureau_soon')}</div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
