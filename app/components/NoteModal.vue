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
const textareaRef = ref<HTMLTextAreaElement | null>(null)

watch(
  () => [props.open, props.habitName, props.note],
  ([isOpen]) => {
    if (isOpen) {
      noteValue.value = props.note ?? ''
      nextTick(() => textareaRef.value?.focus())
    }
  }
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
    <div class="flex flex-col gap-4 px-5 pt-1 pb-6">
      <p class="text-sm text-muted">
        {{ hasSavedNote ? 'Edite ou revise a nota salva para este hábito hoje.' : 'Adicione uma nota sobre como foi realizar este hábito hoje.' }}
      </p>

      <UTextarea
        v-model="noteValue"
        ref="textareaRef"
        placeholder="Ex: Tomei o remédio com o café da manhã..."
        :rows="3"
        :maxlength="280"
        autofocus
      />

      <p v-if="hasSavedNote && !noteValue" class="text-xs text-muted">
        Esta nota será removida se você salvar o campo vazio.
      </p>

      <div class="flex gap-3">
        <UButton
          variant="ghost"
          color="neutral"
          class="flex-1"
          @click="$emit('update:open', false)"
        >
          Cancelar
        </UButton>
        <UButton class="flex-1" @click="handleSave">
          {{ hasSavedNote ? 'Salvar alterações' : 'Salvar' }}
        </UButton>
      </div>
    </div>
  </AppBottomSheet>
</template>
