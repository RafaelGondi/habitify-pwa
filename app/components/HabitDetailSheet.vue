<script setup lang="ts">
import type { Completion, Habit } from '~/types'
import { getHabitPeriodsLabel } from '~/utils/periods'

const props = defineProps<{
  open: boolean
  habit: Habit | null
}>()

defineEmits<{ 'update:open': [value: boolean] }>()

const { data } = useStorage()
const { getStreak, getLongestStreak } = useStreak()

const WEEKS = 18

type CellStatus = 'completed' | 'missed' | 'not-scheduled' | 'before' | 'future'
interface Cell { dateStr: string, status: CellStatus }

function generateGrid(habit: Habit, completions: Completion[]): Cell[][] {
  const today = new Date()
  const todayStr = toDateString(today)
  const habitStart = habit.createdAt.slice(0, 10)

  const dow = today.getDay()
  const daysToMon = dow === 0 ? 6 : dow - 1
  const thisMon = new Date(today.getTime() - daysToMon * 86400000)
  const startMon = new Date(thisMon.getTime() - (WEEKS - 1) * 7 * 86400000)
  const isWeeklyX = habit.recurrence.type === 'weekly_x'

  return Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(startMon.getTime() + (w * 7 + d) * 86400000)
      const dateStr = toDateString(date)

      if (dateStr > todayStr) return { dateStr, status: 'future' as CellStatus }
      if (dateStr < habitStart) return { dateStr, status: 'before' as CellStatus }

      const isDue = isHabitDueOn(habit, date)
      if (!isDue) return { dateStr, status: 'not-scheduled' as CellStatus }

      const completed = completions.some(c => c.habitId === habit.id && c.date === dateStr)
      if (completed) return { dateStr, status: 'completed' as CellStatus }
      return { dateStr, status: isWeeklyX ? 'not-scheduled' : 'missed' }
    }),
  )
}

function getMonthLabel(grid: Cell[][], wi: number): string {
  const week = grid[wi]
  if (!week) return ''
  const firstReal = week.find(c => c.status !== 'before' && c.status !== 'future')
  if (!firstReal) return ''
  const d = new Date(firstReal.dateStr + 'T12:00:00')
  const previousWeek = wi > 0 ? grid[wi - 1] : undefined
  const prevCol = previousWeek?.find(c => c.status !== 'before' && c.status !== 'future') ?? null
  if (!prevCol) return d.toLocaleDateString('pt-BR', { month: 'short' })
  const prevD = new Date(prevCol.dateStr + 'T12:00:00')
  if (d.getMonth() !== prevD.getMonth()) return d.toLocaleDateString('pt-BR', { month: 'short' })
  return ''
}

function cellClass(status: CellStatus): string {
  switch (status) {
    case 'completed': return 'heatmap-cell heatmap-cell--done'
    case 'missed': return 'heatmap-cell heatmap-cell--missed'
    case 'not-scheduled': return 'heatmap-cell heatmap-cell--idle'
    case 'before':
    case 'future': return 'heatmap-cell heatmap-cell--empty'
  }
}

const grid = computed(() => props.habit ? generateGrid(props.habit, data.value.completions) : [])
const currentStreak = computed(() => props.habit ? getStreak(props.habit) : 0)
const longestStreak = computed(() => props.habit ? getLongestStreak(props.habit) : 0)
const totalCompletions = computed(() =>
  props.habit ? data.value.completions.filter(c => c.habitId === props.habit!.id).length : 0,
)

const thisMonthRate = computed(() => {
  if (!props.habit) return 0
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `${y}-${m}`
  const todayStr = toDateString(now)
  let due = 0
  let done = 0
  let cur = `${prefix}-01`
  while (cur <= todayStr) {
    const d = new Date(cur + 'T12:00:00')
    if (cur >= props.habit.createdAt.slice(0, 10) && isHabitDueOn(props.habit, d)) {
      due++
      if (data.value.completions.some(c => c.habitId === props.habit!.id && c.date === cur)) done++
    }
    const next = new Date(d.getTime() + 86400000)
    cur = toDateString(next)
  }
  return due ? Math.round((done / due) * 100) : 0
})

const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
</script>

<template>
  <AppBottomSheet :open="open" :title="habit ? `${habit.emoji} ${habit.name}` : ''" @update:open="$emit('update:open', $event)">
    <div v-if="habit" class="detail-body">
      <div class="stats-grid">
        <div class="stat-cell">
          <div class="stat-cell__value">🔥 {{ currentStreak }}</div>
          <div class="stat-cell__label">streak atual</div>
        </div>
        <div class="stat-cell">
          <div class="stat-cell__value">🏆 {{ longestStreak }}</div>
          <div class="stat-cell__label">maior streak</div>
        </div>
        <div class="stat-cell">
          <div class="stat-cell__value">✅ {{ totalCompletions }}</div>
          <div class="stat-cell__label">total feitos</div>
        </div>
      </div>

      <AkProgress
        :value="thisMonthRate"
        label="Taxa este mês"
        show-value
      />

      <div class="info-row">
        <span class="text-sm text-muted">Turno prioritário</span>
        <span class="text-sm font-semibold">{{ getHabitPeriodsLabel(habit.periods) }}</span>
      </div>

      <div>
        <AkSectionHeader title="Histórico" />
        <div class="heatmap-wrap">
          <div class="heatmap">
            <div class="heatmap-col" style="margin-right: 2px; justify-content: flex-end; padding-bottom: 1px">
              <div v-for="label in DAY_LABELS" :key="label" class="heatmap-label">{{ label }}</div>
            </div>
            <div v-for="(week, wi) in grid" :key="wi" class="heatmap-col">
              <div class="heatmap-month">{{ getMonthLabel(grid, wi) }}</div>
              <div
                v-for="(cell, di) in week"
                :key="di"
                :class="cellClass(cell.status)"
                :title="cell.dateStr"
              />
            </div>
          </div>
        </div>

        <div class="legend-row">
          <div class="legend-item">
            <div class="legend-swatch heatmap-cell--done" />
            <span>Feito</span>
          </div>
          <div v-if="habit.recurrence.type !== 'weekly_x'" class="legend-item">
            <div class="legend-swatch heatmap-cell--missed" />
            <span>Não feito</span>
          </div>
          <div class="legend-item">
            <div class="legend-swatch heatmap-cell--idle" />
            <span>Não previsto</span>
          </div>
        </div>
      </div>
    </div>
  </AppBottomSheet>
</template>

<style scoped>
.detail-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-1) var(--page-pad-x) var(--space-6);
}
</style>
