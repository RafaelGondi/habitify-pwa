import type { DayRecord, HabitWithStatus } from '~/types'

export function useHistoryDays() {
  const { data } = useStorage()
  const visibleDays = ref(30)

  const days = computed((): DayRecord[] => {
    const allHabits = data.value.habits
    if (!allHabits.length) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const earliestMs = Math.min(...allHabits.map(h => new Date(h.createdAt).getTime()))
    const earliestDate = new Date(earliestMs)
    earliestDate.setHours(0, 0, 0, 0)

    const totalDays = Math.ceil((today.getTime() - earliestDate.getTime()) / 86400000)
    const limit = Math.min(visibleDays.value, totalDays)

    const result: DayRecord[] = []

    for (let i = 1; i <= limit; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = toDateString(date)

      const relevantHabits = allHabits.filter((h) => {
        const created = new Date(h.createdAt)
        created.setHours(0, 0, 0, 0)
        if (created > date) return false
        if (h.archivedAt) {
          const archived = new Date(h.archivedAt)
          archived.setHours(0, 0, 0, 0)
          if (archived <= date) return false
        }
        return isHabitDueOn(h, date)
      })

      if (!relevantHabits.length) continue

      const completions = data.value.completions.filter(c => c.date === dateStr)
      const skipsForDate = (data.value.skips ?? []).filter(s => s.date === dateStr)
      const weekStart = getWeekStart(dateStr)

      const habits: HabitWithStatus[] = relevantHabits.map((h) => {
        const completedToday = completions.some(c => c.habitId === h.id)
        const skipped = skipsForDate.some(s => s.habitId === h.id)

        if (h.recurrence.type === 'weekly_x') {
          const total = h.recurrence.timesPerWeek ?? 1
          // completions this week strictly before this date
          const weekDoneBefore = data.value.completions.filter(
            c => c.habitId === h.id && c.date >= weekStart && c.date < dateStr,
          ).length
          const weekDoneTotal = weekDoneBefore + (completedToday ? 1 : 0)
          const couldSkip = canSkipWeeklyX(dateStr, weekDoneBefore, total)

          return {
            habit: h,
            completed: completedToday || weekDoneTotal >= total,
            completionId: completions.find(c => c.habitId === h.id)?.id,
            weeklyProgress: { done: weekDoneTotal, total },
            skipped,
            canSkip: couldSkip,
          }
        }

        return {
          habit: h,
          completed: completedToday,
          completionId: completions.find(c => c.habitId === h.id)?.id,
          skipped: false,
          canSkip: false,
        }
      })

      // Exclude skipped from rate (same rule as today view)
      const activeHabits = habits.filter(h => !h.skipped)
      const completionRate = activeHabits.length
        ? activeHabits.filter(h => h.completed).length / activeHabits.length
        : 0

      result.push({ date: dateStr, habits, completionRate })
    }

    return result
  })

  const hasMore = computed(() => {
    const allHabits = data.value.habits
    if (!allHabits.length) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const earliestMs = Math.min(...allHabits.map(h => new Date(h.createdAt).getTime()))
    const earliestDate = new Date(earliestMs)
    earliestDate.setHours(0, 0, 0, 0)
    const totalDays = Math.ceil((today.getTime() - earliestDate.getTime()) / 86400000)
    return visibleDays.value < totalDays
  })

  function loadMore() {
    visibleDays.value += 30
  }

  return { days, hasMore, loadMore }
}
