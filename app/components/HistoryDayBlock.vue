<script setup lang="ts">
import type { DayRecord } from '~/types'

const props = defineProps<{
  day: DayRecord
  defaultExpanded?: boolean
}>()

const isExpanded = ref(props.defaultExpanded ?? false)
const activeHabits = computed(() => props.day.habits.filter(h => !h.skipped))
const completedCount = computed(() => activeHabits.value.filter(h => h.completed).length)
const pct = computed(() => Math.round(props.day.completionRate * 100))
</script>

<template>
  <div class="mb-2 rounded-2xl border border-default overflow-hidden">
    <!-- Header -->
    <button
      class="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-elevated/50"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <span class="font-semibold text-sm">{{ formatDateLabel(day.date) }}</span>
        <span
          class="text-xs px-1.5 py-0.5 rounded-full font-medium"
          :class="day.completionRate === 1
            ? 'bg-primary/15 text-primary'
            : 'bg-elevated text-muted'"
        >
          {{ pct }}%
        </span>
      </div>
      <div class="flex items-center gap-2 text-muted">
        <span class="text-xs">{{ completedCount }}/{{ activeHabits.length }}</span>
        <UIcon
          :name="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-sm"
        />
      </div>
    </button>

    <!-- Habits list -->
    <Transition
      enter-active-class="transition-all duration-200 overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-screen opacity-100"
      leave-active-class="transition-all duration-150 overflow-hidden"
      leave-from-class="max-h-screen opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="isExpanded" class="border-t border-default">
        <div
          v-for="item in day.habits"
          :key="item.habit.id"
          class="flex items-center gap-3 px-4 py-2.5"
          :class="{ 'border-t border-default/50': day.habits.indexOf(item) > 0 }"
        >
          <span class="text-lg" :class="item.skipped ? 'opacity-40' : ''">{{ item.habit.emoji }}</span>
          <span
            class="flex-1 text-sm"
            :class="item.skipped
              ? 'text-muted/60 italic'
              : item.completed ? 'text-default' : 'text-muted line-through'"
          >
            {{ item.habit.name }}
          </span>
          <UIcon
            v-if="item.skipped"
            name="i-lucide-forward"
            class="text-base shrink-0 text-amber-400"
          />
          <UIcon
            v-else
            :name="item.completed ? 'i-lucide-check-circle-2' : 'i-lucide-circle'"
            class="text-base shrink-0"
            :class="item.completed ? 'text-primary' : 'text-muted'"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
