export const PRICE_KEYS = [
  'ounce',
  'bazartehran',
  'geram18',
  'sekkejad',
  'sekkenim',
  'sekkerob',
  'silver',
  'shemsh1',
  'BTC_USDT',
  'sekke-arzesh',
  'ENERGY_BRENT',
  'USDT_IRT',
  'parsian1',
  'sekkegad',
  'geram740',
  'try',
  'omr',
  'ETH_USDT',
  'hobab',
] as const

export type PriceKey = (typeof PRICE_KEYS)[number]

export type TalaPriceMap = Record<string, string>

export type TalaBannerResponse = {
  banner?: unknown[]
  price?: TalaPriceMap
}

export type PriceSnapshot = {
  prices: Partial<Record<PriceKey, string>>
  fetchedAt: number
}

const CACHE_KEY = 'ruby-light-tala-prices'
export const PRICE_POLL_MS = 60_000

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export function toFaDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)] ?? d)
}

export function pickPrices(raw?: TalaPriceMap): Partial<Record<PriceKey, string>> {
  const next: Partial<Record<PriceKey, string>> = {}
  if (!raw) return next
  for (const key of PRICE_KEYS) {
    const value = raw[key]
    if (typeof value === 'string' && value.trim()) next[key] = value.trim()
  }
  return next
}

export function readPriceCache(): PriceSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PriceSnapshot
    if (!parsed?.prices || typeof parsed.fetchedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function writePriceCache(snapshot: PriceSnapshot) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot))
  } catch {
    /* ignore quota / private mode */
  }
}

export async function fetchTalaPrices(
  signal?: AbortSignal,
): Promise<PriceSnapshot> {
  const res = await fetch('/api/tala', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`tala ${res.status}`)
  const data = (await res.json()) as TalaBannerResponse
  const prices = pickPrices(data.price)
  if (Object.keys(prices).length === 0) {
    throw new Error('tala empty prices')
  }
  const snapshot: PriceSnapshot = { prices, fetchedAt: Date.now() }
  writePriceCache(snapshot)
  return snapshot
}
