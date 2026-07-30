import { useLayoutEffect } from 'react'
import { CONTACT, telHref } from '../lib/contacts'
import { useI18n } from '../i18n/I18nContext'
import { CtaGroup } from './CtaGroup'

export function Hero() {
  const { t, locale } = useI18n()
  const isFa = locale === 'fa'

  useLayoutEffect(() => {
    const img = document.getElementById(
      'hero-logo-fallback',
    ) as HTMLImageElement | null
    const slot = document.getElementById('hero-logo-slot')
    if (!img || !slot) return

    const nextSrc = isFa
      ? '/brand/logo-light-hero.webp'
      : '/brand/logo-hero.webp'
    if (!img.src.endsWith(nextSrc.split('/').pop()!)) {
      img.src = nextSrc
    }
    img.alt =
      locale === 'fa'
        ? 'لوگوی جواهری روبی لایت'
        : 'Ruby Light Jewelry logo'

    const sync = () => {
      const rect = slot.getBoundingClientRect()
      img.style.position = 'fixed'
      img.style.left = `${rect.left}px`
      img.style.top = `${rect.top}px`
      img.style.width = `${rect.width}px`
      img.style.height = `${rect.height}px`
      img.style.margin = '0'
      img.style.transform = 'none'
      img.style.zIndex = '1'
      img.style.pointerEvents = 'none'
    }

    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [isFa, locale])

  return (
    <section className="stage" aria-labelledby="hero-title">
      <div
        id="hero-logo-slot"
        className="logo-slot"
        aria-hidden="true"
      />

      {isFa ? (
        <h1 id="hero-title" className="brand-fa">
          {(t.hero.brandLines.length
            ? t.hero.brandLines
            : ['جواهری', 'روبی', 'لایت']
          ).map((line) => (
            <span key={line} className="brand-fa-line">
              {line}
            </span>
          ))}
        </h1>
      ) : (
        <>
          <h1 id="hero-title" className="brand-en">
            {t.hero.brand}
          </h1>
          <p className="brand-en-tag">{t.hero.tagline}</p>
        </>
      )}

      <address className="hero-meta">
        <p>{CONTACT.address[locale]}</p>
        <p className="hero-phones">
          <a href={telHref(CONTACT.phones.cell)}>
            {CONTACT.phones.cellDisplay[locale]}
          </a>
          <span aria-hidden="true"> · </span>
          <a href={telHref(CONTACT.phones.work)}>
            {CONTACT.phones.workDisplay[locale]}
          </a>
        </p>
      </address>

      <CtaGroup />
    </section>
  )
}
