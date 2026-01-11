<script setup lang="ts">
import PriceCard from './PriceCard.vue'
import type { TickerData } from '@/types'

defineProps<{
  tickers: TickerData[]
  selectedSymbol: string
}>()

const emit = defineEmits<{
  select: [symbol: string]
}>()

function handleSelect(symbol: string) {
  emit('select', symbol)
}
</script>

<template>
  <div class="market-grid">
    <PriceCard
      v-for="ticker in tickers"
      :key="ticker.symbol"
      :ticker="ticker"
      :is-selected="ticker.symbol === selectedSymbol"
      @select="handleSelect"
    />
  </div>
</template>

<style scoped>
.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 1200px) {
  .market-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 600px) {
  .market-grid {
    grid-template-columns: 1fr;
  }
}
</style>
