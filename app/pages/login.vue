<script setup lang="ts">
definePageMeta({ layout: false })

const { user, authReady, loginWithGoogle } = useAuth()
const loading = ref(false)
const error = ref('')

watchEffect(() => {
  if (authReady.value && user.value) navigateTo('/')
})

useAppTheme()

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await loginWithGoogle()
  }
  catch (e: any) {
    if (e.code !== 'auth/popup-closed-by-user') {
      error.value = 'Erro ao entrar. Tente novamente.'
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <AkAmbientBg contained />
    <div class="login-panel">
      <div class="login-intro">
        <div class="login-mark">✅</div>
        <div>
          <span class="page-label">Rotina diária</span>
          <h1 class="page-title" style="max-width: none; font-size: clamp(32px, 7vw, 40px)">Habitify</h1>
          <p class="text-sm text-muted">Acompanhe seus hábitos com clareza</p>
        </div>
      </div>

      <div class="login-actions">
        <AkButton block size="lg" :loading="loading" @click="handleLogin">
          <template v-if="!loading" #icon>
            <svg viewBox="0 0 24 24" class="google-icon" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </template>
          {{ loading ? 'Entrando...' : 'Entrar com Google' }}
        </AkButton>
        <p v-if="error" class="text-xs text-danger text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-intro {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

.google-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.text-center {
  text-align: center;
}
</style>
