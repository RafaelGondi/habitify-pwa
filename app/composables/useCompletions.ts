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

  function getCompletion(habitId: string, date: string): Completion | undefined {
    return data.value.completions.find(c => c.habitId === habitId && c.date === date)
  }

  function setNote(habitId: string, date: string, note: string) {
    const completion = getCompletion(habitId, date)
    if (!completion) return

    const updated = completion.note === note
      ? completion
      : { ...completion, note }

    const completions = data.value.completions.map(
      c => c.id === completion.id ? updated : c,
    )
    save({ completions })
  }

  function completionsForDate(date: string) {
    return computed(() => data.value.completions.filter(c => c.date === date))
  }

  return { toggle, getCompletion, setNote, completionsForDate }
}
