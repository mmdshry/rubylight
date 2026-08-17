import {
  formatPrice,
  trendArrow,
  type PriceDir,
  type PriceStat,
} from '../lib/prices'

type PriceTrendProps = {
  value: string | undefined
  stat: PriceStat | undefined
  locale: string
  minLabel: string
  maxLabel: string
  upLabel: string
  downLabel: string
  flatLabel: string
  variant: 'web' | 'tv'
}

function dirClass(dir: PriceDir | undefined, variant: 'web' | 'tv') {
  const prefix = variant === 'tv' ? 'tv-dir' : 'price-dir'
  if (dir === 'up') return `${prefix} ${prefix}-up`
  if (dir === 'down') return `${prefix} ${prefix}-down`
  return `${prefix} ${prefix}-flat`
}

function dirLabel(
  dir: PriceDir | undefined,
  up: string,
  down: string,
  flat: string,
) {
  if (dir === 'up') return up
  if (dir === 'down') return down
  return flat
}

export function PriceTrend({
  value,
  stat,
  locale,
  minLabel,
  maxLabel,
  upLabel,
  downLabel,
  flatLabel,
  variant,
}: PriceTrendProps) {
  const dir = stat?.dir
  const valueClass = variant === 'tv' ? 'tv-value' : 'price-board-value'
  const rangeClass = variant === 'tv' ? 'tv-range' : 'price-board-range'

  return (
    <>
      <span className={valueClass} dir="ltr">
        <span
          className={dirClass(dir, variant)}
          aria-label={dirLabel(dir, upLabel, downLabel, flatLabel)}
        >
          {`${trendArrow(dir)} `}
        </span>
        {formatPrice(value, locale)}
      </span>
      {stat ? (
        <span className={rangeClass}>
          {minLabel} {formatPrice(stat.min, locale)}
          {' · '}
          {maxLabel} {formatPrice(stat.max, locale)}
        </span>
      ) : null}
    </>
  )
}
