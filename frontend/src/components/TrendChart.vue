<script setup>
import { computed } from 'vue'

const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true },
  color: { type: String, default: '#2A5BFF' },
  yMax: { type: Number, default: 100 },
  yTicks: { type: Array, default: () => [0, 25, 50, 75, 100] },
})

const W = 380
const H = 160
const PAD_L = 26
const PAD_R = 8
const PAD_T = 10
const PAD_B = 22

const chartW = W - PAD_L - PAD_R
const chartH = H - PAD_T - PAD_B

function xAt(i, n) {
  return PAD_L + (chartW * i) / (n - 1)
}
function yAt(value) {
  return PAD_T + chartH - (chartH * value) / props.yMax
}

const n = computed(() => props.labels.length)
const points = computed(() => props.values.map((v, i) => [xAt(i, n.value), yAt(v)]))
const path = computed(() =>
  points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
)
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="trend-chart" preserveAspectRatio="none">
    <g v-for="tick in yTicks" :key="tick">
      <line :x1="PAD_L" :x2="W - PAD_R" :y1="yAt(tick)" :y2="yAt(tick)" stroke="#EEF0F6" stroke-width="1" />
      <text :x="PAD_L - 6" :y="yAt(tick) + 3" text-anchor="end" class="trend-chart__label">{{ tick }}</text>
    </g>

    <path :d="path" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <circle v-for="(p, i) in points" :key="i" :cx="p[0]" :cy="p[1]" r="3" fill="#fff" :stroke="color" stroke-width="2" />

    <text
      v-for="(label, i) in labels"
      :key="label"
      :x="xAt(i, n)"
      :y="H - 4"
      text-anchor="middle"
      class="trend-chart__label"
    >
      {{ label }}
    </text>
  </svg>
</template>

<style scoped>
.trend-chart {
  width: 100%;
  height: 180px;
  overflow: visible;
}
.trend-chart__label {
  font-size: 10px;
  fill: var(--color-text-muted);
}
</style>
