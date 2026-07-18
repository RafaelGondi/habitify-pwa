export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type HabitPeriod = 'early_morning' | 'morning' | 'afternoon' | 'night' | 'late_night'

export type RecurrenceType =
  | 'daily'
  | 'weekdays'
  | 'weekends'
  | 'custom'
  | 'weekly_x'
  | 'biweekly_x'
  | 'monthly_x'

export type QuotaPeriodUnit = 'week' | 'biweek' | 'month'

export interface HabitRecurrence {
  type: RecurrenceType
  days?: WeekDay[]
  timesPerWeek?: number
  timesPerBiweek?: number
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
