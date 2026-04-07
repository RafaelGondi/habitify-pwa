import type { Habit } from '~/types'

export function useHabits() {
  const { data, save } = useStorage()

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

  function addHabit(input: Omit<Habit, 'id' | 'order'> & { createdAt?: string }): Habit {
    const habit: Habit = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      order: data.value.habits.length,
    }
    save({ habits: [...data.value.habits, habit] })
    return habit
  }

  function updateHabit(id: string, patch: Partial<Habit>) {
    save({
      habits: data.value.habits.map(h => h.id === id ? { ...h, ...patch } : h),
    })
  }

  function archiveHabit(id: string) {
    updateHabit(id, { archivedAt: new Date().toISOString() })
  }

  function unarchiveHabit(id: string) {
    updateHabit(id, { archivedAt: undefined })
  }

  function deleteHabit(id: string) {
    save({
      habits: data.value.habits.filter(h => h.id !== id),
      completions: data.value.completions.filter(c => c.habitId !== id),
      skips: (data.value.skips ?? []).filter(s => s.habitId !== id),
    })
  }

  return { activeHabits, archivedHabits, addHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit }
}
