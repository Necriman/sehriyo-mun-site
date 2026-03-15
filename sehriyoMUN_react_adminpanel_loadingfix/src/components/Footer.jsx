import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getSetting } from '../lib/cms'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const [contactEmail, setContactEmail] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [email, instagram] = await Promise.all([
        getSetting('contact_email', ''),
        getSetting('instagram_url', ''),
      ])
      if (alive) {
        setContactEmail(email || '')
        setInstagramUrl(instagram || '')
      }
    })()
    return () => { alive = false }
  }, [])

  const emailHref = contactEmail ? `mailto:${contactEmail}` : '#'
  const instagramHref = instagramUrl && instagramUrl !== '#' ? instagramUrl : '#'

  return (
    <footer className="border-t border-slate-200/70 py-10 dark:border-slate-800/70">
      <div className="container-pad flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          © {year} Sehriyo MUN. {t('footer.rights')}
        </div>
        <div className="flex gap-2 text-sm">
          <a
            className="text-slate-600 hover:underline dark:text-slate-300"
            href={instagramHref}
            target={instagramHref === '#' ? undefined : '_blank'}
            rel={instagramHref === '#' ? undefined : 'noopener noreferrer'}
          >
            Instagram
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            className="text-slate-600 hover:underline dark:text-slate-300"
            href={emailHref}
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  )
}
