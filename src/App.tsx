import { I18nProvider } from './i18n/I18nContext'
import { isTvPath } from './lib/tv'
import { Home } from './pages/Home'
import { TvBoard } from './pages/TvBoard'

export default function App() {
  return (
    <I18nProvider>
      {isTvPath() ? <TvBoard /> : <Home />}
    </I18nProvider>
  )
}
