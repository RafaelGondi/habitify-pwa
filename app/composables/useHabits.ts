import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import type { Habit } from '~/types'

export function useHabits() {
  const { data } = useStorage()
  const { db } = useFirebase()
  const { user } = useAuth()

  const activeHabits = computed(() =>
    [...data.value.habits]
      .filter(h => !h.archivedAt)
      .sort((a, b) => a.order - b.order),
  )

  const archivedHabits = computed(() =>
    [...data.value.habits]
      .filter(h => !!h.archivedAt)
      .sort((a, b) => (b.archivedAt ?? '').localeCompare(a.archivedAt ?? '')),
  )

  function habitRef(id: string) {
    return doc(db, 'users', user.value!.uid, 'habits', id)
  }

  function addHabit(input: Omit<Habit, 'id' | 'order' | 'createdAt'> & { createdAt?: string }): Habit {
    const habit: Habit = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      order: data.value.habits.length,
    }
    data.value.habits = [...data.value.habits, habit]
    if (user.value) setDoc(habitRef(habit.id), toFirestore(habit))
    return habit
  }

  function updateHabit(id: string, patch: Partial<Habit>) {
    const habits = data.value.habits.map(h => h.id === id ? { ...h, ...patch } : h)
    data.value.habits = habits
    if (user.value) {
      const updated = habits.find(h => h.id === id)!
      setDoc(habitRef(id), toFirestore(updated))
    }
  }

  function archiveHabit(id: string) {
    updateHabit(id, { archivedAt: new Date().toISOString() })
  }

  function unarchiveHabit(id: string) {
    updateHabit(id, { archivedAt: undefined })
  }

  function deleteHabit(id: string) {
    const completionsToDelete = data.value.completions.filter(c => c.habitId === id)
    const skipsToDelete = (data.value.skips ?? []).filter(s => s.habitId === id)

    data.value.habits = data.value.habits.filter(h => h.id !== id)
    data.value.completions = data.value.completions.filter(c => c.habitId !== id)
    data.value.skips = (data.value.skips ?? []).filter(s => s.habitId !== id)

    if (user.value) {
      const uid = user.value.uid
      deleteDoc(doc(db, 'users', uid, 'habits', id))
      completionsToDelete.forEach(c => deleteDoc(doc(db, 'users', uid, 'completions', c.id)))
      skipsToDelete.forEach(s => deleteDoc(doc(db, 'users', uid, 'skips', s.id)))
    }
  }

  return { activeHabits, archivedHabits, addHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit }
}
