import type { Habit, RecurrenceType, WeekDay } from '~/types'

export function isHabitDueOn(habit: Habit, date: Date): boolean {
  const day = date.getDay() as WeekDay
  switch (habit.recurrence.type) {
    case 'daily': return true
    case 'weekdays': return day >= 1 && day <= 5
    case 'weekends': return day === 0 || day === 6
    case 'custom': return (habit.recurrence.days ?? []).includes(day)
    case 'weekly_x': return true
  }
}

export function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const day = date.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(date.getTime() + diff * 86400000)
  return toDateString(monday)
}

export function getWeekEnd(dateStr: string): string {
  const start = getWeekStart(dateStr)
  const monday = new Date(start + 'T12:00:00')
  const sunday = new Date(monday.getTime() + 6 * 86400000)
  return toDateString(sunday)
}

export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDateLabel(dateStr: string): string {
  const today = toDateString(new Date())
  const yesterday = toDateString(new Date(Date.now() - 86400000))

  if (dateStr === today) return 'Hoje'
  if (dateStr === yesterday) return 'Ontem'

  const date = new Date(dateStr + 'T12:00:00')
  const formatted = date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatTodayFull(): string {
  const date = new Date()
  const formatted = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function recurrenceLabel(type: RecurrenceType): string {
  const labels: Record<RecurrenceType, string> = {
    daily: 'Todo dia',
    weekdays: 'Dias úteis',
    weekends: 'Fim de semana',
    custom: 'Personalizado',
    weekly_x: 'X vezes/semana',
  }
  return labels[type]
}
