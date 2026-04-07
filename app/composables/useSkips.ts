import type { Skip } from '~/types'

export function useSkips() {
  const { data, save } = useStorage()

  function skipHabit(habitId: string, date: string) {
    const already = data.value.skips.find(s => s.habitId === habitId && s.date === date)
    if (already) return
    const skip: Skip = { id: crypto.randomUUID(), habitId, date }
    save({ skips: [...data.value.skips, skip] })
  }

  function unskipHabit(habitId: string, date: string) {
    save({ skips: data.value.skips.filter(s => !(s.habitId === habitId && s.date === date)) })
  }

  function isSkipped(habitId: string, date: string): boolean {
    return data.value.skips.some(s => s.habitId === habitId && s.date === date)
  }

  return { skipHabit, unskipHabit, isSkipped }
}

/**
 * Returns whether a weekly_x habit can be skipped on a given date.
 * Rule: remaining days in week > remaining reps needed.
 */
export function canSkipWeeklyX(dateStr: string, weeklyDone: number, timesPerWeek: number): boolean {
  const remainingReps = timesPerWeek - weeklyDone
  if (remainingReps <= 0) return false // quota already met

  const date = new Date(dateStr + 'T12:00:00')
  const dow = date.getDay() // 0 = Sun
  const daysToSunday = dow === 0 ? 0 : 7 - dow
  const remainingDays = daysToSunday + 1 // inclusive of today

  return remainingDays > remainingReps
}
