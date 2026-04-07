import type { HabitWithStatus } from '~/types'

export function useDayHabits(dateStr: Ref<string> | ComputedRef<string>) {
  const { data } = useStorage()
  const { toggle } = useCompletions()

  const todayStr = toDateString(new Date())

  const isToday = computed(() => dateStr.value === todayStr)
  const isPast = computed(() => dateStr.value < todayStr)
  const isFuture = computed(() => dateStr.value > todayStr)
  // Past and today are both editable (retroactive check-off is allowed)
  const isEditable = computed(() => !isFuture.value)

  const dateObj = computed(() => new Date(dateStr.value + 'T12:00:00'))

  const dueHabits = computed((): HabitWithStatus[] => {
    const completions = data.value.completions.filter(c => c.date === dateStr.value)
    const d = dateObj.value
    const target = new Date(dateStr.value + 'T00:00:00')

    return data.value.habits
      .filter((h) => {
        if (isFuture.value) {
          // Future: show only currently active habits due on that day
          if (h.archivedAt) return false
        }
        else {
          // Past / today: habit must have existed on that date
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
      .map(h => ({
        habit: h,
        completed: completions.some(c => c.habitId === h.id),
        completionId: completions.find(c => c.habitId === h.id)?.id,
      }))
  })

  const completedCount = computed(() => dueHabits.value.filter(h => h.completed).length)

  const completionRate = computed(() => {
    if (!dueHabits.value.length || isFuture.value) return 0
    return completedCount.value / dueHabits.value.length
  })

  const allDone = computed(
    () => !isFuture.value && dueHabits.value.length > 0 && dueHabits.value.every(h => h.completed),
  )

  function toggleHabit(habitId: string) {
    if (!isEditable.value) return
    toggle(habitId, dateStr.value)
  }

  return { dueHabits, completedCount, completionRate, allDone, isToday, isPast, isFuture, isEditable, toggleHabit }
}
