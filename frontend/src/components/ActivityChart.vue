<script setup>
import { computed } from 'vue'

const props = defineProps({
  activity: { type: Object, required: true }, // { labels, attendance, averageGrade }
})

const W = 560
const H = 200
const PAD_L = 28
const PAD_R = 8
const PAD_T = 10
const PAD_B = 26

const chartW = W - PAD_L - PAD_R
const chartH = H - PAD_T - PAD_B

function xAt(i, n) {
  return PAD_L + (chartW * i) / (n - 1)
}
function yAt(value) {
  // value ожидается в шкале 0-100
  return PAD_T + chartH - (chartH * value) / 100
}

function toPoints(values, n) {
  return values.map((v, i) => [xAt(i, n), yAt(v)])
}

const n = computed(() => props.activity.labels.length)

const attendancePoints = computed(() => toPoints(props.activity.attendance, n.value))
// Средний балл (0-5) переводим в шкалу 0-100 для общей оси
const gradePoints = computed(() =>
  toPoints(props.activity.averageGrade.map((g) => g * 10), n.value)
)

function toPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
}

const attendancePath = computed(() => toPath(attendancePoints.value))
const gradePath = computed(() => toPath(gradePoints.value))

const yTicks = [0, 25, 50, 75, 100]
</script>

<template>
  <div class="chart">
    <div class="chart__legend">
      <span class="legend-item"><i class="legend-dot legend-dot--blue" />Посещаемость (%)</span>
      <span class="legend-item"><i class="legend-dot legend-dot--green" />Средний балл</span>
    </div>

    <svg :viewBox="`0 0 ${W} ${H}`" class="chart__svg" preserveAspectRatio="none">
      <!-- горизонтальные линии сетки -->
      <g v-for="tick in yTicks" :key="tick">
        <line
          :x1="PAD_L"
          :x2="W - PAD_R"
          :y1="yAt(tick)"
          :y2="yAt(tick)"
          stroke="#EEF0F6"
          stroke-width="1"
        />
        <text :x="PAD_L - 8" :y="yAt(tick) + 3" text-anchor="end" class="chart__axis-label">{{ tick }}</text>
      </g>

      <path :d="attendancePath" fill="none" stroke="#2A5BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path :d="gradePath" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

      <circle v-for="(p, i) in attendancePoints" :key="`a${i}`" :cx="p[0]" :cy="p[1]" r="3" fill="#fff" stroke="#2A5BFF" stroke-width="2" />
      <circle v-for="(p, i) in gradePoints" :key="`g${i}`" :cx="p[0]" :cy="p[1]" r="3" fill="#fff" stroke="#22C55E" stroke-width="2" />

      <text
        v-for="(label, i) in activity.labels"
        :key="label"
        :x="xAt(i, n)"
        :y="H - 4"
        text-anchor="middle"
        class="chart__axis-label"
      >
        {{ label }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.chart {
  width: 100%;
}
.chart__legend {
  display: flex;
  gap: 18px;
  margin-bottom: 8px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--color-text-muted);
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.legend-dot--blue { background: #2A5BFF; }
.legend-dot--green { background: #22C55E; }

.chart__svg {
  width: 100%;
  height: 220px;
  overflow: visible;
}

.chart__axis-label {
  font-size: 10px;
  fill: var(--color-text-muted);
}
</style>
