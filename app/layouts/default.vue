<template>
  <div class="flex flex-col bg-zinc-100 dark:bg-zinc-900" style="height: 100dvh; max-width: 480px; margin: 0 auto">
    <!-- overflow-hidden so index.vue can own its own swipe/scroll -->
    <main class="flex-1 overflow-hidden min-h-0">
      <slot />
    </main>
    <AppBottomNav />
  </div>
</template>
