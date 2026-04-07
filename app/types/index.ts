export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type RecurrenceType = 'daily' | 'weekdays' | 'weekends' | 'custom'

export interface HabitRecurrence {
  type: RecurrenceType
  days?: WeekDay[]
}

export interface Habit {
  id: string
  name: string
  emoji: string
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
}

export interface AppData {
  version: 1
  habits: Habit[]
  completions: Completion[]
  exportedAt?: string
}

export interface HabitWithStatus {
  habit: Habit
  completed: boolean
  completionId?: string
}

export interface DayRecord {
  date: string
  habits: HabitWithStatus[]
  completionRate: number
}
