<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMarketStore } from '@/stores/useMarketStore'
import { useCryptoWebSocket } from '@/composables'
import { CRYPTO_PAIRS, getPairBySymbol } from '@/services/binanceService'
import PriceTicker from '@/components/PriceTicker.vue'
import MarketGrid from '@/components/MarketGrid.vue'
import PriceChart from '@/components/PriceChart.vue'
import PriceHero from '@/components/PriceHero.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'

const marketStore = useMarketStore()
const { allTickers, currentTicker, currentTrades, selectedSymbol, isConnected } =
  storeToRefs(marketStore)

// WebSocket connection
const { connect, disconnect, onTicker, onTrade, isConnected: wsConnected } = useCryptoWebSocket()

// Sync connection status
watch(wsConnected, (connected) => {
  marketStore.setConnected(connected)
})

// Get selected pair display name
const selectedPairName = computed(() => {
  const pair = getPairBySymbol(selectedSymbol.value)
  return pair?.displayName || selectedSymbol.value.toUpperCase()
})

// Prune old trades periodically
let pruneInterval: number | null = null

onMounted(() => {
  // Register handlers before connecting
  onTicker((data) => {
    marketStore.updateTicker(data)
  })

  onTrade((data) => {
    marketStore.addTrade(data)
  })

  // Connect to WebSocket
  connect()

  // Prune old trades every 5 seconds
  pruneInterval = window.setInterval(() => {
    marketStore.pruneOldTrades()
  }, 5000)
})

onUnmounted(() => {
  disconnect()
  if (pruneInterval) {
    clearInterval(pruneInterval)
  }
})

function handleSelectSymbol(symbol: string) {
  marketStore.selectSymbol(symbol)
}

function handleConnect() {
  connect()
}

function handleDisconnect() {
  disconnect()
}
</script>

<template>
  <div class="dashboard">
    <!-- Header with ticker tape -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1 class="logo">
          <span class="logo-flash">Flash</span><span class="logo-market">Market</span>
        </h1>
        <ConnectionStatus
          :is-connected="isConnected"
          @connect="handleConnect"
          @disconnect="handleDisconnect"
        />
      </div>
      <PriceTicker :tickers="allTickers" />
    </header>

    <!-- Main content -->
    <main class="dashboard-main">
      <!-- Selected coin detail section -->
      <section class="detail-section">
        <div class="detail-header">
          <h2 class="section-title">{{ selectedPairName }}</h2>
        </div>
        <div class="detail-content">
          <PriceHero :ticker="currentTicker" />
          <PriceChart
            :trades="currentTrades"
            :symbol="selectedSymbol"
            :price-change="currentTicker?.priceChangePercent"
          />
        </div>
      </section>

      <!-- Market overview grid -->
      <section class="market-section">
        <h2 class="section-title">Market Overview</h2>
        <MarketGrid
          :tickers="allTickers"
          :selected-symbol="selectedSymbol"
          @select="handleSelectSymbol"
        />
      </section>
    </main>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <p>Data provided by Binance WebSocket API • Updates in real-time</p>
    </footer>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
}

.dashboard-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #0f172a;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #1e293b;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.logo-flash {
  color: #fbbf24;
}

.logo-market {
  color: #f1f5f9;
}

.dashboard-main {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 1rem 0;
}

.detail-section {
  padding: 0 1rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
}

.market-section {
  padding: 0 1rem;
}

.dashboard-footer {
  text-align: center;
  padding: 1.5rem;
  color: #64748b;
  font-size: 0.75rem;
  border-top: 1px solid #1e293b;
}
</style>
