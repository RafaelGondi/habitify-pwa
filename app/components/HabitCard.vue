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
const periodProgress = computed(() => props.item.periodProgress)

const periodBadgeVariant = computed(() => {
  const p = periodProgress.value
  if (!p) return 'neutral' as const
  if (p.done > p.total) return 'success' as const
  if (p.done >= p.total) return 'accent' as const
  return 'neutral' as const
})

const periodBadgeLabel = computed(() => {
  const p = periodProgress.value
  if (!p) return ''
  const suffix = p.done > p.total ? '+' : ''
  return `${p.done}/${p.total}${suffix} ${quotaUnitShortLabel(p.unit)}`
})

const isDimmed = computed(() => props.item.skipped)

const showMeta = computed(() =>
  (streak.value >= 1 || periodProgress.value || props.item.skipped) && props.mode !== 'future'
)

function openDetail() {
  if (props.mode !== 'future') emit('detail')
}

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
    class="habit-card-row"
    padding="md"
    :divider="divider"
    :class="{
      'habit-row--dimmed': isDimmed,
      'habit-row--done': item.completed && mode !== 'future',
    }"
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
      class="habit-row__title"
      :class="{ 'habit-row__title--done': item.completed && mode !== 'future' }"
      type="button"
      :disabled="mode === 'future'"
      @click="openDetail"
    >
      {{ item.habit.name }}
    </button>

    <template
      v-if="showMeta"
      #subtitle
    >
      <div class="habit-row-meta">
        <span v-if="streak >= 1">🔥 {{ streak }} dia{{ streak !== 1 ? 's' : '' }}</span>
        <AkBadge
          v-if="periodProgress"
          :variant="periodBadgeVariant"
          :label="periodBadgeLabel"
        />
        <span
          v-if="item.skipped"
          class="text-accent"
        >Pulado</span>
      </div>
    </template>

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
          <AkIcon
            name="document-text-outline"
            :size="16"
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
          <AkIcon
            v-if="item.skipped"
            name="undo-outline"
            :size="15"
          />
          <AppIcon
            v-else
            name="lucide:forward"
            :size="15"
          />
        </AkIconButton>

        <button
          v-if="!item.skipped"
          class="check-toggle"
          :class="{ 'check-toggle--on': item.completed }"
          type="button"
          aria-label="Marcar hábito"
          @click="handleToggle"
        />
      </div>

      <span
        v-else-if="mode === 'past'"
        class="check-toggle check-toggle--readonly"
        :class="{ 'check-toggle--on': item.completed }"
        aria-hidden="true"
      />

      <span
        v-else-if="mode === 'future'"
        class="check-toggle check-toggle--future"
        aria-hidden="true"
      />
    </template>
  </AkListRow>
</template>

<style scoped>
.habit-card-row :deep(.ak-list-row__content) {
  min-width: 0;
  overflow: hidden;
}

.habit-row__title {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 650;
  font-size: 15px;
  letter-spacing: -0.01em;
  text-align: left;
}

.habit-row__title:disabled {
  cursor: default;
  color: var(--text-secondary);
}

.habit-row__title--done {
  color: var(--text-secondary);
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
  text-decoration-color: color-mix(in srgb, var(--text-secondary) 75%, transparent);
}

.habit-row__title:focus-visible {
  outline: none;
  border-radius: var(--radius-sm);
  box-shadow: var(--focus-ring);
}

.habit-row--dimmed .habit-row__title:not(:disabled) {
  color: var(--text-secondary);
}

.habit-row-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.habit-row--done {
  opacity: 0.7;
}

.habit-row--dimmed {
  opacity: 0.55;
}
</style>
