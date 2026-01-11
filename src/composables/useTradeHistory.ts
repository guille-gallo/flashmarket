import { shallowRef, computed } from 'vue'
import type { ShallowRef, ComputedRef } from 'vue'
import type { TradeData } from '@/types'

const TRADE_HISTORY_DURATION_MS = 60 * 1000 // 1 minute

export interface UseTradeHistoryReturn {
  trades: ShallowRef<TradeData[]>
  addTrade: (trade: TradeData) => void
  clearOld: () => void
  latestTrade: ComputedRef<TradeData | null>
  tradeCount: ComputedRef<number>
}

/**
 * Composable for maintaining a rolling window of trade history
 * Uses shallowRef for performance - prevents deep reactivity on frequent updates
 */
export function useTradeHistory(symbol: string): UseTradeHistoryReturn {
  // Using shallowRef to avoid deep reactivity on the array
  // This is critical for performance with high-frequency updates
  const trades = shallowRef<TradeData[]>([])

  const addTrade = (trade: TradeData) => {
    if (trade.symbol.toLowerCase() !== symbol.toLowerCase()) {
      return
    }

    const now = Date.now()
    const cutoff = now - TRADE_HISTORY_DURATION_MS

    // Filter old trades and add new one
    // Create a new array to trigger reactivity on shallowRef
    const filteredTrades = trades.value.filter((t) => t.timestamp > cutoff)
    trades.value = [...filteredTrades, trade]
  }

  const clearOld = () => {
    const cutoff = Date.now() - TRADE_HISTORY_DURATION_MS
    const filteredTrades = trades.value.filter((t) => t.timestamp > cutoff)

    // Only update if something was actually removed
    if (filteredTrades.length !== trades.value.length) {
      trades.value = filteredTrades
    }
  }

  const latestTrade = computed((): TradeData | null => {
    if (trades.value.length === 0) return null
    return trades.value[trades.value.length - 1] ?? null
  })

  const tradeCount = computed(() => trades.value.length)

  return {
    trades,
    addTrade,
    clearOld,
    latestTrade,
    tradeCount,
  }
}
