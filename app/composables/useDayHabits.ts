import type { HabitWithStatus } from '~/types'

export function useDayHabits(dateStr: Ref<string> | ComputedRef<string>) {
  const { data } = useStorage()
  const { toggle } = useCompletions()
  const { skipHabit, unskipHabit } = useSkips()

  const todayStr = toDateString(new Date())

  const isToday = computed(() => dateStr.value === todayStr)
  const isPast = computed(() => dateStr.value < todayStr)
  const isFuture = computed(() => dateStr.value > todayStr)
  const isEditable = computed(() => !isFuture.value)

  const dateObj = computed(() => new Date(dateStr.value + 'T12:00:00'))

  const dueHabits = computed((): HabitWithStatus[] => {
    const completions = data.value.completions.filter(c => c.date === dateStr.value)
    const skips = (data.value.skips ?? []).filter(s => s.date === dateStr.value)
    const d = dateObj.value
    const target = new Date(dateStr.value + 'T00:00:00')

    return data.value.habits
      .filter((h) => {
        if (isFuture.value) {
          if (h.archivedAt) return false
        }
        else {
          const created = new Date(h.createdAt)
          created.setHours(0, 0, 0, 0)
          if (created > target) return false
          if (h.archivedAt) {
            const archived = new Date(h.archivedAt)
            archived.setHours(0, 0, 0, 0)
            if (archived <= target) return false
          }
        }
        return isHabitDueOn(h, d)
      })
      .sort((a, b) => a.order - b.order)
      .map((h) => {
        const completion = completions.find(c => c.habitId === h.id)
        const completedToday = !!completion
        const skipped = skips.some(s => s.habitId === h.id)
        const period = getQuotaPeriod(h, dateStr.value)

        if (period) {
          const done = data.value.completions.filter(
            c => c.habitId === h.id && c.date >= period.start && c.date <= period.end,
          ).length
          const allowSkip = !completedToday
            && !skipped
            && canSkipPeriodQuota(dateStr.value, period.end, done, period.total)

          return {
            habit: h,
            completed: completedToday,
            completionId: completion?.id,
            note: completion?.note,
            periodProgress: { done, total: period.total, unit: period.unit },
            skipped,
            canSkip: allowSkip,
          }
        }

        return {
          habit: h,
          completed: completedToday,
          completionId: completion?.id,
          note: completion?.note,
          skipped: false,
          canSkip: false,
        }
      })
  })

  /** Cota do período já batida, mas sem check hoje (ex.: 3x/semana já feitos). */
  function isQuotaMetPending(h: HabitWithStatus): boolean {
    if (h.completed || h.skipped || !h.periodProgress) return false
    return h.periodProgress.done >= h.periodProgress.total
  }

  const sortedHabits = computed(() => {
    const pending = dueHabits.value.filter(h => !h.completed && !h.skipped && !isQuotaMetPending(h))
    const quotaMet = dueHabits.value.filter(h => isQuotaMetPending(h))
    const done = dueHabits.value.filter(h => h.completed && !h.skipped)
    const skipped = dueHabits.value.filter(h => h.skipped)
    return [...pending, ...quotaMet, ...done, ...skipped]
  })

  // Skipped habits are excluded from completion rate
  const activeHabits = computed(() => dueHabits.value.filter(h => !h.skipped))
  const completedCount = computed(() => activeHabits.value.filter(h => isHabitGoalMet(h)).length)

  const completionRate = computed(() => {
    if (!activeHabits.value.length || isFuture.value) return 0
    return completedCount.value / activeHabits.value.length
  })

  const allDone = computed(
    () => !isFuture.value && activeHabits.value.length > 0 && activeHabits.value.every(h => isHabitGoalMet(h)),
  )

  function toggleHabit(habitId: string) {
    if (!isEditable.value) return
    toggle(habitId, dateStr.value)
  }

  function toggleSkip(habitId: string) {
    if (!isEditable.value) return
    const item = dueHabits.value.find(h => h.habit.id === habitId)
    if (!item) return
    if (item.skipped) {
      unskipHabit(habitId, dateStr.value)
    }
    else if (item.canSkip) {
      skipHabit(habitId, dateStr.value)
    }
  }

  return { dueHabits: sortedHabits, activeHabits, completedCount, completionRate, allDone, isToday, isPast, isFuture, isEditable, toggleHabit, toggleSkip }
}
