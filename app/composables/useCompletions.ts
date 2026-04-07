import type { Completion } from '~/types'

export function useCompletions() {
  const { data, save } = useStorage()

  function toggle(habitId: string, date: string) {
    const existing = data.value.completions.find(
      c => c.habitId === habitId && c.date === date,
    )
    if (existing) {
      save({ completions: data.value.completions.filter(c => c.id !== existing.id) })
    }
    else {
      const completion: Completion = {
        id: crypto.randomUUID(),
        habitId,
        date,
        completedAt: new Date().toISOString(),
      }
      save({ completions: [...data.value.completions, completion] })
    }
  }

  function completionsForDate(date: string) {
    return computed(() => data.value.completions.filter(c => c.date === date))
  }

  return { toggle, completionsForDate }
}
