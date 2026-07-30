import { I18nProvider } from './i18n/I18nContext'
import { Home } from './pages/Home'

export default function App() {
  return (
    <I18nProvider>
      <Home />
    </I18nProvider>
  )
}
