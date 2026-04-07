import type { Habit } from '~/types'

export function useStreak() {
  const { data } = useStorage()

  function getStreak(habit: Habit, referenceDate?: string): number {
    const todayStr = toDateString(new Date())
    const limitStr = toDateString(new Date(Date.now() - 365 * 86400000))

    // Start from reference date (default: today)
    // If today is not yet completed, start counting from yesterday
    let current = referenceDate ?? todayStr
    let streak = 0
    let skippedToday = false

    while (current >= limitStr) {
      const date = new Date(current + 'T12:00:00')

      // Habit didn't exist yet
      if (current < habit.createdAt.slice(0, 10)) break

      // Habit was already archived before this date
      if (habit.archivedAt && current >= habit.archivedAt.slice(0, 10)) {
        current = prevDay(current)
        continue
      }

      // Not due on this day — skip without breaking streak
      if (!isHabitDueOn(habit, date)) {
        current = prevDay(current)
        continue
      }

      const completed = data.value.completions.some(
        c => c.habitId === habit.id && c.date === current,
      )

      if (!completed) {
        // Allow skipping today once (habit not yet done today)
        if (!skippedToday && current === todayStr) {
          skippedToday = true
          current = prevDay(current)
          continue
        }
        break
      }

      streak++
      current = prevDay(current)
    }

    return streak
  }

  return { getStreak }
}

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() - 1)
  return toDateString(d)
}
