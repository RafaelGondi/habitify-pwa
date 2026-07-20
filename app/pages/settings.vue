<script setup lang="ts">
import type { Habit } from '~/types'
import { getHabitPeriodsLabel } from '~/utils/periods'
import { getHabitColor } from '~/utils/colors'

const { user, logout } = useAuth()
const { activeHabits, archivedHabits, addHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit } = useHabits()
const { mode, setMode } = useAppTheme()
const isDark = computed({
  get: () => mode.value === 'dark',
  set: (v: boolean) => setMode(v ? 'dark' : 'light')
})
const showArchived = ref(false)
const confirmDeleteId = ref<string | null>(null)

function handleDelete() {
  if (!confirmDeleteId.value) return
  deleteHabit(confirmDeleteId.value)
  confirmDeleteId.value = null
  toast.neutral('Hábito excluído')
}

function closeConfirmDelete(val: boolean) {
  if (!val) confirmDeleteId.value = null
}

const { exportJSON, importJSON } = useExport()
const toast = useAppToast()

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

function handleSubmit(data: Omit<Habit, 'id' | 'order'>) {
  if (editingHabit.value) {
    updateHabit(editingHabit.value.id, data)
    toast.success('Hábito atualizado!')
  } else {
    addHabit(data)
    toast.success('Hábito criado!')
  }
  isModalOpen.value = false
}

function handleArchive(habit: Habit) {
  archiveHabit(habit.id)
  toast.neutral(`"${habit.name}" arquivado`)
}

async function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    await importJSON(file)
    toast.success('Dados importados com sucesso!')
  } catch (err) {
    toast.error('Erro ao importar', String(err))
  }
  input.value = ''
}

const modalTitle = computed(() => editingHabit.value ? 'Editar hábito' : 'Novo hábito')
const modalKey = computed(() => editingHabit.value?.id ?? 'new')

const { $pwa } = useNuxtApp()
const importInput = ref<HTMLInputElement | null>(null)

function habitSubtitle(habit: Habit) {
  const periods = habit.periods?.length ? ` · ${getHabitPeriodsLabel(habit.periods)}` : ''
  return formatRecurrenceSummary(habit) + periods
}
</script>

