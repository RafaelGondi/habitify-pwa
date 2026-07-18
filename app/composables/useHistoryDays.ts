import type { DayRecord, HabitWithStatus } from '~/types'

export function useHistoryDays() {
  const { data } = useStorage()
  const visibleDays = ref(60)

  const earliestDate = computed(() => {
    const allHabits = data.value.habits
    if (!allHabits.length) return null
    const earliestMs = Math.min(...allHabits.map(h => new Date(h.createdAt).getTime()))
    const date = new Date(earliestMs)
    date.setHours(0, 0, 0, 0)
    return date
  })

  const totalSpanDays = computed(() => {
    if (!earliestDate.value) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((today.getTime() - earliestDate.value.getTime()) / 86400000) + 1
  })

  const days = computed((): DayRecord[] => {
    const allHabits = data.value.habits
    if (!allHabits.length) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const limit = Math.min(visibleDays.value, totalSpanDays.value)
    const result: DayRecord[] = []

    for (let i = 0; i < limit; i++) {
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

      const habits: HabitWithStatus[] = relevantHabits.map((h) => {
        const completedToday = completions.some(c => c.habitId === h.id)
        const skipped = skipsForDate.some(s => s.habitId === h.id)
        const period = getQuotaPeriod(h, dateStr)

        if (period) {
          const doneBefore = data.value.completions.filter(
            c => c.habitId === h.id && c.date >= period.start && c.date < dateStr,
          ).length
          const doneTotal = doneBefore + (completedToday ? 1 : 0)
          const couldSkip = canSkipPeriodQuota(dateStr, period.end, doneBefore, period.total)

          return {
            habit: h,
            completed: completedToday,
            completionId: completions.find(c => c.habitId === h.id)?.id,
            periodProgress: { done: doneTotal, total: period.total, unit: period.unit },
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

      const activeHabits = habits.filter(h => !h.skipped)
      const completionRate = activeHabits.length
        ? activeHabits.filter(h => isHabitGoalMet(h)).length / activeHabits.length
        : 0

      result.push({ date: dateStr, habits, completionRate })
    }

    return result
  })

  const hasMore = computed(() => visibleDays.value < totalSpanDays.value)

  function loadMore() {
    visibleDays.value += 30
  }

  /** Garante que o histórico cubra até a data (para navegar meses no calendário). */
  function ensureLoadedForDate(dateStr: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(`${dateStr}T12:00:00`)
    target.setHours(0, 0, 0, 0)
    const daysNeeded = Math.ceil((today.getTime() - target.getTime()) / 86400000) + 1
    if (daysNeeded > visibleDays.value) {
      visibleDays.value = Math.min(daysNeeded + 7, Math.max(daysNeeded, totalSpanDays.value))
    }
  }

  return { days, hasMore, loadMore, ensureLoadedForDate, earliestDate, totalSpanDays }
}
