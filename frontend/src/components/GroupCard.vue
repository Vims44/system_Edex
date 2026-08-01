<script setup>
defineProps({
  group: { type: Object, required: true },
})
</script>

<template>
  <div class="group-card">
    <div class="group-card__icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    </div>

    <div class="group-card__info">
      <div class="group-card__name">{{ group.shifr }}</div>
      <div class="group-card__count">{{ group.studentsCount }} студента(ов)</div>
    </div>

    <div class="group-card__stat">
      <div class="group-card__stat-label">Средний балл</div>
      <div class="group-card__stat-value">{{ group.averageGrade.toFixed(2) }}</div>
    </div>

    <div class="group-card__risks">
      <div class="group-card__stat-label">Риск</div>
      <div class="group-card__dots">
        <span class="dot dot--danger">{{ group.riskCounts.high }}</span>
        <span class="dot dot--warning">{{ group.riskCounts.medium }}</span>
        <span class="dot dot--success">{{ group.riskCounts.low }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 4px;
  border-bottom: 1px solid var(--color-border);
}
.group-card:last-child {
  border-bottom: none;
}

.group-card__icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.group-card__info {
  flex: 1;
  min-width: 0;
}
.group-card__name {
  font-weight: 600;
  font-size: 14px;
}
.group-card__count {
  font-size: 12.5px;
  color: var(--color-text-muted);
}

.group-card__stat {
  text-align: right;
  min-width: 84px;
}
.group-card__stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}
.group-card__stat-value {
  font-weight: 600;
  font-size: 14px;
}

.group-card__risks {
  min-width: 110px;
  text-align: right;
}
.group-card__dots {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}
.dot {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 3px;
}
.dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.dot--danger { color: var(--color-danger); }
.dot--danger::before { background: var(--color-danger); }
.dot--warning { color: var(--color-warning); }
.dot--warning::before { background: var(--color-warning); }
.dot--success { color: var(--color-success); }
.dot--success::before { background: var(--color-success); }
</style>
