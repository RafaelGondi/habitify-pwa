export interface HabitColor {
  id: string
  label: string
  hex: string
  light: string // bg tint for emoji container
}

export const HABIT_COLORS: HabitColor[] = [
  { id: 'teal',   label: 'Teal',   hex: '#14b8a6', light: '#ccfbf1' },
  { id: 'blue',   label: 'Azul',   hex: '#3b82f6', light: '#dbeafe' },
  { id: 'indigo', label: 'Índigo', hex: '#6366f1', light: '#e0e7ff' },
  { id: 'purple', label: 'Roxo',   hex: '#a855f7', light: '#f3e8ff' },
  { id: 'pink',   label: 'Rosa',   hex: '#ec4899', light: '#fce7f3' },
  { id: 'red',    label: 'Vermelho', hex: '#ef4444', light: '#fee2e2' },
  { id: 'orange', label: 'Laranja', hex: '#f97316', light: '#ffedd5' },
  { id: 'yellow', label: 'Amarelo', hex: '#eab308', light: '#fef9c3' },
  { id: 'green',  label: 'Verde',  hex: '#22c55e', light: '#dcfce7' },
  { id: 'cyan',   label: 'Ciano',  hex: '#06b6d4', light: '#cffafe' },
  { id: 'slate',  label: 'Cinza',  hex: '#64748b', light: '#f1f5f9' },
  { id: 'rose',   label: 'Rosé',   hex: '#f43f5e', light: '#ffe4e6' },
]

export const DEFAULT_COLOR = 'teal'

export function getHabitColor(id?: string): HabitColor {
  return HABIT_COLORS.find(c => c.id === id) ?? HABIT_COLORS[0]!
}
