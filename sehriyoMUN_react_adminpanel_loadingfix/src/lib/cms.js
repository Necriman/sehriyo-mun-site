import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from './supabase'
import { committees as staticCommittees } from '../data/committees'

// -------- Generic CMS strings --------

export async function fetchCmsStrings(page) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('cms_strings')
    .select('*')
    .eq('page', page)

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchCmsStrings error', error)
    return []
  }
  return data || []
}

/** Fetch all CMS strings (all pages) for admin */
export async function fetchAllCmsStrings() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('cms_strings')
    .select('*')
    .order('page')
    .order('section')
    .order('key')
  if (error) {
    console.error('fetchAllCmsStrings error', error)
    return []
  }
  return data || []
}

export async function upsertCmsString(row) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { id, page, section, key, locale, value, description } = row
  const payload = { page, section: section || '', key, locale, value, description: description || null }
  if (id) {
    return supabase.from('cms_strings').update(payload).eq('id', id).select().single()
  }
  return supabase.from('cms_strings').insert(payload).select().single()
}

export async function deleteCmsString(id) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.from('cms_strings').delete().eq('id', id)
}

/** Build i18n overrides from cms_strings where page='i18n' (section = namespace, key = key, locale, value) */
export async function fetchI18nOverrides() {
  if (!supabase) return { en: {}, ru: {} }
  const { data, error } = await supabase
    .from('cms_strings')
    .select('section, key, locale, value')
    .eq('page', 'i18n')
  if (error || !data) return { en: {}, ru: {} }
  const en = {}
  const ru = {}
  for (const row of data) {
    const target = row.locale === 'ru' ? ru : en
    const section = row.section || 'common'
    if (!target[section]) target[section] = {}
    target[section][row.key] = row.value
  }
  return { en: { translation: en }, ru: { translation: ru } }
}

export function useCmsTexts(page) {
  const { i18n } = useTranslation()
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    if (!supabase) return

    ;(async () => {
      const data = await fetchCmsStrings(page)
      if (alive) setRows(data)
    })()

    return () => {
      alive = false
    }
  }, [page, i18n.language])

  const map = useMemo(() => {
    const byKey = new Map()
    for (const row of rows) {
      if (row.locale !== i18n.language) continue
      const compositeKey = `${row.section || ''}:${row.key}`
      byKey.set(compositeKey, row.value)
    }
    return byKey
  }, [rows, i18n.language])

  function getText(section, key, fallback) {
    const compositeKey = `${section || ''}:${key}`
    return map.get(compositeKey) ?? fallback
  }

  return { getText }
}

// -------- Committees --------

export async function fetchCommittees() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('committees')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchCommittees error', error)
    return []
  }
  return data || []
}

/** Admin: fetch all committees (including unpublished) */
export async function fetchCommitteesAdmin() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('committees')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) {
    console.error('fetchCommitteesAdmin error', error)
    return []
  }
  return data || []
}

export async function fetchCommitteeTranslations(committeeIds, locale) {
  if (!supabase || !committeeIds.length) return []
  const { data, error } = await supabase
    .from('committee_translations')
    .select('*')
    .in('committee_id', committeeIds)
    .eq('locale', locale)

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchCommitteeTranslations error', error)
    return []
  }
  return data || []
}

export function useCommittees() {
  const { i18n } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)

      // Fallback: no Supabase – use static data
      if (!supabase) {
        const mapped = staticCommittees.map(c => ({
          ...c,
          id: c.slug,
          title: i18n.language === 'ru' ? c.title?.ru : c.title?.en,
          languageLabel: i18n.language === 'ru' ? c.language?.ru : c.language?.en,
          agenda: i18n.language === 'ru' ? c.agenda?.ru : c.agenda?.en,
          description: i18n.language === 'ru' ? c.description?.ru : c.description?.en,
        }))
        if (alive) {
          setItems(mapped)
          setLoading(false)
        }
        return
      }

      const base = await fetchCommittees()
      const ids = base.map(c => c.id)
      const translations = await fetchCommitteeTranslations(ids, i18n.language)

      const byId = new Map()
      translations.forEach(t => byId.set(t.committee_id, t))

      const merged = base.map(c => {
        const tr = byId.get(c.id)
        return {
          ...c,
          title: tr?.title,
          languageLabel: tr?.language_label,
          agenda: tr?.agenda,
          description: tr?.description,
        }
      })

      if (alive) {
        setItems(merged)
        setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [i18n.language])

  return { committees: items, loading }
}

export function useCommitteeBySlug(slug) {
  const { committees, loading } = useCommittees()
  const committee = useMemo(
    () => committees.find(c => c.slug === slug),
    [committees, slug]
  )
  return { committee, loading }
}

// -------- Chairs --------

export async function fetchChairsForCommittee(committeeId) {
  if (!supabase || !committeeId) return []
  const { data, error } = await supabase
    .from('chairs')
    .select('*')
    .eq('committee_id', committeeId)
    .order('sort_order', { ascending: true })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchChairsForCommittee error', error)
    return []
  }
  return data || []
}

// -------- Schedule --------

export async function fetchScheduleDays() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('schedule_days')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchScheduleDays error', error)
    return []
  }
  return data || []
}

