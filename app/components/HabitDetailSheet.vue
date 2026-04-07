<script setup lang="ts">
import type { Completion, Habit } from '~/types'

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

  // Find this Monday
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
      // weekly_x: non-completed days are just "not-scheduled" visually (no red)
      return { dateStr, status: isWeeklyX ? 'not-scheduled' : 'missed' }
    }),
  )
}

function getMonthLabel(grid: Cell[][], wi: number): string {
  const firstReal = grid[wi].find(c => c.status !== 'before' && c.status !== 'future')
  if (!firstReal) return ''
  const d = new Date(firstReal.dateStr + 'T12:00:00')
  const prevCol = wi > 0 ? grid[wi - 1].find(c => c.status !== 'before' && c.status !== 'future') : null
  if (!prevCol) return d.toLocaleDateString('pt-BR', { month: 'short' })
  const prevD = new Date(prevCol.dateStr + 'T12:00:00')
  if (d.getMonth() !== prevD.getMonth()) return d.toLocaleDateString('pt-BR', { month: 'short' })
  return ''
}

function cellClass(status: CellStatus): string {
  switch (status) {
    case 'completed': return 'bg-primary'
    case 'missed': return 'bg-red-400/35'
    case 'not-scheduled': return 'bg-elevated/60'
    case 'before':
    case 'future': return 'bg-transparent'
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

const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] // Mon→Sun
</script>

<template>
  <UModal :open="open" :title="habit ? `${habit.emoji} ${habit.name}` : ''" @update:open="$emit('update:open', $event)">
    <template #body>
      <div v-if="habit" class="flex flex-col gap-5 pb-2">
        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-2">
          <div class="flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-elevated/50 py-3">
            <span class="text-xl">🔥</span>
            <span class="text-lg font-bold text-default leading-none">{{ currentStreak }}</span>
            <span class="text-[10px] text-muted text-center leading-tight">streak atual</span>
          </div>
          <div class="flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-elevated/50 py-3">
            <span class="text-xl">🏆</span>
            <span class="text-lg font-bold text-default leading-none">{{ longestStreak }}</span>
            <span class="text-[10px] text-muted text-center leading-tight">maior streak</span>
          </div>
          <div class="flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-elevated/50 py-3">
            <span class="text-xl">✅</span>
            <span class="text-lg font-bold text-default leading-none">{{ totalCompletions }}</span>
            <span class="text-[10px] text-muted text-center leading-tight">total feitos</span>
          </div>
        </div>

        <!-- This month rate -->
        <div class="flex items-center justify-between px-4 py-3 rounded-2xl bg-elevated/50">
          <span class="text-sm text-muted">Taxa este mês</span>
          <div class="flex items-center gap-2">
            <div class="w-20 h-1.5 rounded-full bg-elevated overflow-hidden">
              <div class="h-full rounded-full bg-primary transition-all" :style="{ width: thisMonthRate + '%' }" />
            </div>
            <span class="text-sm font-semibold text-default w-8 text-right">{{ thisMonthRate }}%</span>
          </div>
        </div>

        <!-- Heatmap -->
        <div>
          <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Histórico</p>
          <div class="overflow-x-auto pb-1">
            <div class="flex gap-1 min-w-max">
              <!-- Day labels -->
              <div class="flex flex-col gap-[3px] mr-0.5 justify-end" style="padding-bottom: 1px">
                <div
                  v-for="(label, i) in DAY_LABELS"
                  :key="i"
                  class="h-3 w-3 text-[8px] text-muted flex items-center justify-center"
                >
                  {{ i % 2 === 0 ? label : '' }}
                </div>
              </div>

              <!-- Week columns -->
              <div v-for="(week, wi) in grid" :key="wi" class="flex flex-col gap-[3px]">
                <!-- Month label -->
                <div class="h-3 text-[8px] text-muted flex items-end justify-start leading-none mb-0.5">
                  {{ getMonthLabel(grid, wi) }}
                </div>
                <!-- Day cells -->
                <div
                  v-for="(cell, di) in week"
                  :key="di"
                  class="w-3 h-3 rounded-[3px]"
                  :class="cellClass(cell.status)"
                  :title="cell.dateStr"
                />
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-3 mt-2 flex-wrap">
            <div class="flex items-center gap-1">
              <div class="w-2.5 h-2.5 rounded-[2px] bg-primary" />
              <span class="text-[10px] text-muted">Feito</span>
            </div>
            <div v-if="habit.recurrence.type !== 'weekly_x'" class="flex items-center gap-1">
              <div class="w-2.5 h-2.5 rounded-[2px] bg-red-400/35" />
              <span class="text-[10px] text-muted">Não feito</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-2.5 h-2.5 rounded-[2px] bg-elevated/60" />
              <span class="text-[10px] text-muted">Não previsto</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
