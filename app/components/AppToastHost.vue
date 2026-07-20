<script setup lang="ts">
const { toasts, dismiss } = useAppToast()

function variant(color: string) {
  if (color === 'success') return 'success'
  if (color === 'error') return 'danger'
  return 'neutral'
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite">
      <TransitionGroup name="toast-pop">
        <div
          v-for="item in toasts"
          :key="item.id"
          class="toast-item"
          :class="`toast-item--${item.color}`"
        >
          <AkBadge :variant="variant(item.color)" :label="item.title" />
          <p v-if="item.description" class="toast-item__desc">{{ item.description }}</p>
          <button class="toast-item__close tap-scale" type="button" aria-label="Fechar" @click="dismiss(item.id)">
            <AkIcon name="x-outline" :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  bottom: calc(var(--safe-bottom) + var(--nav-height) + var(--space-4));
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  width: min(calc(var(--shell-max) - var(--space-8)), calc(100vw - var(--space-8)));
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  margin-top: var(--space-2);
  border-radius: var(--radius-md);
  background: var(--toast-bg);
  color: var(--toast-fg);
  box-shadow: var(--shadow-md);
  position: relative;
}

.toast-item__desc {
  font-size: 12px;
  opacity: 0.85;
  padding-right: var(--space-6);
}

.toast-item__close {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  color: inherit;
  opacity: 0.7;
  padding: var(--space-1);
}
</style>
