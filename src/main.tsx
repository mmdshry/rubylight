import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { isTvPath } from './lib/tv'

function initialLocale(): 'fa' | 'en' {
  if (isTvPath()) return 'fa'
  try {
    const q = new URLSearchParams(location.search).get('lang')
    if (q === 'fa' || q === 'en') return q
    const saved = localStorage.getItem('ruby-light-locale')
    if (saved === 'fa' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  return 'fa'
}

async function boot() {
  const tv = isTvPath()
  const root = document.documentElement

  if (tv) {
    root.lang = 'fa'
    root.dir = 'rtl'
    root.dataset.tv = '1'
    root.dataset.theme = 'light'
    await import('./styles/tv.css')
    void import('@fontsource/libre-baskerville/latin-400.css')
    void import('@fontsource/libre-baskerville/latin-700.css')
  } else {
    const locale = initialLocale()
    const tasks: Promise<unknown>[] = [
      import('./styles/index.css'),
      import('@fontsource/libre-baskerville/latin-400.css'),
      import('@fontsource/libre-baskerville/latin-700.css'),
    ]
    if (locale === 'fa') {
      tasks.push(import('./styles/fa-fonts.css'))
    }
    await Promise.all(tasks)
  }

  if (!tv) {
    const { registerAgentTools } = await import('./lib/webmcp')
    registerAgentTools()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  if (import.meta.env.PROD && !tv) {
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({ immediate: true })
  }
}

void boot()
