import { useI18n } from '../i18n/I18nContext'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <p className="site-footer-rights">{t.footer.rights}</p>
    </footer>
  )
}
