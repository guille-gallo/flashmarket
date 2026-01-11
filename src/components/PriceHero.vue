<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useTransition } from '@vueuse/core'
import { usePriceColor } from '@/composables'
import type { TickerData } from '@/types'
import { formatPrice } from '@/services/binanceService'

const props = defineProps<{
  ticker: TickerData | null
}>()

// Animated price transition
const priceSource = computed(() => props.ticker?.price ?? 0)
const transitionedPrice = useTransition(priceSource, { duration: 300 })

// Price color based on change
const priceChangePercent = toRef(() => props.ticker?.priceChangePercent ?? 0)
const { priceColor, textColor } = usePriceColor(priceChangePercent)

// Format displays
const displayPrice = computed(() => {
  if (!props.ticker) return '$0.00'
  return `$${formatPrice(transitionedPrice.value, props.ticker.symbol)}`
})

const changeDisplay = computed(() => {
  if (!props.ticker) return '+0.00%'
  const sign = props.ticker.priceChangePercent >= 0 ? '+' : ''
  return `${sign}${props.ticker.priceChangePercent.toFixed(2)}%`
})

const priceChangeDisplay = computed(() => {
  if (!props.ticker) return '$0.00'
  const sign = props.ticker.priceChange >= 0 ? '+' : ''
  return `${sign}$${formatPrice(Math.abs(props.ticker.priceChange), props.ticker.symbol)}`
})
</script>

<template>
  <div class="price-hero" v-if="ticker">
    <div class="hero-main">
      <span class="hero-price">{{ displayPrice }}</span>
      <div class="hero-change">
        <span class="change-percent">{{ changeDisplay }}</span>
        <span class="change-value">{{ priceChangeDisplay }}</span>
      </div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat">
        <span class="stat-label">24h High</span>
        <span class="stat-value">${{ formatPrice(ticker.high, ticker.symbol) }}</span>
      </div>
      <div class="hero-stat">
        <span class="stat-label">24h Low</span>
        <span class="stat-value">${{ formatPrice(ticker.low, ticker.symbol) }}</span>
      </div>
    </div>
  </div>
  <div class="price-hero loading" v-else>
    <span class="loading-text">Loading...</span>
  </div>
</template>

<style scoped>
.price-hero {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
}

.price-hero.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.loading-text {
  color: #64748b;
}

.hero-main {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
}

.hero-price {
  font-size: 2.5rem;
  font-weight: 700;
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
}

.hero-change {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.change-percent {
  font-size: 1.25rem;
  font-weight: 600;
  color: v-bind(textColor);
}

.change-value {
  font-size: 0.875rem;
  color: v-bind(priceColor);
}

.hero-stats {
  display: flex;
  gap: 2rem;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1rem;
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 600px) {
  .hero-price {
    font-size: 1.75rem;
  }

  .hero-main {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
