<script setup lang="ts">
import { computed } from 'vue'
import { getPriceColor } from '@/composables'
import { formatPrice, CRYPTO_PAIRS } from '@/services/binanceService'
import type { TickerData } from '@/types'

const props = defineProps<{
  tickers: TickerData[]
}>()

// Double the items for seamless loop animation
const tickerItems = computed(() => {
  if (props.tickers.length === 0) return []
  // Create pairs with display names
  return [...props.tickers, ...props.tickers].map((ticker) => {
    const pair = CRYPTO_PAIRS.find((p) => p.symbol === ticker.symbol)
    return {
      ...ticker,
      displayName: pair?.baseAsset || ticker.symbol.toUpperCase(),
    }
  })
})

// Calculate animation duration based on number of items
const animationDuration = computed(() => {
  return `${props.tickers.length * 3}s`
})

function getColor(change: number): string {
  return getPriceColor(change)
}
</script>

<template>
  <div class="ticker-wrapper">
    <div class="ticker-track" :style="{ animationDuration }">
      <div v-for="(item, index) in tickerItems" :key="`${item.symbol}-${index}`" class="ticker-item">
        <span class="ticker-symbol">{{ item.displayName }}</span>
        <span class="ticker-price">${{ formatPrice(item.price, item.symbol) }}</span>
        <span class="ticker-change" :style="{ color: getColor(item.priceChangePercent) }">
          {{ item.priceChangePercent >= 0 ? '+' : ''
          }}{{ item.priceChangePercent.toFixed(2) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker-wrapper {
  width: 100%;
  overflow: hidden;
  background: linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  border-bottom: 1px solid #334155;
  padding: 0.75rem 0;
}

.ticker-track {
  display: flex;
  gap: 2rem;
  animation: scroll linear infinite;
  width: max-content;
}

@keyframes scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  padding: 0 1rem;
}

.ticker-symbol {
  font-weight: 600;
  color: #f1f5f9;
  font-size: 0.875rem;
}

.ticker-price {
  color: #cbd5e1;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}

.ticker-change {
  font-size: 0.75rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* Pause animation on hover */
.ticker-wrapper:hover .ticker-track {
  animation-play-state: paused;
}
</style>
