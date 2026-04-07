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
    const weekStart = getWeekStart(dateStr.value)
    const weekEnd = getWeekEnd(dateStr.value)
    const weekCompletions = data.value.completions.filter(
      c => c.date >= weekStart && c.date <= weekEnd,
    )
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
        const completedToday = completions.some(c => c.habitId === h.id)
        const skipped = skips.some(s => s.habitId === h.id)

        if (h.recurrence.type === 'weekly_x') {
          const total = h.recurrence.timesPerWeek ?? 1
          const done = weekCompletions.filter(c => c.habitId === h.id).length
          const allowSkip = !completedToday && !skipped && canSkipWeeklyX(dateStr.value, done, total)
          return {
            habit: h,
            completed: completedToday || done >= total,
            completionId: completions.find(c => c.habitId === h.id)?.id,
            weeklyProgress: { done, total },
            skipped,
            canSkip: allowSkip,
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
  })

  // Skipped habits are excluded from completion rate
  const activeHabits = computed(() => dueHabits.value.filter(h => !h.skipped))
  const completedCount = computed(() => activeHabits.value.filter(h => h.completed).length)

  const completionRate = computed(() => {
    if (!activeHabits.value.length || isFuture.value) return 0
    return completedCount.value / activeHabits.value.length
  })

  const allDone = computed(
    () => !isFuture.value && activeHabits.value.length > 0 && activeHabits.value.every(h => h.completed),
  )

  function toggleHabit(habitId: string) {
    if (!isEditable.value) return
    const item = dueHabits.value.find(h => h.habit.id === habitId)
    if (!item) return
    if (item.habit.recurrence.type === 'weekly_x' && item.weeklyProgress) {
      const { done, total } = item.weeklyProgress
      const completedToday = !!item.completionId
      if (!completedToday && done >= total) return
    }
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

  return { dueHabits, completedCount, completionRate, allDone, isToday, isPast, isFuture, isEditable, toggleHabit, toggleSkip }
}
