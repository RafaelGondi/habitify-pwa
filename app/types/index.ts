export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type HabitPeriod = 'early_morning' | 'morning' | 'afternoon' | 'night' | 'late_night'

/** 1–4 = n-ésima ocorrência do dia no mês; -1 = última. */
export type MonthWeek = 1 | 2 | 3 | 4 | -1

/** Quinzenal por semanas do mês: 1ª+3ª ou 2ª+4ª. */
export type BiweekWeeks = 'first_third' | 'second_fourth'

export type RecurrenceType =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'custom'
  | 'weekly_x'
  | 'monthly_nth'
  | 'biweekly_nth'
  /** @deprecated Prefer monthly_nth / biweekly_nth */
  | 'biweekly_x'
  /** @deprecated Prefer monthly_nth */
  | 'monthly_x'

export type QuotaPeriodUnit = 'week' | 'biweek' | 'month'

export interface HabitRecurrence {
  type: RecurrenceType
  days?: WeekDay[]
  timesPerWeek?: number
  /** Dia da semana para monthly_nth / biweekly_nth */
  weekday?: WeekDay
  /** Qual ocorrência no mês (1º–4º ou último) */
  weekOfMonth?: MonthWeek
  /** Padrão quinzenal por semanas do mês */
  biweekWeeks?: BiweekWeeks
  /** @deprecated */
  timesPerBiweek?: number
  /** @deprecated */
  timesPerMonth?: number
}

export interface Habit {
  id: string
  name: string
  emoji: string
  color?: string
  periods?: HabitPeriod[]
  recurrence: HabitRecurrence
  createdAt: string
  archivedAt?: string
  order: number
}

export interface Completion {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  completedAt: string
  note?: string
}

export interface Skip {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
}

export interface AppData {
  version: 1
  habits: Habit[]
  completions: Completion[]
  skips: Skip[]
  exportedAt?: string
}

export interface PeriodProgress {
  done: number
  total: number
  unit: QuotaPeriodUnit
}

export interface HabitWithStatus {
  habit: Habit
  completed: boolean
  completionId?: string
  periodProgress?: PeriodProgress
  skipped?: boolean
  canSkip?: boolean
  note?: string
}

export interface DayRecord {
  date: string
  habits: HabitWithStatus[]
  completionRate: number
}
