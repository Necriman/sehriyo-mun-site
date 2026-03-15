import { useMemo, useState } from 'react'
import { committees as staticCommittees } from '../data/committees'
import { useCommittees } from '../lib/cms'
import { supabase } from '../lib/supabase'
import { Reveal } from '../components/Reveal'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { i18nText } from '../lib/i18nText'

function Field({ label, children, hint }) {
  return (
    <div>
      <div className="mb-1 text-sm font-semibold">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div> : null}
    </div>
  )
}

export default function Apply() {
  const { t, i18n } = useTranslation()
  const { committees } = useCommittees()
  const committeesList = committees?.length ? committees : staticCommittees
  const options = useMemo(() => committeesList.map(c => ({ value: c.slug, label: `${c.acronym} — ${i18nText(c.title, i18n.language)} (${i18nText(c.language, i18n.language) || c.languageLabel || ''})` })), [committeesList, i18n.language])
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    school: '',
    grade: '',
    preferred_committee: options[0]?.value ?? '',
    motivation: '',
    experience: '',
  })
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const disabled = status.state === 'loading'
  const onChange = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setStatus({ state: 'loading', message: '' })

    if (!form.full_name.trim() || !form.email.trim()) {
      setStatus({ state: 'error', message: t('apply.err_name_email') })
      return
    }
    if (!supabase) {
      setStatus({ state: 'error', message: t('apply.err_supabase_missing') })
      return
    }

    const { error } = await supabase.from('applications').insert([{ ...form, status: 'pending' }])
    if (error) return setStatus({ state: 'error', message: error.message })

    setStatus({ state: 'success', message: `${t('apply.success_title')} ${t('apply.success_text')}` })
    setForm(prev => ({ ...prev, motivation: '', experience: '' }))
  }

  return (
    <div className="container-pad py-12">
      <Reveal>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('apply.title')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t('apply.page_desc')}
        </p>
      </Reveal>

      <div className="mt-8">
        <Reveal>
          <div className="card w-full p-6 md:p-8">
             <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <Field label={t('form.full_name')}>
                <input className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-slate-800/70 dark:bg-slate-950/40"
                  value={form.full_name} onChange={onChange('full_name')} placeholder={t('form.ph_name')} />
              </Field>
              <Field label={t('form.email')}>
                <input className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-slate-800/70 dark:bg-slate-950/40"
                  value={form.email} onChange={onChange('email')} placeholder="name@example.com" />
              </Field>
              <Field label={t('form.phone')}>
                <input className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-slate-800/70 dark:bg-slate-950/40"
                  value={form.phone} onChange={onChange('phone')} placeholder="+998 ..." />
              </Field>
              <Field label={t('form.school')}>
                <input className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-slate-800/70 dark:bg-slate-950/40"
                  value={form.school} onChange={onChange('school')} placeholder={t('form.ph_school')} />
              </Field>
              <Field label={t('apply.grade')}>
                <input className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-slate-800/70 dark:bg-slate-950/40"
                  value={form.grade} onChange={onChange('grade')} placeholder={t('apply.grade_ph')} />
              </Field>

              <Field label={t('form.preferred_committee')} hint={t('apply.committee_hint')}>
                <select className="w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-slate-800/70 dark:bg-slate-950/40"
                  value={form.preferred_committee} onChange={onChange('preferred_committee')}>
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label={t('form.motivation')} hint={t('apply.motivation_hint')}>
                  <textarea className="min-h-[110px] w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-slate-800/70 dark:bg-slate-950/40"
                    value={form.motivation} onChange={onChange('motivation')} placeholder={t('apply.motivation_ph')} />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label={t('apply.experience')} hint={t('apply.experience_hint')}>
                  <textarea className="min-h-[110px] w-full rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-slate-800/70 dark:bg-slate-950/40"
                    value={form.experience} onChange={onChange('experience')} placeholder={t('apply.experience_ph')} />
                </Field>
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <button disabled={disabled} className="btn-primary">{disabled ? t('apply.submit_loading') : t('form.submit')}</button>
                {status.state !== 'idle' ? (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={'text-sm font-semibold ' + (status.state === 'success'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : status.state === 'error'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-600 dark:text-slate-300')}>
                    {status.message}
                  </motion.div>
                ) : null}
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
