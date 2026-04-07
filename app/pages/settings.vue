<script setup lang="ts">
import type { Habit } from '~/types'

const { activeHabits, addHabit, updateHabit, archiveHabit } = useHabits()
const { exportJSON, importJSON } = useExport()
const toast = useToast()

const isModalOpen = ref(false)
const editingHabit = ref<Habit | undefined>(undefined)

function openAdd() {
  editingHabit.value = undefined
  isModalOpen.value = true
}

function openEdit(habit: Habit) {
  editingHabit.value = habit
  isModalOpen.value = true
}

function handleSubmit(data: Omit<Habit, 'id' | 'createdAt' | 'order'>) {
  if (editingHabit.value) {
    updateHabit(editingHabit.value.id, data)
    toast.add({ title: 'Hábito atualizado!', icon: 'i-lucide-check', color: 'success' })
  }
  else {
    addHabit(data)
    toast.add({ title: 'Hábito criado!', icon: 'i-lucide-check', color: 'success' })
  }
  isModalOpen.value = false
}

function handleArchive(habit: Habit) {
  archiveHabit(habit.id)
  toast.add({ title: `"${habit.name}" arquivado`, icon: 'i-lucide-archive', color: 'neutral' })
}

async function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    await importJSON(file)
    toast.add({ title: 'Dados importados com sucesso!', icon: 'i-lucide-download', color: 'success' })
  }
  catch (err) {
    toast.add({ title: 'Erro ao importar', description: String(err), color: 'error' })
  }
  input.value = ''
}

const modalTitle = computed(() => editingHabit.value ? 'Editar hábito' : 'Novo hábito')
const modalKey = computed(() => editingHabit.value?.id ?? 'new')

const { $pwa } = useNuxtApp()
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-default px-4" style="padding-top: env(safe-area-inset-top, 0px)">
      <div class="flex items-center h-14">
        <h1 class="font-bold text-lg">Hábitos</h1>
      </div>
    </header>

    <div class="flex-1 px-4 pt-4 pb-6 flex flex-col gap-6">
      <!-- Habit list -->
      <section>
        <div v-if="activeHabits.length" class="flex flex-col gap-2">
          <div
            v-for="habit in activeHabits"
            :key="habit.id"
            class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-elevated/40 border border-default"
          >
            <!-- Emoji + info -->
            <div class="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-background shrink-0">
              {{ habit.emoji }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate">{{ habit.name }}</p>
              <p class="text-xs text-muted">
                {{ habit.recurrence.type === 'weekly_x'
                  ? `${habit.recurrence.timesPerWeek}x por semana`
                  : recurrenceLabel(habit.recurrence.type) }}
              </p>
            </div>
            <!-- Actions -->
            <div class="flex gap-1 shrink-0">
              <UButton
                icon="i-lucide-pencil"
                variant="ghost"
                color="neutral"
                size="xs"
                @click="openEdit(habit)"
              />
              <UButton
                icon="i-lucide-archive"
                variant="ghost"
                color="neutral"
                size="xs"
                @click="handleArchive(habit)"
              />
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="flex flex-col items-center justify-center py-10 text-center">
          <div class="text-4xl mb-3">🌱</div>
          <p class="font-medium mb-1">Nenhum hábito cadastrado</p>
          <p class="text-sm text-muted mb-4">Comece adicionando seu primeiro hábito</p>
          <UButton icon="i-lucide-plus" size="sm" @click="openAdd">
            Adicionar hábito
          </UButton>
        </div>
      </section>

      <!-- Appearance section -->
      <section class="border-t border-default pt-6">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Aparência</h2>
        <div class="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-elevated/40 border border-default">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-sun-moon" class="text-primary text-lg shrink-0" />
            <div>
              <p class="font-medium text-sm">Tema</p>
              <p class="text-xs text-muted">Claro, escuro ou automático</p>
            </div>
          </div>
          <UColorModeSelect size="sm" variant="outline" />
        </div>
      </section>

      <!-- Install section -->
      <section v-if="$pwa?.showInstallPrompt" class="border-t border-default pt-6">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Aplicativo</h2>
        <button
          class="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors text-left"
          @click="$pwa?.install()"
        >
          <UIcon name="i-lucide-download" class="text-primary text-lg shrink-0" />
          <div>
            <p class="font-medium text-sm text-primary">Instalar aplicativo</p>
            <p class="text-xs text-muted">Adicionar à tela inicial como app</p>
          </div>
        </button>
      </section>

      <!-- Data section -->
      <section class="border-t border-default pt-6">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Dados</h2>
        <div class="flex flex-col gap-2">
          <button
            class="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-elevated/40 border border-default hover:bg-elevated transition-colors text-left"
            @click="exportJSON"
          >
            <UIcon name="i-lucide-upload" class="text-primary text-lg shrink-0" />
            <div>
              <p class="font-medium text-sm">Exportar dados</p>
              <p class="text-xs text-muted">Baixar todos os hábitos e progresso em JSON</p>
            </div>
          </button>

          <label class="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-elevated/40 border border-default hover:bg-elevated transition-colors cursor-pointer">
            <UIcon name="i-lucide-download" class="text-primary text-lg shrink-0" />
            <div class="flex-1">
              <p class="font-medium text-sm">Importar dados</p>
              <p class="text-xs text-muted">Mesclar dados de um arquivo JSON exportado</p>
            </div>
            <input type="file" accept=".json" class="hidden" @change="handleImport">
          </label>
        </div>
      </section>
    </div>

    <!-- FAB -->
    <button
      class="fixed bottom-20 right-4 z-20 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      style="bottom: calc(env(safe-area-inset-bottom, 0px) + 4.5rem)"
      @click="openAdd"
    >
      <UIcon name="i-lucide-plus" class="text-2xl" />
    </button>

    <!-- Modal -->
    <UModal v-model:open="isModalOpen" :title="modalTitle">
      <template #body>
        <HabitForm
          :key="modalKey"
          :habit="editingHabit"
          @submit="handleSubmit"
          @cancel="isModalOpen = false"
        />
      </template>
    </UModal>
  </div>
</template>
