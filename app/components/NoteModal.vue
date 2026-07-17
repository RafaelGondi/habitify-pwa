<script setup lang="ts">
const props = defineProps<{
  open: boolean
  habitName: string
  habitEmoji: string
  note?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [note: string]
}>()

const noteValue = ref(props.note ?? '')

watch(
  () => [props.open, props.note],
  () => {
    if (props.open) noteValue.value = props.note ?? ''
  },
)

const hasSavedNote = computed(() => !!props.note?.trim())

function handleSave() {
  emit('save', noteValue.value.trim())
  emit('update:open', false)
}
</script>

<template>
  <AppBottomSheet
    :open="open"
    :title="`${habitEmoji} ${habitName}`"
    @update:open="$emit('update:open', $event)"
  >
    <div class="form-stack">
      <p class="text-sm text-muted">
        {{ hasSavedNote ? 'Edite ou revise a nota salva para este hábito hoje.' : 'Adicione uma nota sobre como foi realizar este hábito hoje.' }}
      </p>

      <AkTextarea
        v-model="noteValue"
        placeholder="Ex: Tomei o remédio com o café da manhã..."
        :rows="3"
      />

      <p v-if="hasSavedNote && !noteValue" class="text-xs text-muted">
        Esta nota será removida se você salvar o campo vazio.
      </p>

      <div class="form-actions">
        <AkButton variant="ghost" block @click="$emit('update:open', false)">
          Cancelar
        </AkButton>
        <AkButton block @click="handleSave">
          {{ hasSavedNote ? 'Salvar alterações' : 'Salvar' }}
        </AkButton>
      </div>
    </div>
  </AppBottomSheet>
</template>
