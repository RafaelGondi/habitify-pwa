<script setup lang="ts">
import type {
  BiweekWeeks,
  Habit,
  HabitPeriod,
  HabitRecurrence,
  MonthWeek,
  RecurrenceType,
  WeekDay,
} from '~/types'
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
  { value: 'biweekly_nth', label: 'Quinzenal' },
  { value: 'monthly_nth', label: 'Mensal' },
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

const MONTH_WEEK_OPTIONS: Array<{ value: MonthWeek, label: string }> = [
  { value: 1, label: '1º' },
  { value: 2, label: '2º' },
  { value: 3, label: '3º' },
  { value: 4, label: '4º' },
  { value: -1, label: 'Último' },
]

const BIWEEK_OPTIONS: Array<{ value: BiweekWeeks, label: string }> = [
  { value: 'first_third', label: '1º e 3º' },
  { value: 'second_fourth', label: '2º e 4º' },
]

function initialNthWeekday(): WeekDay {
  return props.habit?.recurrence.weekday
    ?? props.habit?.recurrence.days?.[0]
    ?? 6
}

function initialRecurrenceType(): RecurrenceType {
  const type = props.habit?.recurrence.type
  if (type === 'biweekly_x') return 'biweekly_nth'
  if (type === 'monthly_x') return 'monthly_nth'
  return type ?? 'daily'
}

const name = ref(props.habit?.name ?? '')
const emoji = ref(props.habit?.emoji ?? '🎯')
const color = ref(props.habit?.color ?? DEFAULT_COLOR)
const periods = ref<HabitPeriod[]>(props.habit?.periods ?? [])
const recurrenceType = ref<RecurrenceType>(initialRecurrenceType())
const customDays = ref<WeekDay[]>([...(props.habit?.recurrence.days ?? [])])
const timesPerWeek = ref<number>(props.habit?.recurrence.timesPerWeek ?? 3)
const nthWeekday = ref<WeekDay>(initialNthWeekday())
const weekOfMonth = ref<MonthWeek>(props.habit?.recurrence.weekOfMonth ?? 4)
const biweekWeeks = ref<BiweekWeeks>(props.habit?.recurrence.biweekWeeks ?? 'first_third')
const startDate = ref<string>(
  props.habit?.createdAt
    ? props.habit.createdAt.slice(0, 10)
    : toDateString(new Date()),
)
const error = ref('')

const nthPreview = computed(() => {
  if (recurrenceType.value === 'monthly_nth') {
    return formatRecurrenceSummary({
      recurrence: {
        type: 'monthly_nth',
        weekday: nthWeekday.value,
        weekOfMonth: weekOfMonth.value,
      },
    } as Habit)
  }
  if (recurrenceType.value === 'biweekly_nth') {
    return formatRecurrenceSummary({
      recurrence: {
        type: 'biweekly_nth',
        weekday: nthWeekday.value,
        biweekWeeks: biweekWeeks.value,
      },
    } as Habit)
  }
  return ''
})

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
    ...(recurrenceType.value === 'monthly_nth'
      ? { weekday: nthWeekday.value, weekOfMonth: weekOfMonth.value }
      : {}),
    ...(recurrenceType.value === 'biweekly_nth'
      ? { weekday: nthWeekday.value, biweekWeeks: biweekWeeks.value }
      : {}),
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
      <div v-if="recurrenceType === 'monthly_nth' || recurrenceType === 'biweekly_nth'">
        <p class="text-sm font-semibold" style="margin-bottom: 7px">Dia da semana</p>
        <div class="toggle-grid toggle-grid--days">
          <AkChip
            v-for="day in DAYS"
            :key="day.value"
            :active="nthWeekday === day.value"
            @click="nthWeekday = day.value"
          >
            {{ day.label }}
          </AkChip>
        </div>

        <template v-if="recurrenceType === 'monthly_nth'">
          <p class="text-sm font-semibold" style="margin: var(--space-4) 0 7px">Qual no mês?</p>
          <div class="toggle-grid">
            <AkChip
              v-for="opt in MONTH_WEEK_OPTIONS"
              :key="opt.value"
              :active="weekOfMonth === opt.value"
              @click="weekOfMonth = opt.value"
            >
              {{ opt.label }}
            </AkChip>
          </div>
        </template>

        <template v-else>
          <p class="text-sm font-semibold" style="margin: var(--space-4) 0 7px">Semanas do mês</p>
          <div class="toggle-grid">
            <AkChip
              v-for="opt in BIWEEK_OPTIONS"
              :key="opt.value"
              :active="biweekWeeks === opt.value"
              @click="biweekWeeks = opt.value"
            >
              {{ opt.label }}
            </AkChip>
          </div>
        </template>

        <p class="text-xs text-muted" style="margin-top: var(--space-3)">
          {{ nthPreview }} — se repete todo mês.
        </p>
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
