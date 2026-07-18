import type {
  BiweekWeeks,
  Habit,
  MonthWeek,
  QuotaPeriodUnit,
  RecurrenceType,
  WeekDay,
} from '~/types'

const WEEKDAY_LABELS: Record<WeekDay, string> = {
  0: 'domingo',
  1: 'segunda',
  2: 'terça',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
  6: 'sábado',
}

const MONTH_WEEK_LABELS: Record<MonthWeek, string> = {
  1: '1º',
  2: '2º',
  3: '3º',
  4: '4º',
  [-1]: 'último',
}

/** N-ésima ocorrência deste dia da semana no mês (1–5). */
export function getWeekdayOccurrenceInMonth(date: Date): number {
  return Math.ceil(date.getDate() / 7)
}

export function isLastWeekdayOfMonth(date: Date): boolean {
  const nextWeek = new Date(date)
  nextWeek.setDate(date.getDate() + 7)
  return nextWeek.getMonth() !== date.getMonth()
}

export function matchesMonthWeek(date: Date, weekOfMonth: MonthWeek): boolean {
  if (weekOfMonth === -1) return isLastWeekdayOfMonth(date)
  return getWeekdayOccurrenceInMonth(date) === weekOfMonth
}

export function matchesBiweekWeeks(date: Date, pattern: BiweekWeeks): boolean {
  const occurrence = getWeekdayOccurrenceInMonth(date)
  if (pattern === 'first_third') return occurrence === 1 || occurrence === 3
  return occurrence === 2 || occurrence === 4
}

export function isHabitDueOn(habit: Habit, date: Date): boolean {
  const day = date.getDay() as WeekDay
  const { recurrence } = habit

  switch (recurrence.type) {
    case 'daily':
      return true
    case 'weekdays':
      return day >= 1 && day <= 5
    case 'weekends':
      return day === 0 || day === 6
    case 'custom':
      return (recurrence.days ?? []).includes(day)
    case 'weekly_x':
    case 'biweekly_x':
    case 'monthly_x':
      return true
    case 'monthly_nth': {
      const weekday = recurrence.weekday ?? recurrence.days?.[0]
      const weekOfMonth = recurrence.weekOfMonth ?? 1
      if (weekday === undefined) return false
      if (day !== weekday) return false
      return matchesMonthWeek(date, weekOfMonth)
    }
    case 'biweekly_nth': {
      const weekday = recurrence.weekday ?? recurrence.days?.[0]
      const pattern = recurrence.biweekWeeks ?? 'first_third'
      if (weekday === undefined) return false
      if (day !== weekday) return false
      return matchesBiweekWeeks(date, pattern)
    }
  }
}

export function isQuotaRecurrence(type: RecurrenceType): boolean {
  return type === 'weekly_x' || type === 'biweekly_x' || type === 'monthly_x'
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

/** 1ª quinzena: dias 1–15; 2ª: 16–fim do mês. */
export function getBiweekBounds(dateStr: string): { start: string, end: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const y = date.getFullYear()
  const m = date.getMonth()
  const day = date.getDate()

  if (day <= 15) {
    return {
      start: toDateString(new Date(y, m, 1)),
      end: toDateString(new Date(y, m, 15)),
    }
  }

  return {
    start: toDateString(new Date(y, m, 16)),
    end: toDateString(new Date(y, m + 1, 0)),
  }
}

export function getMonthBounds(dateStr: string): { start: string, end: string } {
  const date = new Date(dateStr + 'T12:00:00')
  const y = date.getFullYear()
  const m = date.getMonth()
  return {
    start: toDateString(new Date(y, m, 1)),
    end: toDateString(new Date(y, m + 1, 0)),
  }
}

export function getQuotaPeriod(habit: Habit, dateStr: string): {
  total: number
  unit: QuotaPeriodUnit
  start: string
  end: string
} | null {
  switch (habit.recurrence.type) {
    case 'weekly_x':
      return {
        total: habit.recurrence.timesPerWeek ?? 1,
        unit: 'week',
        start: getWeekStart(dateStr),
        end: getWeekEnd(dateStr),
      }
    case 'biweekly_x': {
      const bounds = getBiweekBounds(dateStr)
      return {
        total: habit.recurrence.timesPerBiweek ?? 1,
        unit: 'biweek',
        ...bounds,
      }
    }
    case 'monthly_x': {
      const bounds = getMonthBounds(dateStr)
      return {
        total: habit.recurrence.timesPerMonth ?? 1,
        unit: 'month',
        ...bounds,
      }
    }
    default:
      return null
  }
}

export function quotaUnitShortLabel(unit: QuotaPeriodUnit): string {
  switch (unit) {
    case 'week': return 'sem.'
    case 'biweek': return 'quin.'
    case 'month': return 'mês'
  }
}

export function quotaUnitLongLabel(unit: QuotaPeriodUnit): string {
  switch (unit) {
    case 'week': return 'na semana'
    case 'biweek': return 'na quinzena'
    case 'month': return 'no mês'
  }
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
    monthly_nth: 'Mensal (dia da semana)',
    biweekly_nth: 'Quinzenal (semanas do mês)',
    biweekly_x: 'X vezes/quinzena',
    monthly_x: 'X vezes/mês',
  }
  return labels[type]
}

export function formatRecurrenceSummary(habit: Habit): string {
  const { recurrence } = habit

  if (recurrence.type === 'weekly_x') {
    return `${recurrence.timesPerWeek ?? 1}x por semana`
  }

  if (recurrence.type === 'monthly_nth') {
    const weekday = recurrence.weekday ?? recurrence.days?.[0] ?? 6
    const week = recurrence.weekOfMonth ?? 1
    return `Todo ${MONTH_WEEK_LABELS[week]} ${WEEKDAY_LABELS[weekday]}`
  }

  if (recurrence.type === 'biweekly_nth') {
    const weekday = recurrence.weekday ?? recurrence.days?.[0] ?? 6
    const pattern = recurrence.biweekWeeks === 'second_fourth' ? '2º e 4º' : '1º e 3º'
    return `Todo ${pattern} ${WEEKDAY_LABELS[weekday]}`
  }

  if (recurrence.type === 'biweekly_x') {
    return `${recurrence.timesPerBiweek ?? 1}x por quinzena`
  }

  if (recurrence.type === 'monthly_x') {
    return `${recurrence.timesPerMonth ?? 1}x por mês`
  }

  return recurrenceLabel(recurrence.type)
}
