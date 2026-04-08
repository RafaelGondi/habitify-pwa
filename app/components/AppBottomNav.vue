<script setup lang="ts">
const route = useRoute()

const tabs = [
  { to: '/', icon: 'i-lucide-sun', label: 'Hoje' },
  { to: '/history', icon: 'i-lucide-calendar-days', label: 'Histórico' },
  { to: '/settings', icon: 'i-lucide-list-checks', label: 'Hábitos' },
]

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <nav class="shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-t border-default">
    <div class="flex max-w-md mx-auto" style="padding-bottom: env(safe-area-inset-bottom, 0px)">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors"
        :class="isActive(tab.to) ? 'text-primary' : 'text-muted hover:text-default'"
      >
        <UIcon :name="tab.icon" class="text-xl" />
        <span class="text-[10px] font-medium">{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
