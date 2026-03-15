import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { signOut } from '../lib/admin'
import { Reveal } from '../components/Reveal'
import { useTranslation } from 'react-i18next'
import { i18nText } from '../lib/i18nText'
import {
  fetchCommittees,
  fetchCmsStrings,
  fetchAllCmsStrings,
  fetchScheduleDays,
  fetchScheduleEvents,
  fetchTeamMembers,
  fetchSiteSettings,
  fetchCommitteesAdmin,
  fetchCommitteeTranslations,
  fetchChairsForCommittee,
  upsertCmsString,
  deleteCmsString,
  upsertCommittee,
  deleteCommittee,
  upsertChair,
  deleteChair,
  upsertScheduleDay,
  deleteScheduleDay,
  upsertScheduleEvent,
  deleteScheduleEvent,
  upsertTeamMember,
  deleteTeamMember,
  upsertSiteSetting,
  deleteSiteSetting,
} from '../lib/cms'

const STATUS = ['pending', 'approved', 'rejected']

function statusLabel(t, s) {
  if (s === 'approved') return t('admin.approved')
  if (s === 'rejected') return t('admin.rejected')
  return t('admin.pending')
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'rounded-full px-4 py-2 text-sm font-semibold transition ' +
        (active
          ? 'bg-red-600 text-white shadow'
          : 'bg-white/5 text-slate-200 hover:bg-white/10')
      }
    >
      {children}
    </button>
  )
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState('applications')

  // Applications state
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatusFilter] = useState('all')
  const [q, setQ] = useState('')

  // Content (cms_strings)
  const [cmsPage, setCmsPage] = useState('home')
  const [cmsRows, setCmsRows] = useState([])

  // Committees
  const [committees, setCommittees] = useState([])
  const [committeeError, setCommitteeError] = useState('')

  // Schedule
  const [days, setDays] = useState([])
  const [scheduleDayId, setScheduleDayId] = useState(null)
  const [events, setEvents] = useState([])

  // Team
  const [team, setTeam] = useState([])

  // Chairs (bureau per committee)
  const [chairs, setChairs] = useState([])
  const [editingChair, setEditingChair] = useState(null)
  const [chairForm, setChairForm] = useState({
    committee_id: '',
    name: '',
    photo_url: '',
    role_en: '',
    role_ru: '',
    bio_en: '',
    bio_ru: '',
    sort_order: 0,
  })
  const [chairError, setChairError] = useState('')

  // Settings
  const [settings, setSettings] = useState([])

  // Content tab: which page and edit form
  const [contentPageFilter, setContentPageFilter] = useState('home')
  const [allCmsRows, setAllCmsRows] = useState([])
  const [editingCms, setEditingCms] = useState(null)
  const [cmsForm, setCmsForm] = useState({ page: 'home', section: '', key: '', locale: 'ru', value: '', description: '' })
  const [contentError, setContentError] = useState('')

  // Committees form
  const [editingCommittee, setEditingCommittee] = useState(null)
  const [committeeForm, setCommitteeForm] = useState({ slug: '', acronym: '', bg_image_url: '', sort_order: 0, is_published: true, title_en: '', title_ru: '', language_label_en: '', language_label_ru: '', agenda_en: '', agenda_ru: '', description_en: '', description_ru: '' })

  // Schedule: selected day for events, editing day/event
  const [editingDay, setEditingDay] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [dayForm, setDayForm] = useState({ slug: '', sort_order: 0, date: '', title_en: '', title_ru: '', description_en: '', description_ru: '' })
  const [eventForm, setEventForm] = useState({ title_en: '', title_ru: '', start_time: '', end_time: '', description_en: '', description_ru: '', sort_order: 0 })
  const [scheduleError, setScheduleError] = useState('')
  const [scheduleEventError, setScheduleEventError] = useState('')

  // Team form
  const [editingMember, setEditingMember] = useState(null)
  const [memberForm, setMemberForm] = useState({ name: '', photo_url: '', group_key: 'default', group_order: 0, sort_order: 0, group_label_en: '', group_label_ru: '', role_en: '', role_ru: '', bio_en: '', bio_ru: '', is_featured: false })

  // Settings form
  const [settingForm, setSettingForm] = useState({ key: '', value: '' })

  const committeeMap = useMemo(() => {
    const m = new Map()
    committees.forEach(c => m.set(c.slug, i18nText(c.title, i18n.language) || c.slug))
    return m
  }, [committees, i18n.language])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (!error) setRows(data || [])
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (tab === 'content') loadContentTab()
  }, [tab])

  useEffect(() => {
    if (scheduleDayId) {
      fetchScheduleEvents(scheduleDayId).then(setEvents)
    } else {
      setEvents([])
    }
  }, [scheduleDayId])

  async function loadContentTab() {
    const data = await fetchAllCmsStrings()
    setAllCmsRows(data || [])
  }

  // Initial loads for other tabs
  useEffect(() => {
    ;(async () => {
      const [cms, baseComs, d, tMembers, s] = await Promise.all([
        fetchCmsStrings(cmsPage),
        fetchCommitteesAdmin(),
        fetchScheduleDays(),
        fetchTeamMembers(),
        fetchSiteSettings(),
      ])
      setCmsRows(cms)
      const ids = (baseComs || []).map(c => c.id)
      const [transEn, transRu] = await Promise.all([
        fetchCommitteeTranslations(ids, 'en'),
        fetchCommitteeTranslations(ids, 'ru'),
      ])
      const byIdEn = new Map(transEn.map(t => [t.committee_id, t]))
      const byIdRu = new Map(transRu.map(t => [t.committee_id, t]))
      const merged = (baseComs || []).map(c => ({
        ...c,
        title: { en: byIdEn.get(c.id)?.title, ru: byIdRu.get(c.id)?.title },
        languageLabel: { en: byIdEn.get(c.id)?.language_label, ru: byIdRu.get(c.id)?.language_label },
        agenda: { en: byIdEn.get(c.id)?.agenda, ru: byIdRu.get(c.id)?.agenda },
        description: { en: byIdEn.get(c.id)?.description, ru: byIdRu.get(c.id)?.description },
      }))
      setCommittees(merged)

      // Load all chairs for admin (for Team tab)
      const allChairs = []
      for (const com of baseComs || []) {
        const rows = await fetchChairsForCommittee(com.id)
        rows.forEach(r => allChairs.push({ ...r, committee_id: com.id }))
      }
      setChairs(allChairs)

      setDays(d)
      setTeam(tMembers)
      setSettings(s)
      if (d.length && !scheduleDayId) setScheduleDayId(d[0].id)
      if (d.length) {
        const ev = await fetchScheduleEvents(d[0].id)
        setEvents(ev)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return (rows || []).filter(r => {
      if (status !== 'all' && r.status !== status) return false
      if (!query) return true
      const hay = [
        r.full_name, r.email, r.phone, r.school,
        r.motivation, r.experience, r.preferred_committee
      ].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(query)
    })
  }, [rows, status, q])

  async function updateApplicationStatus(id, next) {
    if (!STATUS.includes(next)) return
    await supabase.from('applications').update({ status: next }).eq('id', id)
    setRows(prev => prev.map(r => (r.id === id ? { ...r, status: next } : r)))
  }

  async function remove(id) {
    if (!confirm(t('admin.confirm_delete'))) return
    await supabase.from('applications').delete().eq('id', id)
    setRows(prev => prev.filter(r => r.id !== id))
  }

  async function onSignOut() {
    await signOut()
    location.href = '/admin/login'
  }

  return (
    <div className="container-pad py-12">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('admin.title')}</h1>
            <p className="mt-1 text-slate-300">{filtered.length} / {rows.length}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={load} disabled={loading}>
              {loading ? t('admin.loading') : '↻'}
            </button>
            <button className="btn-ghost" onClick={onSignOut}>{t('admin.sign_out')}</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          <TabButton active={tab === 'applications'} onClick={() => setTab('applications')}>{t('admin.tab_applications', 'Applications')}</TabButton>
          <TabButton active={tab === 'content'} onClick={() => setTab('content')}>{t('admin.tab_content', 'Content')}</TabButton>
          <TabButton active={tab === 'committees'} onClick={() => setTab('committees')}>{t('admin.tab_committees', 'Committees')}</TabButton>
          <TabButton active={tab === 'schedule'} onClick={() => setTab('schedule')}>{t('admin.tab_schedule', 'Schedule')}</TabButton>
          <TabButton active={tab === 'team'} onClick={() => setTab('team')}>{t('admin.tab_team', 'Team')}</TabButton>
          <TabButton active={tab === 'settings'} onClick={() => setTab('settings')}>{t('admin.tab_settings', 'Settings')}</TabButton>
        </div>

        {tab === 'applications' && (
          <>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
                <div className="text-sm font-semibold text-slate-200">{t('admin.status')}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['all', ...STATUS].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full px-3 py-1 text-sm transition ${
                        status === s ? 'bg-red-600 text-white shadow' : 'bg-white/5 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {s === 'all' ? t('admin.all') : statusLabel(t, s)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
                <div className="text-sm font-semibold text-slate-200">{t('admin.search')}</div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('admin.search_ph')}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-red-500/60"
                />
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur">
              <div className="grid grid-cols-12 gap-0 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <div className="col-span-3">{t('form.full_name')}</div>
                <div className="col-span-2">{t('admin.created')}</div>
                <div className="col-span-2">{t('form.email')}</div>
                <div className="col-span-2">{t('form.school')}</div>
                <div className="col-span-2">{t('admin.committee')}</div>
                <div className="col-span-1 text-right">{t('admin.actions')}</div>
              </div>

              {filtered.map(r => (
                <div key={r.id} className="border-b border-white/5 px-4 py-4 last:border-b-0">
                  <div className="grid grid-cols-12 items-start gap-3">
                    <div className="col-span-12 md:col-span-3">
                      <div className="font-semibold text-white">{r.full_name}</div>
                      <div className="mt-1 inline-flex items-center rounded-full bg-white/5 px-2 py-1 text-xs text-slate-200">
                        {statusLabel(t, r.status)}
                      </div>
                      {r.phone ? <div className="mt-2 text-sm text-slate-300">{r.phone}</div> : null}
                    </div>

                    <div className="col-span-6 md:col-span-2 text-sm text-slate-300">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                    <div className="col-span-6 md:col-span-2 text-sm text-slate-300">{r.email}</div>
                    <div className="col-span-6 md:col-span-2 text-sm text-slate-300">{r.school}</div>
                    <div className="col-span-6 md:col-span-2 text-sm text-slate-300">
                      {committeeMap.get(r.preferred_committee) || r.preferred_committee}
                    </div>

                    <div className="col-span-12 md:col-span-1 flex justify-end gap-2">
                      <button className="btn-ghost h-9 px-3" onClick={() => updateApplicationStatus(r.id, 'approved')}>✅</button>
                      <button className="btn-ghost h-9 px-3" onClick={() => updateApplicationStatus(r.id, 'rejected')}>❌</button>
                      <button className="btn-ghost h-9 px-3" onClick={() => remove(r.id)}>🗑</button>
                    </div>
                  </div>

                  {(r.motivation || r.experience) ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {r.motivation ? (
                        <div className="rounded-2xl bg-white/5 p-3 text-sm text-slate-200">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('form.motivation')}</div>
                          {r.motivation}
                        </div>
                      ) : null}
                      {r.experience ? (
                        <div className="rounded-2xl bg-white/5 p-3 text-sm text-slate-200">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{t('form.experience')}</div>
                          {r.experience}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}

              {(!loading && filtered.length === 0) ? (
                <div className="px-4 py-10 text-center text-slate-300">—</div>
              ) : null}
            </div>
          </>
        )}

        {/* Content tab: CMS strings and text editing */}
        {tab === 'content' && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-200">Страница:</span>
              {['home', 'i18n'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setContentPageFilter(p); if (p !== contentPageFilter) loadContentTab() }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${contentPageFilter === p ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                >
                  {p === 'home' ? 'Контент главной' : 'Переводы интерфейса'}
                </button>
              ))}
              <button type="button" onClick={loadContentTab} className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">↻ Обновить</button>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
              <div className="mb-4 flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Страница</label>
                  <input
                    value={cmsForm.page}
                    onChange={e => setCmsForm(f => ({ ...f, page: e.target.value }))}
                    className="mt-1 w-32 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Секция</label>
                  <input
                    value={cmsForm.section}
                    onChange={e => setCmsForm(f => ({ ...f, section: e.target.value }))}
                    className="mt-1 w-32 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                    placeholder="hero"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Ключ</label>
                  <input
                    value={cmsForm.key}
                    onChange={e => setCmsForm(f => ({ ...f, key: e.target.value }))}
                    className="mt-1 w-40 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                    placeholder="headline_top"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Язык</label>
                  <select value={cmsForm.locale} onChange={e => setCmsForm(f => ({ ...f, locale: e.target.value }))} className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white">
                    <option value="en">EN</option>
                    <option value="ru">RU</option>
                  </select>
                </div>
                <div className="min-w-[200px] flex-1">
                  <label className="block text-xs font-semibold text-slate-400">Значение</label>
                  <input
                    value={cmsForm.value}
                    onChange={e => setCmsForm(f => ({ ...f, value: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                    placeholder="Текст..."
                  />
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={async () => {
                    setContentError('')
                    const key = (cmsForm.key || '').trim()
                    const value = (cmsForm.value || '').trim()
                    if (!key || !value) {
                      setContentError('Заполните «Ключ» и «Значение».')
                      return
                    }
                    const payload = {
                      page: contentPageFilter,
                      section: (cmsForm.section || '').trim(),
                      key,
                      locale: cmsForm.locale,
                      value,
                      description: (cmsForm.description || '').trim() || null,
                    }
                    if (editingCms?.id) payload.id = editingCms.id
                    const { error } = await upsertCmsString(payload)
                    if (error) {
                      setContentError(error.message || 'Ошибка сохранения.')
                      return
                    }
                    setEditingCms(null)
                    setCmsForm({ page: contentPageFilter, section: '', key: '', locale: 'ru', value: '', description: '' })
                    loadContentTab()
                  }}
                >
                  {editingCms ? 'Сохранить' : 'Добавить'}
                </button>
                {editingCms && <button type="button" className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/20" onClick={() => { setEditingCms(null); setContentError(''); setCmsForm({ page: contentPageFilter, section: '', key: '', locale: 'ru', value: '', description: '' }) }}>Отмена</button>}
              </div>
              {contentError && <p className="mt-2 text-sm text-red-400">{contentError}</p>}
              <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-white/10">
                {(allCmsRows.filter(r => r.page === contentPageFilter)).map(row => (
                  <div key={row.id} className="flex flex-wrap items-center gap-2 border-b border-white/5 p-3 last:border-b-0">
                    <span className="text-xs text-slate-500">{row.section || '—'}</span>
                    <span className="font-mono text-sm text-slate-200">{row.key}</span>
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-slate-300">{row.locale}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{row.value}</span>
                    <button type="button" className="text-slate-400 hover:text-white" onClick={() => { setEditingCms(row); setCmsForm({ id: row.id, page: row.page, section: row.section || '', key: row.key, locale: row.locale, value: row.value, description: row.description || '' }) }}>Изм.</button>
                    <button type="button" className="text-red-400 hover:text-red-300" onClick={async () => { if (confirm('Удалить?')) { await deleteCmsString(row.id); loadContentTab() } }}>×</button>
                  </div>
                ))}
                {allCmsRows.filter(r => r.page === contentPageFilter).length === 0 && (
                  <div className="p-6 text-center text-slate-500">Нет записей. Добавьте выше.</div>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500">Контент главной: ключи section/key используются в блоках CmsText на сайте. Переводы интерфейса (i18n): после сохранения обновите страницу сайта — тексты меню, кнопок и т.д. подтянутся из БД.</p>
          </div>
        )}

        {/* Committees tab */}
        {tab === 'committees' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-white">Добавить / изменить комитет</h3>
              <p className="mb-4 text-xs text-slate-400">Чтобы изменить комитет: нажмите «Изм.» в списке ниже — форма заполнится. Отредактируйте поля и нажмите «Сохранить».</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Slug (латиница)</label>
                  <input value={committeeForm.slug} onChange={e => setCommitteeForm(f => ({ ...f, slug: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="ga" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Аббревиатура</label>
                  <input value={committeeForm.acronym} onChange={e => setCommitteeForm(f => ({ ...f, acronym: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="GA" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Фото (URL)</label>
                  <input value={committeeForm.bg_image_url} onChange={e => setCommitteeForm(f => ({ ...f, bg_image_url: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="/images/..." />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={committeeForm.is_published} onChange={e => setCommitteeForm(f => ({ ...f, is_published: e.target.checked }))} className="rounded" />
                    Опубликован
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400">Название EN / RU</label>
                  <div className="mt-1 flex gap-2">
                    <input value={committeeForm.title_en} onChange={e => setCommitteeForm(f => ({ ...f, title_en: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Title EN" />
                    <input value={committeeForm.title_ru} onChange={e => setCommitteeForm(f => ({ ...f, title_ru: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Название RU" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400">Язык комитета EN / RU</label>
                  <div className="mt-1 flex gap-2">
                    <input value={committeeForm.language_label_en} onChange={e => setCommitteeForm(f => ({ ...f, language_label_en: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="English" />
                    <input value={committeeForm.language_label_ru} onChange={e => setCommitteeForm(f => ({ ...f, language_label_ru: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Английский" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400">Повестка EN / RU</label>
                  <div className="mt-1 flex gap-2">
                    <input value={committeeForm.agenda_en} onChange={e => setCommitteeForm(f => ({ ...f, agenda_en: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Agenda" />
                    <input value={committeeForm.agenda_ru} onChange={e => setCommitteeForm(f => ({ ...f, agenda_ru: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Повестка" />
                  </div>
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-xs font-semibold text-slate-400">Описание EN / RU</label>
                  <div className="mt-1 flex gap-2">
                    <textarea value={committeeForm.description_en} onChange={e => setCommitteeForm(f => ({ ...f, description_en: e.target.value }))} rows={2} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Description" />
                    <textarea value={committeeForm.description_ru} onChange={e => setCommitteeForm(f => ({ ...f, description_ru: e.target.value }))} rows={2} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Описание" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={async () => {
                    setCommitteeError('')
                    const slug = (committeeForm.slug || '').trim()
                    const acronym = (committeeForm.acronym || '').trim()
                    if (!slug || !acronym) {
                      setCommitteeError('Заполните slug и аббревиатуру.')
                      return
                    }
                    const { error } = await upsertCommittee(
                      { id: editingCommittee?.id, slug, acronym, bg_image_url: (committeeForm.bg_image_url || '').trim() || null, sort_order: committeeForm.sort_order, is_published: committeeForm.is_published },
                      [
                        { locale: 'en', title: (committeeForm.title_en || '').trim() || 'Title', language_label: (committeeForm.language_label_en || '').trim() || 'English', agenda: (committeeForm.agenda_en || '').trim() || null, description: (committeeForm.description_en || '').trim() || null },
                        { locale: 'ru', title: (committeeForm.title_ru || '').trim() || 'Название', language_label: (committeeForm.language_label_ru || '').trim() || 'Русский', agenda: (committeeForm.agenda_ru || '').trim() || null, description: (committeeForm.description_ru || '').trim() || null },
                      ]
                    )
                    if (error) {
                      setCommitteeError(error.message || 'Ошибка сохранения.')
                      return
                    }
                    setEditingCommittee(null)
                    setCommitteeForm({ slug: '', acronym: '', bg_image_url: '', sort_order: committees.length, is_published: true, title_en: '', title_ru: '', language_label_en: 'English', language_label_ru: 'Английский', agenda_en: '', agenda_ru: '', description_en: '', description_ru: '' })
                    const [baseComs] = await Promise.all([fetchCommitteesAdmin()])
                    const ids = (baseComs || []).map(c => c.id)
                    const [te, tr] = await Promise.all([fetchCommitteeTranslations(ids, 'en'), fetchCommitteeTranslations(ids, 'ru')])
                    const byEn = new Map(te.map(x => [x.committee_id, x]))
                    const byRu = new Map(tr.map(x => [x.committee_id, x]))
                    setCommittees((baseComs || []).map(c => ({ ...c, title: { en: byEn.get(c.id)?.title, ru: byRu.get(c.id)?.title }, languageLabel: { en: byEn.get(c.id)?.language_label, ru: byRu.get(c.id)?.language_label }, agenda: { en: byEn.get(c.id)?.agenda, ru: byRu.get(c.id)?.agenda }, description: { en: byEn.get(c.id)?.description, ru: byRu.get(c.id)?.description } })))
                  }}
                >
                  {editingCommittee ? 'Сохранить' : 'Добавить комитет'}
                </button>
                {editingCommittee && <button type="button" className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-200" onClick={() => { setEditingCommittee(null); setCommitteeError(''); setCommitteeForm({ slug: '', acronym: '', bg_image_url: '', sort_order: committees.length, is_published: true, title_en: '', title_ru: '', language_label_en: 'English', language_label_ru: 'Английский', agenda_en: '', agenda_ru: '', description_en: '', description_ru: '' }) }}>Отмена</button>}
              </div>
              {committeeError && <p className="mt-2 text-sm text-red-400">{committeeError}</p>}
            </div>
            <div className="rounded-2xl border border-white/10">
              {committees.map(c => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 p-3 last:border-b-0">
                  <span className="font-semibold text-white">{c.acronym}</span>
                  <span className="text-sm text-slate-300">{i18nText(c.title, i18n.language)}</span>
                  <div className="flex gap-2">
                    <button type="button" className="text-sm text-slate-400 hover:text-white" onClick={() => { setEditingCommittee(c); setCommitteeForm({ slug: c.slug, acronym: c.acronym, bg_image_url: c.bg_image_url || '', sort_order: c.sort_order ?? 0, is_published: c.is_published !== false, title_en: c.title?.en || '', title_ru: c.title?.ru || '', language_label_en: c.languageLabel?.en || '', language_label_ru: c.languageLabel?.ru || '', agenda_en: c.agenda?.en || '', agenda_ru: c.agenda?.ru || '', description_en: c.description?.en || '', description_ru: c.description?.ru || '' }) }}>Изм.</button>
                    <button type="button" className="text-red-400 hover:text-red-300" onClick={async () => { if (confirm('Удалить комитет?')) { await deleteCommittee(c.id); setCommittees(prev => prev.filter(x => x.id !== c.id)) } }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule tab */}
        {tab === 'schedule' && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
                  <h3 className="mb-3 text-sm font-semibold text-slate-200">Дни</h3>
                  <div className="space-y-2">
                    {days.map(day => (
                      <div key={day.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setScheduleDayId(day.id)}
                          className={`flex-1 rounded-xl border px-3 py-2 text-left text-sm ${scheduleDayId === day.id ? 'border-red-500 bg-red-600/20 text-white' : 'border-white/10 text-slate-200 hover:bg-white/5'}`}
                        >
                          {i18n.language === 'ru' ? day.title_ru : day.title_en}
                        </button>
                        <button type="button" className="text-slate-400 hover:text-white text-xs" onClick={() => { setEditingDay(day); setDayForm({ id: day.id, slug: day.slug, sort_order: day.sort_order ?? 0, date: day.date ? day.date.slice(0, 10) : '', title_en: day.title_en || '', title_ru: day.title_ru || '', description_en: day.description_en || '', description_ru: day.description_ru || '' }) }}>Изм.</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                    <h4 className="mb-2 text-xs font-semibold text-slate-400">{editingDay ? 'Изменить день' : 'Новый день'}</h4>
                    <label className="mb-1 block text-xs text-slate-500">Slug (латиница, например day1)</label>
                    <input placeholder="day1" value={dayForm.slug} onChange={e => setDayForm(f => ({ ...f, slug: e.target.value }))} className="mb-2 w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white" />
                    <label className="mb-1 block text-xs text-slate-500">Название (EN)</label>
                    <input placeholder="Conference Day" value={dayForm.title_en} onChange={e => setDayForm(f => ({ ...f, title_en: e.target.value }))} className="mb-2 w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white" />
                    <label className="mb-1 block text-xs text-slate-500">Название (RU)</label>
                    <input placeholder="День конференции" value={dayForm.title_ru} onChange={e => setDayForm(f => ({ ...f, title_ru: e.target.value }))} className="mb-2 w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white" />
                    <label className="mb-1 block text-xs text-slate-500">Дата (необязательно)</label>
                    <input type="date" value={dayForm.date} onChange={e => setDayForm(f => ({ ...f, date: e.target.value }))} className="mb-2 w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white" />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                        onClick={async () => {
                          setScheduleError('')
                          const slug = (dayForm.slug || '').trim()
                          const titleEn = (dayForm.title_en || '').trim()
                          const titleRu = (dayForm.title_ru || '').trim()
                          if (!slug || (!titleEn && !titleRu)) {
                            setScheduleError('Заполните slug и хотя бы одно название (EN или RU).')
                            return
                          }
                          const payload = {
                            slug,
                            sort_order: editingDay?.sort_order ?? days.length,
                            date: dayForm.date || null,
                            title_en: titleEn || titleRu || 'Day',
                            title_ru: titleRu || titleEn || 'День',
                            description_en: (dayForm.description_en || '').trim() || null,
                            description_ru: (dayForm.description_ru || '').trim() || null,
                          }
                          if (editingDay?.id) payload.id = editingDay.id
                          const { error } = await upsertScheduleDay(payload)
                          if (error) {
                            setScheduleError(error.message || 'Ошибка сохранения дня.')
                            return
                          }
                          setEditingDay(null)
                          setDayForm({ slug: '', sort_order: 0, date: '', title_en: '', title_ru: '', description_en: '', description_ru: '' })
                          const d = await fetchScheduleDays()
                          setDays(d)
                          if (d.length && !scheduleDayId) setScheduleDayId(d[0].id)
                        }}
                      >
                        {editingDay ? 'Сохранить' : 'Добавить'}
                      </button>
                      {editingDay && <button type="button" className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-slate-200" onClick={() => { setEditingDay(null); setScheduleError('') }}>Отмена</button>}
                    </div>
                    {scheduleError && <p className="mt-2 text-sm text-red-400">{scheduleError}</p>}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4 backdrop-blur">
                  <h3 className="mb-3 text-sm font-semibold text-slate-200">События выбранного дня</h3>
                  <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/40 p-3">
                    <h4 className="mb-2 text-xs font-semibold text-slate-400">Новое событие</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs text-slate-500">Название (EN)</label>
                        <input placeholder="Opening" value={eventForm.title_en} onChange={e => setEventForm(f => ({ ...f, title_en: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500">Название (RU)</label>
                        <input placeholder="Открытие" value={eventForm.title_ru} onChange={e => setEventForm(f => ({ ...f, title_ru: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500">Начало (например 09:00)</label>
                        <input placeholder="09:00" value={eventForm.start_time} onChange={e => setEventForm(f => ({ ...f, start_time: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500">Конец (например 18:00)</label>
                        <input placeholder="18:00" value={eventForm.end_time} onChange={e => setEventForm(f => ({ ...f, end_time: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-slate-800 px-2 py-1.5 text-sm text-white" />
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                        disabled={!scheduleDayId}
                        onClick={async () => {
                          if (!scheduleDayId) return
                          setScheduleEventError('')
                          const titleEn = (eventForm.title_en || '').trim()
                          const titleRu = (eventForm.title_ru || '').trim()
                          if (!titleEn && !titleRu) {
                            setScheduleEventError('Введите название события (EN или RU).')
                            return
                          }
                          const payload = {
                            day_id: scheduleDayId,
                            sort_order: editingEvent?.sort_order ?? events.length,
                            start_time: (eventForm.start_time || '').trim() || null,
                            end_time: (eventForm.end_time || '').trim() || null,
                            title_en: titleEn || titleRu || 'Event',
                            title_ru: titleRu || titleEn || 'Событие',
                            description_en: (eventForm.description_en || '').trim() || null,
                            description_ru: (eventForm.description_ru || '').trim() || null,
                          }
                          if (editingEvent?.id) payload.id = editingEvent.id
                          const { error } = await upsertScheduleEvent(payload)
                          if (error) {
                            setScheduleEventError(error.message || 'Ошибка сохранения события.')
                            return
                          }
                          setEditingEvent(null)
                          setEventForm({ title_en: '', title_ru: '', start_time: '', end_time: '', description_en: '', description_ru: '', sort_order: events.length })
                          setEvents(await fetchScheduleEvents(scheduleDayId))
                        }}
                      >
                        {editingEvent ? 'Сохранить' : 'Добавить событие'}
                      </button>
                      {editingEvent && <button type="button" className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-slate-200" onClick={() => { setEditingEvent(null); setScheduleEventError('') }}>Отмена</button>}
                    </div>
                    {scheduleEventError && <p className="mt-2 text-sm text-red-400">{scheduleEventError}</p>}
                    {!scheduleDayId && days.length > 0 && <p className="mt-2 text-xs text-amber-400">Сначала выберите день слева.</p>}
                  </div>
                  <div className="space-y-2">
                    {events.map(ev => (
                      <div key={ev.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 p-3">
                        <span className="text-sm font-semibold text-white">{i18n.language === 'ru' ? ev.title_ru : ev.title_en}</span>
                        <span className="text-xs text-slate-400">{ev.start_time} – {ev.end_time}</span>
                        <div className="flex gap-2">
                          <button type="button" className="text-xs text-slate-400 hover:text-white" onClick={() => { setEditingEvent(ev); setEventForm({ id: ev.id, title_en: ev.title_en, title_ru: ev.title_ru, start_time: ev.start_time || '', end_time: ev.end_time || '', description_en: ev.description_en || '', description_ru: ev.description_ru || '', sort_order: ev.sort_order ?? 0 }) }}>Изм.</button>
                          <button type="button" className="text-red-400" onClick={async () => { if (confirm('Удалить?')) { await deleteScheduleEvent(ev.id); setEvents(await fetchScheduleEvents(scheduleDayId)) } }}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {days.length === 0 && <p className="text-sm text-slate-500">Сначала добавьте день слева.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team tab */}
        {tab === 'team' && (
          <div className="mt-6 space-y-6">
            {/* Forms row: team members + chairs */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Team members (secretariat & staff) */}
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-white">Участник команды</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Имя</label>
                  <input value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Фото URL</label>
                  <input value={memberForm.photo_url} onChange={e => setMemberForm(f => ({ ...f, photo_url: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Группа (key)</label>
                  <input value={memberForm.group_key} onChange={e => setMemberForm(f => ({ ...f, group_key: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="default" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Роль EN / RU</label>
                  <div className="mt-1 flex gap-2">
                    <input value={memberForm.role_en} onChange={e => setMemberForm(f => ({ ...f, role_en: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Role" />
                    <input value={memberForm.role_ru} onChange={e => setMemberForm(f => ({ ...f, role_ru: e.target.value }))} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" placeholder="Роль" />
                  </div>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={memberForm.is_featured}
                      onChange={e => setMemberForm(f => ({ ...f, is_featured: e.target.checked }))}
                      className="rounded"
                    />
                    В секретариате (featured)
                  </label>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-400">Био EN / RU</label>
                  <div className="mt-1 flex gap-2">
                    <textarea value={memberForm.bio_en} onChange={e => setMemberForm(f => ({ ...f, bio_en: e.target.value }))} rows={2} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" />
                    <textarea value={memberForm.bio_ru} onChange={e => setMemberForm(f => ({ ...f, bio_ru: e.target.value }))} rows={2} className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={async () => {
                    const { error } = await upsertTeamMember({ ...editingMember, ...memberForm })
                    if (!error) {
                      setEditingMember(null)
                      setMemberForm({
                        name: '',
                        photo_url: '',
                        group_key: 'default',
                        group_order: 0,
                        sort_order: 0,
                        group_label_en: '',
                        group_label_ru: '',
                        role_en: '',
                        role_ru: '',
                        bio_en: '',
                        bio_ru: '',
                        is_featured: false,
                      })
                      setTeam(await fetchTeamMembers())
                    }
                  }}
                >
                  {editingMember ? 'Сохранить' : 'Добавить'}
                </button>
                {editingMember && (
                  <button
                    type="button"
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-200"
                    onClick={() => setEditingMember(null)}
                  >
                    Отмена
                  </button>
                )}
              </div>
              </div>

              {/* Chairs admin: assign chairs to committees */}
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-white">Члены бюро (chairs)</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Комитет</label>
                  <select
                    value={chairForm.committee_id}
                    onChange={e => setChairForm(f => ({ ...f, committee_id: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  >
                    <option value="">Выберите комитет</option>
                    {committees.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.acronym}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Имя</label>
                  <input
                    value={chairForm.name}
                    onChange={e => setChairForm(f => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400">Фото URL</label>
                  <input
                    value={chairForm.photo_url}
                    onChange={e => setChairForm(f => ({ ...f, photo_url: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-400">Роль EN / RU</label>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={chairForm.role_en}
                      onChange={e => setChairForm(f => ({ ...f, role_en: e.target.value }))}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                      placeholder="Chair"
                    />
                    <input
                      value={chairForm.role_ru}
                      onChange={e => setChairForm(f => ({ ...f, role_ru: e.target.value }))}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                      placeholder="Председатель"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-400">Био EN / RU</label>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <textarea
                      value={chairForm.bio_en}
                      onChange={e => setChairForm(f => ({ ...f, bio_en: e.target.value }))}
                      rows={2}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                    />
                    <textarea
                      value={chairForm.bio_ru}
                      onChange={e => setChairForm(f => ({ ...f, bio_ru: e.target.value }))}
                      rows={2}
                      className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={async () => {
                    setChairError('')
                    const committeeId = chairForm.committee_id
                    const name = (chairForm.name || '').trim()
                    if (!committeeId || !name) {
                      setChairError('Выберите комитет и введите имя.')
                      return
                    }
                    const { error } = await upsertChair({
                      id: editingChair?.id,
                      committee_id: committeeId,
                      name,
                      photo_url: (chairForm.photo_url || '').trim() || null,
                      sort_order: chairForm.sort_order ?? 0,
                      role_en: (chairForm.role_en || '').trim() || null,
                      role_ru: (chairForm.role_ru || '').trim() || null,
                      bio_en: (chairForm.bio_en || '').trim() || null,
                      bio_ru: (chairForm.bio_ru || '').trim() || null,
                    })
                    if (error) {
                      setChairError(error.message || 'Ошибка сохранения.')
                      return
                    }
                    setEditingChair(null)
                    setChairForm({
                      committee_id: '',
                      name: '',
                      photo_url: '',
                      role_en: '',
                      role_ru: '',
                      bio_en: '',
                      bio_ru: '',
                      sort_order: chairs.length,
                    })
                    // reload all chairs
                    const allChairs = []
                    for (const com of committees || []) {
                      const rows = await fetchChairsForCommittee(com.id)
                      rows.forEach(r => allChairs.push({ ...r, committee_id: com.id }))
                    }
                    setChairs(allChairs)
                  }}
                >
                  {editingChair ? 'Сохранить' : 'Добавить'}
                </button>
                {editingChair && (
                  <button
                    type="button"
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-slate-200"
                    onClick={() => {
                      setEditingChair(null)
                      setChairError('')
                      setChairForm({
                        committee_id: '',
                        name: '',
                        photo_url: '',
                        role_en: '',
                        role_ru: '',
                        bio_en: '',
                        bio_ru: '',
                        sort_order: chairs.length,
                      })
                    }}
                  >
                    Отмена
                  </button>
                )}
              </div>
              {chairError && <p className="mt-2 text-sm text-red-400">{chairError}</p>}
              </div>
            </div>

            {/* Lists row: team members list + chairs list */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Team members list */}
              <div className="rounded-2xl border border-white/10">
              {team.map(m => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 p-3 last:border-b-0">
                  <span className="font-semibold text-white">{m.name}</span>
                  <span className="text-sm text-slate-300">
                    {i18n.language === 'ru' ? (m.role_ru || m.role_en) : (m.role_en || m.role_ru)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-sm text-slate-400 hover:text-white"
                      onClick={() => {
                        setEditingMember(m)
                        setMemberForm({
                          name: m.name,
                          photo_url: m.photo_url || '',
                          group_key: m.group_key || 'default',
                          group_order: m.group_order ?? 0,
                          sort_order: m.sort_order ?? 0,
                          group_label_en: m.group_label_en || '',
                          group_label_ru: m.group_label_ru || '',
                          role_en: m.role_en || '',
                          role_ru: m.role_ru || '',
                          bio_en: m.bio_en || '',
                          bio_ru: m.bio_ru || '',
                          is_featured: !!m.is_featured,
                        })
                      }}
                    >
                      Изм.
                    </button>
                    <button
                      type="button"
                      className="text-red-400 hover:text-red-300"
                      onClick={async () => {
                        if (confirm('Удалить?')) {
                          await deleteTeamMember(m.id)
                          setTeam(prev => prev.filter(x => x.id !== m.id))
                        }
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              </div>

              {/* Chairs list */}
              <div className="rounded-2xl border border-white/10">
              {chairs.map(c => {
                const committee = committees.find(com => com.id === (c.committee_id || c.committeeId))
                return (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 p-3 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-xs text-slate-400">
                        {committee ? committee.acronym : '—'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-sm text-slate-400 hover:text-white"
                        onClick={() => {
                          setEditingChair(c)
                          setChairForm({
                            committee_id: c.committee_id || c.committeeId || '',
                            name: c.name || '',
                            photo_url: c.photo_url || '',
                            role_en: c.role_en || '',
                            role_ru: c.role_ru || '',
                            bio_en: c.bio_en || '',
                            bio_ru: c.bio_ru || '',
                            sort_order: c.sort_order ?? 0,
                          })
                        }}
                      >
                        Изм.
                      </button>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-300"
                        onClick={async () => {
                          if (confirm('Удалить?')) {
                            await deleteChair(c.id)
                            const allChairs = []
                            for (const com of committees || []) {
                              const rows = await fetchChairsForCommittee(com.id)
                              rows.forEach(r => allChairs.push({ ...r, committee_id: com.id }))
                            }
                            setChairs(allChairs)
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
              {chairs.length === 0 && (
                <div className="p-4 text-sm text-slate-400">Пока нет добавленных членов бюро.</div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-white">Ключ — значение (контакты, соцсети, логотип и т.д.)</h3>
              <div className="flex flex-wrap gap-3">
                <input value={settingForm.key} onChange={e => setSettingForm(f => ({ ...f, key: e.target.value }))} placeholder="Ключ (напр. instagram_url)" className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white w-48" />
                <input value={settingForm.value} onChange={e => setSettingForm(f => ({ ...f, value: e.target.value }))} placeholder="Значение" className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white min-w-[200px] flex-1" />
                <button type="button" className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={async () => { const { error } = await upsertSiteSetting(settingForm.key, settingForm.value); if (!error) { setSettingForm({ key: '', value: '' }); setSettings(await fetchSiteSettings()) } }}>Сохранить</button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10">
              {settings.map(s => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 p-3 last:border-b-0">
                  <span className="font-mono text-sm text-slate-200">{s.key}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{s.value}</span>
                  <button type="button" className="text-red-400 hover:text-red-300" onClick={async () => { if (confirm('Удалить?')) { await deleteSiteSetting(s.key); setSettings(await fetchSiteSettings()) } }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Reveal>
    </div>
  )
}
