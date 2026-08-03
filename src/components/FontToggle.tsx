import { useEffect, useId, useRef, useState } from 'react'
import { useFont } from '../i18n/FontContext'
import en from '../i18n/en.json'

/** Lucide `settings` (cog) — 24×24 */
function GearIcon() {
  return (
    <svg
      className="font-toggle-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function FontToggle() {
  const { fontId, setFontId, fonts } = useFont()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    void Promise.all(fonts.map((font) => font.load()))

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, fonts])

  return (
    <div className="font-toggle" ref={rootRef}>
      <button
        type="button"
        className="font-toggle-btn"
        title={en.nav.fontSettings}
        aria-label={en.nav.fontSettings}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <GearIcon />
      </button>
      {open ? (
        <ul
          id={menuId}
          className="font-menu"
          role="menu"
          aria-label={en.nav.fontMenu}
        >
          {fonts.map((font) => (
            <li key={font.id} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={fontId === font.id}
                aria-current={fontId === font.id ? 'true' : undefined}
                className="font-menu-item"
                style={{ fontFamily: font.cssFamily }}
                onClick={() => {
                  setFontId(font.id)
                  setOpen(false)
                }}
              >
                {font.label.en}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
