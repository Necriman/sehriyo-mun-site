import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en/translation.json'
import ru from './locales/ru/translation.json'

const STORAGE_KEY = 'sehriyo_lang'

function getInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'ru') return saved
  const nav = (navigator.language || '').toLowerCase()
  return nav.startsWith('ru') ? 'ru' : 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

// Load editable translations from CMS (page='i18n') and merge over static keys
import('./lib/cms').then(({ fetchI18nOverrides }) => {
  fetchI18nOverrides().then(pairs => {
    if (pairs.en?.translation && Object.keys(pairs.en.translation).length) {
      i18n.addResourceBundle('en', 'translation', pairs.en.translation, true)
    }
    if (pairs.ru?.translation && Object.keys(pairs.ru.translation).length) {
      i18n.addResourceBundle('ru', 'translation', pairs.ru.translation, true)
    }
  }).catch(() => {})
})

export function setLanguage(lng) {
  i18n.changeLanguage(lng)
  localStorage.setItem(STORAGE_KEY, lng)
}

export default i18n
