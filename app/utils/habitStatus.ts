import type { HabitWithStatus } from '~/types'

/** Whether the habit's obligation is satisfied for this day (incl. weekly_x quota met earlier in the week). */
export function isHabitGoalMet(item: HabitWithStatus): boolean {
  if (item.completed) return true
  if (item.weeklyProgress && item.weeklyProgress.done >= item.weeklyProgress.total) return true
  return false
}
