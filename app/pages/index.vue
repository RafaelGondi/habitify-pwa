<script setup lang="ts">
import type { Habit, HabitPeriod, HabitWithStatus } from '~/types'
import { getCurrentPeriod, PERIOD_OPTIONS } from '~/utils/periods'

type PeriodFilter = 'all' | HabitPeriod

const todayStr = toDateString(new Date())

// Current date being viewed
const currentDateStr = ref(todayStr)
const slideDir = ref<'left' | 'right'>('left')

// Navigation
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

// Touch / swipe
let touchStartX = 0
let touchStartY = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}
function onTouchEnd(e: TouchEvent) {
  const dx = touchStartX - e.changedTouches[0].clientX
  const dy = Math.abs(touchStartY - e.changedTouches[0].clientY)
  // Only trigger on horizontal swipes (dx > 50, more horizontal than vertical)
  if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
    navigate(dx > 0 ? 'next' : 'prev')
  }
}

// Day data
const { dueHabits, isToday, isPast, isFuture, toggleHabit, toggleSkip } = useDayHabits(currentDateStr)

const selectedPeriod = ref<PeriodFilter>(getCurrentPeriod())
const currentPeriod = computed(() => getCurrentPeriod())
const periodFilters = computed(() => [
  { value: 'all' as const, label: 'Todos' },
  ...PERIOD_OPTIONS.map(option => ({ value: option.value, label: option.label })),
])

const filteredDueHabits = computed((): HabitWithStatus[] => {
  if (selectedPeriod.value === 'all') return dueHabits.value

  return dueHabits.value.filter((item) => {
    const { periods } = item.habit
    return !periods || periods.length === 0 || periods.includes(selectedPeriod.value as HabitPeriod)
  })
})

