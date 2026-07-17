<script setup lang="ts">
import { Icon } from '@iconify/vue'

withDefaults(defineProps<{
  name: string
  size?: number | string
}>(), {
  size: 20,
})
</script>

<template>
  <Icon :icon="name" :width="size" :height="size" aria-hidden="true" class="app-icon" />
</template>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
