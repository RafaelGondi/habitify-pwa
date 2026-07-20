<script setup lang="ts">
const { mode } = useAppTheme()

useHead(() => ({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    {
      name: 'theme-color',
      content: HABITIFY_THEME_COLORS[mode.value],
    },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
  ],
  htmlAttrs: {
    lang: 'pt-BR',
    'data-mood': 'app',
    'data-accent': 'evergreen',
    'data-theme': mode.value,
  },
}))

useSeoMeta({
  title: 'Habitify',
  description: 'Acompanhe seus hábitos diários',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToastHost />
</template>
