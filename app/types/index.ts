export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type HabitPeriod = 'morning' | 'afternoon' | 'night' | 'late_night'

export type RecurrenceType = 'daily' | 'weekdays' | 'weekends' | 'custom' | 'weekly_x'

export interface HabitRecurrence {
  type: RecurrenceType
  days?: WeekDay[]
  timesPerWeek?: number
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

export interface HabitWithStatus {
  habit: Habit
  completed: boolean
  completionId?: string
  weeklyProgress?: { done: number, total: number }
  skipped?: boolean
  canSkip?: boolean
  note?: string
}

export interface DayRecord {
  date: string
  habits: HabitWithStatus[]
  completionRate: number
}
