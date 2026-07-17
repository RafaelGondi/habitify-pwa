<script setup lang="ts">
import type { Habit, HabitPeriod, HabitRecurrence, RecurrenceType, WeekDay } from '~/types'
import { DEFAULT_COLOR, HABIT_COLORS } from '~/utils/colors'
import { PERIOD_OPTIONS } from '~/utils/periods'

function togglePeriod(value: HabitPeriod) {
  if (periods.value.includes(value)) {
    periods.value = periods.value.filter(p => p !== value)
  }
  else {
    periods.value = [...periods.value, value]
  }
}

const props = defineProps<{
  habit?: Habit
}>()

const emit = defineEmits<{
  submit: [data: Omit<Habit, 'id' | 'order'>]
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
  '💰', '💵', '💳', '🏦', '📈', '🪙', '💹', '🤑',
  '💉', '🩺', '🩹', '🩻', '🩸', '🧪', '🫁', '🫀',
  '🤧', '😷', '🧴', '🩷', '🧬', '🔬', '🏥',
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
const color = ref(props.habit?.color ?? DEFAULT_COLOR)
const periods = ref<HabitPeriod[]>(props.habit?.periods ?? [])
const recurrenceType = ref<RecurrenceType>(props.habit?.recurrence.type ?? 'daily')
const customDays = ref<WeekDay[]>([...(props.habit?.recurrence.days ?? [])])
const timesPerWeek = ref<number>(props.habit?.recurrence.timesPerWeek ?? 3)
const startDate = ref<string>(
  props.habit?.createdAt
    ? props.habit.createdAt.slice(0, 10)
    : toDateString(new Date()),
)
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
    color: color.value,
    periods: periods.value.length ? periods.value : undefined,
    recurrence,
    createdAt: new Date(startDate.value + 'T12:00:00').toISOString(),
  })
}
</script>

<template>
  <form class="form-stack" @submit.prevent="handleSubmit">
    <AkInput
      v-model="name"
      label="Nome do hábito"
      placeholder="Ex: Beber 2L de água"
      size="lg"
    />

    <div>
      <p class="text-sm font-semibold" style="margin-bottom: 7px">Ícone</p>
      <div class="emoji-grid">
        <button
          v-for="e in EMOJIS"
          :key="e"
          type="button"
          class="emoji-cell tap-scale"
          :class="{ 'emoji-cell--active': emoji === e }"
          @click="emoji = e"
        >
          {{ e }}
        </button>
      </div>
    </div>

    <div>
      <p class="text-sm font-semibold" style="margin-bottom: 7px">Cor</p>
      <div class="color-row">
        <button
          v-for="c in HABIT_COLORS"
          :key="c.id"
          type="button"
          class="color-swatch tap-scale"
          :class="{ 'color-swatch--active': color === c.id }"
          :style="{ backgroundColor: c.hex }"
          :aria-label="c.label"
          @click="color = c.id"
        />
      </div>
    </div>

    <div>
      <p class="text-sm font-semibold" style="margin-bottom: 7px">Turno prioritário</p>
      <div class="toggle-grid">
        <AkChip
          v-for="option in PERIOD_OPTIONS"
          :key="option.value"
          :active="periods.includes(option.value)"
          @click="togglePeriod(option.value)"
        >
          {{ option.label }}
        </AkChip>
      </div>
      <p class="text-xs text-muted" style="margin-top: var(--space-2)">
        Sem seleção = qualquer horário. Pode selecionar mais de um turno.
      </p>
    </div>

    <div>
      <p class="text-sm font-semibold" style="margin-bottom: 7px">Recorrência</p>
      <div class="toggle-grid">
        <AkChip
          v-for="opt in RECURRENCE_OPTIONS"
          :key="opt.value"
          :active="recurrenceType === opt.value"
          @click="recurrenceType = opt.value"
        >
          {{ opt.label }}
        </AkChip>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="recurrenceType === 'weekly_x'">
        <p class="text-sm font-semibold" style="margin-bottom: 7px">Quantas vezes por semana?</p>
        <div class="counter-row">
          <AkButton
            type="button"
            variant="secondary"
            size="sm"
            :disabled="timesPerWeek <= 1"
            @click="timesPerWeek = Math.max(1, timesPerWeek - 1)"
          >
            −
          </AkButton>
          <div class="counter-value">
            {{ timesPerWeek }}
            <span class="text-sm text-muted">{{ timesPerWeek === 1 ? 'vez' : 'vezes' }}</span>
          </div>
          <AkButton
            type="button"
            variant="secondary"
            size="sm"
            :disabled="timesPerWeek >= 7"
            @click="timesPerWeek = Math.min(7, timesPerWeek + 1)"
          >
            +
          </AkButton>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="recurrenceType === 'custom'">
        <p class="text-sm font-semibold" style="margin-bottom: 7px">Dias da semana</p>
        <div class="toggle-grid toggle-grid--days">
          <AkChip
            v-for="day in DAYS"
            :key="day.value"
            :active="customDays.includes(day.value)"
            @click="toggleDay(day.value)"
          >
            {{ day.label }}
          </AkChip>
        </div>
      </div>
    </Transition>

    <div>
      <p class="text-sm font-semibold" style="margin-bottom: 7px">Início do hábito</p>
      <input
        v-model="startDate"
        type="date"
        class="field-date"
        :max="toDateString(new Date())"
      >
      <p class="text-xs text-muted" style="margin-top: var(--space-2)">
        Defina uma data passada para registrar hábitos retroativamente
      </p>
    </div>

    <p v-if="error" class="text-sm text-danger">{{ error }}</p>

    <div class="form-actions">
      <AkButton type="button" variant="ghost" block @click="$emit('cancel')">
        Cancelar
      </AkButton>
      <AkButton type="submit" block>
        {{ habit ? 'Salvar' : 'Criar hábito' }}
      </AkButton>
    </div>
  </form>
</template>
