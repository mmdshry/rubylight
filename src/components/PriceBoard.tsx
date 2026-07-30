import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import {
  PRICE_KEYS,
  PRICE_POLL_MS,
  fetchTalaPrices,
  readPriceCache,
  toFaDigits,
  type PriceSnapshot,
} from '../lib/prices'

type BoardState = {
  snapshot: PriceSnapshot | null
  status: 'loading' | 'ready' | 'stale' | 'error'
}

function formatUpdatedAt(ts: number, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ts))
  } catch {
    return ''
  }
}

function formatPrice(value: string | undefined, locale: string) {
  if (!value) return '—'
  return locale === 'fa' ? toFaDigits(value) : value
}

export function PriceBoard() {
  const { t, locale } = useI18n()
  const [state, setState] = useState<BoardState>(() => {
    const cached = readPriceCache()
    return {
      snapshot: cached,
      status: cached ? 'stale' : 'loading',
    }
  })

  useEffect(() => {
    const controller = new AbortController()
    let alive = true

    const load = async () => {
      try {
        const snapshot = await fetchTalaPrices(controller.signal)
        if (!alive) return
        setState({ snapshot, status: 'ready' })
      } catch {
        if (!alive || controller.signal.aborted) return
        const cached = readPriceCache()
        setState((prev) => ({
          snapshot: prev.snapshot ?? cached,
          status: prev.snapshot || cached ? 'stale' : 'error',
        }))
      }
    }

    void load()
    const id = window.setInterval(() => void load(), PRICE_POLL_MS)
    return () => {
      alive = false
      controller.abort()
      window.clearInterval(id)
    }
  }, [])

  const cells = PRICE_KEYS.map((key) => ({
    key,
    label: t.prices.items[key],
    value: state.snapshot?.prices[key],
  })).filter((cell) => cell.value)

  return (
    <section
      id="price-board"
      className="price-board"
      aria-labelledby="price-board-title"
    >
      <div className="price-board-inner">
        <header className="price-board-head">
          <h2 id="price-board-title" className="price-board-title">
            {t.prices.title}
          </h2>
          <p className="price-board-sub">{t.prices.subtitle}</p>
        </header>

        {state.status === 'loading' && !state.snapshot ? (
          <p className="price-board-status" role="status">
            {t.prices.loading}
          </p>
        ) : null}

        {state.status === 'error' && !state.snapshot ? (
          <p className="price-board-status" role="alert">
            {t.prices.error}
          </p>
        ) : null}

        {cells.length > 0 ? (
          <ul className="price-board-grid">
            {cells.map((cell) => (
              <li key={cell.key} className="price-board-cell">
                <span className="price-board-label">{cell.label}</span>
                <span className="price-board-value" dir="ltr">
                  {formatPrice(cell.value, locale)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <footer className="price-board-foot">
          {state.snapshot ? (
            <span>
              {t.prices.updated}{' '}
              <time dateTime={new Date(state.snapshot.fetchedAt).toISOString()}>
                {formatUpdatedAt(state.snapshot.fetchedAt, locale)}
              </time>
              {state.status === 'stale' ? ` · ${t.prices.cached}` : ''}
            </span>
          ) : (
            <span>{t.prices.source}</span>
          )}
        </footer>
      </div>
    </section>
  )
}
