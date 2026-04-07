export function useTodayHabits() {
  const { activeHabits } = useHabits()
  const { toggle, completionsForDate } = useCompletions()

  const todayString = toDateString(new Date())
  const todayDate = new Date()

  const dueToday = computed(() => {
    const completions = completionsForDate(todayString).value
    return activeHabits.value
      .filter(h => isHabitDueOn(h, todayDate))
      .map(h => ({
        habit: h,
        completed: completions.some(c => c.habitId === h.id),
        completionId: completions.find(c => c.habitId === h.id)?.id,
      }))
  })

  const completionRate = computed(() => {
    if (!dueToday.value.length) return 0
    return dueToday.value.filter(h => h.completed).length / dueToday.value.length
  })

  const completedCount = computed(() => dueToday.value.filter(h => h.completed).length)

  const allDone = computed(
    () => dueToday.value.length > 0 && dueToday.value.every(h => h.completed),
  )

  function toggleHabit(habitId: string) {
    toggle(habitId, todayString)
  }

  return { todayString, dueToday, completionRate, completedCount, allDone, toggleHabit }
}
