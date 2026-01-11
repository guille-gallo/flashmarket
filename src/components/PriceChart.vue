<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, markRaw } from 'vue'
import { createChart, LineSeries, type IChartApi, type ISeriesApi, type LineData, ColorType } from 'lightweight-charts'
import type { TradeData } from '@/types'
import { getPriceColor } from '@/composables'

const props = defineProps<{
  trades: TradeData[]
  symbol: string
  priceChange?: number
}>()

const chartContainer = ref<HTMLElement | null>(null)

// Use markRaw to prevent Vue from making chart instances reactive
// This is critical for performance with high-frequency updates
let chart: IChartApi | null = null
let lineSeries: ISeriesApi<'Line'> | null = null

const lineColor = ref('#22c55e')

// Update line color based on price change
watch(
  () => props.priceChange,
  (change) => {
    lineColor.value = getPriceColor(change || 0)
    if (lineSeries) {
      lineSeries.applyOptions({
        color: lineColor.value,
      })
    }
  },
  { immediate: true },
)

// Update chart data when trades change
watch(
  () => props.trades,
  (newTrades) => {
    if (!lineSeries || newTrades.length === 0) return

    // Convert trades to chart data format
    // Group by second to reduce data points
    const dataBySecond = new Map<number, number>()

    for (const trade of newTrades) {
      const second = Math.floor(trade.timestamp / 1000)
      dataBySecond.set(second, trade.price) // Use latest price for each second
    }

    const chartData: LineData[] = Array.from(dataBySecond.entries())
      .sort(([a], [b]) => a - b)
      .map(([time, value]) => ({
        time: time as LineData['time'],
        value,
      }))

    if (chartData.length > 0) {
      lineSeries.setData(chartData)
    }
  },
  { deep: false }, // Shallow watch since we use shallowRef
)

function initChart() {
  if (!chartContainer.value) return

  // Create chart and mark as raw to exclude from reactivity
  chart = markRaw(
    createChart(chartContainer.value, {
      width: chartContainer.value.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.5)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.5)' },
      },
      crosshair: {
        vertLine: {
          color: '#475569',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: '#475569',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: true,
      },
    }),
  )

  // Create line series using new API (lightweight-charts v4+)
  lineSeries = markRaw(
    chart.addSeries(LineSeries, {
      color: lineColor.value,
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    }),
  )

  // Handle resize
  const resizeObserver = new ResizeObserver((entries) => {
    if (chart && entries[0]) {
      const { width, height } = entries[0].contentRect
      chart.resize(width, height)
    }
  })

  resizeObserver.observe(chartContainer.value)
}

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chart) {
    chart.remove()
    chart = null
    lineSeries = null
  }
})
</script>

<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h3 class="chart-title">{{ symbol.toUpperCase() }} - Real-Time Trades</h3>
      <span class="chart-subtitle">Last 60 seconds</span>
    </div>
    <div ref="chartContainer" class="chart-container"></div>
    <div v-if="trades.length === 0" class="no-data">
      <span>Waiting for trade data...</span>
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1rem;
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0;
}

.chart-subtitle {
  font-size: 0.75rem;
  color: #64748b;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.no-data {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  color: #64748b;
  font-size: 0.875rem;
}
</style>
