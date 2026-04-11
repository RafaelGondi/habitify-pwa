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

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    noteValue.value = props.note ?? ''
    nextTick(() => textareaRef.value?.focus())
  }
})

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
        Adicione uma nota sobre como foi realizar este hábito hoje.
      </p>

      <UTextarea
        v-model="noteValue"
        ref="textareaRef"
        placeholder="Ex: Tomei o remédio com o café da manhã..."
        :rows="3"
        :maxlength="280"
        autofocus
      />

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
          Salvar
        </UButton>
      </div>
    </div>
  </AppBottomSheet>
</template>
