import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@vite-pwa/nuxt',
  ],

  ssr: false,

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  vite: {
    resolve: {
      alias: {
        '@sysvale/cuida-icons': path.resolve(
          rootDir,
          'node_modules/@sysvale/cuida-icons/dist/index.js',
        ),
      },
    },
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Habitify',
      short_name: 'Habitify',
      description: 'Acompanhe seus hábitos diários',
      theme_color: '#f8f6f1',
      background_color: '#f8f6f1',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      id: '/',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
    },
  },
})
