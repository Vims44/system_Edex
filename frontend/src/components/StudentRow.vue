<script setup>
import RiskBadge from './RiskBadge.vue'

defineProps({
  student: { type: Object, required: true },
  active: { type: Boolean, default: false },
})
defineEmits(['select'])

const barColor = { low: 'var(--color-success)', medium: 'var(--color-warning)', high: 'var(--color-danger)', critical: 'var(--color-danger)' }
</script>

<template>
  <div class="row" :class="{ 'row--active': active }" @click="$emit('select', student.id)">
    <div class="row__student">
      <div class="row__avatar">
        <img v-if="student.photo" :src="student.photo" alt="" />
        <span v-else>{{ student.fullName.charAt(0) }}</span>
      </div>
      <span class="row__name">{{ student.fullName }}</span>
    </div>
    <div class="row__grade">{{ student.averageGrade.toFixed(2) }}</div>
    <div class="row__attendance">
      <span>{{ student.attendance }}%</span>
      <div class="row__bar">
        <div
          class="row__bar-fill"
          :style="{ width: student.attendance + '%', background: barColor[student.riskLevel] }"
        />
      </div>
    </div>
    <div class="row__absences">{{ student.absences }}</div>
    <div class="row__risk"><RiskBadge :level="student.riskLevel" :with-dot="false" /></div>
    <button class="row__more" type="button" @click.stop title="Скоро">⋯</button>
  </div>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 1fr 60px 130px 70px 90px 28px;
  align-items: center;
  gap: 8px;
  padding: 11px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.row:hover {
  background: #F7F8FC;
}
.row--active {
  background: var(--color-primary-soft);
}

.row__student {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.row__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #EDEFF5;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12.5px;
  flex-shrink: 0;
  overflow: hidden;
}
.row__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.row__name {
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row__grade {
  font-size: 13.5px;
  font-weight: 600;
}

.row__attendance {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
}
.row__bar {
  height: 4px;
  border-radius: 999px;
  background: #EEF0F6;
  overflow: hidden;
}
.row__bar-fill {
  height: 100%;
  border-radius: 999px;
}

.row__absences {
  font-size: 13.5px;
  color: var(--color-text-muted);
}

.row__more {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1;
  padding: 4px;
  border-radius: var(--radius-sm);
}
.row__more:hover {
  background: #EEF0F6;
}
</style>
