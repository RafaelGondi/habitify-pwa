export interface HabitColor {
  id: string
  label: string
  hex: string
  light: string
}

export const HABIT_COLORS: HabitColor[] = [
  { id: 'teal', label: 'Botânico', hex: 'var(--cat-4)', light: 'color-mix(in srgb, var(--cat-4) 16%, var(--bg))' },
  { id: 'blue', label: 'Azul mineral', hex: 'var(--cat-1)', light: 'color-mix(in srgb, var(--cat-1) 16%, var(--bg))' },
  { id: 'indigo', label: 'Índigo', hex: 'var(--cat-2)', light: 'color-mix(in srgb, var(--cat-2) 16%, var(--bg))' },
  { id: 'purple', label: 'Violeta', hex: 'var(--cat-2)', light: 'color-mix(in srgb, var(--cat-2) 16%, var(--bg))' },
  { id: 'pink', label: 'Rosé', hex: 'var(--cat-5)', light: 'color-mix(in srgb, var(--cat-5) 16%, var(--bg))' },
  { id: 'red', label: 'Terracota', hex: 'var(--cat-5)', light: 'color-mix(in srgb, var(--cat-5) 16%, var(--bg))' },
  { id: 'orange', label: 'Âmbar', hex: 'var(--cat-3)', light: 'color-mix(in srgb, var(--cat-3) 16%, var(--bg))' },
  { id: 'yellow', label: 'Dourado', hex: 'var(--cat-3)', light: 'color-mix(in srgb, var(--cat-3) 16%, var(--bg))' },
  { id: 'green', label: 'Verde', hex: 'var(--cat-4)', light: 'color-mix(in srgb, var(--cat-4) 16%, var(--bg))' },
  { id: 'cyan', label: 'Azul claro', hex: 'var(--cat-1)', light: 'color-mix(in srgb, var(--cat-1) 16%, var(--bg))' },
  { id: 'slate', label: 'Ardósia', hex: 'var(--cat-6)', light: 'color-mix(in srgb, var(--cat-6) 16%, var(--bg))' },
  { id: 'gray', label: 'Pedra', hex: 'var(--cat-6)', light: 'color-mix(in srgb, var(--cat-6) 12%, var(--bg))' },
  { id: 'white', label: 'Neutro', hex: 'var(--border-strong)', light: 'var(--bg-soft)' },
  { id: 'rose', label: 'Rosa antigo', hex: 'var(--cat-5)', light: 'color-mix(in srgb, var(--cat-5) 16%, var(--bg))' }
]

export const DEFAULT_COLOR = 'teal'

export function getHabitColor(id?: string): HabitColor {
  return HABIT_COLORS.find(c => c.id === id) ?? HABIT_COLORS[0]!
}
