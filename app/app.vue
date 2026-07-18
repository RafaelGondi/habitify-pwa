<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'theme-color', content: '#f8f6f1' },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
  ],
  htmlAttrs: {
    lang: 'pt-BR',
    'data-mood': 'app',
    'data-accent': 'slate',
  },
})

useSeoMeta({
  title: 'Habitify',
  description: 'Acompanhe seus hábitos diários',
})

useAppTheme()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppToastHost />
</template>
