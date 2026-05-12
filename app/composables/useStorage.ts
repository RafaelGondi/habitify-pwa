import type { AppData, Habit, Completion, Skip } from '~/types'
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'

const LEGACY_KEY = 'habitify-data'

function defaultData(): AppData {
  return { version: 1, habits: [], completions: [], skips: [] }
}

export function useStorage() {
  const data = useState<AppData>('habitify', () => defaultData())

  async function loadUserData(uid: string) {
    const { db } = useFirebase()

    const [habitsSnap, completionsSnap, skipsSnap] = await Promise.all([
      getDocs(collection(db, 'users', uid, 'habits')),
      getDocs(collection(db, 'users', uid, 'completions')),
      getDocs(collection(db, 'users', uid, 'skips')),
    ])

    // First login: migrate localStorage data to Firestore
    if (habitsSnap.empty && import.meta.client) {
      const raw = localStorage.getItem(LEGACY_KEY)
      if (raw) {
        try {
          const local = JSON.parse(raw) as AppData
          if (!local.skips) local.skips = []
          await Promise.all([
            ...local.habits.map(h => setDoc(doc(db, 'users', uid, 'habits', h.id), toFirestore(h))),
            ...local.completions.map(c => setDoc(doc(db, 'users', uid, 'completions', c.id), toFirestore(c))),
            ...local.skips.map(s => setDoc(doc(db, 'users', uid, 'skips', s.id), toFirestore(s))),
          ])
          data.value = local
          return
        }
        catch {}
      }
    }

    data.value = {
      version: 1,
      habits: habitsSnap.docs.map(d => d.data() as Habit),
      completions: completionsSnap.docs.map(d => d.data() as Completion),
      skips: skipsSnap.docs.map(d => d.data() as Skip),
    }
  }

  return { data, loadUserData }
}

export function toFirestore(obj: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  )
}
