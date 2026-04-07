<script setup lang="ts">
const { days, hasMore, loadMore } = useHistoryDays()
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-default px-4" style="padding-top: env(safe-area-inset-top, 0px)">
      <div class="flex items-center h-14">
        <h1 class="font-bold text-lg">Histórico</h1>
      </div>
    </header>

    <!-- Days -->
    <div v-if="days.length" class="flex-1 px-4 pt-4 pb-6">
      <HistoryDayBlock
        v-for="(day, index) in days"
        :key="day.date"
        :day="day"
        :default-expanded="index < 3"
      />

      <!-- Load more -->
      <div v-if="hasMore" class="text-center pt-2">
        <UButton variant="ghost" color="neutral" @click="loadMore">
          Carregar mais dias
        </UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
      <div class="text-5xl mb-4">📅</div>
      <h2 class="font-bold text-lg mb-1">Nenhum histórico ainda</h2>
      <p class="text-sm text-muted leading-relaxed">
        Os hábitos concluídos dos dias anteriores aparecerão aqui
      </p>
    </div>
  </div>
</template>
