import type {
  BinanceTickerMessage,
  BinanceTradeMessage,
  BinanceStreamWrapper,
  CryptoPair,
  TickerData,
  TradeData,
  StreamType,
} from '@/types'

// Top crypto pairs to track
export const CRYPTO_PAIRS: CryptoPair[] = [
  { symbol: 'btcusdt', displayName: 'BTC/USDT', baseAsset: 'BTC', quoteAsset: 'USDT' },
  { symbol: 'ethusdt', displayName: 'ETH/USDT', baseAsset: 'ETH', quoteAsset: 'USDT' },
  { symbol: 'bnbusdt', displayName: 'BNB/USDT', baseAsset: 'BNB', quoteAsset: 'USDT' },
  { symbol: 'solusdt', displayName: 'SOL/USDT', baseAsset: 'SOL', quoteAsset: 'USDT' },
  { symbol: 'xrpusdt', displayName: 'XRP/USDT', baseAsset: 'XRP', quoteAsset: 'USDT' },
  { symbol: 'adausdt', displayName: 'ADA/USDT', baseAsset: 'ADA', quoteAsset: 'USDT' },
  { symbol: 'dogeusdt', displayName: 'DOGE/USDT', baseAsset: 'DOGE', quoteAsset: 'USDT' },
  { symbol: 'avaxusdt', displayName: 'AVAX/USDT', baseAsset: 'AVAX', quoteAsset: 'USDT' },
]

const BINANCE_WS_BASE = 'wss://stream.binance.com:9443'

/**
 * Build Binance WebSocket stream URL for multiple pairs
 */
export function buildStreamUrl(pairs: CryptoPair[], streamType: StreamType): string {
  const streams = pairs.map((pair) => `${pair.symbol}@${streamType}`).join('/')
  return `${BINANCE_WS_BASE}/stream?streams=${streams}`
}

/**
 * Build combined stream URL for both ticker and trade data
 */
export function buildCombinedStreamUrl(pairs: CryptoPair[]): string {
  const tickerStreams = pairs.map((pair) => `${pair.symbol}@ticker`)
  const tradeStreams = pairs.map((pair) => `${pair.symbol}@trade`)
  const allStreams = [...tickerStreams, ...tradeStreams].join('/')
  return `${BINANCE_WS_BASE}/stream?streams=${allStreams}`
}

/**
 * Parse Binance ticker message to app TickerData format
 */
export function parseTickerMessage(message: BinanceTickerMessage): TickerData {
  return {
    symbol: message.s.toLowerCase(),
    price: parseFloat(message.c),
    priceChange: parseFloat(message.p),
    priceChangePercent: parseFloat(message.P),
    volume: parseFloat(message.v),
    high: parseFloat(message.h),
    low: parseFloat(message.l),
    lastUpdated: message.E,
  }
}

/**
 * Parse Binance trade message to app TradeData format
 */
export function parseTradeMessage(message: BinanceTradeMessage): TradeData {
  return {
    symbol: message.s.toLowerCase(),
    price: parseFloat(message.p),
    quantity: parseFloat(message.q),
    timestamp: message.T,
    isBuyerMaker: message.m,
    tradeId: message.t,
  }
}

/**
 * Parse incoming WebSocket message and determine type
 */
export function parseStreamMessage(
  rawData: string,
): { type: 'ticker'; data: TickerData } | { type: 'trade'; data: TradeData } | null {
  try {
    const parsed = JSON.parse(rawData) as BinanceStreamWrapper<
      BinanceTickerMessage | BinanceTradeMessage
    >

    if (!parsed.stream || !parsed.data) {
      return null
    }

    if (parsed.stream.endsWith('@ticker')) {
      return {
        type: 'ticker',
        data: parseTickerMessage(parsed.data as BinanceTickerMessage),
      }
    }

    if (parsed.stream.endsWith('@trade')) {
      return {
        type: 'trade',
        data: parseTradeMessage(parsed.data as BinanceTradeMessage),
      }
    }

    return null
  } catch {
    console.error('Failed to parse WebSocket message:', rawData)
    return null
  }
}

/**
 * Get crypto pair info by symbol
 */
export function getPairBySymbol(symbol: string): CryptoPair | undefined {
  return CRYPTO_PAIRS.find((pair) => pair.symbol === symbol.toLowerCase())
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price: number, symbol: string): string {
  // High-value coins use 2 decimals, low-value coins use more
  const lowValueCoins = ['dogeusdt', 'adausdt', 'xrpusdt']
  const decimals = lowValueCoins.includes(symbol.toLowerCase()) ? 4 : 2
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format volume with K/M/B suffixes
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`
  }
  return volume.toFixed(2)
}
