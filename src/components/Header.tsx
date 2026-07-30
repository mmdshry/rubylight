import { useI18n } from '../i18n/I18nContext'
import { LangToggle } from './LangToggle'

export function Header() {
  const { t, locale } = useI18n()
  const isFa = locale === 'fa'

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#main" className="site-brand">
          <img
            src={isFa ? '/brand/logo-light-icon.webp' : '/brand/logo-icon.webp'}
            alt=""
            width={36}
            height={36}
            className="site-brand-logo"
          />
          <span className="site-brand-name">{t.nav.brand}</span>
        </a>
        <LangToggle />
      </div>
    </header>
  )
}
