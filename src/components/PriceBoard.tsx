import { useI18n } from '../i18n/I18nContext'
import { useTalaPrices } from '../hooks/useTalaPrices'
import { PRICE_KEYS, formatUpdatedAt } from '../lib/prices'
import { PriceTrend } from './PriceTrend'

export function PriceBoard() {
  const { t, locale } = useI18n()
  const { snapshot, status } = useTalaPrices()

  const cells = PRICE_KEYS.map((key) => ({
    key,
    label: t.prices.items[key],
    value: snapshot?.prices[key],
    stat: snapshot?.stats[key],
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

        {status === 'loading' && !snapshot ? (
          <p className="price-board-status" role="status">
            {t.prices.loading}
          </p>
        ) : null}

        {status === 'error' && !snapshot ? (
          <p className="price-board-status" role="alert">
            {t.prices.error}
          </p>
        ) : null}

        {cells.length > 0 ? (
          <ul className="price-board-grid">
            {cells.map((cell) => (
              <li key={cell.key} className="price-board-cell">
                <span className="price-board-label">{cell.label}</span>
                <PriceTrend
                  value={cell.value}
                  stat={cell.stat}
                  locale={locale}
                  minLabel={t.prices.min}
                  maxLabel={t.prices.max}
                  upLabel={t.prices.up}
                  downLabel={t.prices.down}
                  flatLabel={t.prices.flat}
                  variant="web"
                />
              </li>
            ))}
          </ul>
        ) : null}

        <footer className="price-board-foot">
          {snapshot ? (
            <span>
              {t.prices.updated}{' '}
              <time dateTime={new Date(snapshot.fetchedAt).toISOString()}>
                {formatUpdatedAt(snapshot.fetchedAt, locale)}
              </time>
              {status === 'stale' ? ` · ${t.prices.cached}` : ''}
            </span>
          ) : (
            <span>{t.prices.source}</span>
          )}
        </footer>
      </div>
    </section>
  )
}
