<script setup lang="ts">
import type { DayRecord } from '~/types'
import { completionShade, completionShadeClass } from '~/utils/completionShade'

const props = defineProps<{
  days: DayRecord[]
  earliestDate: Date | null
}>()

const emit = defineEmits<{
  ensureDate: [dateStr: string]
}>()

const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

type CalendarCell = {
  dateStr: string
  day: number
  inMonth: boolean
  isToday: boolean
  isFuture: boolean
  record: DayRecord | null
}

type CalendarMonth = {
  key: string
  year: number
  month: number
  label: string
  cells: CalendarCell[]
}

const todayStr = toDateString(new Date())
const monthIndex = ref(0)
const selectedDate = ref<string | null>(null)
const slideDir = ref<'left' | 'right' | null>(null)

const daysByDate = computed(() => {
  const map = new Map<string, DayRecord>()
  for (const day of props.days) map.set(day.date, day)
  return map
})

const months = computed((): CalendarMonth[] => {
  const end = new Date()
  end.setDate(1)
  end.setHours(0, 0, 0, 0)

  const start = props.earliestDate
    ? new Date(props.earliestDate.getFullYear(), props.earliestDate.getMonth(), 1)
    : new Date(end)

  const list: CalendarMonth[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    list.push({
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      year,
      month,
      label: cursor
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^./, c => c.toUpperCase()),
      cells: buildMonthCells(year, month),
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return list
})

const currentMonth = computed(() => months.value[monthIndex.value] ?? null)

const selectedDay = computed(() =>
  selectedDate.value ? daysByDate.value.get(selectedDate.value) ?? null : null,
)

const selectedLabel = computed(() => {
  if (!selectedDate.value) return ''
  return formatDateLabel(selectedDate.value)
})

function buildMonthCells(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1)
  const firstDow = first.getDay()
  const mondayOffset = firstDow === 0 ? 6 : firstDow - 1
  const gridStart = new Date(first)
  gridStart.setDate(1 - mondayOffset)

  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    const dateStr = toDateString(date)
    const inMonth = date.getMonth() === month
    cells.push({
      dateStr,
      day: date.getDate(),
      inMonth,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
      record: daysByDate.value.get(dateStr) ?? null,
    })
  }
  return cells
}

function cellShadeClass(cell: CalendarCell) {
  if (!cell.inMonth || cell.isFuture || !cell.record) return ''
  return completionShadeClass(completionShade(cell.record.completionRate))
}

function selectDay(cell: CalendarCell) {
  if (!cell.inMonth || cell.isFuture) return
  selectedDate.value = selectedDate.value === cell.dateStr ? null : cell.dateStr
}

function goToMonth(index: number, dir?: 'left' | 'right') {
  const next = Math.max(0, Math.min(months.value.length - 1, index))
  if (next === monthIndex.value) return
  slideDir.value = dir ?? (next > monthIndex.value ? 'left' : 'right')
  monthIndex.value = next
  selectedDate.value = null
  const month = months.value[next]
  if (month) emit('ensureDate', `${month.key}-01`)
}

let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  const dx = touchStartX - touch.clientX
  const dy = Math.abs(touchStartY - touch.clientY)
  // Só troca o mês se o gesto for claramente horizontal — senão o scroll da página segue.
  if (Math.abs(dx) > 56 && Math.abs(dx) > dy * 1.25) {
    goToMonth(monthIndex.value + (dx > 0 ? 1 : -1), dx > 0 ? 'left' : 'right')
  }
}

watch(
  months,
  (list) => {
    if (!list.length) return
    monthIndex.value = list.length - 1
  },
  { immediate: true },
)
</script>

