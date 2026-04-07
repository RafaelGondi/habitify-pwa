import type { Habit } from '~/types'

export function useHabits() {
  const { data, save } = useStorage()

  const activeHabits = computed(() =>
    [...data.value.habits]
      .filter(h => !h.archivedAt)
      .sort((a, b) => a.order - b.order),
  )

  function addHabit(input: Omit<Habit, 'id' | 'createdAt' | 'order'>): Habit {
    const habit: Habit = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
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

  return { activeHabits, addHabit, updateHabit, archiveHabit }
}
