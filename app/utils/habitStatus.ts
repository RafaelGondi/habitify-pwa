import type { HabitWithStatus } from '~/types'

/** Whether the habit's obligation is satisfied for this day (incl. quota met earlier in the period). */
export function isHabitGoalMet(item: HabitWithStatus): boolean {
  if (item.completed) return true
  if (item.periodProgress && item.periodProgress.done >= item.periodProgress.total) return true
  return false
}
