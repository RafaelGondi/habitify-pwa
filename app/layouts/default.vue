<script setup lang="ts">
const { user, authReady } = useAuth()

watchEffect(() => {
  if (authReady.value && !user.value) navigateTo('/login')
})
</script>

<template>
  <div class="flex flex-col bg-white dark:bg-zinc-950" style="height: 100dvh; max-width: 480px; margin: 0 auto">
    <template v-if="authReady && user">
      <main class="flex-1 overflow-hidden min-h-0">
        <slot />
      </main>
      <AppBottomNav />
    </template>
    <div v-else class="flex-1 flex items-center justify-center">
      <UIcon name="i-lucide-loader-circle" class="text-primary text-2xl animate-spin" />
    </div>
  </div>
</template>
