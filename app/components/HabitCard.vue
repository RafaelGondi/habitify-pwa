<script setup lang="ts">
import type { HabitWithStatus } from '~/types'

defineProps<{
  item: HabitWithStatus
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3 rounded-xl transition-opacity"
    :class="item.completed ? 'opacity-55' : ''"
  >
    <!-- Emoji -->
    <div class="text-2xl w-11 h-11 flex items-center justify-center rounded-2xl bg-elevated shrink-0">
      {{ item.habit.emoji }}
    </div>

    <!-- Name + recurrence -->
    <div class="flex-1 min-w-0">
      <p
        class="font-medium text-base truncate transition-colors"
        :class="item.completed ? 'line-through text-muted' : 'text-default'"
      >
        {{ item.habit.name }}
      </p>
      <p class="text-xs text-muted mt-0.5">{{ recurrenceLabel(item.habit.recurrence.type) }}</p>
    </div>

    <!-- Check button -->
    <button
      class="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shrink-0 active:scale-90"
      :class="item.completed
        ? 'bg-primary border-primary'
        : 'border-accented hover:border-primary/60'"
      @click="$emit('toggle')"
    >
      <UIcon
        v-if="item.completed"
        name="i-lucide-check"
        class="text-white text-sm"
      />
    </button>
  </div>
</template>
