import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="container-pad py-16">
      <div className="card p-8">
        <div className="text-2xl font-extrabold">404</div>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{t('notfound.title')}.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/">{t('notfound.home')}</Link>
          <Link className="btn-ghost" to="/committees">{t('nav.committees')}</Link>
        </div>
      </div>
    </div>
  )
}
