import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import en from './en.json'
import fa from './fa.json'
import type { Locale } from '../lib/contacts'
import { applySeo } from '../lib/seo'

type Messages = typeof fa

const dictionaries: Record<Locale, Messages> = { fa, en }

type I18nContextValue = {
  locale: Locale
  t: Messages
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextValue | null>(null)
const STORAGE_KEY = 'ruby-light-locale'

function readLocale(): Locale {
  try {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('lang')
    if (q === 'fa' || q === 'en') return q
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'fa' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  return 'fa'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('lang', next)
      window.history.replaceState({}, '', url)
    } catch {
      /* ignore */
    }
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'fa' ? 'en' : 'fa')
  }, [locale, setLocale])

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = locale === 'fa' ? 'rtl' : 'ltr'
    root.dataset.theme = locale === 'fa' ? 'dark' : 'light'
    applySeo(locale)

    // Load locale fonts on switch
    if (locale === 'en') {
      void import('@fontsource/libre-baskerville/latin-400.css')
      void import('@fontsource/libre-baskerville/latin-700.css')
    } else {
      void import('@fontsource/noto-nastaliq-urdu/arabic-400.css')
      void import('@fontsource-variable/vazirmatn/wght.css')
    }
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