<template>
  <div class="ak-app-page ak-app-scroll">
    <AkPageHeader
      label="Gerenciar"
      title="Hábitos"
    />

    <div class="page-body page-body--flush-top stack--lg">
      <section>
        <AkSectionHeader title="Ativos">
          <template
            v-if="activeHabits.length"
            #action
          >
            <AkButton
              variant="ghost"
              size="sm"
              @click="openAdd"
            >
              <template #icon>
                <AkIcon
                  name="plus-outline"
                  :size="16"
                />
              </template>
              Adicionar
            </AkButton>
          </template>
        </AkSectionHeader>

        <AkList v-if="activeHabits.length">
          <AkListRow
            v-for="(habit, index) in activeHabits"
            :key="habit.id"
            :divider="index < activeHabits.length - 1"
            padding="md"
          >
            <template #leading>
              <div
                class="habit-emoji"
                :style="{ backgroundColor: getHabitColor(habit.color).light }"
              >
                {{ habit.emoji }}
              </div>
            </template>
            <span class="habit-row-name">{{ habit.name }}</span>
            <template #subtitle>
              <span class="text-xs text-muted">{{ habitSubtitle(habit) }}</span>
            </template>
            <template #trailing>
              <div class="habit-row-actions">
                <AkIconButton
                  variant="ghost"
                  size="sm"
                  label="Editar"
                  icon="edit-outline"
                  @click="openEdit(habit)"
                />
                <AkIconButton
                  variant="ghost"
                  size="sm"
                  label="Arquivar"
                  @click="handleArchive(habit)"
                >
                  <AppIcon
                    name="lucide:archive"
                    :size="16"
                  />
                </AkIconButton>
                <AkIconButton
                  variant="ghost"
                  size="sm"
                  label="Excluir"
                  icon="trash-outline"
                  @click="confirmDeleteId = habit.id"
                />
              </div>
            </template>
          </AkListRow>
        </AkList>

        <div
          v-else
          class="empty-wrap--compact"
        >
          <AkEmptyState
            title="Nenhum hábito cadastrado"
            description="Comece adicionando seu primeiro hábito."
          >
            <template #icon>
              <span style="font-size: 2rem">🌱</span>
            </template>
            <template #action>
              <AkButton
                size="sm"
                @click="openAdd"
              >
                <template #icon>
                  <AkIcon
                    name="plus-outline"
                    :size="16"
                  />
                </template>
                Adicionar hábito
              </AkButton>
            </template>
          </AkEmptyState>
        </div>
      </section>

      <section v-if="archivedHabits.length">
        <AkSectionHeader :title="`Arquivados (${archivedHabits.length})`">
          <template #action>
            <AkIconButton
              variant="ghost"
              size="sm"
              :label="showArchived ? 'Recolher' : 'Expandir'"
              :icon="showArchived ? 'caret-up-outline' : 'caret-down-outline'"
              @click="showArchived = !showArchived"
            />
          </template>
        </AkSectionHeader>

        <Transition name="accordion">
          <AkList
            v-if="showArchived"
            class="opacity-muted"
          >
            <AkListRow
              v-for="(habit, index) in archivedHabits"
              :key="habit.id"
              :divider="index < archivedHabits.length - 1"
              padding="md"
            >
              <template #leading>
                <div
                  class="habit-emoji"
                  :style="{ backgroundColor: getHabitColor(habit.color).light }"
                >
                  {{ habit.emoji }}
                </div>
              </template>
              <span class="habit-row-name text-muted">{{ habit.name }}</span>
              <template #subtitle>
                <span class="text-xs text-muted">{{ habitSubtitle(habit) }}</span>
              </template>
              <template #trailing>
                <div class="habit-row-actions">
                  <AkIconButton
                    variant="ghost"
                    size="sm"
                    label="Restaurar"
                    @click="unarchiveHabit(habit.id)"
                  >
                    <AppIcon
                      name="lucide:archive-restore"
                      :size="16"
                    />
                  </AkIconButton>
                  <AkIconButton
                    variant="ghost"
                    size="sm"
                    label="Excluir"
                    icon="trash-outline"
                    @click="confirmDeleteId = habit.id"
                  />
                </div>
              </template>
            </AkListRow>
          </AkList>
        </Transition>
      </section>

      <section>
        <AkSectionHeader title="Aparência" />
        <AkList>
          <AkListRow padding="md">
            <span class="text-sm font-semibold">Tema escuro</span>
            <template #subtitle>
              <span class="text-xs text-muted">Alternar entre claro e escuro</span>
            </template>
            <template #trailing>
              <AkSwitch v-model="isDark" />
            </template>
          </AkListRow>
        </AkList>
      </section>

      <section v-if="$pwa?.showInstallPrompt">
        <AkSectionHeader title="Aplicativo" />
        <AkList>
          <AkListRow
            interactive
            padding="md"
            @click="$pwa?.install()"
          >
            <AkIcon
              name="download-outline"
              :size="20"
              class="text-accent"
            />
            <span class="text-sm font-semibold text-accent">Instalar aplicativo</span>
            <template #subtitle>
              <span class="text-xs text-muted">Adicionar à tela inicial</span>
            </template>
            <template #trailing>
              <AkIcon
                name="caret-right-outline"
                :size="16"
                class="text-muted"
              />
            </template>
          </AkListRow>
        </AkList>
      </section>

      <section>
        <AkSectionHeader title="Conta" />
        <AkList>
          <AkListRow padding="md">
            <template #leading>
              <img
                v-if="user?.photoURL"
                :src="user.photoURL"
                class="avatar"
                referrerpolicy="no-referrer"
                alt=""
              >
              <AkIcon
                v-else
                name="user-outline"
                :size="28"
                class="text-accent"
              />
            </template>
            <span class="text-sm font-semibold truncate">{{ user?.displayName ?? user?.email }}</span>
            <template #subtitle>
              <span class="text-xs text-muted truncate">{{ user?.email }}</span>
            </template>
            <template #trailing>
              <AkIconButton
                variant="ghost"
                size="sm"
                label="Sair"
                icon="logout-outline"
                @click="logout"
              />
            </template>
          </AkListRow>
        </AkList>
      </section>

      <section>
        <AkSectionHeader title="Dados" />
        <AkList>
          <AkListRow
            interactive
            padding="md"
            @click="exportJSON"
          >
            <AkIcon
              name="upload-outline"
              :size="20"
              class="text-accent"
            />
            <span class="text-sm font-semibold">Exportar dados</span>
            <template #subtitle>
              <span class="text-xs text-muted">Baixar hábitos e progresso em JSON</span>
            </template>
            <template #trailing>
              <AkIcon
                name="caret-right-outline"
                :size="16"
                class="text-muted"
              />
            </template>
          </AkListRow>
          <AkListRow
            padding="md"
            :divider="false"
            interactive
            @click="importInput?.click()"
          >
            <AkIcon
              name="download-outline"
              :size="20"
              class="text-accent"
            />
            <span class="text-sm font-semibold">Importar dados</span>
            <template #subtitle>
              <span class="text-xs text-muted">Mesclar de um arquivo JSON</span>
            </template>
            <template #trailing>
              <AkIcon
                name="caret-right-outline"
                :size="16"
                class="text-muted"
              />
            </template>
          </AkListRow>
        </AkList>
        <input
          ref="importInput"
          type="file"
          accept=".json"
          class="sr-only"
          @change="handleImport"
        >
      </section>
    </div>

    <AkSheet
      :open="!!confirmDeleteId"
      title="Excluir hábito"
      close-label="Fechar"
      @update:open="closeConfirmDelete"
    >
      <div class="form-stack">
        <p class="text-sm text-muted">
          Tem certeza? Isso vai excluir o hábito e <strong>todo o histórico</strong> permanentemente.
        </p>
        <div class="form-actions">
          <AkButton
            variant="secondary"
            block
            @click="confirmDeleteId = null"
          >
            Cancelar
          </AkButton>
          <AkButton
            variant="danger"
            block
            @click="handleDelete"
          >
            <template #icon>
              <AkIcon
                name="trash-outline"
                :size="16"
              />
            </template>
            Excluir
          </AkButton>
        </div>
      </div>
    </AkSheet>

    <AkSheet
      v-model:open="isModalOpen"
      :title="modalTitle"
      close-label="Fechar"
    >
      <HabitForm
        :key="modalKey"
        :habit="editingHabit"
        @submit="handleSubmit"
        @cancel="isModalOpen = false"
      />
    </AkSheet>
  </div>
</template>

<style scoped>
.empty-wrap--compact {
  padding: var(--space-8) 0;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.opacity-muted {
  opacity: 0.72;
}
</style>
