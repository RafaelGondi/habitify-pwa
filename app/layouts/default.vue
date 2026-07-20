<script setup lang="ts">
const { user, authReady } = useAuth()

watchEffect(() => {
  if (authReady.value && !user.value) navigateTo('/login')
})
</script>

<template>
  <div class="ak-app-root">
    <AkAmbientBg contained />
    <template v-if="authReady && user">
      <main class="ak-app-main">
        <slot />
      </main>
      <AppBottomNav />
    </template>
    <div
      v-else
      class="loader-center"
    >
      <AkIcon
        name="loading-right-outline"
        :size="28"
        class="spin text-accent"
      />
    </div>
  </div>
</template>

<style scoped>
.text-accent {
  color: var(--accent);
}
</style>
