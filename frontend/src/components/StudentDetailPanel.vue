<script setup>
import { ref, watch, onMounted } from 'vue'
import RiskBadge from './RiskBadge.vue'
import TrendChart from './TrendChart.vue'
import { getStudentTrends } from '../services/api'
import { formatDate } from '../utils/date'

const props = defineProps({
  student: { type: Object, required: true },
})

const tabs = [
  { value: 'overview', label: 'Обзор' }
]
const activeTab = ref('overview')

const trends = ref(null)
const loadingTrends = ref(true)

async function loadTrends(studentId) {
  loadingTrends.value = true
  trends.value = await getStudentTrends(studentId)
  loadingTrends.value = false
}

onMounted(() => loadTrends(props.student.id))
watch(
  () => props.student.id,
  (id) => loadTrends(id)
)
</script>

<template>
  <section class="card detail">
    <div class="detail__header">
      <div class="detail__identity">
        <div class="detail__avatar">
          <img v-if="student.photo" :src="student.photo" alt="" />
          <span v-else>{{ student.fullName.charAt(0) }}</span>
        </div>
        <div>
          <div class="detail__name-row">
            <h3>{{ student.fullName }}</h3>
            <RiskBadge :level="student.riskLevel" />
          </div>
          <div class="detail__sub">
            {{ student.group }} · Группа
            <span class="detail__dot">•</span>
            {{ formatDate(student.enrollmentDate) }} · Дата поступления
          </div>
        </div>
      </div>

      <div class="detail__stats">
        <div class="detail__stat">
          <div class="detail__stat-label">Средний балл</div>
          <div class="detail__stat-value">{{ student.averageGrade.toFixed(2) }}</div>
        </div>
        <div class="detail__stat">
          <div class="detail__stat-label">Посещаемость</div>
          <div class="detail__stat-value">{{ student.attendance }}%</div>
        </div>
      </div>
    </div>

    <div class="detail__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="detail__tab"
        :class="{ 'detail__tab--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'overview'" class="detail__body">
      <div class="detail__charts">
        <div class="chart-card">
          <div class="chart-card__header">
            <h4>Динамика среднего балла</h4>
            <select class="chart-card__select"><option>За 6 месяцев</option></select>
          </div>
          <TrendChart
            v-if="!loadingTrends"
            :labels="trends.labels"
            :values="trends.grade"
            color="#2A5BFF"
            :y-max="5"
            :y-ticks="[0, 1, 2, 3, 4, 5]"
          />
        </div>
        <div class="chart-card">
          <div class="chart-card__header">
            <h4>Динамика посещаемости</h4>
            <select class="chart-card__select"><option>За 6 месяцев</option></select>
          </div>
          <TrendChart
            v-if="!loadingTrends"
            :labels="trends.labels"
            :values="trends.attendance"
            color="#22C55E"
            :y-max="100"
            :y-ticks="[0, 25, 50, 75, 100]"
          />
        </div>
      </div>

      <div class="info-card">
        <h4>Общая информация</h4>
        <dl class="info-grid">
          <div><dt>Дата рождения</dt><dd>{{ formatDate(student.birthDate) }}</dd></div>
          <div><dt>Телефон</dt><dd>{{ student.phone }}</dd></div>
          <div><dt>Email</dt><dd>{{ student.email }}</dd></div>
          <div><dt>Статус</dt><dd><span class="status-pill">{{ student.status }}</span></dd></div>
          <div><dt>Форма обучения</dt><dd>{{ student.studyForm }}</dd></div>
          <div><dt>Куратор</dt><dd>{{ student.curator }}</dd></div>
        </dl>
      </div>
    </div>

    <div v-else class="detail__placeholder">
      Раздел «{{ tabs.find((t) => t.value === activeTab).label }}» ещё в разработке.
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 20px 0;
  flex-wrap: wrap;
}

.detail__identity {
  display: flex;
  gap: 14px;
}
.detail__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #EDEFF5;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;
}
.detail__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail__name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.detail__name-row h3 {
  margin: 0;
  font-size: 16.5px;
}
.detail__sub {
  font-size: 12.5px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.detail__dot {
  margin: 0 2px;
}

.detail__stats {
  display: flex;
  gap: 28px;
}
.detail__stat-label {
  font-size: 11.5px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}
.detail__stat-value {
  font-size: 19px;
  font-weight: 700;
}

.detail__tabs {
  display: flex;
  gap: 4px;
  padding: 16px 20px 0;
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
}
.detail__tab {
  border: none;
  background: transparent;
  padding: 8px 4px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  margin-right: 18px;
}
.detail__tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.detail__body {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.chart-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 14px 6px;
}
.chart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.chart-card__header h4 {
  margin: 0;
  font-size: 13px;
}
.chart-card__select {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.info-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px 18px;
}
.info-card h4 {
  margin: 0 0 12px;
  font-size: 13.5px;
}
.info-grid {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}
.info-grid dt {
  font-size: 11.5px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}
.info-grid dd {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
}
.status-pill {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  background: #E7F9EE;
  color: var(--color-success);
}

.detail__placeholder {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13.5px;
}

@media (max-width: 700px) {
  .detail__charts,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
