import { useEffect, useMemo, useState } from 'react'
import { Reveal } from '../components/Reveal'
import { useTranslation } from 'react-i18next'
import { i18nText } from '../lib/i18nText'
import { fetchTeamMembers, fetchCommittees, fetchChairsForCommittee } from '../lib/cms'

export default function Team() {
  const { t, i18n } = useTranslation()
  const [members, setMembers] = useState([])
  const [committees, setCommittees] = useState([])
  const [chairs, setChairs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [m, c] = await Promise.all([
        fetchTeamMembers(),
        fetchCommittees(),
      ])
      if (!alive) return
      setMembers(m || [])
      setCommittees(c || [])
      if (!c?.length) setLoading(false)

      // Load chairs for all committees to display in the chairs block
      const allChairs = []
      for (const com of c || []) {
        const rows = await fetchChairsForCommittee(com.id)
        rows.forEach(r => allChairs.push({ ...r, committeeId: com.id }))
      }
      if (alive) {
        setChairs(allChairs)
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const featured = useMemo(() => members.filter(m => m.is_featured), [members])
  const grouped = useMemo(() => {
    const groups = new Map()
    for (const m of members.filter(m => !m.is_featured)) {
      const key = m.group_key || 'other'
      if (!groups.has(key)) {
        groups.set(key, {
          key,
          order: m.group_order ?? 0,
          label_en: m.group_label_en,
          label_ru: m.group_label_ru,
          items: [],
        })
      }
      groups.get(key).items.push(m)
    }
    return Array.from(groups.values()).sort((a, b) => a.order - b.order)
  }, [members])

  const chairsWithCommittee = useMemo(() => {
    const byId = new Map()
    committees.forEach(c => byId.set(c.id, c))
    return chairs.map(ch => ({
      ...ch,
      committee: byId.get(ch.committeeId || ch.committee_id),
    }))
  }, [chairs, committees])

  return (
    <div className="container-pad py-12">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('team.title')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t('team.intro')}
        </p>
      </Reveal>

      {loading && (
        <div className="mt-8 text-center text-slate-500 dark:text-slate-400">
          {t('team.loading', 'Loading…')}
        </div>
      )}
      {!loading && (
      <>
      {/* Featured leadership */}
      {featured.length ? (
        <section className="mt-8">
          <Reveal>
            <div className="mb-4 text-sm font-extrabold text-brand-900 dark:text-brand-500">
              {t('team.leadership', 'Secretariat')}
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((m, idx) => (
              <Reveal key={m.id || m.name} delay={0.04 * idx}>
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-900/90 text-slate-50 shadow-lg dark:border-slate-700">
                  <div className="aspect-[3/4] w-full overflow-hidden bg-slate-800">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col justify-between px-5 py-4">
                    <div>
                      <div className="text-sm font-extrabold uppercase tracking-wide">
                        {m.name}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-amber-300">
                        {i18n.language === 'ru' ? (m.role_ru || m.role_en) : (m.role_en || m.role_ru)}
                      </div>
                      {m.bio_en || m.bio_ru ? (
                        <p className="mt-2 text-xs text-slate-200">
                          {i18n.language === 'ru' ? (m.bio_ru || m.bio_en) : (m.bio_en || m.bio_ru)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Other departments / staff */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {grouped.map((group, idx) => (
          <Reveal key={group.key} delay={0.03 * idx}>
            <div className="card p-6">
              <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">
                {i18n.language === 'ru'
                  ? (group.label_ru || group.label_en || group.key)
                  : (group.label_en || group.label_ru || group.key)}
              </div>
              <div className="mt-4 space-y-3">
                {group.items.map(m => (
                  <div
                    key={m.id || m.name}
                    className="group rounded-xl border border-slate-200/60 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:shadow-glow dark:border-slate-800/70 dark:bg-slate-900/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl ring-1 ring-slate-200/70 dark:ring-slate-800/70">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-brand-50 text-sm font-extrabold text-brand-900 dark:bg-slate-900 dark:text-brand-500">
                            {m.name?.[0] || 'S'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold">{m.name}</div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {i18n.language === 'ru' ? (m.role_ru || m.role_en) : (m.role_en || m.role_ru)}
                        </div>
                        {m.bio_en || m.bio_ru ? (
                          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            {i18n.language === 'ru' ? (m.bio_ru || m.bio_en) : (m.bio_en || m.bio_ru)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}

        {/* Chairs block */}
        <Reveal delay={0.08}>
          <div className="card p-6">
            <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">{t('team.chairs')}</div>
            <div className="mt-4 space-y-3">
              {chairsWithCommittee.map(c => (
                <div
                  key={c.id || c.name}
                  className="group rounded-xl border border-slate-200/60 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:shadow-glow dark:border-slate-800/70 dark:bg-slate-900/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl ring-1 ring-slate-200/70 dark:ring-slate-800/70">
                        {c.photo_url ? (
                          <img src={c.photo_url} alt={c.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-brand-50 text-sm font-extrabold text-brand-900 dark:bg-slate-900 dark:text-brand-500">
                            {c.name?.[0] || 'C'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold">{c.name}</div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {i18n.language === 'ru' ? (c.role_ru || c.role_en) : (c.role_en || c.role_ru)}
                        </div>
                      </div>
                    </div>
                    <span className="chip">
                      {c.committee ? c.committee.acronym : t('team.committee')}
                    </span>
                  </div>
                  {c.bio_en || c.bio_ru ? (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {i18n.language === 'ru' ? (c.bio_ru || c.bio_en) : (c.bio_en || c.bio_ru)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      </>
      )}
    </div>
  )
}
