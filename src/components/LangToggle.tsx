import { useI18n } from '../i18n/I18nContext'

export function LangToggle() {
  const { t, toggleLocale } = useI18n()

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="lang-toggle"
      title="Switch language"
      aria-label={`${t.nav.lang} — Switch language`}
    >
      {t.nav.lang}
    </button>
  )
}
