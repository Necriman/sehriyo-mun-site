import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setLanguage } from '../i18n'

export function Navbar({ theme, onToggleTheme }) {
  const { t, i18n } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const nav = [
    { to: '/', label: t('nav.home') },
    { to: '/committees', label: t('nav.committees') },
    { to: '/schedule', label: t('nav.schedule') },
    { to: '/team', label: t('nav.team') },
    { to: '/apply', label: t('nav.apply') },
  ]

  const langSwitcher = (
    <div className="flex items-center rounded-full border border-slate-200/70 bg-white/70 p-1 text-sm shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/40">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full transition ${i18n.language === 'en' ? 'bg-red-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'}`}
        aria-label={t('lang.en')}
      >
        {t('lang.en')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ru')}
        className={`px-3 py-1 rounded-full transition ${i18n.language === 'ru' ? 'bg-red-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'}`}
        aria-label={t('lang.ru')}
      >
        {t('lang.ru')}
      </button>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/60">
      <div className="container-pad flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden">
            <img src="/images/logo.png" alt="Sehriyo MUN" className="h-full w-full object-contain" />
          </span>
          <span>Sehriyo MUN</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                'rounded-xl px-3 py-2 text-sm font-semibold transition ' +
                (isActive
                  ? 'bg-brand-50 text-brand-900 dark:bg-slate-900 dark:text-brand-500'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/60')
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex">{langSwitcher}</div>
          <button onClick={onToggleTheme} className="btn-ghost h-10 w-10 p-0" title={t('common.toggle_theme')} aria-label={t('common.toggle_theme')}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/apply" className="btn-primary hidden md:inline-flex">{t('nav.apply')}</Link>

          {/* Burger: visible only on mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={menuOpen ? t('nav.close_menu', 'Close menu') : t('nav.open_menu', 'Open menu')}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <span className="text-xl" aria-hidden>✕</span>
            ) : (
              <span className="flex flex-col gap-1" aria-hidden>
                <span className="block h-0.5 w-5 bg-current rounded" />
                <span className="block h-0.5 w-5 bg-current rounded" />
                <span className="block h-0.5 w-5 bg-current rounded" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden absolute inset-x-0 top-16 z-40 border-b border-slate-200/70 bg-white/95 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/95 ${
          menuOpen ? 'block' : 'hidden'
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="container-pad flex flex-col py-4 gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                'rounded-xl px-4 py-3 text-sm font-semibold transition ' +
                (isActive
                  ? 'bg-brand-50 text-brand-900 dark:bg-slate-800 dark:text-brand-500'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60')
              }
            >
              {n.label}
            </NavLink>
          ))}
          <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('lang.label')}</div>
            {langSwitcher}
          </div>
          <Link
            to="/apply"
            onClick={() => setMenuOpen(false)}
            className="btn-primary mt-4 w-full justify-center"
          >
            {t('nav.apply')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
