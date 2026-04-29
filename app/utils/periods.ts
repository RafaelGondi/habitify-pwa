import type { HabitPeriod } from '~/types'

export const PERIOD_OPTIONS: Array<{ value: HabitPeriod, label: string, shortLabel: string }> = [
  { value: 'anytime', label: 'Qualquer horário', shortLabel: 'Livre' },
  { value: 'morning', label: 'Manhã', shortLabel: 'Manhã' },
  { value: 'afternoon', label: 'Tarde', shortLabel: 'Tarde' },
  { value: 'night', label: 'Noite', shortLabel: 'Noite' },
]

export function getHabitPeriodLabel(period?: HabitPeriod): string {
  return PERIOD_OPTIONS.find(option => option.value === (period ?? 'anytime'))?.label ?? 'Qualquer horário'
}

export function getCurrentPeriod(date = new Date()): Exclude<HabitPeriod, 'anytime'> {
  const hour = date.getHours()

  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'night'
}
