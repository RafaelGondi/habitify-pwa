<script setup lang="ts">
import type { DayRecord } from '~/types'
import { getHabitColor } from '~/utils/colors'

type HistoryRange = 7 | 30 | 'all'

const { days, loadMore, ensureLoadedForDate, earliestDate } = useHistoryDays()
const range = ref<HistoryRange>(30)

const visibleDays = computed(() =>
  range.value === 'all' ? days.value : days.value.slice(0, range.value)
)
function dayTotals(day: DayRecord) {
  const active = day.habits.filter(item => !item.skipped)
  return {
    total: active.length,
    done: active.filter(item => isHabitGoalMet(item)).length
  }
}

function rateFor(period: DayRecord[]) {
  const totals = period.reduce((result, day) => {
    const dayTotal = dayTotals(day)
    result.done += dayTotal.done
    result.total += dayTotal.total
    return result
  }, { done: 0, total: 0 })

  return totals.total ? Math.round((totals.done / totals.total) * 100) : 0
}

const periodTotals = computed(() =>
  visibleDays.value.reduce((result, day) => {
    const dayTotal = dayTotals(day)
    result.done += dayTotal.done
    result.total += dayTotal.total
    if (dayTotal.total > 0 && dayTotal.done === dayTotal.total) result.perfectDays++
    return result
  }, { done: 0, total: 0, perfectDays: 0 })
)

const consistency = computed(() =>
  periodTotals.value.total
    ? Math.round((periodTotals.value.done / periodTotals.value.total) * 100)
    : 0
)

/**
 * Tendência amarrada ao filtro: metade recente do período vs. metade anterior.
 * Assim o badge acompanha 7 / 30 / todos, em vez de ficar preso na semana.
 */
const trendHalf = computed(() => Math.floor(visibleDays.value.length / 2))
const hasTrendBaseline = computed(() => trendHalf.value >= 3)

const recentPeriodRate = computed(() =>
  hasTrendBaseline.value
    ? rateFor(visibleDays.value.slice(0, trendHalf.value))
    : 0
)
const olderPeriodRate = computed(() =>
  hasTrendBaseline.value
    ? rateFor(visibleDays.value.slice(trendHalf.value, trendHalf.value * 2))
    : 0
)
const trendDelta = computed(() => recentPeriodRate.value - olderPeriodRate.value)

const trendMessage = computed(() => {
  if (!hasTrendBaseline.value) return 'Continue registrando para enxergar sua tendência.'
  if (trendDelta.value >= 8) return 'Você ganhou ritmo na parte mais recente deste período.'
  if (trendDelta.value <= -8) return 'Retomar com um hábito já conta.'
  return 'Seu ritmo está estável neste período.'
})

const trendLabel = computed(() => {
  if (!hasTrendBaseline.value) return 'Nova jornada'
  if (trendDelta.value === 0) return 'Estável'
  return `${trendDelta.value > 0 ? '+' : ''}${trendDelta.value} p.p.`
})

type HabitStruggleStat = {
  id: string
  name: string
  emoji: string
  color?: string
  due: number
  done: number
  rate: number
}

/** Hábitos com menor taxa no período filtrado (mín. 2 oportunidades). */
const strugglingHabits = computed((): HabitStruggleStat[] => {
  const map = new Map<string, HabitStruggleStat>()

  for (const day of visibleDays.value) {
    for (const item of day.habits) {
      if (item.skipped) continue

      let row = map.get(item.habit.id)
      if (!row) {
        row = {
          id: item.habit.id,
          name: item.habit.name,
          emoji: item.habit.emoji,
          color: item.habit.color,
          due: 0,
          done: 0,
          rate: 0,
        }
        map.set(item.habit.id, row)
      }

      row.due++
      if (isHabitGoalMet(item)) row.done++
    }
  }

  return [...map.values()]
    .map(row => ({
      ...row,
      rate: row.due ? Math.round((row.done / row.due) * 100) : 0,
    }))
    .filter(row => row.due >= 2 && row.rate < 100)
    .sort((a, b) => a.rate - b.rate || b.due - a.due)
    .slice(0, 3)
})

function habitAccent(colorId?: string) {
  return getHabitColor(colorId)
}

function showMore() {
  loadMore()
  range.value = 'all'
}

function onCalendarEnsureDate(dateStr: string) {
  ensureLoadedForDate(dateStr)
}
</script>

