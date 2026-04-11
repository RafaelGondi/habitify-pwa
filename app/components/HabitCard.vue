<script setup lang="ts">
import type { HabitWithStatus } from '~/types'
import { getHabitColor } from '~/utils/colors'

const props = defineProps<{
  item: HabitWithStatus
  // editable: interactive check (today + past), past: read-only ✓/✗, future: dashed dot
  mode?: 'editable' | 'past' | 'future'
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

function handleToggle() {
  if (!props.item.completed && 'vibrate' in navigator) {
    const result = navigator.vibrate([100, 30, 80])
    console.log('[haptic] vibrate result:', result)
  }
  emit('toggle')
}
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3 rounded-xl"
    :class="[
      item.completed && mode !== 'future' ? 'opacity-55' : '',
      item.skipped ? 'opacity-40' : '',
    ]"
  >
    <!-- Emoji + Name (tappable for detail) -->
    <button class="flex items-center gap-3 flex-1 min-w-0 text-left" @click="$emit('detail')">
    <div
      class="text-2xl w-11 h-11 flex items-center justify-center rounded-2xl shrink-0"
      :style="{ backgroundColor: mode === 'future' ? undefined : habitColor.light }"
      :class="mode === 'future' ? 'bg-elevated/50' : ''"
    >
      {{ item.habit.emoji }}
    </div>

    <!-- Name + streak -->
    <div class="flex-1 min-w-0">
      <p
        class="font-medium text-base truncate"
        :class="[
          item.completed && mode !== 'future' ? 'line-through text-muted' : 'text-default',
          mode === 'future' ? 'text-muted' : '',
        ]"
      >
        {{ item.habit.name }}
      </p>
      <div v-if="streak >= 1 && mode !== 'future'" class="flex items-center gap-2 mt-0.5">
        <span class="text-xs text-muted flex items-center gap-0.5">
          <span>🔥</span>
          <span>{{ streak }} dia{{ streak !== 1 ? 's' : '' }}</span>
        </span>
        <span
          v-if="item.weeklyProgress"
          class="text-xs font-medium px-1.5 py-0.5 rounded-full"
          :class="item.weeklyProgress.done >= item.weeklyProgress.total
            ? 'bg-primary/15 text-primary'
            : 'bg-elevated text-muted'"
        >
          {{ item.weeklyProgress.done }}/{{ item.weeklyProgress.total }} sem.
        </span>
      </div>
      <span
        v-else-if="item.weeklyProgress && mode !== 'future'"
        class="text-xs font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
        :class="item.weeklyProgress.done >= item.weeklyProgress.total
          ? 'bg-primary/15 text-primary'
          : 'bg-elevated text-muted'"
      >
        {{ item.weeklyProgress.done }}/{{ item.weeklyProgress.total }} sem.
      </span>
    </div>

    </button>

    <!-- Editable: check + optional skip + note -->
    <div v-if="isEditable" class="flex items-center gap-1.5 shrink-0">
      <!-- Note button (only when completed) -->
      <button
        v-if="item.completed"
        class="h-7 w-7 rounded-full flex items-center justify-center transition-all active:scale-90"
        @click="$emit('openNote')"
      >
        <UIcon
          name="i-lucide-sticky-note"
          class="text-sm"
          :class="item.note ? 'text-primary' : 'text-muted/50'"
        />
      </button>

      <!-- Skip button (only when canSkip or already skipped) -->
      <button
        v-if="item.canSkip || item.skipped"
        class="h-7 px-2 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1"
        :class="item.skipped
          ? 'bg-elevated text-muted border border-default'
          : 'bg-elevated/60 text-muted hover:bg-elevated border border-dashed border-muted/50'"
        @click="$emit('skip')"
      >
        <UIcon :name="item.skipped ? 'i-lucide-undo-2' : 'i-lucide-forward'" class="text-xs" />
        <span>{{ item.skipped ? 'desfazer' : 'skip' }}</span>
      </button>

      <!-- Check circle (hidden when skipped) -->
      <button
        v-if="!item.skipped"
        class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 active:scale-90"
        :class="item.completed
          ? 'bg-primary border-primary'
          : 'border-accented hover:border-primary/60'"
        @click="handleToggle"
      >
        <UIcon v-if="item.completed" name="i-lucide-check" class="text-white text-sm" />
      </button>
    </div>

    <!-- Past: static ✓ or ✗ -->
    <div
      v-else-if="mode === 'past'"
      class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      :class="item.completed ? 'bg-primary/15' : 'bg-elevated'"
    >
      <UIcon
        :name="item.completed ? 'i-lucide-check' : 'i-lucide-x'"
        class="text-sm"
        :class="item.completed ? 'text-primary' : 'text-muted'"
      />
    </div>

    <!-- Future: dashed planned indicator -->
    <div
      v-else-if="mode === 'future'"
      class="w-9 h-9 rounded-full border-2 border-dashed border-muted/40 flex items-center justify-center shrink-0"
    >
      <div class="w-2 h-2 rounded-full bg-muted/40" />
    </div>
  </div>
</template>
