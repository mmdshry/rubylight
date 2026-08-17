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

/** Gold/coin rates that fit a 3×4 TV board without scrolling. */
export const TV_PRICE_KEYS = [
  'ounce',
  'bazartehran',
  'geram18',
  'sekkejad',
  'sekkenim',
  'sekkerob',
  'sekkegad',
  'parsian1',
  'shemsh1',
  'geram740',
  'hobab',
  'silver',
] as const satisfies readonly PriceKey[]

export type TvPriceKey = (typeof TV_PRICE_KEYS)[number]

export type TalaPriceMap = Record<string, string>

export type PriceDir = 'up' | 'down' | 'flat'

export type PriceStat = {
  min: string
  max: string
  dir: PriceDir
}

export type PriceStats = Partial<Record<PriceKey, PriceStat>>

export type TalaBannerResponse = {
  banner?: unknown[]
  price?: TalaPriceMap
  stats?: PriceStats
}

export type PriceSnapshot = {
  prices: Partial<Record<PriceKey, string>>
  fetchedAt: number
  stats: PriceStats
}

const CACHE_KEY = 'ruby-light-tala-prices'
const STATS_KEY = 'ruby-light-tala-day-stats'
export const PRICE_POLL_MS = 60_000

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

type LocalStatRecord = {
  min: string
  max: string
  minN: number
  maxN: number
  last: string
  lastN: number
}

type LocalDayStats = {
  date: string
  items: Partial<Record<PriceKey, LocalStatRecord>>
}

export function toFaDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)] ?? d)
}

export function parsePrice(raw: string): number | null {
  let s = raw.trim()
  if (!s) return null
  s = s.replace(/[۰-۹]/g, (d) => {
    const i = FA_DIGITS.indexOf(d)
    return i === -1 ? d : String(i)
  })
  s = s.replace(/[٬,]/g, '')
  s = s.replace(/[٫/]/g, '.')
  s = s.replace(/[^\d.eE+-]/g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function tehranDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function formatPrice(value: string | undefined, locale: string): string {
  if (!value) return '—'
  return locale === 'fa' ? toFaDigits(value) : value
}

export function formatUpdatedAt(ts: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts))
  } catch {
    const d = new Date(ts)
    const h = d.getHours()
    const m = d.getMinutes()
    const raw = `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`
    return locale === 'fa' ? toFaDigits(raw) : raw
  }
}

export function trendArrow(dir: PriceDir | undefined): string {
  if (dir === 'up') return '▲'
  if (dir === 'down') return '▼'
  return '−'
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

function isDir(value: unknown): value is PriceDir {
  return value === 'up' || value === 'down' || value === 'flat'
}

export function pickStats(raw?: PriceStats | null): PriceStats {
  const next: PriceStats = {}
  if (!raw) return next
  for (const key of PRICE_KEYS) {
    const row = raw[key]
    if (!row || typeof row.min !== 'string' || typeof row.max !== 'string') continue
    if (!isDir(row.dir)) continue
    next[key] = { min: row.min, max: row.max, dir: row.dir }
  }
  return next
}

function readLocalDay(): LocalDayStats | null {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LocalDayStats
    if (!parsed?.date || typeof parsed.items !== 'object' || !parsed.items) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeLocalDay(day: LocalDayStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(day))
  } catch {
    /* ignore quota / private mode */
  }
}

function applyTick(
  prev: LocalStatRecord | undefined,
  display: string,
  n: number,
): { record: LocalStatRecord; dir: PriceDir } {
  let dir: PriceDir = 'flat'
  if (prev && typeof prev.lastN === 'number') {
    if (n > prev.lastN) dir = 'up'
    else if (n < prev.lastN) dir = 'down'
  }
  let min = prev?.min ?? display
  let max = prev?.max ?? display
  let minN = prev?.minN ?? n
  let maxN = prev?.maxN ?? n
  if (n < minN) {
    minN = n
    min = display
  }
  if (n > maxN) {
    maxN = n
    max = display
  }
  return {
    record: { min, max, minN, maxN, last: display, lastN: n },
    dir,
  }
}

/** Update browser daily stats when the API did not send `stats`. */
export function updateLocalStats(
  prices: Partial<Record<PriceKey, string>>,
): PriceStats {
  const date = tehranDate()
  const prev = readLocalDay()
  const prevItems = prev?.date === date ? prev.items : {}
  const nextItems: LocalDayStats['items'] = { ...prevItems }
  const stats: PriceStats = {}

  for (const key of PRICE_KEYS) {
    const display = prices[key]
    if (!display) continue
    const n = parsePrice(display)
    if (n == null) continue
    const { record, dir } = applyTick(prevItems[key], display, n)
    nextItems[key] = record
    stats[key] = { min: record.min, max: record.max, dir }
  }

  writeLocalDay({ date, items: nextItems })
  return stats
}

export function syncLocalStats(stats: PriceStats, prices: Partial<Record<PriceKey, string>>) {
  const date = tehranDate()
  const prev = readLocalDay()
  const items: LocalDayStats['items'] =
    prev?.date === date ? { ...prev.items } : {}

  for (const key of PRICE_KEYS) {
    const row = stats[key]
    const display = prices[key]
    if (!row || !display) continue
    const n = parsePrice(display)
    const minN = parsePrice(row.min)
    const maxN = parsePrice(row.max)
    items[key] = {
      min: row.min,
      max: row.max,
      minN: minN ?? n ?? 0,
      maxN: maxN ?? n ?? 0,
      last: display,
      lastN: n ?? 0,
    }
  }
  writeLocalDay({ date, items })
}

export function readPriceCache(): PriceSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PriceSnapshot
    if (!parsed?.prices || typeof parsed.fetchedAt !== 'number') return null
    return {
      prices: parsed.prices,
      fetchedAt: parsed.fetchedAt,
      stats: pickStats(parsed.stats),
    }
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
  let stats = pickStats(data.stats)
  if (Object.keys(stats).length === 0) {
    stats = updateLocalStats(prices)
  } else {
    syncLocalStats(stats, prices)
  }
  const snapshot: PriceSnapshot = { prices, fetchedAt: Date.now(), stats }
  writePriceCache(snapshot)
  return snapshot
}
