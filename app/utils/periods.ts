import type { HabitPeriod } from '~/types'

export const PERIOD_OPTIONS: Array<{ value: HabitPeriod, label: string, shortLabel: string }> = [
  { value: 'early_morning', label: 'Início da manhã', shortLabel: 'Início da manhã' },
  { value: 'morning', label: 'Manhã', shortLabel: 'Manhã' },
  { value: 'afternoon', label: 'Tarde', shortLabel: 'Tarde' },
  { value: 'night', label: 'Noite', shortLabel: 'Noite' },
  { value: 'late_night', label: 'Fim da noite', shortLabel: 'Fim da noite' },
]

export function getHabitPeriodsLabel(periods?: HabitPeriod[]): string {
  if (!periods || periods.length === 0) return 'Qualquer horário'
  return periods.map(p => PERIOD_OPTIONS.find(o => o.value === p)?.label ?? p).join(', ')
}

export function getCurrentPeriod(date = new Date()): HabitPeriod {
  const hour = date.getHours()

  if (hour < 10) return 'early_morning'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  if (hour < 21 || (hour === 21 && date.getMinutes() < 30)) return 'night'
  return 'late_night'
}
