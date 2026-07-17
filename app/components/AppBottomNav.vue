<script setup lang="ts">
import type { CuidaIconName } from '@rafael_dias/akoma'

const route = useRoute()
const router = useRouter()

const tabs: { value: string; icon: CuidaIconName; label: string }[] = [
  { value: '/', icon: 'check-circle-outline', label: 'Hoje' },
  { value: '/history', icon: 'chart-column-outline', label: 'Progresso' },
  { value: '/settings', icon: 'list-outline', label: 'Hábitos' },
]

const active = computed({
  get: () => route.path,
  set: (path: string) => {
    if (path !== route.path) router.push(path)
  },
})
</script>

<template>
  <AkTabBar v-model="active">
    <AkTabBarItem
      v-for="tab in tabs"
      :key="tab.value"
      :value="tab.value"
      :label="tab.label"
      :icon="tab.icon"
    />
  </AkTabBar>
</template>
