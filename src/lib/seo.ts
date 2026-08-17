import { BRANCHES, CONTACT, type Locale } from './contacts'
import en from '../i18n/en.json'
import fa from '../i18n/fa.json'
import { isTvPath } from './tv'

const dict = { fa, en }

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  const selector = extra?.hreflang
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v))
  }
}

export function applySeo(locale: Locale) {
  const meta = dict[locale].meta
  const url = CONTACT.siteUrl
  const ogImage = `${url}/brand/og.png`
  const tv = isTvPath()

  if (tv) {
    document.title = `${fa.prices.title} | ${fa.nav.brand}`
    upsertMeta('name', 'description', fa.prices.subtitle)
    upsertMeta('name', 'robots', 'noindex, nofollow')
    upsertMeta('name', 'theme-color', '#ffffff')
    upsertMeta('name', 'color-scheme', 'light')
    upsertLink('canonical', `${url}/tv`)
    return
  }

  document.title = meta.title
  upsertMeta('name', 'description', meta.description)
  upsertMeta('name', 'keywords', meta.keywords)
  upsertMeta('name', 'robots', 'index, follow, max-image-preview:large')
  upsertMeta('name', 'author', CONTACT.brand[locale])
  upsertMeta('name', 'theme-color', '#ffffff')

  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', CONTACT.brand[locale])
  upsertMeta('property', 'og:title', meta.title)
  upsertMeta('property', 'og:description', meta.description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:image', ogImage)
  upsertMeta('property', 'og:locale', locale === 'fa' ? 'fa_IR' : 'en_US')

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', meta.title)
  upsertMeta('name', 'twitter:description', meta.description)
  upsertMeta('name', 'twitter:image', ogImage)

  upsertLink('canonical', url)
  upsertLink('alternate', `${url}/?lang=fa`, { hreflang: 'fa' })
  upsertLink('alternate', `${url}/?lang=en`, { hreflang: 'en' })
  upsertLink('alternate', url, { hreflang: 'x-default' })
}

export function jewelryStoreJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': ['JewelryStore', 'LocalBusiness'],
    '@id': `${CONTACT.siteUrl}/#store`,
    name: CONTACT.brand[locale],
    alternateName: CONTACT.brand[locale === 'fa' ? 'en' : 'fa'],
    description: dict[locale].meta.description,
    url: CONTACT.siteUrl,
    image: `${CONTACT.siteUrl}/brand/og.png`,
    logo: `${CONTACT.siteUrl}/brand/logo.png`,
    telephone: [
      CONTACT.phones.cell,
      CONTACT.phones.work,
      BRANCHES.gold.phones.cell,
      BRANCHES.gold.phones.work,
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress:
        locale === 'fa'
          ? 'پاساژ خرداد، پلاک ۲، روبروی ناصر خسرو'
          : 'No. 2, Khordad Passage, opposite Nasser Khosrow',
      addressLocality: locale === 'fa' ? 'تهران' : 'Tehran',
      addressCountry: 'IR',
    },
    sameAs: [CONTACT.whatsapp, CONTACT.telegram],
  }
}
