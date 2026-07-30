export type Locale = 'fa' | 'en'

export const CONTACT = {
  brand: {
    en: 'Ruby Light Jewelry',
    fa: 'جواهری روبی لایت',
  },
  shortName: {
    en: 'Ruby Light',
    fa: 'جواهری روبی لایت',
  },
  phones: {
    cell: '+989127217081',
    cellDisplay: {
      en: '+98 912 721 7081',
      fa: '۰۹۱۲۷۲۱۷۰۸۱',
    },
    work: '+982155582214',
    workDisplay: {
      en: '+98 21 5558 2214',
      fa: '۰۲۱۵۵۵۸۲۲۱۴',
    },
  },
  address: {
    en: 'No. 2, Khordad Passage, The Great Market of Tehran, Iran',
    fa: 'بازار بزرگ تهران، روبروی ناصر خسرو، پاساژ خرداد، پلاک ۲',
  },
  whatsapp: 'https://wa.me/989127217081',
  telegram: 'https://t.me/MHDDARINI',
  telegramHandle: '@MHDDARINI',
  logoPath: '/brand/logo.png',
  avatarPath: '/brand/avatar-vcf.png',
  siteUrl: 'https://rubylight.ir',
} as const

export function telHref(phone: string) {
  return `tel:${phone}`
}
