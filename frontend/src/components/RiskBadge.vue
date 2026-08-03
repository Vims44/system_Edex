<script setup>
defineProps({
  level: { type: String, required: true }, // 'low' | 'medium' | 'high' | 'critical'
  withDot: { type: Boolean, default: true },
})

const labels = { high: 'Высокий', medium: 'Средний', low: 'Низкий', critical: 'Критический' }
</script>

<template>
  <span class="badge" :class="[`badge--${level}`, { 'badge--no-dot': !withDot }]">
    {{ labels[level] || level }}
  </span>
</template>

<style scoped>
.badge {
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.badge:not(.badge--no-dot)::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
.badge--high, .badge--critical {
  color: var(--color-danger);
  background: #FDECEC;
}
.badge--medium {
  color: var(--color-warning);
  background: #FEF3DE;
}
.badge--low, .badge--none {
  color: var(--color-success);
  background: #E7F9EE;
}
</style>
