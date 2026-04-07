<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
}>()

const emit = defineEmits<{ 'update:open': [boolean] }>()

function close() {
  emit('update:open', false)
}

// Swipe down to close
let startY = 0
let isDragging = false

function onHandleTouchStart(e: TouchEvent) {
  startY = e.touches[0].clientY
  isDragging = true
}

function onHandleTouchEnd(e: TouchEvent) {
  if (!isDragging) return
  isDragging = false
  const dy = e.changedTouches[0].clientY - startY
  if (dy > 60) close()
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="bs-backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/50"
        @click="close"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="bs-slide">
      <div
        v-if="open"
        class="fixed bottom-0 z-50 w-full rounded-t-3xl flex flex-col shadow-2xl"
        style="
          background-color: var(--ui-bg);
          max-width: 480px;
          left: 50%;
          transform: translateX(-50%);
          max-height: 92dvh;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        "
      >
        <!-- Drag handle -->
        <div
          class="flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing"
          @touchstart="onHandleTouchStart"
          @touchend="onHandleTouchEnd"
        >
          <div class="w-10 h-1 rounded-full bg-muted/40" />
        </div>

        <!-- Header -->
        <div v-if="title" class="flex items-center justify-between px-5 pb-3 shrink-0">
          <h2 class="font-bold text-lg truncate pr-4">{{ title }}</h2>
          <button
            class="w-8 h-8 rounded-full bg-elevated flex items-center justify-center text-muted hover:text-default transition-colors shrink-0"
            @click="close"
          >
            <UIcon name="i-lucide-x" class="text-sm" />
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-y-auto flex-1">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bs-backdrop-enter-active,
.bs-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.bs-backdrop-enter-from,
.bs-backdrop-leave-to {
  opacity: 0;
}

.bs-slide-enter-active,
.bs-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.bs-slide-enter-from,
.bs-slide-leave-to {
  transform: translateX(-50%) translateY(100%);
}
</style>