const filteredActiveHabits = computed(() => filteredDueHabits.value.filter(h => !h.skipped))
const filteredCompletedCount = computed(() => filteredActiveHabits.value.filter(h => h.completed).length)
const filteredCompletionRate = computed(() => {
  if (!filteredActiveHabits.value.length || isFuture.value) return 0
  return filteredCompletedCount.value / filteredActiveHabits.value.length
})
const filteredAllDone = computed(
  () => !isFuture.value && filteredActiveHabits.value.length > 0 && filteredActiveHabits.value.every(h => h.completed)
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

// Card mode for HabitCard
const cardMode = computed(() => {
  if (isFuture.value) return 'future'
  return 'editable' // past and today are both interactive
})

// Habit detail sheet
const selectedHabit = ref<Habit | null>(null)
const isDetailOpen = ref(false)
function openDetail(habit: Habit) {
  selectedHabit.value = habit
  isDetailOpen.value = true
}

// Note modal
const { getCompletion, setNote } = useCompletions()
const noteModalOpen = ref(false)
const noteHabit = ref<Habit | null>(null)

const currentNote = computed(() => {
  if (!noteHabit.value) return ''
  return getCompletion(noteHabit.value.id, currentDateStr.value)?.note ?? ''
})

function openNoteModal(habit: Habit, _item: typeof dueHabits.value[0]) {
  noteHabit.value = habit
  noteModalOpen.value = true
}

function handleSaveNote(note: string) {
  if (noteHabit.value) {
    setNote(noteHabit.value.id, currentDateStr.value, note)
  }
}

// Habit creation
const { addHabit } = useHabits()
const toast = useToast()
const isModalOpen = ref(false)

function handleHabitSubmit(data: Omit<Habit, 'id' | 'createdAt' | 'order'>) {
  addHabit(data)
  isModalOpen.value = false
  toast.add({ title: 'Hábito criado!', icon: 'i-lucide-check-circle', color: 'success' })
}

// Date header labels
const dateLabel = computed(() => {
  if (currentDateStr.value === todayStr) return 'Hoje'
  const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return toDateString(d) })()
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return toDateString(d) })()
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
  <div class="flex flex-col h-full">
    <!-- Header -->
    <header
      class="shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-default"
      style="padding-top: env(safe-area-inset-top, 0px)"
    >
      <div class="flex items-center gap-2 px-2 h-14">
        <!-- Prev -->
        <UButton
          icon="i-lucide-chevron-left"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="navigate('prev')"
        />

        <!-- Date label -->
        <div class="flex-1 text-center">
          <h1 class="font-bold text-lg leading-tight">{{ dateLabel }}</h1>
          <p class="text-xs text-muted capitalize leading-tight">{{ dateSub }}</p>
        </div>

        <!-- Next -->
        <UButton
          icon="i-lucide-chevron-right"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="navigate('next')"
        />

      </div>

      <!-- Back to today strip -->
      <Transition name="fade">
        <button
          v-if="isNotToday"
          class="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-primary bg-primary/8 hover:bg-primary/12 transition-colors"
          @click="goToToday"
        >
          <UIcon name="i-lucide-calendar-check" class="text-sm" />
          Ir para hoje
        </button>
      </Transition>

      <!-- Period filter -->
      <div class="px-4 pb-3">
        <div class="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="filter in periodFilters"
            :key="filter.value"
            class="shrink-0 h-9 px-3 rounded-full text-sm font-medium transition-colors border"
            :class="selectedPeriod === filter.value
              ? 'bg-primary text-white border-primary'
              : 'bg-white/80 dark:bg-zinc-900/80 text-muted border-default hover:text-default'"
            @click="selectedPeriod = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Progress bar (past + today only) -->
      <div v-if="!isFuture && filteredActiveHabits.length" class="px-4 pb-3">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs text-muted">
            {{ filteredCompletedCount }}/{{ filteredActiveHabits.length }}
          </span>
          <span class="text-xs font-semibold text-primary">{{ Math.round(filteredCompletionRate * 100) }}%</span>
        </div>
        <UProgress :model-value="filteredCompletionRate * 100" color="primary" size="md" class="progress-no-anim" />
      </div>
    </header>

    <!-- Swipeable content area -->
    <div
      class="flex-1 relative overflow-hidden"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <Transition :name="'slide-' + slideDir">
        <div :key="currentDateStr" class="absolute inset-0 overflow-y-auto">
          <!-- All done banner (today only) -->
          <Transition name="fade">
            <div v-if="filteredAllDone && isToday" class="mx-4 mt-3 mb-1 px-4 py-2.5 rounded-2xl bg-primary/10 text-center">
              <p class="text-sm font-semibold text-primary">
                🎉 Todos os hábitos de hoje concluídos!
              </p>
            </div>
          </Transition>

          <!-- Future banner -->
          <div v-if="isFuture && hasVisibleHabits" class="mx-4 mt-3 mb-1 px-4 py-2.5 rounded-2xl bg-elevated/60 text-center">
            <p class="text-sm text-muted">
              📅 {{ filteredDueHabits.length }} {{ filteredDueHabits.length === 1 ? 'hábito planejado' : 'hábitos planejados' }} para este dia
            </p>
          </div>

          <!-- Habit list -->
          <div v-if="hasVisibleHabits" class="px-3 pt-4 pb-4 flex flex-col gap-2">
            <div
              v-for="item in filteredDueHabits"
              :key="item.habit.id"
              class="rounded-2xl border transition-colors"
              :class="item.completed || item.skipped
                ? 'border-zinc-200/60 dark:border-zinc-700/40 bg-zinc-50 dark:bg-zinc-800/50 opacity-60'
                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'"
            >
              <HabitCard
                :item="item"
                :mode="cardMode"
                @toggle="toggleHabit(item.habit.id)"
                @skip="toggleSkip(item.habit.id)"
                @detail="openDetail(item.habit)"
                @open-note="openNoteModal(item.habit, item)"
              />
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="flex flex-col items-center justify-center px-8 py-16 text-center">
            <template v-if="hasHabitsForDay">
              <div class="text-4xl mb-3">🕒</div>
              <p class="font-medium mb-1">Nada para {{ selectedFilterLabel.toLowerCase() }}</p>
              <p class="text-sm text-muted mb-6 leading-relaxed">
                Tente trocar o filtro ou veja todos os hábitos do dia.
              </p>
              <UButton variant="soft" color="neutral" @click="selectedPeriod = 'all'">
                Ver todos
              </UButton>
            </template>
            <template v-else-if="isToday">
              <div class="text-5xl mb-4">📋</div>
              <h2 class="font-bold text-lg mb-1">Nenhum hábito para hoje</h2>
              <p class="text-sm text-muted mb-6 leading-relaxed">
                Crie seu primeiro hábito e comece a construir uma rotina incrível
              </p>
              <UButton icon="i-lucide-plus" @click="isModalOpen = true">
                Adicionar hábito
              </UButton>
            </template>
            <template v-else-if="!hasHabitsForDay && isPast">
              <div class="text-4xl mb-3">🗓️</div>
              <p class="font-medium mb-1">Sem hábitos neste dia</p>
              <p class="text-sm text-muted">Nenhum hábito estava ativo nesta data</p>
            </template>
            <template v-else-if="!hasHabitsForDay">
              <div class="text-4xl mb-3">✨</div>
              <p class="font-medium mb-1">Nenhum hábito planejado</p>
              <p class="text-sm text-muted">Adicione hábitos na aba "Hoje" para vê-los aqui</p>
            </template>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Habit detail sheet -->
    <HabitDetailSheet
      v-model:open="isDetailOpen"
      :habit="selectedHabit"
    />

    <!-- FAB -->
    <button
      v-if="isToday"
      class="fixed z-20 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      style="bottom: calc(env(safe-area-inset-bottom, 0px) + 5rem); right: 1rem"
      @click="isModalOpen = true"
    >
      <UIcon name="i-lucide-plus" class="text-2xl" />
    </button>

    <!-- Bottom sheet: new habit -->
    <AppBottomSheet v-model:open="isModalOpen" title="Novo hábito">
      <HabitForm
        @submit="handleHabitSubmit"
        @cancel="isModalOpen = false"
      />
    </AppBottomSheet>

    <!-- Note modal -->
    <NoteModal
      v-model:open="noteModalOpen"
      :habit-name="noteHabit?.name ?? ''"
      :habit-emoji="noteHabit?.emoji ?? ''"
      :note="currentNote"
      @save="handleSaveNote"
    />
  </div>
</template>

<style scoped>
/* Kill progress bar animation */
.progress-no-anim :deep([data-slot="indicator"]) {
  animation: none !important;
  transition: none !important;
}

.no-scrollbar {
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Slide to next day (swipe left) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from { transform: translateX(100%); }
.slide-left-leave-to   { transform: translateX(-100%); }

/* Slide to prev day (swipe right) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from { transform: translateX(-100%); }
.slide-right-leave-to   { transform: translateX(100%); }

/* Fade for banners */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
