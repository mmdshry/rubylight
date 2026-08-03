export type Locale = 'fa' | 'en'

export type BranchPhones = {
  cell: string
  cellDisplay: Record<Locale, string>
  work: string
  workDisplay: Record<Locale, string>
}

export type Branch = {
  id: 'jewelry' | 'gold'
  address: Record<Locale, string>
  phones: BranchPhones
}

export const BRANCHES: Record<'jewelry' | 'gold', Branch> = {
  jewelry: {
    id: 'jewelry',
    address: {
      en: 'No. 2, Khordad Passage, The Great Market of Tehran, Iran',
      fa: 'بازار بزرگ تهران، روبروی ناصر خسرو، پاساژ خرداد، پلاک ۲',
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
  },
  gold: {
    id: 'gold',
    address: {
      en: 'No. 182, Basement, Reza Gold & Jewelry Passage, 15 Khordad St, Tehran Grand Bazaar, Iran',
      fa: 'بازار بزرگ تهران خیابان ۱۵ خرداد پاساژ طلا و جواهر رضا طبقه منفی یک پلاک ۱۸۲',
    },
    phones: {
      cell: '+989123872953',
      cellDisplay: {
        en: '+98 912 387 2953',
        fa: '۰۹۱۲۳۸۷۲۹۵۳',
      },
      work: '+982155597520',
      workDisplay: {
        en: '+98 21 5559 7520',
        fa: '۰۲۱۵۵۵۹۷۵۲۰',
      },
    },
  },
}

/** Primary (jewelry) contact — used for SEO, VCF, WhatsApp CTA */
export const CONTACT = {
  brand: {
    en: 'Ruby Light Jewelry',
    fa: 'جواهری روبی لایت',
  },
  shortName: {
    en: 'Ruby Light',
    fa: 'جواهری روبی لایت',
  },
  phones: BRANCHES.jewelry.phones,
  address: BRANCHES.jewelry.address,
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
