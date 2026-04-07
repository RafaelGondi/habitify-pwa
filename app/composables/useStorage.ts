import type { AppData } from '~/types'

const STORAGE_KEY = 'habitify-data'

function defaultData(): AppData {
  return { version: 1, habits: [], completions: [] }
}

export function useStorage() {
  const data = useState<AppData>('habitify', () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw) as AppData
      }
      catch {}
    }
    return defaultData()
  })

  // Hydrate from localStorage on client mount (handles SSR mismatch)
  if (import.meta.client && data.value.habits.length === 0) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AppData
        data.value = parsed
      }
    }
    catch {}
  }

  function save(patch: Partial<AppData>) {
    Object.assign(data.value, patch)
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
    }
  }

  return { data, save }
}
