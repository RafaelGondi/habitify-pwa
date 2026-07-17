import { applyAccentPalette, type AccentPalette } from '@rafael_dias/akoma'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'habitify-theme'
const ACCENT: AccentPalette = 'teal'

const THEME_COLORS: Record<ThemeMode, string> = {
  light: '#f8f6f1',
  dark: '#1d211f',
}

function loadTheme(): ThemeMode {
  if (!import.meta.client) return 'light'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  }
  catch { /* ignore */ }
  return 'light'
}

export function applyAkomaTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode
  document.documentElement.dataset.mood = 'app'
  applyAccentPalette(document.documentElement, ACCENT)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[mode])
}

export function useAppTheme() {
  const mode = useState<ThemeMode>('app-theme', () => 'light')

  if (import.meta.client && mode.value === 'light') {
    mode.value = loadTheme()
  }

  watch(mode, (val) => {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, val)
    applyAkomaTheme(val)
  }, { immediate: true })

  function setMode(next: ThemeMode) {
    mode.value = next
  }

  function toggleMode() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
  }

  return { mode, setMode, toggleMode }
}
