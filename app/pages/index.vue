<script setup lang="ts">
import type { Habit, HabitPeriod, HabitWithStatus } from '~/types'
import { getCurrentPeriod, PERIOD_OPTIONS } from '~/utils/periods'

type PeriodFilter = 'all' | HabitPeriod

const todayStr = toDateString(new Date())
const currentDateStr = ref(todayStr)
const slideDir = ref<'left' | 'right'>('left')

function navigate(dir: 'prev' | 'next') {
  slideDir.value = dir === 'next' ? 'left' : 'right'
  const d = new Date(currentDateStr.value + 'T12:00:00')
  d.setDate(d.getDate() + (dir === 'next' ? 1 : -1))
  currentDateStr.value = toDateString(d)
}

function goToToday() {
  slideDir.value = currentDateStr.value > todayStr ? 'right' : 'left'
  currentDateStr.value = todayStr
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
  if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
    navigate(dx > 0 ? 'next' : 'prev')
  }
}

const { dueHabits, isToday, isFuture, toggleHabit, toggleSkip } = useDayHabits(currentDateStr)

const selectedPeriod = ref<PeriodFilter>(getCurrentPeriod())
const currentPeriod = computed(() => getCurrentPeriod())
const periodFilters = computed(() => [
  { value: 'all' as const, label: 'Todos' },
  ...PERIOD_OPTIONS.map(option => ({ value: option.value, label: option.label }))
])

const filteredDueHabits = computed((): HabitWithStatus[] => {
  if (selectedPeriod.value === 'all') return dueHabits.value
  return dueHabits.value.filter((item) => {
    const { periods } = item.habit
    return !periods || periods.length === 0 || periods.includes(selectedPeriod.value as HabitPeriod)
  })
})

const filteredActiveHabits = computed(() => filteredDueHabits.value.filter(h => !h.skipped))
const filteredCompletedCount = computed(() => filteredActiveHabits.value.filter(h => isHabitGoalMet(h)).length)
const filteredAllDone = computed(
  () => !isFuture.value && filteredActiveHabits.value.length > 0 && filteredActiveHabits.value.every(h => isHabitGoalMet(h))
)
const hasVisibleHabits = computed(() => filteredDueHabits.value.length > 0)
const hasHabitsForDay = computed(() => dueHabits.value.length > 0)
const selectedFilterLabel = computed(() =>
  periodFilters.value.find(filter => filter.value === selectedPeriod.value)?.label ?? 'Todos'
)

watch(currentDateStr, () => {
  if (selectedPeriod.value !== 'all') {
    selectedPeriod.value = currentPeriod.value
  }
})

const cardMode = computed(() => isFuture.value ? 'future' : 'editable')

const selectedHabit = ref<Habit | null>(null)
const isDetailOpen = ref(false)
function openDetail(habit: Habit) {
  selectedHabit.value = habit
  isDetailOpen.value = true
}

const { getCompletion, setNote } = useCompletions()
const noteModalOpen = ref(false)
const noteHabit = ref<Habit | null>(null)

function openNoteModal(habit: Habit) {
  noteHabit.value = habit
  noteModalOpen.value = true
}

function handleSaveNote(note: string) {
  if (noteHabit.value) {
    setNote(noteHabit.value.id, currentDateStr.value, note)
  }
}

const { addHabit } = useHabits()
const toast = useAppToast()
const isModalOpen = ref(false)

function handleHabitSubmit(data: Omit<Habit, 'id' | 'createdAt' | 'order'>) {
  addHabit(data)
  isModalOpen.value = false
  toast.success('Hábito criado!')
}

function dateFromToday(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return toDateString(date)
}

const dateLabel = computed(() => {
  if (currentDateStr.value === todayStr) return 'Hoje'
  const yesterday = dateFromToday(-1)
  const tomorrow = dateFromToday(1)
  if (currentDateStr.value === yesterday) return 'Ontem'
  if (currentDateStr.value === tomorrow) return 'Amanhã'
  return formatDateLabel(currentDateStr.value)
})

const dateSub = computed(() => {
  const d = new Date(currentDateStr.value + 'T12:00:00')
  const s = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
})

const isNotToday = computed(() => currentDateStr.value !== todayStr)
</script>

