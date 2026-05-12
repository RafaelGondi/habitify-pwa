import type { AppData } from '~/types'
import { doc, setDoc } from 'firebase/firestore'

export function useExport() {
  const { data } = useStorage()
  const { db } = useFirebase()
  const { user } = useAuth()

  function exportJSON() {
    const exportData: AppData = {
      ...data.value,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `habitify-export-${toDateString(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJSON(file: File): Promise<void> {
    const text = await file.text()
    const imported = JSON.parse(text)

    if (!imported.version || !Array.isArray(imported.habits) || !Array.isArray(imported.completions)) {
      throw new Error('Arquivo inválido ou formato não reconhecido')
    }

    const existingHabitIds = new Set(data.value.habits.map(h => h.id))
    const existingCompletionIds = new Set(data.value.completions.map(c => c.id))
    const newHabits = imported.habits.filter((h: any) => !existingHabitIds.has(h.id))
    const newCompletions = imported.completions.filter((c: any) => !existingCompletionIds.has(c.id))

    data.value.habits = [...data.value.habits, ...newHabits]
    data.value.completions = [...data.value.completions, ...newCompletions]

    if (user.value) {
      const uid = user.value.uid
      await Promise.all([
        ...newHabits.map((h: any) => setDoc(doc(db, 'users', uid, 'habits', h.id), toFirestore(h))),
        ...newCompletions.map((c: any) => setDoc(doc(db, 'users', uid, 'completions', c.id), toFirestore(c))),
      ])
    }
  }

  return { exportJSON, importJSON }
}
