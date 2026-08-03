<script setup>
import RiskBadge from './RiskBadge.vue'

defineProps({
  risk: { type: Object, required: true },
})
</script>

<template>
  <div class="risk-item">
    <div class="risk-item__avatar">{{ risk.fullName.charAt(0) }}</div>
    <div class="risk-item__info">
      <div class="risk-item__name">{{ risk.fullName }}</div>
      <div class="risk-item__group">{{ risk.group }}</div>
    </div>
    <div class="risk-item__meta">
      <RiskBadge :level="risk.riskLevel" />
      <span class="risk-item__date">{{ risk.date }}</span>
    </div>
  </div>
</template>

<style scoped>
.risk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 4px;
  border-bottom: 1px solid var(--color-border);
}
.risk-item:last-child {
  border-bottom: none;
}

.risk-item__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #EDEFF5;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  flex-shrink: 0;
}

.risk-item__info {
  flex: 1;
  min-width: 0;
}
.risk-item__name {
  font-size: 13.5px;
  font-weight: 600;
}
.risk-item__group {
  font-size: 12px;
  color: var(--color-text-muted);
}

.risk-item__meta {
  text-align: right;
}
.risk-item__date {
  display: block;
  font-size: 11.5px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
</style>
