import en from '../i18n/en.json'
import { useI18n } from '../i18n/I18nContext'
import { useTalaPrices } from '../hooks/useTalaPrices'
import {
  TV_PRICE_KEYS,
  formatUpdatedAt,
  type TvPriceKey,
} from '../lib/prices'
import { PriceTrend } from '../components/PriceTrend'

const COLS = 3

function chunkKeys(keys: readonly TvPriceKey[]): TvPriceKey[][] {
  const rows: TvPriceKey[][] = []
  for (let i = 0; i < keys.length; i += COLS) {
    rows.push(keys.slice(i, i + COLS))
  }
  return rows
}

export function TvBoard() {
  const { t } = useI18n()
  const { snapshot, status } = useTalaPrices()
  const rows = chunkKeys(TV_PRICE_KEYS)

  let foot = t.prices.source
  if (status === 'loading' && !snapshot) foot = t.prices.loading
  else if (status === 'error' && !snapshot) foot = t.prices.error
  else if (snapshot) {
    foot = `${t.prices.updated} ${formatUpdatedAt(snapshot.fetchedAt, 'fa')}`
    if (status === 'stale') foot += ` · ${t.prices.cached}`
  }

  return (
    <table className="tv-shell">
      <tbody>
        <tr className="tv-header-row" style={{ height: '8%' }}>
          <td colSpan={3}>
            <img
              className="tv-logo"
              src="/brand/logo-icon.png"
              width={40}
              height={40}
              alt=""
            />
            <span className="tv-brand-name">{en.nav.brand}</span>
          </td>
        </tr>
        <tr className="tv-board-head-row" style={{ height: '8%' }}>
          <td colSpan={3}>
            <span className="tv-title">{t.prices.title}</span>
            <span className="tv-sub">{t.prices.subtitle}</span>
          </td>
        </tr>
        {rows.map((row) => (
          <tr key={row.join('-')} className="tv-price-row" style={{ height: '18%' }}>
            {row.map((key) => (
              <td key={key} className="tv-cell">
                <span className="tv-label">{t.prices.items[key]}</span>
                <PriceTrend
                  value={snapshot?.prices[key]}
                  stat={snapshot?.stats[key]}
                  locale="fa"
                  minLabel={t.prices.min}
                  maxLabel={t.prices.max}
                  upLabel={t.prices.up}
                  downLabel={t.prices.down}
                  flatLabel={t.prices.flat}
                  variant="tv"
                />
              </td>
            ))}
          </tr>
        ))}
        <tr className="tv-board-foot-row" style={{ height: '5%' }}>
          <td colSpan={3}>{foot}</td>
        </tr>
        <tr className="tv-footer-row" style={{ height: '5%' }}>
          <td colSpan={3}>
            <span className="tv-footer-rights">{en.footer.rights}</span>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