export async function fetchScheduleEvents(dayId) {
  if (!supabase || !dayId) return []
  const { data, error } = await supabase
    .from('schedule_events')
    .select('*')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: true })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchScheduleEvents error', error)
    return []
  }
  return data || []
}

// -------- Team members --------

export async function fetchTeamMembers() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('group_order', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchTeamMembers error', error)
    return []
  }
  return data || []
}

// -------- Site settings --------

export async function fetchSiteSettings() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')

  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchSiteSettings error', error)
    return []
  }
  return data || []
}

export async function getSetting(key, fallback = '') {
  if (!supabase) return fallback
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()

  if (error || !data) return fallback
  return data.value ?? fallback
}

// -------- Admin mutations --------

export async function upsertCommittee(committee, translations) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { id, slug, acronym, bg_image_url, sort_order, is_published } = committee
  const trEn = translations?.find(t => t.locale === 'en')
  const trRu = translations?.find(t => t.locale === 'ru')
  const titleEn = (trEn?.title || '').trim() || 'Title'
  const titleRu = (trRu?.title || '').trim() || 'Title'
  const payload = {
    slug,
    acronym,
    bg_image_url: bg_image_url || null,
    sort_order: sort_order ?? 0,
    is_published: is_published !== false,
    title_en: titleEn,
    title_ru: titleRu,
  }
  let committeeId = id
  if (id) {
    const { error: e } = await supabase.from('committees').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
    if (e) return { error: e }
  } else {
    const { data: inserted, error: e } = await supabase.from('committees').insert(payload).select('id').single()
    if (e) return { error: e }
    committeeId = inserted.id
  }
  if (translations && Array.isArray(translations)) {
    for (const tr of translations) {
      const { locale, title, language_label, agenda, description } = tr
      if (!locale) continue
      const { error: e2 } = await supabase.from('committee_translations').upsert(
        { committee_id: committeeId, locale, title: title || '', language_label: language_label || '', agenda: agenda || null, description: description || null },
        { onConflict: 'committee_id,locale' }
      )
      if (e2) return { error: e2 }
    }
  }
  return { data: { id: committeeId } }
}

export async function deleteCommittee(id) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.from('committees').delete().eq('id', id)
}

export async function upsertChair(row) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { id, committee_id, name, photo_url, sort_order, role_en, role_ru, bio_en, bio_ru } = row
  const payload = { committee_id, name, photo_url: photo_url || null, sort_order: sort_order ?? 0, role_en: role_en || null, role_ru: role_ru || null, bio_en: bio_en || null, bio_ru: bio_ru || null }
  if (id) {
    return supabase.from('chairs').update(payload).eq('id', id).select().single()
  }
  return supabase.from('chairs').insert(payload).select().single()
}

export async function deleteChair(id) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.from('chairs').delete().eq('id', id)
}

export async function upsertScheduleDay(row) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { id, slug, sort_order, date, title_en, title_ru, description_en, description_ru } = row
  const payload = { slug, sort_order: sort_order ?? 0, date: date || null, title_en: title_en || '', title_ru: title_ru || '', description_en: description_en || null, description_ru: description_ru || null }
  if (id) {
    return supabase.from('schedule_days').update(payload).eq('id', id).select().single()
  }
  return supabase.from('schedule_days').insert(payload).select().single()
}

export async function deleteScheduleDay(id) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.from('schedule_days').delete().eq('id', id)
}

export async function upsertScheduleEvent(row) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { id, day_id, sort_order, start_time, end_time, title_en, title_ru, description_en, description_ru } = row
  const payload = { day_id, sort_order: sort_order ?? 0, start_time: start_time || null, end_time: end_time || null, title_en: title_en || '', title_ru: title_ru || '', description_en: description_en || null, description_ru: description_ru || null }
  if (id) {
    return supabase.from('schedule_events').update(payload).eq('id', id).select().single()
  }
  return supabase.from('schedule_events').insert(payload).select().single()
}

export async function deleteScheduleEvent(id) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.from('schedule_events').delete().eq('id', id)
}

export async function upsertTeamMember(row) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { id, name, photo_url, group_key, group_order, sort_order, group_label_en, group_label_ru, role_en, role_ru, bio_en, bio_ru, is_featured } = row
  const payload = {
    name,
    photo_url: photo_url || null,
    group_key: group_key || 'default',
    group_order: group_order ?? 0,
    sort_order: sort_order ?? 0,
    group_label_en: group_label_en || null,
    group_label_ru: group_label_ru || null,
    role_en: role_en || null,
    role_ru: role_ru || null,
    bio_en: bio_en || null,
    bio_ru: bio_ru || null,
    is_featured: !!is_featured,
  }
  if (id) {
    return supabase.from('team_members').update(payload).eq('id', id).select().single()
  }
  return supabase.from('team_members').insert(payload).select().single()
}

export async function deleteTeamMember(id) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.from('team_members').delete().eq('id', id)
}

export async function upsertSiteSetting(key, value) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.from('site_settings').upsert({ key, value: value || '' }, { onConflict: 'key' }).select().single()
}

export async function deleteSiteSetting(key) {
  if (!supabase) return { error: new Error('Supabase not configured') }
  return supabase.from('site_settings').delete().eq('key', key)
}

