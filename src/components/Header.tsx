import en from '../i18n/en.json'
import { FontToggle } from './FontToggle'
import { LangToggle } from './LangToggle'

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#main" className="site-brand">
          <img
            src="/brand/logo-icon.webp"
            alt=""
            width={56}
            height={56}
            className="site-brand-logo"
          />
          <span className="site-brand-name">{en.nav.brand}</span>
        </a>
        <div className="site-header-actions">
          <FontToggle />
          <LangToggle />
        </div>
      </div>
    </header>
  )
}
