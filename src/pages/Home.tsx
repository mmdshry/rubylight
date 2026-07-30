import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { JsonLd } from '../components/JsonLd'

export function Home() {
  return (
    <div className="app-shell">
      <JsonLd />
      <Header />
      <main id="main" className="app-main">
        <Hero />
      </main>
      <Footer />
    </div>
  )
}
