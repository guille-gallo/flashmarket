<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isConnected: boolean
}>()

const emit = defineEmits<{
  connect: []
  disconnect: []
}>()

const statusColor = computed(() => (props.isConnected ? '#22c55e' : '#ef4444'))
const statusText = computed(() => (props.isConnected ? 'Connected' : 'Disconnected'))

function toggleConnection() {
  if (props.isConnected) {
    emit('disconnect')
  } else {
    emit('connect')
  }
}
</script>

<template>
  <div class="connection-status">
    <div class="status-indicator">
      <span class="status-dot"></span>
      <span class="status-text">{{ statusText }}</span>
    </div>
    <button class="toggle-btn" @click="toggleConnection">
      {{ isConnected ? 'Disconnect' : 'Connect' }}
    </button>
  </div>
</template>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: v-bind(statusColor);
  box-shadow: 0 0 8px v-bind(statusColor);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 0.875rem;
  color: #94a3b8;
}

.toggle-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #334155;
  border-color: #64748b;
}
</style>