<template>
  <section class="history-cal">
    <div class="history-cal__toolbar">
      <AkIconButton
        label="Mês anterior"
        variant="ghost"
        size="sm"
        :disabled="monthIndex <= 0"
        @click="goToMonth(monthIndex - 1, 'right')"
      >
        <AppIcon
          name="lucide:chevron-left"
          :size="18"
        />
      </AkIconButton>

      <div class="history-cal__title-wrap">
        <h2 class="history-cal__title">
          {{ currentMonth?.label ?? 'Calendário' }}
        </h2>
        <p class="history-cal__hint">
          Deslize na horizontal para mudar o mês
        </p>
      </div>

      <AkIconButton
        label="Próximo mês"
        variant="ghost"
        size="sm"
        :disabled="monthIndex >= months.length - 1"
        @click="goToMonth(monthIndex + 1, 'left')"
      >
        <AppIcon
          name="lucide:chevron-right"
          :size="18"
        />
      </AkIconButton>
    </div>

    <div
      class="history-cal__stage"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <Transition
        :name="slideDir === 'right' ? 'cal-right' : 'cal-left'"
        mode="out-in"
      >
        <div
          v-if="currentMonth"
          :key="currentMonth.key"
          class="history-cal__month"
        >
          <div
            class="history-cal__weekdays"
            aria-hidden="true"
          >
            <span
              v-for="(label, index) in WEEKDAYS"
              :key="`${currentMonth.key}-${index}`"
            >{{ label }}</span>
          </div>

          <div
            class="history-cal__grid"
            role="grid"
            :aria-label="currentMonth.label"
          >
            <button
              v-for="cell in currentMonth.cells"
              :key="`${currentMonth.key}-${cell.dateStr}`"
              type="button"
              class="history-cal__cell"
              :class="[
                cellShadeClass(cell),
                {
                  'history-cal__cell--out': !cell.inMonth,
                  'history-cal__cell--future': cell.isFuture,
                  'history-cal__cell--today': cell.isToday,
                  'history-cal__cell--selected': selectedDate === cell.dateStr,
                  'history-cal__cell--empty': cell.inMonth && !cell.isFuture && !cell.record,
                },
              ]"
              :disabled="!cell.inMonth || cell.isFuture"
              :aria-label="cell.inMonth ? `${cell.dateStr}${cell.record ? `, ${Math.round(cell.record.completionRate * 100)}%` : ''}` : undefined"
              :aria-pressed="selectedDate === cell.dateStr"
              @click="selectDay(cell)"
            >
              <span>{{ cell.inMonth ? cell.day : '' }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <div
      class="history-cal__legend"
      aria-label="Escala de completude"
    >
      <span><i class="swatch completion-shade--none" />0</span>
      <span><i class="swatch completion-shade--lighter" /></span>
      <span><i class="swatch completion-shade--light" /></span>
      <span><i class="swatch completion-shade--base" /></span>
      <span><i class="swatch completion-shade--dark" /></span>
      <span><i class="swatch completion-shade--darker" />100</span>
    </div>

    <div
      v-if="selectedDate"
      class="history-cal__detail"
    >
      <AkSectionHeader :title="selectedLabel">
        <template #action>
          <button
            type="button"
            class="history-cal__clear"
            @click="selectedDate = null"
          >
            Fechar
          </button>
        </template>
      </AkSectionHeader>

      <ul
        v-if="selectedDay"
        class="history-cal__day-list"
      >
        <HistoryDayBlock
          :day="selectedDay"
          default-expanded
        />
      </ul>
      <p
        v-else
        class="history-cal__empty-day"
      >
        Nenhum hábito previsto neste dia.
      </p>
    </div>
  </section>
</template>

<style scoped>
.history-cal {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.history-cal__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.history-cal__title-wrap {
  min-width: 0;
  text-align: center;
}

.history-cal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: capitalize;
}

.history-cal__hint {
  margin: 2px 0 0;
  color: var(--text-tertiary);
  font-size: 11px;
}

.history-cal__stage {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.history-cal__month {
  width: 100%;
}

.history-cal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin-bottom: var(--space-2);
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 650;
  text-align: center;
}

.history-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.history-cal__cell {
  aspect-ratio: 1;
  min-height: 40px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--bg-soft);
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 160ms var(--ease-spring),
    box-shadow var(--transition),
    background var(--transition),
    color var(--transition);
}

.history-cal__cell:disabled {
  cursor: default;
}

.history-cal__cell--out {
  background: transparent;
  color: transparent;
}

.history-cal__cell--empty {
  background: var(--bg-soft);
  color: var(--text-tertiary);
}

/* Scoped cell bg beats global .completion-shade--*; redeclare with higher specificity. */
.history-cal__cell.completion-shade--none {
  background: var(--bg-muted);
  color: var(--text-tertiary);
}

.history-cal__cell.completion-shade--lighter {
  background: var(--accent-lighter);
  color: var(--text);
}

.history-cal__cell.completion-shade--light {
  background: var(--accent-light);
  color: var(--text);
}

.history-cal__cell.completion-shade--base {
  background: var(--accent);
  color: var(--accent-contrast);
}

.history-cal__cell.completion-shade--dark {
  background: var(--accent-dark);
  color: var(--accent-contrast);
}

.history-cal__cell.completion-shade--darker {
  background: var(--accent-darker);
  color: var(--accent-contrast);
}

.history-cal__cell--future {
  opacity: 0.38;
}

.history-cal__cell--today:not(.history-cal__cell--out) {
  box-shadow: inset 0 0 0 1.5px var(--accent);
}

.history-cal__cell--selected:not(.history-cal__cell--out) {
  box-shadow: var(--focus-ring);
  transform: scale(0.96);
}

.history-cal__cell:not(:disabled):active {
  transform: scale(0.94);
}

.history-cal__legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--text-tertiary);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.history-cal__legend span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}

.history-cal__detail {
  margin-top: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}

.history-cal__day-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.history-cal__clear {
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.history-cal__empty-day {
  margin: 0;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--bg-soft);
  color: var(--text-secondary);
  font-size: 13px;
  text-align: center;
}

.cal-left-enter-active,
.cal-left-leave-active,
.cal-right-enter-active,
.cal-right-leave-active {
  transition:
    opacity 220ms var(--ease-smooth),
    transform 220ms var(--ease-out-expo);
}

.cal-left-enter-from {
  opacity: 0;
  transform: translateX(18px);
}

.cal-left-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

.cal-right-enter-from {
  opacity: 0;
  transform: translateX(-18px);
}

.cal-right-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

@media (prefers-reduced-motion: reduce) {
  .history-cal__cell,
  .cal-left-enter-active,
  .cal-left-leave-active,
  .cal-right-enter-active,
  .cal-right-leave-active {
    transition: none;
  }
}
</style>
