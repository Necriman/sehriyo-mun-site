import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Reveal } from '../components/Reveal'
import { fetchScheduleDays, fetchScheduleEvents } from '../lib/cms'

export default function Schedule() {
  const { t, i18n } = useTranslation()
  const [days, setDays] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [events, setEvents] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const loaded = await fetchScheduleDays()
      if (!alive) return
      setDays(loaded)
      if (loaded.length && !currentId) {
        setCurrentId(loaded[0].id)
      }
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let alive = true
    if (!currentId) {
      setEvents([])
      return
    }
    ;(async () => {
      const loaded = await fetchScheduleEvents(currentId)
      if (alive) setEvents(loaded)
    })()
    return () => { alive = false }
  }, [currentId])

  const currentDay = days.find(d => d.id === currentId)

  return (
    <div className="container-pad py-12">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {t('schedule.title', 'Conference schedule')}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t('schedule.intro', 'Explore the conference days and detailed timeline.')}
        </p>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-start">
        <Reveal className="lg:col-span-3">
          <div className="space-y-2">
            {days.map(day => {
              const isActive = day.id === currentId
              const title = i18n.language === 'ru' ? day.title_ru : day.title_en
              const dateLabel = day.date ? new Date(day.date).toLocaleDateString() : ''
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setCurrentId(day.id)}
                  className={
                    'w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ' +
                    (isActive
                      ? 'border-brand-500 bg-brand-500 text-white shadow'
                      : 'border-slate-200 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200')
                  }
                >
                  <div>{title}</div>
                  {dateLabel ? (
                    <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {dateLabel}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </Reveal>

        <Reveal className="lg:col-span-9" delay={0.04}>
          <div className="card p-6 sm:p-8">
            {currentDay ? (
              <>
                <div className="text-sm font-extrabold text-brand-900 dark:text-brand-500">
                  {i18n.language === 'ru' ? currentDay.title_ru : currentDay.title_en}
                </div>
                {currentDay.description_en || currentDay.description_ru ? (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {i18n.language === 'ru'
                      ? currentDay.description_ru || currentDay.description_en
                      : currentDay.description_en || currentDay.description_ru}
                  </p>
                ) : null}

                <div className="mt-6 space-y-3">
                  {events.map(ev => {
                    const title = i18n.language === 'ru' ? ev.title_ru : ev.title_en
                    const desc = i18n.language === 'ru'
                      ? ev.description_ru || ev.description_en
                      : ev.description_en || ev.description_ru
                    const range =
                      (ev.start_time && ev.end_time)
                        ? `${ev.start_time} – ${ev.end_time}`
                        : ev.start_time || ev.end_time || ''
                    return (
                      <div
                        key={ev.id}
                        className="flex flex-col gap-1 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm dark:border-slate-800/70 dark:bg-slate-900/40 sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div>
                          <div className="font-semibold">{title}</div>
                          {desc ? (
                            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                              {desc}
                            </div>
                          ) : null}
                        </div>
                        {range ? (
                          <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 sm:mt-0 sm:text-right">
                            {range}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}

                  {!events.length && (
                    <div className="rounded-2xl border border-dashed border-slate-300/70 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      {t('schedule.empty', 'No events for this day yet.')}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {t('schedule.no_days', 'Schedule is not configured yet.')}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  )
}

