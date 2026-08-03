import { BRANCHES, telHref } from '../lib/contacts'
import { useI18n } from '../i18n/I18nContext'
import { CtaGroup } from './CtaGroup'

export function Hero() {
  const { t, locale } = useI18n()
  const isFa = locale === 'fa'
  const logoAlt =
    locale === 'fa'
      ? 'لوگوی جواهری روبی لایت'
      : 'Ruby Light Jewelry logo'

  const branchMeta = [
    { branch: BRANCHES.jewelry, title: t.contact.jewelryBranch },
    { branch: BRANCHES.gold, title: t.contact.goldBranch },
  ] as const

  return (
    <section className="stage" aria-labelledby="hero-title">
      <div className="logo-slot">
        <img
          className="logo-slot-img"
          src="/brand/logo-hero.webp"
          width={288}
          height={288}
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
        <div className="hero-branches">
          {branchMeta.map(({ branch, title }) => (
            <address key={branch.id} className="hero-meta hero-branch">
              <p className="hero-branch-title">{title}</p>
              <p className="hero-address">{branch.address[locale]}</p>
              <ul className="hero-phones">
                <li>
                  <span className="hero-phone-label">{t.contact.mobile}</span>
                  <a href={telHref(branch.phones.cell)}>
                    {branch.phones.cellDisplay[locale]}
                  </a>
                </li>
                <li>
                  <span className="hero-phone-label">{t.contact.landline}</span>
                  <a href={telHref(branch.phones.work)}>
                    {branch.phones.workDisplay[locale]}
                  </a>
                </li>
              </ul>
            </address>
          ))}
        </div>

        <CtaGroup />
      </div>
    </section>
  )
}
