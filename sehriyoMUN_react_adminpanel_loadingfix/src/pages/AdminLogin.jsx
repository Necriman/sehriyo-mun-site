import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, getSession, isAdmin } from '../lib/admin'
import { Reveal } from '../components/Reveal'
import { useTranslation } from 'react-i18next'

export default function AdminLogin() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      const session = await getSession()
      if (session?.user) {
        const ok = await isAdmin(session.user.id)
        if (ok) nav('/admin', { replace: true })
      }
    })()
  }, [nav])

  async function onSubmit(e) {
e.preventDefault()
setErr('')
setLoading(true)
try {
  // Basic config sanity check
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    setErr(t('admin.env_missing'))
    return
  }

  const { data, error } = await signIn(email, password)
  if (error) {
    setErr(error.message)
    return
  }

  const ok = await isAdmin(data.session?.user?.id)
  if (!ok) {
    setErr(t('admin.not_admin'))
    return
  }

  nav('/admin', { replace: true })
} catch (e) {
  setErr(e?.message || String(e))
} finally {
  setLoading(false)
}

  }

  return (
    <div className="container-pad py-14">
      <Reveal>
        <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-slate-950/40 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{t('admin.login_title')}</h1>
          <p className="mt-2 text-slate-300">{t('admin.login_subtitle')}</p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-200">{t('admin.email')}</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-red-500/60"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-200">{t('admin.password')}</label>
              <input
                type="password"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-red-500/60"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {err ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="btn-primary w-full justify-center"
              type="submit"
            >
              {loading ? t('admin.loading') : t('admin.sign_in')}
            </button>
          </form>
        </div>
      </Reveal>
    </div>
  )
}
