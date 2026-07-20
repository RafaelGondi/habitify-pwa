<script setup lang="ts">
import type { DayRecord } from '~/types'
import { completionShade, completionShadeColor } from '@rafael_dias/akoma'

const props = defineProps<{
  day: DayRecord
  defaultExpanded?: boolean
  divider?: boolean
}>()

const isExpanded = ref(props.defaultExpanded ?? false)
const activeHabits = computed(() => props.day.habits.filter(h => !h.skipped))
const completedCount = computed(() => activeHabits.value.filter(h => isHabitGoalMet(h)).length)
const pct = computed(() => Math.round(props.day.completionRate * 100))

const ringShadeVar = computed(() =>
  completionShadeColor(completionShade(props.day.completionRate)),
)

const dateParts = computed(() => {
  const date = new Date(`${props.day.date}T12:00:00`)
  const weekday = date
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
  const month = date
    .toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')

  return {
    day: date.getDate(),
    weekday,
    month,
  }
})

const statusLabel = computed(() => {
  if (!activeHabits.value.length) return 'Dia sem metas'
  if (completedCount.value === activeHabits.value.length) return 'Tudo concluído'
  if (!completedCount.value) return 'Nenhum concluído'
  return `${completedCount.value} de ${activeHabits.value.length} concluídos`
})
</script>

<template>
  <li
    class="history-day"
    :class="{ 'history-day--divider': divider }"
  >
    <button
      class="history-day__trigger"
      type="button"
      :aria-expanded="isExpanded"
      @click="isExpanded = !isExpanded"
    >
      <span
        class="history-day__date"
        aria-hidden="true"
      >
        <span>{{ dateParts.weekday }}</span>
        <strong>{{ dateParts.day }}</strong>
      </span>

      <span class="history-day__content">
        <span class="history-day__title">{{ dateParts.month }}</span>
        <span class="history-day__status">{{ statusLabel }}</span>
      </span>

      <span class="history-day__progress">
        <span
          class="history-day__ring"
          :style="{
            '--progress': `${pct * 3.6}deg`,
            '--ring-accent': ringShadeVar,
          }"
          aria-hidden="true"
        >
          <span>{{ pct }}</span>
        </span>
        <AkIcon
          :name="isExpanded ? 'caret-up-outline' : 'caret-down-outline'"
          :size="15"
          class="text-muted"
        />
      </span>
    </button>

    <Transition name="accordion">
      <div
        v-if="isExpanded"
        class="history-day__habits"
      >
        <AkList>
          <HabitCard
            v-for="(item, index) in day.habits"
            :key="item.habit.id"
            :item="item"
            mode="past"
            :divider="index < day.habits.length - 1"
          />
        </AkList>
      </div>
    </Transition>
  </li>
</template>

<style scoped>
.history-day {
  list-style: none;
  background: var(--bg);
}

.history-day--divider {
  border-bottom: 1px solid var(--border);
}

.history-day__trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  transition: background-color var(--transition);
}

.history-day__trigger:active {
  background: var(--bg-soft);
}

.history-day__trigger:focus-visible {
  outline: none;
  box-shadow: inset var(--focus-ring);
}

.history-day__date {
  width: 2.5rem;
  min-height: 2.75rem;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-soft);
  flex-shrink: 0;
}

.history-day__date span {
  color: var(--text-tertiary);
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.history-day__date strong {
  margin-top: 3px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.history-day__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-day__title {
  font-size: 14px;
  font-weight: 650;
  text-transform: capitalize;
}

.history-day__status {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-day__progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.history-day__ring {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-full);
  display: grid;
  place-items: center;
  background: conic-gradient(var(--ring-accent, var(--accent)) var(--progress), var(--bg-muted) 0);
  position: relative;
}

.history-day__ring::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: inherit;
  background: var(--bg);
}

.history-day__ring span {
  position: relative;
  z-index: 1;
  font-size: 9px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.history-day__habits {
  background: var(--bg-soft);
  padding-bottom: var(--space-2);
}
</style>
