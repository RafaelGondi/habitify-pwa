<script setup lang="ts">
import type { HabitWithStatus } from '~/types'
import { getHabitColor } from '~/utils/colors'

const props = defineProps<{
  item: HabitWithStatus
  mode?: 'editable' | 'past' | 'future'
  divider?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  detail: []
  skip: []
  openNote: []
}>()

const isEditable = computed(() => !props.mode || props.mode === 'editable')

const { getStreak } = useStreak()
const streak = computed(() => getStreak(props.item.habit))
const habitColor = computed(() => getHabitColor(props.item.habit.color))
const weeklyProgress = computed(() => props.item.weeklyProgress)

const weeklyBadgeVariant = computed(() => {
  const p = weeklyProgress.value
  if (!p) return 'neutral' as const
  if (p.done > p.total) return 'success' as const
  if (p.done >= p.total) return 'accent' as const
  return 'neutral' as const
})

const weeklyBadgeLabel = computed(() => {
  const p = weeklyProgress.value
  if (!p) return ''
  const suffix = p.done > p.total ? '+' : ''
  return `${p.done}/${p.total}${suffix} sem.`
})

const isDimmed = computed(() => props.item.skipped)

function handleToggle(e: Event) {
  e.stopPropagation()
  if (!props.item.completed && 'vibrate' in navigator) {
    navigator.vibrate([100, 30, 80])
  }
  emit('toggle')
}
</script>

<template>
  <AkListRow
    padding="md"
    :divider="divider"
    :class="{ 'habit-row--dimmed': isDimmed }"
  >
    <template #leading>
      <div
        class="habit-emoji"
        :class="{ 'habit-emoji--future': mode === 'future' }"
        :style="mode !== 'future' ? { backgroundColor: habitColor.light } : undefined"
      >
        {{ item.habit.emoji }}
      </div>
    </template>

    <button
      class="habit-row__main"
      type="button"
      :disabled="mode === 'future'"
      @click="emit('detail')"
    >
      <span
        class="habit-row-name"
        :class="{
          'habit-row-name--done': item.completed && mode !== 'future',
          'text-muted': mode === 'future'
        }"
      >
        {{ item.habit.name }}
      </span>
      <span
        v-if="(streak >= 1 || weeklyProgress || item.skipped) && mode !== 'future'"
        class="habit-row-meta"
      >
        <span v-if="streak >= 1">🔥 {{ streak }} dia{{ streak !== 1 ? 's' : '' }}</span>
        <AkBadge
          v-if="weeklyProgress"
          :variant="weeklyBadgeVariant"
          :label="weeklyBadgeLabel"
        />
        <span
          v-if="item.skipped"
          class="text-accent"
        >Pulado</span>
      </span>
    </button>

    <template #trailing>
      <div
        v-if="isEditable"
        class="habit-row-actions"
      >
        <AkIconButton
          variant="ghost"
          size="sm"
          label="Nota"
          @click="emit('openNote')"
        >
          <AppIcon
            name="lucide:sticky-note"
            :size="18"
            :class="item.note ? 'text-accent' : 'text-muted'"
          />
        </AkIconButton>

        <AkIconButton
          v-if="item.canSkip || item.skipped"
          variant="ghost"
          size="sm"
          :label="item.skipped ? 'Desfazer pulo' : 'Pular hoje'"
          @click="emit('skip')"
        >
          <AppIcon
            :name="item.skipped ? 'lucide:undo-2' : 'lucide:forward'"
            :size="16"
          />
        </AkIconButton>

        <button
          v-if="!item.skipped"
          class="check-toggle"
          :class="{ 'check-toggle--on': item.completed }"
          type="button"
          aria-label="Marcar hábito"
          @click="handleToggle"
        >
          <AppIcon
            v-if="item.completed"
            name="lucide:check"
            :size="14"
          />
        </button>
      </div>

      <div
        v-else-if="mode === 'past'"
        class="check-toggle"
        :class="{ 'check-toggle--on': item.completed }"
      >
        <AppIcon
          :name="item.completed ? 'lucide:check' : 'lucide:x'"
          :size="14"
        />
      </div>

      <div
        v-else-if="mode === 'future'"
        class="check-toggle check-toggle--future"
        aria-hidden="true"
      />
    </template>
  </AkListRow>
</template>

<style scoped>
.habit-row__main {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
}

.habit-row__main:disabled {
  cursor: default;
}

.habit-row__main:focus-visible {
  outline: none;
  border-radius: var(--radius-sm);
  box-shadow: var(--focus-ring);
}

.habit-row--dimmed {
  opacity: 0.62;
}
</style>
