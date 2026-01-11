import { defineStore } from 'pinia'
import { shallowRef, ref, computed } from 'vue'
import type { TickerData, TradeData } from '@/types'
import { CRYPTO_PAIRS } from '@/services/binanceService'

const TRADE_HISTORY_DURATION_MS = 60 * 1000 // 1 minute
const MAX_TRADES_PER_SYMBOL = 500 // Limit trades to prevent memory issues

export const useMarketStore = defineStore('market', () => {
  // Using shallowRef for tickers map to optimize performance
  // Only top-level changes trigger reactivity
  const tickers = shallowRef<Map<string, TickerData>>(new Map())

  // Trade history per symbol - also using shallowRef
  const tradeHistory = shallowRef<Map<string, TradeData[]>>(new Map())

  // Currently selected symbol for detailed view
  const selectedSymbol = ref<string>(CRYPTO_PAIRS[0]?.symbol || 'btcusdt')

  // Connection status
  const isConnected = ref(false)

  // Getters
  const currentTicker = computed(() => {
    return tickers.value.get(selectedSymbol.value) || null
  })

  const currentTrades = computed(() => {
    return tradeHistory.value.get(selectedSymbol.value) || []
  })

  const sortedTickers = computed(() => {
    // Sort by volume (highest first)
    return Array.from(tickers.value.values()).sort((a, b) => b.volume - a.volume)
  })

  const allTickers = computed(() => {
    // Return in the order defined by CRYPTO_PAIRS
    return CRYPTO_PAIRS.map((pair) => tickers.value.get(pair.symbol)).filter(
      (ticker): ticker is TickerData => ticker !== undefined,
    )
  })

  // Actions
  function updateTicker(data: TickerData) {
    // Create new Map to trigger shallowRef reactivity
    const newTickers = new Map(tickers.value)
    newTickers.set(data.symbol, data)
    tickers.value = newTickers
  }

  function addTrade(data: TradeData) {
    const symbol = data.symbol
    const newHistory = new Map(tradeHistory.value)
    const symbolTrades = newHistory.get(symbol) || []

    // Add new trade and limit array size
    const updatedTrades = [...symbolTrades, data].slice(-MAX_TRADES_PER_SYMBOL)
    newHistory.set(symbol, updatedTrades)
    tradeHistory.value = newHistory
  }

  function selectSymbol(symbol: string) {
    selectedSymbol.value = symbol
  }

  function pruneOldTrades() {
    const cutoff = Date.now() - TRADE_HISTORY_DURATION_MS
    const newHistory = new Map(tradeHistory.value)
    let hasChanges = false

    for (const [symbol, trades] of newHistory.entries()) {
      const filtered = trades.filter((t) => t.timestamp > cutoff)
      if (filtered.length !== trades.length) {
        newHistory.set(symbol, filtered)
        hasChanges = true
      }
    }

    if (hasChanges) {
      tradeHistory.value = newHistory
    }
  }

  function setConnected(connected: boolean) {
    isConnected.value = connected
  }

  function clearAll() {
    tickers.value = new Map()
    tradeHistory.value = new Map()
  }

  return {
    // State
    tickers,
    tradeHistory,
    selectedSymbol,
    isConnected,

    // Getters
    currentTicker,
    currentTrades,
    sortedTickers,
    allTickers,

    // Actions
    updateTicker,
    addTrade,
    selectSymbol,
    pruneOldTrades,
    setConnected,
    clearAll,
  }
})
