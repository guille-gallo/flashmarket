// Types for market data

export interface TickerData {
  symbol: string
  price: number
  priceChange: number
  priceChangePercent: number
  volume: number
  high: number
  low: number
  lastUpdated: number
}

export interface TradeData {
  symbol: string
  price: number
  quantity: number
  timestamp: number
  isBuyerMaker: boolean
  tradeId: number
}

// Binance WebSocket message types
export interface BinanceTickerMessage {
  e: '24hrTicker' // Event type
  E: number // Event time
  s: string // Symbol
  p: string // Price change
  P: string // Price change percent
  w: string // Weighted average price
  c: string // Last price
  Q: string // Last quantity
  o: string // Open price
  h: string // High price
  l: string // Low price
  v: string // Total traded base asset volume
  q: string // Total traded quote asset volume
  O: number // Statistics open time
  C: number // Statistics close time
  F: number // First trade ID
  L: number // Last trade ID
  n: number // Total number of trades
}

export interface BinanceTradeMessage {
  e: 'trade' // Event type
  E: number // Event time
  s: string // Symbol
  t: number // Trade ID
  p: string // Price
  q: string // Quantity
  T: number // Trade time
  m: boolean // Is the buyer the market maker?
}

export interface BinanceStreamWrapper<T> {
  stream: string
  data: T
}

export type StreamType = 'ticker' | 'trade'

export interface CryptoPair {
  symbol: string
  displayName: string
  baseAsset: string
  quoteAsset: string
}