<template>
  <div class="app-page">
    <header class="day-header">
      <div class="day-header__top">
        <div class="day-header__heading">
          <span class="page-label">Sua rotina</span>
          <h1 class="page-title">
            {{ dateLabel }}
          </h1>
          <p class="day-header__date capitalize">
            {{ dateSub }}
          </p>
        </div>

        <div class="day-header__actions">
          <AkIconButton
            variant="ghost"
            size="md"
            label="Dia anterior"
            @click="navigate('prev')"
          >
            <AppIcon
              name="lucide:chevron-left"
              :size="20"
            />
          </AkIconButton>
          <AkIconButton
            variant="ghost"
            size="md"
            label="Próximo dia"
            @click="navigate('next')"
          >
            <AppIcon
              name="lucide:chevron-right"
              :size="20"
            />
          </AkIconButton>
        </div>
      </div>

      <Transition name="fade">
        <div
          v-if="isNotToday"
          class="chip-row"
        >
          <AkChip @click="goToToday">
            <AppIcon
              name="lucide:calendar-check"
              :size="14"
            />
            Ir para hoje
          </AkChip>
        </div>
      </Transition>

      <div
        v-if="!isFuture && filteredActiveHabits.length"
        class="day-header__progress"
      >
        <AkProgress
          :value="filteredCompletedCount"
          :max="filteredActiveHabits.length"
          :label="`${filteredCompletedCount} de ${filteredActiveHabits.length} concluídos`"
          show-value
        />
      </div>

      <div
        class="chip-row"
        aria-label="Filtrar por período"
      >
        <AkChip
          v-for="filter in periodFilters"
          :key="filter.value"
          :active="selectedPeriod === filter.value"
          @click="selectedPeriod = filter.value"
        >
          {{ filter.label }}
        </AkChip>
      </div>
    </header>

    <div
      class="flex-1 day-content"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <Transition :name="'slide-' + slideDir">
        <div
          :key="currentDateStr"
          class="app-scroll page-body page-body--flush-top"
          :class="{ 'page-body--with-fab': isToday }"
        >
          <Transition name="fade">
            <div
              v-if="filteredAllDone && isToday"
              class="inline-notice inline-notice--success"
            >
              Todos os hábitos de hoje concluídos
            </div>
          </Transition>

          <div
            v-if="isFuture && hasVisibleHabits"
            class="inline-notice"
          >
            {{ filteredDueHabits.length }}
            {{ filteredDueHabits.length === 1 ? 'hábito planejado' : 'hábitos planejados' }} para este dia
          </div>

          <AkList
            v-if="hasVisibleHabits"
            class="habit-list"
          >
            <HabitCard
              v-for="(item, index) in filteredDueHabits"
              :key="item.habit.id"
              :item="item"
              :mode="cardMode"
              :divider="index < filteredDueHabits.length - 1"
              @toggle="toggleHabit(item.habit.id)"
              @skip="toggleSkip(item.habit.id)"
              @detail="openDetail(item.habit)"
              @open-note="openNoteModal(item.habit)"
            />
          </AkList>

          <div
            v-else
            class="empty-wrap"
          >
            <template v-if="hasHabitsForDay">
              <AkEmptyState
                :title="`Nada para ${selectedFilterLabel.toLowerCase()}`"
                description="Tente trocar o filtro ou veja todos os hábitos do dia."
              >
                <template #action>
                  <AkButton
                    variant="secondary"
                    @click="selectedPeriod = 'all'"
                  >
                    Ver todos
                  </AkButton>
                </template>
              </AkEmptyState>
            </template>
            <template v-else-if="isToday">
              <AkEmptyState
                title="Nenhum hábito para hoje"
                description="Crie seu primeiro hábito e comece a construir uma rotina."
              >
                <template #icon>
                  <span style="font-size: 2rem">📋</span>
                </template>
                <template #action>
                  <AkButton @click="isModalOpen = true">
                    <template #icon>
                      <AppIcon
                        name="lucide:plus"
                        :size="18"
                      />
                    </template>
                    Adicionar hábito
                  </AkButton>
                </template>
              </AkEmptyState>
            </template>
            <template v-else-if="!hasHabitsForDay && currentDateStr < todayStr">
              <AkEmptyState
                title="Sem hábitos neste dia"
                description="Nenhum hábito estava ativo nesta data."
              />
            </template>
            <template v-else>
              <AkEmptyState
                title="Nenhum hábito planejado"
                description="Adicione hábitos para vê-los aqui."
              />
            </template>
          </div>
        </div>
      </Transition>
    </div>

    <HabitDetailSheet
      v-model:open="isDetailOpen"
      :habit="selectedHabit"
    />

    <div
      v-if="isToday"
      class="fab"
    >
      <AkButton
        size="lg"
        aria-label="Novo hábito"
        @click="isModalOpen = true"
      >
        <template #icon>
          <AppIcon
            name="lucide:plus"
            :size="22"
          />
        </template>
        Novo
      </AkButton>
    </div>

    <AppBottomSheet
      v-model:open="isModalOpen"
      title="Novo hábito"
    >
      <HabitForm
        @submit="handleHabitSubmit"
        @cancel="isModalOpen = false"
      />
    </AppBottomSheet>

    <NoteModal
      v-model:open="noteModalOpen"
      :habit-name="noteHabit?.name ?? ''"
      :habit-emoji="noteHabit?.emoji ?? ''"
      :note="noteHabit ? (getCompletion(noteHabit.id, currentDateStr)?.note ?? '') : ''"
      @save="handleSaveNote"
    />
  </div>
</template>

<style scoped>
.day-content {
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.day-content > div {
  position: absolute;
  inset: 0;
}

.habit-list {
  margin-top: var(--space-5);
}

.empty-wrap {
  padding: var(--space-10) 0;
}
</style>
