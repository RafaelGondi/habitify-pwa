<script setup lang="ts">
import type { DayRecord } from '~/types'

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
const trackRef = ref<HTMLElement | null>(null)
const monthIndex = ref(0)
const selectedDate = ref<string | null>(null)

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

function cellStyle(cell: CalendarCell) {
  if (!cell.inMonth || cell.isFuture || !cell.record) return undefined
  const rate = Math.max(14, Math.round(cell.record.completionRate * 100))
  return { '--day-rate': `${rate}%` }
}

function selectDay(cell: CalendarCell) {
  if (!cell.inMonth || cell.isFuture) return
  selectedDate.value = selectedDate.value === cell.dateStr ? null : cell.dateStr
}

function goToMonth(index: number) {
  const next = Math.max(0, Math.min(months.value.length - 1, index))
  monthIndex.value = next
  const month = months.value[next]
  if (month) {
    emit('ensureDate', `${month.key}-01`)
    scrollToMonth(next, true)
  }
}

function scrollToMonth(index: number, smooth = false) {
  const track = trackRef.value
  if (!track) return
  const width = track.clientWidth
  track.scrollTo({
    left: width * index,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

function onTrackScroll() {
  const track = trackRef.value
  if (!track?.clientWidth) return
  const index = Math.round(track.scrollLeft / track.clientWidth)
  if (index !== monthIndex.value && index >= 0 && index < months.value.length) {
    monthIndex.value = index
    const month = months.value[index]
    if (month) emit('ensureDate', `${month.key}-01`)
  }
}

watch(
  months,
  (list) => {
    if (!list.length) return
    monthIndex.value = list.length - 1
    nextTick(() => scrollToMonth(list.length - 1))
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
        @click="goToMonth(monthIndex - 1)"
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
          Deslize para mudar o mês
        </p>
      </div>

      <AkIconButton
        label="Próximo mês"
        variant="ghost"
        size="sm"
        :disabled="monthIndex >= months.length - 1"
        @click="goToMonth(monthIndex + 1)"
      >
        <AppIcon
          name="lucide:chevron-right"
          :size="18"
        />
      </AkIconButton>
    </div>

    <div
      ref="trackRef"
      class="history-cal__track"
      aria-label="Calendário de progresso"
      @scroll.passive="onTrackScroll"
    >
      <div
        v-for="month in months"
        :key="month.key"
        class="history-cal__month"
      >
        <div
          class="history-cal__weekdays"
          aria-hidden="true"
        >
          <span
            v-for="(label, index) in WEEKDAYS"
            :key="`${month.key}-${index}`"
          >{{ label }}</span>
        </div>

        <div
          class="history-cal__grid"
          role="grid"
          :aria-label="month.label"
        >
          <button
            v-for="cell in month.cells"
            :key="`${month.key}-${cell.dateStr}`"
            type="button"
            class="history-cal__cell"
            :class="{
              'history-cal__cell--out': !cell.inMonth,
              'history-cal__cell--future': cell.isFuture,
              'history-cal__cell--today': cell.isToday,
              'history-cal__cell--selected': selectedDate === cell.dateStr,
              'history-cal__cell--done': cell.record && cell.record.completionRate === 1,
              'history-cal__cell--partial': cell.record && cell.record.completionRate > 0 && cell.record.completionRate < 1,
              'history-cal__cell--missed': cell.record && cell.record.completionRate === 0,
            }"
            :style="cellStyle(cell)"
            :disabled="!cell.inMonth || cell.isFuture"
            :aria-label="cell.inMonth ? `${cell.dateStr}${cell.record ? `, ${Math.round(cell.record.completionRate * 100)}%` : ''}` : undefined"
            :aria-pressed="selectedDate === cell.dateStr"
            @click="selectDay(cell)"
          >
            <span>{{ cell.inMonth ? cell.day : '' }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="history-cal__legend">
      <span><i class="swatch swatch--missed" />0%</span>
      <span><i class="swatch swatch--partial" />Parcial</span>
      <span><i class="swatch swatch--done" />100%</span>
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

.history-cal__track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  margin-inline: calc(var(--page-pad-x) * -1);
  padding-inline: var(--page-pad-x);
}

.history-cal__track::-webkit-scrollbar {
  display: none;
}

.history-cal__month {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: center;
  scroll-snap-stop: always;
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

.history-cal__cell--future {
  opacity: 0.38;
}

.history-cal__cell--missed {
  background: var(--bg-muted);
  color: var(--text-tertiary);
}

.history-cal__cell--partial {
  background: color-mix(in srgb, var(--accent) var(--day-rate), var(--bg-muted));
  color: var(--text);
}

.history-cal__cell--done {
  background: var(--accent);
  color: var(--accent-contrast);
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
  justify-content: center;
  gap: var(--space-4);
  color: var(--text-tertiary);
  font-size: 11px;
}

.history-cal__legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}

.swatch--missed { background: var(--bg-muted); }
.swatch--partial { background: color-mix(in srgb, var(--accent) 45%, var(--bg-muted)); }
.swatch--done { background: var(--accent); }

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

@media (prefers-reduced-motion: reduce) {
  .history-cal__cell {
    transition: none;
  }
}
</style>
