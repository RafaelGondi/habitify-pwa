import { useAkomaTheme } from '@rafael_dias/akoma'

/** Matches Akoma mood `app` `--bg` light/dark (evergreen). */
export const HABITIFY_THEME_COLORS = {
  light: '#f8f6f1',
  dark: '#1d211f',
} as const

/** Habitify theme — evergreen app mood with persisted light/dark. */
export function useAppTheme() {
  return useAkomaTheme({
    mood: 'app',
    accent: 'evergreen',
    storageKey: 'habitify-theme',
  })
}

/** First-paint theme-color before useAkomaTheme syncs from `--bg`. */
export function initialThemeColor(): string {
  if (!import.meta.client) return HABITIFY_THEME_COLORS.light
  try {
    const saved = localStorage.getItem('habitify-theme')
    if (saved === 'dark') return HABITIFY_THEME_COLORS.dark
  }
  catch { /* ignore */ }
  return HABITIFY_THEME_COLORS.light
}
