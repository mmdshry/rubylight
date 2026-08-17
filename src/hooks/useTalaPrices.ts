import { useEffect, useState } from 'react'
import {
  PRICE_POLL_MS,
  fetchTalaPrices,
  readPriceCache,
  type PriceSnapshot,
} from '../lib/prices'

export type TalaPricesStatus = 'loading' | 'ready' | 'stale' | 'error'

export type TalaPricesState = {
  snapshot: PriceSnapshot | null
  status: TalaPricesStatus
}

export function useTalaPrices(): TalaPricesState {
  const [state, setState] = useState<TalaPricesState>(() => {
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

  return state
}