<template>
  <div class="app-page app-scroll">
    <header class="progress-header">
      <span class="page-label">Sua evolução</span>
      <h1 class="page-title">
        Progresso
      </h1>
      <p class="progress-header__intro">
        Tendências ajudam mais que dias isolados.
      </p>
    </header>

    <div
      v-if="days.length"
      class="page-body progress-body"
    >
      <div
        class="range-picker"
        aria-label="Período do histórico"
      >
        <AkChip
          :active="range === 7"
          @click="range = 7"
        >
          7 dias
        </AkChip>
        <AkChip
          :active="range === 30"
          @click="range = 30"
        >
          30 dias
        </AkChip>
        <AkChip
          :active="range === 'all'"
          @click="showMore"
        >
          Mais antigos
        </AkChip>
      </div>

      <section
        class="history-overview"
        aria-labelledby="consistency-title"
      >
        <div class="history-overview__heading">
          <div>
            <span
              id="consistency-title"
              class="history-overview__eyebrow"
            >
              Consistência
            </span>
            <div class="history-overview__score">
              {{ consistency }}%
            </div>
          </div>
          <AkBadge
            :variant="trendDelta > 0 ? 'accent' : 'neutral'"
            :label="trendLabel"
          />
        </div>

        <AkProgress
          :value="periodTotals.done"
          :max="periodTotals.total || 1"
          size="md"
        />

        <p class="history-overview__message">
          {{ trendMessage }}
        </p>

        <div class="history-metrics">
          <div class="history-metric">
            <strong>{{ periodTotals.done }}</strong>
            <span>conclusões</span>
          </div>
          <div class="history-metric">
            <strong>{{ periodTotals.perfectDays }}</strong>
            <span>dias completos</span>
          </div>
          <div class="history-metric">
            <strong>{{ visibleDays.length }}</strong>
            <span>dias analisados</span>
          </div>
        </div>
      </section>

      <section v-if="strugglingHabits.length">
        <AkSectionHeader title="Mais difíceis">
          <template #action>
            <span class="section-value section-value--muted">neste período</span>
          </template>
        </AkSectionHeader>
        <p class="struggle-intro">
          Hábitos com menor taxa de conclusão — bons candidatos a um ajuste de meta ou horário.
        </p>
        <AkList>
          <AkListRow
            v-for="(habit, index) in strugglingHabits"
            :key="habit.id"
            padding="md"
            :divider="index < strugglingHabits.length - 1"
          >
            <template #leading>
              <div
                class="struggle-emoji"
                :style="{ backgroundColor: habitAccent(habit.color).light }"
              >
                {{ habit.emoji }}
              </div>
            </template>

            {{ habit.name }}

            <template #subtitle>
              {{ habit.done }} de {{ habit.due }}
              {{ habit.due === 1 ? 'oportunidade' : 'oportunidades' }}
            </template>

            <template #trailing>
              <span
                class="struggle-rate"
                :class="{
                  'struggle-rate--low': habit.rate < 40,
                  'struggle-rate--mid': habit.rate >= 40 && habit.rate < 70,
                }"
              >
                {{ habit.rate }}%
              </span>
            </template>
          </AkListRow>
        </AkList>
      </section>

      <section>
        <AkSectionHeader title="Calendário" />
        <HistoryCalendar
          :days="days"
          :earliest-date="earliestDate"
          @ensure-date="onCalendarEnsureDate"
        />
      </section>
    </div>

    <div
      v-else
      class="empty-wrap"
    >
      <AkEmptyState
        title="Seu progresso começa hoje"
        description="Conclua hábitos para ver sua consistência e suas tendências aqui."
      >
        <template #icon>
          <span class="empty-icon">◌</span>
        </template>
      </AkEmptyState>
    </div>
  </div>
</template>

<style scoped>
.progress-header {
  padding:
    calc(var(--page-pad-top) + var(--safe-top))
    var(--page-pad-x)
    var(--space-6);
}

.progress-header__intro {
  margin-top: var(--space-2);
  color: var(--text-secondary);
  font-size: 14px;
}

.progress-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding-top: 0;
}

.range-picker {
  display: flex;
  gap: var(--space-2);
}

.history-overview {
  padding: var(--space-5);
  border-radius: var(--card-radius);
  background: var(--bg-tinted);
  border: 1px solid color-mix(in srgb, var(--accent) 14%, var(--border));
}

.history-overview__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.history-overview__eyebrow {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 650;
}

.history-overview__score {
  margin-top: 2px;
  color: var(--text);
  font-size: clamp(38px, 10vw, 48px);
  font-weight: 650;
  letter-spacing: -0.055em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.history-overview__message {
  margin-top: var(--space-4);
  color: var(--text-secondary);
  font-size: 13px;
}

.history-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid color-mix(in srgb, var(--accent) 12%, var(--border));
}

.history-metric {
  min-width: 0;
  padding: 0 var(--space-2);
  text-align: center;
}

.history-metric:not(:last-child) {
  border-right: 1px solid color-mix(in srgb, var(--accent) 12%, var(--border));
}

.history-metric strong,
.history-metric span {
  display: block;
}

.history-metric strong {
  font-size: 17px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.history-metric span {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.25;
}

.section-value {
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.section-value--muted {
  color: var(--text-tertiary);
  font-weight: 650;
}

.struggle-intro {
  margin: calc(var(--space-2) * -1) 0 var(--space-3);
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.struggle-emoji {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: grid;
  place-items: center;
  font-size: 1.15rem;
  line-height: 1;
}

.struggle-rate {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary);
}

.struggle-rate--mid {
  color: var(--warning);
}

.struggle-rate--low {
  color: var(--danger);
}

.empty-wrap {
  flex: 1;
  display: grid;
  place-items: center;
  padding: var(--space-10) var(--page-pad-x);
  padding-bottom: calc(var(--nav-height) + var(--safe-bottom) + var(--space-10));
}

.empty-icon {
  color: var(--accent);
  font-size: 2.5rem;
}
</style>
