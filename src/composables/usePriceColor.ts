import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

export interface UsePriceColorReturn {
  priceColor: ComputedRef<string>
  textColor: ComputedRef<string>
  bgColor: ComputedRef<string>
}

/**
 * Composable for computing dynamic colors based on price change
 * Returns colors suitable for use with v-bind() in <style>
 */
export function usePriceColor(priceChangePercent: Ref<number>): UsePriceColorReturn {
  const priceColor = computed(() => {
    if (priceChangePercent.value > 0) {
      return '#22c55e' // Green for positive
    } else if (priceChangePercent.value < 0) {
      return '#ef4444' // Red for negative
    }
    return '#94a3b8' // Gray for neutral
  })

  const textColor = computed(() => {
    if (priceChangePercent.value > 0) {
      return '#4ade80' // Lighter green for text
    } else if (priceChangePercent.value < 0) {
      return '#f87171' // Lighter red for text
    }
    return '#cbd5e1' // Light gray for neutral
  })

  const bgColor = computed(() => {
    if (priceChangePercent.value > 0) {
      return 'rgba(34, 197, 94, 0.1)' // Green background
    } else if (priceChangePercent.value < 0) {
      return 'rgba(239, 68, 68, 0.1)' // Red background
    }
    return 'rgba(148, 163, 184, 0.1)' // Gray background
  })

  return {
    priceColor,
    textColor,
    bgColor,
  }
}

/**
 * Get static color based on change value (for non-reactive contexts)
 */
export function getPriceColor(change: number): string {
  if (change > 0) return '#22c55e'
  if (change < 0) return '#ef4444'
  return '#94a3b8'
}

export function getPriceTextColor(change: number): string {
  if (change > 0) return '#4ade80'
  if (change < 0) return '#f87171'
  return '#cbd5e1'
}
