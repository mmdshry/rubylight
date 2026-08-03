export type FaFontId =
  | 'vazirmatn'
  | 'vazir'
  | 'shabnam'
  | 'samim'
  | 'sahel'
  | 'tanha'
  | 'parastoo'
  | 'noto-naskh'

export type FaFontOption = {
  id: FaFontId
  label: { fa: string; en: string }
  cssFamily: string
  load: () => Promise<unknown>
}

const loaded = new Set<FaFontId>()

async function loadOnce(id: FaFontId, loader: () => Promise<unknown>) {
  if (loaded.has(id)) return
  await loader()
  loaded.add(id)
}

export const FA_FONTS: readonly FaFontOption[] = [
  {
    id: 'vazirmatn',
    label: { fa: 'وزیرمتن', en: 'Vazirmatn' },
    cssFamily: "'Vazirmatn Variable', 'Vazirmatn', sans-serif",
    load: () =>
      loadOnce('vazirmatn', () =>
        import('@fontsource-variable/vazirmatn/wght.css'),
      ),
  },
  {
    id: 'vazir',
    label: { fa: 'وزیر', en: 'Vazir' },
    cssFamily: "'Vazir', sans-serif",
    load: () =>
      loadOnce('vazir', () => import('../styles/fa-fonts.css')),
  },
  {
    id: 'shabnam',
    label: { fa: 'شبنم', en: 'Shabnam' },
    cssFamily: "'Shabnam', sans-serif",
    load: () =>
      loadOnce('shabnam', () => import('../styles/fa-fonts.css')),
  },
  {
    id: 'samim',
    label: { fa: 'صمیم', en: 'Samim' },
    cssFamily: "'Samim', sans-serif",
    load: () =>
      loadOnce('samim', () => import('../styles/fa-fonts.css')),
  },
  {
    id: 'sahel',
    label: { fa: 'ساحل', en: 'Sahel' },
    cssFamily: "'Sahel', sans-serif",
    load: () =>
      loadOnce('sahel', () => import('../styles/fa-fonts.css')),
  },
  {
    id: 'tanha',
    label: { fa: 'تنها', en: 'Tanha' },
    cssFamily: "'Tanha', sans-serif",
    load: () =>
      loadOnce('tanha', () => import('../styles/fa-fonts.css')),
  },
  {
    id: 'parastoo',
    label: { fa: 'پرستو', en: 'Parastoo' },
    cssFamily: "'Parastoo', serif",
    load: () =>
      loadOnce('parastoo', () => import('../styles/fa-fonts.css')),
  },
  {
    id: 'noto-naskh',
    label: { fa: 'نوتو نسخ', en: 'Noto Naskh' },
    cssFamily: "'Noto Naskh Arabic', serif",
    load: () =>
      loadOnce('noto-naskh', () =>
        Promise.all([
          import('@fontsource/noto-naskh-arabic/arabic-400.css'),
          import('@fontsource/noto-naskh-arabic/arabic-700.css'),
        ]),
      ),
  },
] as const

export const DEFAULT_FA_FONT: FaFontId = 'vazirmatn'
export const FA_FONT_STORAGE_KEY = 'ruby-light-fa-font'

export function isFaFontId(value: string | null | undefined): value is FaFontId {
  return FA_FONTS.some((f) => f.id === value)
}

export function getFaFont(id: FaFontId): FaFontOption {
  return FA_FONTS.find((f) => f.id === id) ?? FA_FONTS[0]
}

export function readStoredFaFont(): FaFontId {
  try {
    const saved = localStorage.getItem(FA_FONT_STORAGE_KEY)
    if (isFaFontId(saved)) return saved
  } catch {
    /* ignore */
  }
  return DEFAULT_FA_FONT
}

export async function applyFaFont(id: FaFontId) {
  const font = getFaFont(id)
  await font.load()
  document.documentElement.style.setProperty('--font-body-fa', font.cssFamily)
}
