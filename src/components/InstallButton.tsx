import { useEffect, useId, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  return Boolean(
    (navigator as Navigator & { standalone?: boolean }).standalone,
  )
}

function isIos() {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function InstallButton() {
  const { t } = useI18n()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [iosHint, setIosHint] = useState(false)
  const [hidden, setHidden] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const hintId = useId()

  useEffect(() => {
    if (isStandalone()) {
      setHidden(true)
      return
    }

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setHidden(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    if (!iosHint) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIosHint(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIosHint(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [iosHint])

  if (hidden) return null

  const showIos = !deferred && isIos()
  if (!deferred && !showIos) return null

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      setDeferred(null)
      if (choice.outcome === 'accepted') setHidden(true)
      return
    }
    setIosHint((open) => !open)
  }

  return (
    <div className="install-toggle" ref={rootRef}>
      <button
        type="button"
        className="lang-toggle install-toggle-btn"
        title={t.nav.install}
        aria-label={t.nav.install}
        aria-expanded={showIos ? iosHint : undefined}
        aria-controls={showIos ? hintId : undefined}
        onClick={() => void onClick()}
      >
        {t.nav.install}
      </button>
      {showIos && iosHint ? (
        <p id={hintId} className="install-ios-hint" role="status">
          {t.nav.installIos}
        </p>
      ) : null}
    </div>
  )
}
