import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSession, isAdmin } from '../lib/admin'
import { useTranslation } from 'react-i18next'

export function AdminGate({ children }) {
  const { t } = useTranslation()
  const location = useLocation()
  const [state, setState] = useState({ loading: true, ok: false, error: '' })

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const session = await getSession()
        if (!session?.user) {
          if (alive) setState({ loading: false, ok: false, error: '' })
          return
        }
        const ok = await isAdmin(session.user.id)
        if (alive) setState({ loading: false, ok, error: '' })
      } catch (e) {
        if (alive) setState({ loading: false, ok: false, error: e?.message || String(e) })
      }
    })()
    return () => { alive = false }
  }, [])

  if (state.loading) {
    return <div className="container-pad py-16 text-slate-200">{t('admin.loading')}</div>
  }

  if (state.error) {
    return (
      <div className="container-pad py-16">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {state.error}
        </div>
      </div>
    )
  }

  if (!state.ok) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}
