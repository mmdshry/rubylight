import { CONTACT, telHref } from '../lib/contacts'
import { useI18n } from '../i18n/I18nContext'
import { CtaGroup } from './CtaGroup'

export function Hero() {
  const { t, locale } = useI18n()
  const isFa = locale === 'fa'
  const logoSrc = isFa
    ? '/brand/logo-light-hero.webp'
    : '/brand/logo-hero.webp'
  const logoAlt =
    locale === 'fa'
      ? 'لوگوی جواهری روبی لایت'
      : 'Ruby Light Jewelry logo'

  return (
    <section className="stage" aria-labelledby="hero-title">
      <div className="logo-slot">
        <img
          className="logo-slot-img"
          src={logoSrc}
          width={224}
          height={224}
          alt={logoAlt}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="brand-stack">
        {isFa ? (
          <>
            <p className="brand-fa">{t.hero.brand}</p>
            <h1 id="hero-title" className="brand-fa-tag">
              {t.hero.tagline}
            </h1>
          </>
        ) : (
          <>
            <h1 id="hero-title" className="brand-en">
              {t.hero.brand}
            </h1>
            <p className="brand-en-tag">{t.hero.tagline}</p>
          </>
        )}
      </div>

      <div className="hero-card">
        <address className="hero-meta">
          <p className="hero-address">{CONTACT.address[locale]}</p>
          <ul className="hero-phones">
            <li>
              <span className="hero-phone-label">{t.contact.mobile}</span>
              <a href={telHref(CONTACT.phones.cell)}>
                {CONTACT.phones.cellDisplay[locale]}
              </a>
            </li>
            <li>
              <span className="hero-phone-label">{t.contact.landline}</span>
              <a href={telHref(CONTACT.phones.work)}>
                {CONTACT.phones.workDisplay[locale]}
              </a>
            </li>
          </ul>
        </address>

        <CtaGroup />
      </div>
    </section>
  )
}
