import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import type { Completion } from '~/types'

export function useCompletions() {
  const { data } = useStorage()
  const { db } = useFirebase()
  const { user } = useAuth()

  function completionRef(id: string) {
    return doc(db, 'users', user.value!.uid, 'completions', id)
  }

  function toggle(habitId: string, date: string) {
    const existing = data.value.completions.find(c => c.habitId === habitId && c.date === date)
    if (existing) {
      data.value.completions = data.value.completions.filter(c => c.id !== existing.id)
      if (user.value) deleteDoc(completionRef(existing.id))
    }
    else {
      const completion: Completion = {
        id: crypto.randomUUID(),
        habitId,
        date,
        completedAt: new Date().toISOString(),
      }
      data.value.completions = [...data.value.completions, completion]
      if (user.value) setDoc(completionRef(completion.id), completion)
    }
  }

  function getCompletion(habitId: string, date: string): Completion | undefined {
    return data.value.completions.find(c => c.habitId === habitId && c.date === date)
  }

  function setNote(habitId: string, date: string, note: string) {
    const completion = getCompletion(habitId, date)
    if (!completion) return
    const updated = completion.note === note ? completion : { ...completion, note }
    data.value.completions = data.value.completions.map(c => c.id === completion.id ? updated : c)
    if (user.value) setDoc(completionRef(completion.id), updated)
  }

  function completionsForDate(date: string) {
    return computed(() => data.value.completions.filter(c => c.date === date))
  }

  return { toggle, getCompletion, setNote, completionsForDate }
}
