<script setup lang="ts">
import type { DayRecord } from '~/types'

const props = defineProps<{
  day: DayRecord
  defaultExpanded?: boolean
  divider?: boolean
}>()

const isExpanded = ref(props.defaultExpanded ?? false)
const activeHabits = computed(() => props.day.habits.filter(h => !h.skipped))
const completedCount = computed(() => activeHabits.value.filter(h => isHabitGoalMet(h)).length)
const pct = computed(() => Math.round(props.day.completionRate * 100))

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
    month
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
          :style="{ '--progress': `${pct * 3.6}deg` }"
          aria-hidden="true"
        >
          <span>{{ pct }}</span>
        </span>
        <AppIcon
          :name="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          :size="15"
          class="text-muted"
        />
      </span>
    </button>

    <Transition name="accordion">
      <ul
        v-if="isExpanded"
        class="history-day__habits"
      >
        <li
          v-for="item in day.habits"
          :key="item.habit.id"
          class="history-habit"
        >
          <span class="history-habit__emoji">{{ item.habit.emoji }}</span>

          <span class="history-habit__content">
            <span
              class="history-habit__name"
              :class="{ 'history-habit__name--muted': item.skipped }"
            >
              {{ item.habit.name }}
            </span>
            <span
              v-if="item.periodProgress"
              class="history-habit__meta"
            >
              {{ item.periodProgress.done }}/{{ item.periodProgress.total }}
              {{ quotaUnitLongLabel(item.periodProgress.unit) }}
            </span>
          </span>

          <AkBadge
            v-if="item.skipped"
            variant="neutral"
            label="Pulado"
          />
          <span
            v-else
            class="history-habit__state"
            :class="{ 'history-habit__state--done': isHabitGoalMet(item) }"
            :aria-label="isHabitGoalMet(item) ? 'Concluído' : 'Não concluído'"
          >
            <AppIcon
              :name="isHabitGoalMet(item) ? 'lucide:check' : 'lucide:minus'"
              :size="14"
            />
          </span>
        </li>
      </ul>
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
  background: conic-gradient(var(--accent) var(--progress), var(--bg-muted) 0);
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
  margin: 0;
  padding: var(--space-2) var(--space-4) var(--space-3) 4.25rem;
  background: var(--bg-soft);
  list-style: none;
}

.history-habit {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.5rem;
}

.history-habit + .history-habit {
  border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
}

.history-habit__emoji {
  width: 1.5rem;
  text-align: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.history-habit__content {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.history-habit__name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-habit__name--muted {
  color: var(--text-tertiary);
}

.history-habit__meta {
  color: var(--text-tertiary);
  font-size: 10px;
}

.history-habit__state {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-full);
  display: grid;
  place-items: center;
  background: var(--bg-muted);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.history-habit__state--done {
  background: var(--accent-soft);
  color: var(--accent);
}
</style>
