<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useTransition } from '@vueuse/core'
import { usePriceColor } from '@/composables'
import { formatPrice, formatVolume, getPairBySymbol } from '@/services/binanceService'
import type { TickerData } from '@/types'

const props = defineProps<{
  ticker: TickerData
  isSelected?: boolean
}>()

const emit = defineEmits<{
  select: [symbol: string]
}>()

// Get pair display info
const pairInfo = computed(() => getPairBySymbol(props.ticker.symbol))

// Use transition for smooth price animation
const priceSource = computed(() => props.ticker.price)
const transitionedPrice = useTransition(priceSource, {
  duration: 300,
})

// Format the transitioned price
const displayPrice = computed(() => {
  return formatPrice(transitionedPrice.value, props.ticker.symbol)
})

// Price change percentage as a ref for the composable
const priceChangePercent = toRef(() => props.ticker.priceChangePercent)

// Get dynamic colors using the composable
const { priceColor, textColor, bgColor } = usePriceColor(priceChangePercent)

// Format change percent
const changePercentDisplay = computed(() => {
  const sign = props.ticker.priceChangePercent >= 0 ? '+' : ''
  return `${sign}${props.ticker.priceChangePercent.toFixed(2)}%`
})

// Format volume
const volumeDisplay = computed(() => formatVolume(props.ticker.volume))

// Flash effect on price update
const isFlashing = ref(false)
let flashTimeout: number | null = null

// Watch for price changes to trigger flash
const lastPrice = ref(props.ticker.price)
const priceDirection = computed(() => {
  if (props.ticker.price > lastPrice.value) return 'up'
  if (props.ticker.price < lastPrice.value) return 'down'
  return 'neutral'
})

function handleClick() {
  emit('select', props.ticker.symbol)
}
</script>

<template>
  <div
    class="price-card"
    :class="{ selected: isSelected, flashing: isFlashing }"
    @click="handleClick"
  >
    <div class="card-header">
      <span class="symbol">{{ pairInfo?.baseAsset || ticker.symbol.toUpperCase() }}</span>
      <span class="pair-suffix">/{{ pairInfo?.quoteAsset || 'USDT' }}</span>
    </div>

    <div class="price-section">
      <span class="price">${{ displayPrice }}</span>
      <span class="change" :class="priceDirection">
        {{ changePercentDisplay }}
      </span>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-label">24h High</span>
        <span class="stat-value">${{ formatPrice(ticker.high, ticker.symbol) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">24h Low</span>
        <span class="stat-value">${{ formatPrice(ticker.low, ticker.symbol) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Volume</span>
        <span class="stat-value">{{ volumeDisplay }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.price-card {
  background: v-bind(bgColor);
  border: 1px solid v-bind(priceColor);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.price-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.price-card.selected {
  border-width: 2px;
  box-shadow: 0 0 20px v-bind(priceColor);
}

.price-card.flashing::after {
  content: '';
  position: absolute;
  inset: 0;
  background: v-bind(priceColor);
  opacity: 0.2;
  animation: flash 0.3s ease-out;
}

@keyframes flash {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 0;
  }
}

.card-header {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.symbol {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f1f5f9;
}

.pair-suffix {
  font-size: 0.875rem;
  color: #64748b;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
}

.change {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.change.up {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.15);
}

.change.down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.change.neutral {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.15);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 0.75rem;
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
}
</style>
