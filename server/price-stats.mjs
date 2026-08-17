const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const DAY_TTL_SEC = 60 * 60 * 24 * 3

const PRICE_KEYS = [
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
]

/** @type {{ date: string, items: Record<string, StatRecord> }} */
const memory = { date: '', items: {} }

/** @type {ReturnType<typeof import('./redis-lite.mjs').createRedisLite> | null} */
let redis = null
let redisTried = false

/**
 * @typedef {{ min: string, max: string, minN: number, maxN: number, last: string, lastN: number }} StatRecord
 */

export function parsePrice(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null
  let s = raw.trim()
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

export function tehranDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function redisKey(date) {
  return `ruby:day:${date}`
}

/**
 * @param {StatRecord | undefined} prev
 * @param {string} display
 * @param {number} n
 */
function applyTick(prev, display, n) {
  let dir = 'flat'
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

function publicStat(record, dir) {
  return { min: record.min, max: record.max, dir }
}

async function connectRedis() {
  if (redisTried) return redis
  redisTried = true
  try {
    const { createRedisLite } = await import('./redis-lite.mjs')
    const client = createRedisLite(REDIS_URL)
    await client.connect()
    redis = client
    console.log('[rubylight] redis connected')
  } catch (err) {
    redis = null
    console.warn(
      '[rubylight] redis unavailable, using memory',
      err && err.message ? err.message : err,
    )
  }
  return redis
}

async function loadDay(date) {
  if (memory.date !== date) {
    memory.date = date
    memory.items = {}
  }
  const client = await connectRedis()
  if (!client) return { ...memory.items }
  try {
    const raw = await client.hGetAll(redisKey(date))
    const items = {}
    for (const [key, json] of Object.entries(raw)) {
      try {
        items[key] = JSON.parse(json)
      } catch {
        /* skip bad field */
      }
    }
    memory.date = date
    memory.items = items
    return items
  } catch {
    return { ...memory.items }
  }
}

async function saveDay(date, items) {
  memory.date = date
  memory.items = items
  const client = await connectRedis()
  if (!client) return
  try {
    const key = redisKey(date)
    const entries = []
    for (const [field, rec] of Object.entries(items)) {
      entries.push(field, JSON.stringify(rec))
    }
    if (entries.length === 0) return
    await client.hSet(key, entries)
    await client.expire(key, DAY_TTL_SEC)
  } catch {
    /* keep memory */
  }
}

/**
 * @param {Record<string, string>} prices
 * @returns {Promise<Record<string, { min: string, max: string, dir: string }>>}
 */
export async function updateDailyStats(prices) {
  const date = tehranDate()
  const prevItems = await loadDay(date)
  const nextItems = { ...prevItems }
  const stats = {}

  for (const key of PRICE_KEYS) {
    const display = prices[key]
    if (typeof display !== 'string' || !display.trim()) continue
    const n = parsePrice(display)
    if (n == null) continue
    const { record, dir } = applyTick(prevItems[key], display.trim(), n)
    nextItems[key] = record
    stats[key] = publicStat(record, dir)
  }

  await saveDay(date, nextItems)
  return stats
}
