import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyFaFont,
  FA_FONT_STORAGE_KEY,
  FA_FONTS,
  type FaFontId,
  readStoredFaFont,
} from '../lib/fonts'

type FontContextValue = {
  fontId: FaFontId
  setFontId: (id: FaFontId) => void
  fonts: typeof FA_FONTS
}

const FontContext = createContext<FontContextValue | null>(null)

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontId, setFontIdState] = useState<FaFontId>(readStoredFaFont)

  const setFontId = useCallback((id: FaFontId) => {
    setFontIdState(id)
    try {
      localStorage.setItem(FA_FONT_STORAGE_KEY, id)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    void applyFaFont(fontId)
  }, [fontId])

  const value = useMemo(
    () => ({
      fontId,
      setFontId,
      fonts: FA_FONTS,
    }),
    [fontId, setFontId],
  )

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>
}

export function useFont() {
  const ctx = useContext(FontContext)
  if (!ctx) throw new Error('useFont must be used within FontProvider')
  return ctx
}
