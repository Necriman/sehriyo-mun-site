export function i18nText(value, lng) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    return value[lng] || value.en || value.ru || ''
  }
  return String(value)
}
