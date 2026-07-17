<script setup lang="ts">
const route = useRoute()

const tabs = [
  { to: '/', icon: 'lucide:circle-check', label: 'Hoje' },
  { to: '/history', icon: 'lucide:chart-no-axes-column-increasing', label: 'Progresso' },
  { to: '/settings', icon: 'lucide:list-checks', label: 'Hábitos' }
]
</script>

<template>
  <nav
    class="bottom-nav"
    aria-label="Navegação principal"
  >
    <div class="bottom-nav__inner">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="bottom-nav__tab"
        :class="{ 'bottom-nav__tab--active': route.path === tab.to }"
      >
        <AppIcon
          :name="tab.icon"
          :size="20"
        />
        <span class="bottom-nav__label">{{ tab.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding:
    var(--space-2)
    var(--page-pad-x)
    calc(var(--space-2) + var(--safe-bottom));
  max-width: var(--shell-max);
  margin: 0 auto;
  background: var(--nav-glass);
  border-top: 1px solid var(--border);
  box-shadow: var(--shadow-nav);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.bottom-nav__inner {
  display: flex;
  gap: var(--space-2);
}

.bottom-nav__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 7px 4px;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  transition:
    color var(--transition),
    background-color var(--transition);
  min-width: 0;
}

.bottom-nav__tab--active {
  background: var(--accent-soft);
  color: var(--accent);
}

.bottom-nav__label {
  font-size: 11px;
  font-weight: 650;
}
</style>
