import { useEffect } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { jewelryStoreJsonLd } from '../lib/seo'

const SCRIPT_ID = 'ruby-light-jsonld'

export function JsonLd() {
  const { locale } = useI18n()

  useEffect(() => {
    let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id = SCRIPT_ID
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(jewelryStoreJsonLd(locale))
  }, [locale])

  return null
}
