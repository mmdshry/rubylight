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

  if (locale === 'en') {
    await Promise.all([
      import('@fontsource/libre-baskerville/latin-400.css'),
      import('@fontsource/libre-baskerville/latin-700.css'),
    ])
  } else {
    await Promise.all([
      import('@fontsource/noto-nastaliq-urdu/arabic-400.css'),
      import('@fontsource-variable/vazirmatn/wght.css'),
    ])
  }

  registerAgentTools()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  window.setTimeout(() => {
    if (!('serviceWorker' in navigator)) return
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      /* optional */
    })
  }, 4000)
}

void boot()
