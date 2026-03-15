import { useTranslation } from 'react-i18next'
import { useCmsTexts } from '../lib/cms'

/**
 * Read-only CMS text component.
 * Usage:
 *   <CmsText page="home" section="hero" keyName="headline_top" fallback={t('home.headline.top')} />
 */
export function CmsText({ page, section = '', keyName, fallback }) {
  const { t } = useTranslation()
  const { getText } = useCmsTexts(page)
  const value = getText(section, keyName, fallback ?? t(keyName))
  return value
}

