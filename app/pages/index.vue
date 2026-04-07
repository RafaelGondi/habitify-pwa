<script setup lang="ts">
import type { Habit } from '~/types'

const { dueToday, completionRate, completedCount, allDone, toggleHabit } = useTodayHabits()
const { addHabit } = useHabits()
const toast = useToast()

const isModalOpen = ref(false)
const todayFormatted = formatTodayFull()

function handleHabitSubmit(data: Omit<Habit, 'id' | 'createdAt' | 'order'>) {
  addHabit(data)
  isModalOpen.value = false
  toast.add({ title: 'Hábito criado!', icon: 'i-lucide-check-circle', color: 'success' })
}
</script>

<template>
  <div class="flex flex-col min-h-full">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-default px-4" style="padding-top: env(safe-area-inset-top, 0px)">
      <div class="flex items-center justify-between h-14">
        <div>
          <h1 class="font-bold text-lg leading-tight">Hoje</h1>
          <p class="text-xs text-muted capitalize leading-tight">{{ todayFormatted }}</p>
        </div>
        <UButton
          icon="i-lucide-plus"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="isModalOpen = true"
        />
      </div>
    </header>

    <!-- Progress bar -->
    <div v-if="dueToday.length" class="px-4 pt-4 pb-2">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-muted">
          {{ completedCount }} de {{ dueToday.length }}
          {{ dueToday.length === 1 ? 'hábito' : 'hábitos' }} concluído{{ completedCount !== 1 ? 's' : '' }}
        </span>
        <span class="text-sm font-semibold text-primary">{{ Math.round(completionRate * 100) }}%</span>
      </div>
      <UProgress :value="completionRate * 100" color="primary" size="sm" />
    </div>

    <!-- All done banner -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
    >
      <div v-if="allDone" class="mx-4 mt-2 mb-1 px-4 py-3 rounded-2xl bg-primary/10 text-center">
        <p class="text-sm font-semibold text-primary">
          🎉 Todos os hábitos de hoje concluídos!
        </p>
      </div>
    </Transition>

    <!-- Habit list -->
    <div v-if="dueToday.length" class="flex-1 px-3 pt-2 pb-4">
      <TransitionGroup
        name="list"
        tag="div"
        class="flex flex-col gap-1"
      >
        <div
          v-for="item in dueToday"
          :key="item.habit.id"
          class="rounded-2xl bg-elevated/40"
        >
          <HabitCard :item="item" @toggle="toggleHabit(item.habit.id)" />
        </div>
      </TransitionGroup>
    </div>

    <!-- Empty state -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
      <div class="text-5xl mb-4">📋</div>
      <h2 class="font-bold text-lg mb-1">Nenhum hábito para hoje</h2>
      <p class="text-sm text-muted mb-6 leading-relaxed">
        Crie seu primeiro hábito e comece a construir uma rotina incrível
      </p>
      <UButton icon="i-lucide-plus" @click="isModalOpen = true">
        Adicionar hábito
      </UButton>
    </div>

    <!-- Modal -->
    <UModal v-model:open="isModalOpen" title="Novo hábito">
      <template #body>
        <HabitForm
          @submit="handleHabitSubmit"
          @cancel="isModalOpen = false"
        />
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
