<script setup lang="ts">
import type { Habit, HabitRecurrence, RecurrenceType, WeekDay } from '~/types'

const props = defineProps<{
  habit?: Habit
}>()

const emit = defineEmits<{
  submit: [data: Omit<Habit, 'id' | 'createdAt' | 'order'>]
  cancel: []
}>()

const EMOJIS = [
  '🏃', '🏋️', '🚴', '🧘', '🏊', '🤸', '🚶', '💪',
  '💧', '🥗', '🥤', '🍎', '☕', '🫖', '🍵', '🥦',
  '📚', '📖', '✍️', '🧠', '🎓', '💡', '📝', '🎯',
  '🎨', '🎵', '🎸', '🎹', '📷', '🎬', '🎭', '🖼️',
  '😴', '🛌', '💊', '🦷', '🧴', '🧹', '🛁', '🌿',
  '💻', '📱', '📊', '💼', '📅', '⏰', '✅', '📧',
  '🌅', '🌙', '🌻', '🌱', '🌊', '⛅', '🏔️', '🌺',
  '❤️', '🐕', '🐱', '🏡', '🤝', '🙏', '😊', '🎉',
  '🐾', '🦴', '🐶', '🐩', '🐇', '🐹', '🦜', '🐠',
]

const RECURRENCE_OPTIONS: Array<{ value: RecurrenceType, label: string }> = [
  { value: 'daily', label: 'Todo dia' },
  { value: 'weekdays', label: 'Dias úteis' },
  { value: 'weekends', label: 'Fim de semana' },
  { value: 'weekly_x', label: 'X vezes/semana' },
  { value: 'custom', label: 'Personalizado' },
]

const DAYS: Array<{ value: WeekDay, label: string }> = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sab' },
]

const name = ref(props.habit?.name ?? '')
const emoji = ref(props.habit?.emoji ?? '🎯')
const recurrenceType = ref<RecurrenceType>(props.habit?.recurrence.type ?? 'daily')
const customDays = ref<WeekDay[]>([...(props.habit?.recurrence.days ?? [])])
const timesPerWeek = ref<number>(props.habit?.recurrence.timesPerWeek ?? 3)
const error = ref('')

function toggleDay(day: WeekDay) {
  if (customDays.value.includes(day)) {
    customDays.value = customDays.value.filter(d => d !== day)
  }
  else {
    customDays.value = [...customDays.value, day].sort((a, b) => a - b) as WeekDay[]
  }
}

function handleSubmit() {
  if (!name.value.trim()) {
    error.value = 'O nome é obrigatório'
    return
  }
  if (recurrenceType.value === 'custom' && customDays.value.length === 0) {
    error.value = 'Selecione pelo menos um dia'
    return
  }
  error.value = ''

  const recurrence: HabitRecurrence = {
    type: recurrenceType.value,
    ...(recurrenceType.value === 'custom' ? { days: customDays.value } : {}),
    ...(recurrenceType.value === 'weekly_x' ? { timesPerWeek: timesPerWeek.value } : {}),
  }

  emit('submit', {
    name: name.value.trim(),
    emoji: emoji.value,
    recurrence,
  })
}
</script>

<template>
  <form class="flex flex-col gap-5 p-4" @submit.prevent="handleSubmit">
    <!-- Name -->
    <div>
      <label class="block text-sm font-medium mb-1.5 text-default">Nome do hábito</label>
      <UInput
        v-model="name"
        placeholder="Ex: Beber 2L de água"
        size="lg"
        autofocus
      />
    </div>

    <!-- Emoji picker -->
    <div>
      <label class="block text-sm font-medium mb-1.5 text-default">Ícone</label>
      <div class="grid grid-cols-8 gap-1 max-h-36 overflow-y-auto rounded-xl border border-default bg-background p-2">
        <button
          v-for="e in EMOJIS"
          :key="e"
          type="button"
          class="h-9 w-9 rounded-lg flex items-center justify-center text-xl transition-colors"
          :class="emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-elevated'"
          @click="emoji = e"
        >
          {{ e }}
        </button>
      </div>
    </div>

    <!-- Recurrence -->
    <div>
      <label class="block text-sm font-medium mb-1.5 text-default">Recorrência</label>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="opt in RECURRENCE_OPTIONS"
          :key="opt.value"
          type="button"
          class="h-10 rounded-xl text-sm font-medium transition-colors"
          :class="recurrenceType === opt.value
            ? 'bg-primary text-white'
            : 'bg-elevated text-default hover:bg-accented'"
          @click="recurrenceType = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Times per week picker -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="recurrenceType === 'weekly_x'">
        <label class="block text-sm font-medium mb-1.5 text-default">Quantas vezes por semana?</label>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-10 h-10 rounded-xl bg-elevated text-lg font-bold flex items-center justify-center hover:bg-accented transition-colors disabled:opacity-30"
            :disabled="timesPerWeek <= 1"
            @click="timesPerWeek = Math.max(1, timesPerWeek - 1)"
          >
            −
          </button>
          <div class="flex-1 text-center">
            <span class="text-3xl font-bold text-primary">{{ timesPerWeek }}</span>
            <span class="text-sm text-muted ml-1">{{ timesPerWeek === 1 ? 'vez' : 'vezes' }}</span>
          </div>
          <button
            type="button"
            class="w-10 h-10 rounded-xl bg-elevated text-lg font-bold flex items-center justify-center hover:bg-accented transition-colors disabled:opacity-30"
            :disabled="timesPerWeek >= 7"
            @click="timesPerWeek = Math.min(7, timesPerWeek + 1)"
          >
            +
          </button>
        </div>
      </div>
    </Transition>

    <!-- Custom days -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="recurrenceType === 'custom'">
        <label class="block text-sm font-medium mb-1.5 text-default">Dias da semana</label>
        <div class="flex gap-1">
          <button
            v-for="day in DAYS"
            :key="day.value"
            type="button"
            class="flex-1 h-9 rounded-xl text-xs font-semibold transition-colors"
            :class="customDays.includes(day.value)
              ? 'bg-primary text-white'
              : 'bg-elevated text-muted hover:bg-accented'"
            @click="toggleDay(day.value)"
          >
            {{ day.label }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Error -->
    <p v-if="error" class="text-sm text-red-500 -mt-2">
      {{ error }}
    </p>

    <!-- Actions -->
    <div class="flex gap-3 pt-1">
      <UButton
        type="button"
        variant="ghost"
        color="neutral"
        class="flex-1"
        @click="$emit('cancel')"
      >
        Cancelar
      </UButton>
      <UButton
        type="submit"
        class="flex-1"
      >
        {{ habit ? 'Salvar' : 'Criar hábito' }}
      </UButton>
    </div>
  </form>
</template>
