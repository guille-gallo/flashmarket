import { useWebSocket } from '@vueuse/core'
import { markRaw, ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { buildCombinedStreamUrl, parseStreamMessage, CRYPTO_PAIRS } from '@/services/binanceService'
import type { TickerData, TradeData } from '@/types'

export interface UseCryptoWebSocketReturn {
  status: Ref<string>
  isConnected: Ref<boolean>
  connect: () => void
  disconnect: () => void
  onTicker: (callback: (data: TickerData) => void) => void
  onTrade: (callback: (data: TradeData) => void) => void
}

/**
 * Composable for managing Binance WebSocket connection
 * Uses markRaw to prevent Vue from making the WebSocket deeply reactive
 */
export function useCryptoWebSocket(): UseCryptoWebSocketReturn {
  const url = buildCombinedStreamUrl(CRYPTO_PAIRS)

  // Store callbacks for ticker and trade updates
  const tickerCallbacks: ((data: TickerData) => void)[] = markRaw([])
  const tradeCallbacks: ((data: TradeData) => void)[] = markRaw([])

  const { status, data, open, close } = useWebSocket(url, {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        console.error('Failed to reconnect to Binance WebSocket after 3 retries')
      },
    },
    immediate: false, // Don't connect automatically
  })

  const isConnected = computed(() => status.value === 'OPEN')

  // Watch for incoming messages
  watch(data, (rawData) => {
    if (!rawData) return

    const parsed = parseStreamMessage(rawData)
    if (!parsed) return

    if (parsed.type === 'ticker') {
      tickerCallbacks.forEach((cb) => cb(parsed.data as TickerData))
    } else if (parsed.type === 'trade') {
      tradeCallbacks.forEach((cb) => cb(parsed.data as TradeData))
    }
  })

  const connect = () => {
    open()
  }

  const disconnect = () => {
    close()
  }

  const onTicker = (callback: (data: TickerData) => void) => {
    tickerCallbacks.push(callback)
  }

  const onTrade = (callback: (data: TradeData) => void) => {
    tradeCallbacks.push(callback)
  }

  return {
    status: status as Ref<string>,
    isConnected,
    connect,
    disconnect,
    onTicker,
    onTrade,
  }
}
