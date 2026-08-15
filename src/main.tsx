import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { registerAgentTools } from './lib/webmcp'

function initialLocale(): 'fa' | 'en' {
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
  const locale = initialLocale()

  const tasks: Promise<unknown>[] = [
    import('@fontsource/libre-baskerville/latin-400.css'),
    import('@fontsource/libre-baskerville/latin-700.css'),
  ]

  if (locale === 'fa') {
    tasks.push(import('./styles/fa-fonts.css'))
  }

  await Promise.all(tasks)

  registerAgentTools()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      /* optional */
    })
  }
}

void boot()
