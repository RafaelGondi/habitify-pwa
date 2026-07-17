<script setup lang="ts">
import type { DayRecord } from '~/types'

type HistoryRange = 7 | 30 | 'all'

const { days, hasMore, loadMore } = useHistoryDays()
const range = ref<HistoryRange>(30)

const visibleDays = computed(() =>
  range.value === 'all' ? days.value : days.value.slice(0, range.value)
)
const weekDays = computed(() => [...days.value.slice(0, 7)].reverse())

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

const currentWeekRate = computed(() => rateFor(days.value.slice(0, 7)))
const previousWeekRate = computed(() => rateFor(days.value.slice(7, 14)))
const trendDelta = computed(() => currentWeekRate.value - previousWeekRate.value)

const trendMessage = computed(() => {
  if (days.value.length < 8) return 'Continue registrando para enxergar sua tendência.'
  if (trendDelta.value >= 8) return 'Você ganhou ritmo nos últimos dias.'
  if (trendDelta.value <= -8) return 'Retomar com um hábito já conta.'
  return 'Seu ritmo está estável nesta semana.'
})

const trendLabel = computed(() => {
  if (days.value.length < 8) return 'Nova jornada'
  if (trendDelta.value === 0) return 'Estável'
  return `${trendDelta.value > 0 ? '+' : ''}${trendDelta.value} p.p.`
})

function weekdayLabel(date: string) {
  return new Date(`${date}T12:00:00`)
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
    .slice(0, 3)
}

function dayNumber(date: string) {
  return new Date(`${date}T12:00:00`).getDate()
}

function dayRateStyle(day: DayRecord) {
  return { '--day-rate': `${Math.max(12, Math.round(day.completionRate * 100))}%` }
}

function showMore() {
  loadMore()
  range.value = 'all'
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

      <section v-if="weekDays.length">
        <AkSectionHeader title="Últimos 7 dias">
          <template #action>
            <span class="section-value">{{ currentWeekRate }}%</span>
          </template>
        </AkSectionHeader>

        <div
          class="week-strip"
          role="list"
          aria-label="Consistência nos últimos sete dias"
        >
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="week-day"
            role="listitem"
            :title="`${formatDateLabel(day.date)}: ${Math.round(day.completionRate * 100)}%`"
          >
            <span class="week-day__label">{{ weekdayLabel(day.date) }}</span>
            <div
              class="week-day__mark"
              :class="{ 'week-day__mark--complete': day.completionRate === 1 }"
              :style="dayRateStyle(day)"
            >
              <AppIcon
                v-if="day.completionRate === 1"
                name="lucide:check"
                :size="14"
              />
              <span v-else>{{ dayNumber(day.date) }}</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <AkSectionHeader :title="`Dia a dia · ${visibleDays.length} dias`" />
        <AkList class="history-timeline">
          <HistoryDayBlock
            v-for="(day, index) in visibleDays"
            :key="day.date"
            :day="day"
            :divider="index < visibleDays.length - 1"
          />
        </AkList>

        <AkButton
          v-if="range === 'all' && hasMore"
          class="load-more"
          variant="ghost"
          block
          @click="showMore"
        >
          Ver mais 30 dias
        </AkButton>
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

.week-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-2);
}

.week-day {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.week-day__label {
  color: var(--text-tertiary);
  font-size: 10px;
  font-weight: 650;
  text-transform: uppercase;
}

.week-day__mark {
  width: min(9vw, 38px);
  height: min(9vw, 38px);
  min-width: 32px;
  min-height: 32px;
  border-radius: var(--radius-full);
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--accent) var(--day-rate), var(--bg-muted));
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}

.week-day__mark--complete {
  background: var(--accent);
  color: var(--accent-contrast);
}

.history-timeline {
  overflow: visible;
}

.load-more {
  margin-top: var(--space-3);
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
