import { useAkomaTheme } from '@rafael_dias/akoma'

/** Habitify theme — evergreen app mood with persisted light/dark. */
export function useAppTheme() {
  return useAkomaTheme({
    mood: 'app',
    accent: 'evergreen',
    storageKey: 'habitify-theme',
  })
}
