<template>
  <div class="flex flex-col" style="height: 100dvh; max-width: 480px; margin: 0 auto">
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
    <AppBottomNav />
  </div>
</template>
