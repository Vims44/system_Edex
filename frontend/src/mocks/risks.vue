<script setup>
import { computed, onMounted, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { getRisks } from '../services/api'

const props = defineProps({
  filters: { type: Object, required: true },
})

const loading = ref(true)
const error = ref('')
const data = ref(null)
const activeRisk = ref('all')
const page = ref(1)
const pageSize = 8
const period = ref('month')
const startDate = ref('2024-04-01')
const endDate = ref('2024-05-31')

const riskOptions = [
  { value: 'all', label: 'Все риски' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
]

const students = computed(() => data.value?.students || [])
const summary = computed(() => data.value?.summary || {
  totalStudents: 23,
  atRisk: 12,
  high: 4,
  medium: 6,
  low: 2,
  withoutRisk: 11,
})
const reasons = computed(() => data.value?.reasons || [
  { key: 'grades', label: 'Низкие оценки', count: 15, percent: 56 },
  { key: 'attendance', label: 'Пропуски занятий', count: 12, percent: 44 },
])
const filteredStudents = computed(() => {
  if (activeRisk.value === 'all') return students.value
  return students.value.filter((student) => student.riskLevel === activeRisk.value)
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredStudents.value.length / pageSize)))
const paginatedStudents = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredStudents.value.slice(start, start + pageSize)
})
const donutStyle = computed(() => {
  const total = reasons.value.reduce((sum, item) => sum + item.count, 0)
  if (!total) return { background: '#EEF1F6' }
  let start = 0
  const colors = {
    grades: '#EF4444',
    attendance: '#7C3AED',
  }
  const segments = reasons.value.map((item) => {
    const end = start + (item.count / total) * 100
    const segment = `${colors[item.key] || '#CBD5E1'} ${start}% ${end}%`
    start = end
    return segment
  })
  return { background: `conic-gradient(${segments.join(', ')})` }
})

function formatDateRange() {
  const start = new Date(`${startDate.value}T00:00:00`)
  const end = new Date(`${endDate.value}T00:00:00`)
  return `${start.toLocaleDateString('ru-RU')} – ${end.toLocaleDateString('ru-RU')}`
}

function setRiskFilter(value) {
  activeRisk.value = value
  page.value = 1
}

function setPeriod(value) {
  period.value = value
  const today = new Date(2024, 4, 31)
  let start
  if (value === 'week') {
    start = new Date(today)
    start.setDate(today.getDate() - 6)
  } else if (value === 'month') {
    start = new Date(today.getFullYear(), today.getMonth(), 1)
  } else if (value === 'semester') {
    start = new Date(2024, 1, 1)
  } else {
    start = new Date(today.getFullYear(), 0, 1)
  }
  startDate.value = formatInputDate(start)
  endDate.value = formatInputDate(today)
  loadRisks()
}

function formatInputDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function loadRisks() {
  loading.value = true
  error.value = ''
  try {
    data.value = await getRisks({
      group: props.filters.group,
      subject: props.filters.subject,
      startDate: startDate.value,
      endDate: endDate.value,
      riskLevel: activeRisk.value,
    })
  } catch (e) {
    error.value = 'Не удалось загрузить риски'
  } finally {
    loading.value = false
  }
}

function riskLabel(level) {
  return {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }[level] || 'Без риска'
}

function reasonIcon(reason) {
  return reason === 'grades' ? 'book' : 'calendar-check'
}

function reasonLabel(reason) {
  return reason === 'grades' ? 'Низкие оценки' : 'Пропуски'
}

function riskClass(level) {
  return `risk-level--${level}`
}

function progressClass(level) {
  return `risk-progress--${level}`
}

function dynamicsClass(value) {
  if (value > 0) return 'dynamics--up'
  if (value < 0) return 'dynamics--down'
  return 'dynamics--neutral'
}

function dynamicsIcon(value) {
  if (value > 0) return '↑'
  if (value < 0) return '↓'
  return '–'
}

function formatChange(value) {
  if (value > 0) return `+${value}`
  if (value < 0) return `${value}`
  return '0'
}

function nextPage() {
  if (page.value < totalPages.value) page.value += 1
}

function previousPage() {
  if (page.value > 1) page.value -= 1
}

onMounted(loadRisks)
</script>

<template>
  <div class="risks">
    <div class="risks__toolbar">
      <div class="period">
        <span class="period__label">Период</span>
        <div class="period__field">
          <input v-model="startDate" type="date" @change="loadRisks" />
          <span>–</span>
          <input v-model="endDate" type="date" @change="loadRisks" />
          <Icon name="calendar" :size="15" />
        </div>
      </div>

      <div class="risk-switcher">
        <button
          v-for="item in riskOptions"
          :key="item.value"
          type="button"
          :class="{ 'risk-switcher__item--active': activeRisk === item.value }"
          @click="setRiskFilter(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="risks__summary">
      <section class="analytics-card">
        <span class="analytics-card__title">Студентов в зоне риска</span>
        <div class="analytics-card__value-row">
          <strong class="analytics-card__value">{{ summary.atRisk }}</strong>
          <span>из {{ summary.totalStudents }}</span>
        </div>
        <div class="trend trend--danger">↑ 3 к периоду 01.03 – 31.03</div>
        <svg class="mini-chart mini-chart--danger" viewBox="0 0 180 48" preserveAspectRatio="none">
          <polyline points="0,35 20,37 40,30 60,34 80,17 100,22 120,19 140,25 160,14 180,20" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </section>

      <section class="analytics-card">
        <span class="analytics-card__title">Высокий риск</span>
        <div class="analytics-card__value-row">
          <strong class="analytics-card__value">{{ summary.high }}</strong>
          <span>студента</span>
        </div>
        <div class="trend trend--danger">↑ 1 к периоду 01.03 – 31.03</div>
        <svg class="mini-chart mini-chart--danger" viewBox="0 0 180 48" preserveAspectRatio="none">
          <polyline points="0,35 20,35 40,25 60,29 80,20 100,26 120,23 140,28 160,17 180,20" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </section>

      <section class="analytics-card">
        <span class="analytics-card__title">Средний риск</span>
        <div class="analytics-card__value-row">
          <strong class="analytics-card__value">{{ summary.medium }}</strong>
          <span>студентов</span>
        </div>
        <div class="trend trend--danger">↑ 2 к периоду 01.03 – 31.03</div>
        <svg class="mini-chart mini-chart--warning" viewBox="0 0 180 48" preserveAspectRatio="none">
          <polyline points="0,36 20,27 40,34 60,20 80,25 100,17 120,26 140,21 160,29 180,22" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </section>

      <section class="analytics-card">
        <span class="analytics-card__title">Низкий риск</span>
        <div class="analytics-card__value-row">
          <strong class="analytics-card__value">{{ summary.low }}</strong>
          <span>студента</span>
        </div>
        <div class="trend trend--success">↓ 1 к периоду 01.03 – 31.03</div>
        <svg class="mini-chart mini-chart--success" viewBox="0 0 180 48" preserveAspectRatio="none">
          <polyline points="0,34 20,20 40,18 60,34 80,36 100,25 120,34 140,28 160,36 180,30" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </section>

      <section class="analytics-card">
        <span class="analytics-card__title">Студентов без риска</span>
        <div class="analytics-card__value-row">
          <strong class="analytics-card__value">{{ summary.withoutRisk }}</strong>
          <span>студентов</span>
        </div>
        <div class="trend trend--success">↑ 1 к периоду 01.03 – 31.03</div>
        <div class="people-indicator">
          <span v-for="index in summary.totalStudents" :key="index" :class="{ 'people-indicator__muted': index > summary.withoutRisk }">●</span>
        </div>
      </section>
    </div>

    <div class="risks__content" v-if="!loading">
      <section class="card risk-list-card">
        <div class="card__header">
          <div>
            <h3>Студенты в зоне риска</h3>
            <span>{{ filteredStudents.length }} студентов</span>
          </div>
          <span class="card__period">{{ formatDateRange() }}</span>
        </div>

        <div class="risk-table-wrap">
          <table class="risk-table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>Уровень риска</th>
                <th>Причины риска</th>
                <th>Индекс риска</th>
                <th>Динамика</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents" :key="student.id">
                <td class="student-cell">
                  <div class="avatar">
                    <img v-if="student.photo" :src="student.photo" alt="" />
                    <span v-else>{{ student.fullName.charAt(0) }}</span>
                  </div>
                  <div>
                    <strong>{{ student.fullName }}</strong>
                    <small>{{ student.course }} курс</small>
                  </div>
                </td>

                <td>
                  <span class="risk-level" :class="riskClass(student.riskLevel)">
                    {{ riskLabel(student.riskLevel) }}
                  </span>
                </td>

                <td>
                  <div class="reasons">
                    <span v-for="reason in student.reasons" :key="reason.type" class="reason">
                      <Icon :name="reasonIcon(reason.type)" :size="14" />
                      <b>{{ reason.count }}</b>
                    </span>
                  </div>
                </td>

                <td>
                  <div class="risk-index">
                    <span>{{ student.riskIndex }} / 100</span>
                    <div class="risk-progress">
                      <span :class="progressClass(student.riskLevel)" :style="{ width: `${student.riskIndex}%` }"></span>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="dynamics" :class="dynamicsClass(student.dynamics)">
                    {{ dynamicsIcon(student.dynamics) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="risk-table__footer">
          <span>Показано {{ filteredStudents.length ? (page - 1) * pageSize + 1 : 0 }}–{{ Math.min(page * pageSize, filteredStudents.length) }} из {{ filteredStudents.length }}</span>
          <div class="pagination">
            <button type="button" :disabled="page === 1" @click="previousPage">‹</button>
            <button
              v-for="item in totalPages"
              :key="item"
              type="button"
              :class="{ 'pagination__active': page === item }"
              @click="page = item"
            >
              {{ item }}
            </button>
            <button type="button" :disabled="page === totalPages" @click="nextPage">›</button>
          </div>
          <span>Показывать по: <b>{{ pageSize }}</b></span>
        </div>

        <div class="legend">
          <span><Icon name="book" :size="13" /> Низкие оценки</span>
          <span><Icon name="calendar-check" :size="13" /> Пропуски</span>
          <span><i class="legend-arrow legend-arrow--up">↑</i> Рост</span>
          <span><i class="legend-arrow legend-arrow--down">↓</i> Снижение</span>
          <span><i class="legend-arrow">–</i> Без изменений</span>
        </div>
      </section>

      <aside class="risk-side">
        <section class="card reason-card">
          <div class="card__header">
            <h3>Распределение рисков по причинам</h3>
          </div>
          <div class="donut-layout">
            <div class="donut" :style="donutStyle">
              <div class="donut__center">
                <strong>{{ reasons.reduce((sum, item) => sum + item.count, 0) }}</strong>
                <span>рисков</span>
              </div>
            </div>
            <div class="reason-legend">
              <div v-for="reason in reasons" :key="reason.key" class="reason-legend__item">
                <span class="reason-legend__dot" :class="`reason-legend__dot--${reason.key}`"></span>
                <span>{{ reason.label }}</span>
                <strong>{{ reason.count }} ({{ reason.percent }}%)</strong>
              </div>
            </div>
          </div>
        </section>

        <section class="card level-card">
          <div class="card__header">
            <h3>Распределение студентов по уровню риска</h3>
          </div>
          <div class="level-list">
            <div class="level-row">
              <span>Высокий</span>
              <div class="level-bar"><i class="level-bar__high" :style="{ width: `${(summary.high / summary.totalStudents) * 100}%` }"></i></div>
              <b>{{ summary.high }} ({{ Math.round((summary.high / summary.totalStudents) * 100) }}%)</b>
            </div>
            <div class="level-row">
              <span>Средний</span>
              <div class="level-bar"><i class="level-bar__medium" :style="{ width: `${(summary.medium / summary.totalStudents) * 100}%` }"></i></div>
              <b>{{ summary.medium }} ({{ Math.round((summary.medium / summary.totalStudents) * 100) }}%)</b>
            </div>
            <div class="level-row">
              <span>Низкий</span>
              <div class="level-bar"><i class="level-bar__low" :style="{ width: `${(summary.low / summary.totalStudents) * 100}%` }"></i></div>
              <b>{{ summary.low }} ({{ Math.round((summary.low / summary.totalStudents) * 100) }}%)</b>
            </div>
            <div class="level-row">
              <span>Без риска</span>
              <div class="level-bar"><i class="level-bar__none" :style="{ width: `${(summary.withoutRisk / summary.totalStudents) * 100}%` }"></i></div>
              <b>{{ summary.withoutRisk }} ({{ Math.round((summary.withoutRisk / summary.totalStudents) * 100) }}%)</b>
            </div>
          </div>
          <div class="level-scale"><span>0</span><span>5</span><span>10</span><span>15</span></div>
        </section>

        <section class="card side-placeholder"></section>
      </aside>
    </div>

    <div v-else class="risks__loading">Загрузка…</div>
    <div v-if="error" class="risks__error">{{ error }}</div>
  </div>
</template>

<style scoped>
.risks {
  min-width: 0;
}

.risks__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.period {
  display: flex;
  align-items: center;
  gap: 8px;
}

.period__label {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.period__field {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-card);
}

.period__field input {
  width: 105px;
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 12px;
  background: transparent;
}

.period__field span {
  color: var(--color-text-muted);
}

.risk-switcher {
  display: flex;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-card);
}

.risk-switcher button {
  border: none;
  background: transparent;
  border-radius: 6px;
  padding: 7px 12px;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
}

.risk-switcher__item--active {
  background: var(--color-primary);
  color: #fff !important;
}

.risks__summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.analytics-card,
.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.analytics-card {
  min-height: 150px;
  padding: 16px;
  overflow: hidden;
}

.analytics-card__title {
  display: block;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 5px;
}

.analytics-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.analytics-card__value {
  color: var(--color-text);
  font-size: 24px;
  line-height: 1.1;
}

.analytics-card__value-row span {
  color: var(--color-text-muted);
  font-size: 11px;
}

.trend {
  display: block;
  margin-top: 7px;
  font-size: 10px;
}

.trend--danger {
  color: #EF4444;
}

.trend--success {
  color: #16A34A;
}

.mini-chart {
  display: block;
  width: 100%;
  height: 48px;
  margin-top: 12px;
}

.mini-chart--danger {
  color: #EF4444;
}

.mini-chart--warning {
  color: #F59E0B;
}

.mini-chart--success {
  color: #22A35A;
}

.people-indicator {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 20px;
  max-width: 145px;
  color: #16A34A;
  font-size: 15px;
  line-height: 1;
}

.people-indicator__muted {
  color: #CBD5E1;
}

.risks__content {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
  gap: 12px;
  align-items: start;
}

.risk-list-card {
  min-width: 0;
  overflow: hidden;
}

.card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 16px 16px 12px;
}

.card__header h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 700;
}

.card__header span {
  display: block;
  margin-top: 4px;
  color: var(--color-text-muted);
  font-size: 10px;
}

.card__header > h3 {
  margin-top: 2px;
}

.card__period {
  white-space: nowrap;
}

.risk-table-wrap {
  overflow-x: auto;
}

.risk-table {
  width: 100%;
  min-width: 690px;
  border-collapse: collapse;
  table-layout: fixed;
}

.risk-table th {
  padding: 8px 12px;
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.risk-table td {
  height: 48px;
  padding: 7px 12px;
  border-bottom: 1px solid #F0F2F6;
  color: var(--color-text);
  font-size: 11px;
}

.risk-table th:nth-child(1) {
  width: 29%;
}

.risk-table th:nth-child(2) {
  width: 17%;
}

.risk-table th:nth-child(3) {
  width: 17%;
}

.risk-table th:nth-child(4) {
  width: 27%;
}

.risk-table th:nth-child(5) {
  width: 10%;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.student-cell strong {
  display: block;
  font-size: 11px;
  font-weight: 600;
}

.student-cell small {
  display: block;
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: 9px;
}

.avatar {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  overflow: hidden;
  border-radius: 50%;
  background: #E8ECF3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667085;
  font-size: 10px;
  font-weight: 700;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.risk-level {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 600;
}

.risk-level--high {
  color: #EF4444;
  background: #FEECEC;
}

.risk-level--medium {
  color: #F59E0B;
  background: #FFF4DE;
}

.risk-level--low {
  color: #16A34A;
  background: #EAF8EF;
}

.reasons {
  display: flex;
  gap: 10px;
}

.reason {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #EF4444;
}

.reason:last-child {
  color: #7C3AED;
}

.reason b {
  font-size: 10px;
}

.reason svg {
  color: currentColor;
}

.risk-index {
  width: 110px;
}

.risk-index > span {
  display: block;
  margin-bottom: 5px;
  color: #344054;
  font-size: 9px;
}

.risk-progress {
  width: 100%;
  height: 4px;
  overflow: hidden;
  border-radius: 5px;
  background: #E9EDF3;
}

.risk-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.risk-progress--high {
  background: #EF4444;
}

.risk-progress--medium {
  background: #F59E0B;
}

.risk-progress--low {
  background: #22A35A;
}

.dynamics {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
}

.dynamics--up {
  color: #EF4444;
  background: #FEECEC;
}

.dynamics--down {
  color: #16A34A;
  background: #EAF8EF;
}

.dynamics--neutral {
  color: #98A2B3;
  background: #F1F3F6;
}

.risk-table__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  color: var(--color-text-muted);
  font-size: 10px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination button {
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 10px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

.pagination__active {
  border-color: #D9E2F2 !important;
  background: #F5F8FD !important;
  color: var(--color-primary) !important;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 14px 13px;
  color: var(--color-text-muted);
  font-size: 9px;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend span:nth-child(1) svg {
  color: #EF4444;
}

.legend span:nth-child(2) svg {
  color: #7C3AED;
}

.legend-arrow {
  font-style: normal;
  font-weight: 700;
}

.legend-arrow--up {
  color: #EF4444;
}

.legend-arrow--down {
  color: #16A34A;
}

.risk-side {
  display: grid;
  gap: 12px;
}

.reason-card,
.level-card,
.side-placeholder {
  min-width: 0;
}

.reason-card {
  min-height: 185px;
}

.donut-layout {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 2px 16px 16px;
}

.donut {
  width: 112px;
  height: 112px;
  flex: 0 0 112px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.donut__center {
  width: 68px;
  height: 68px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-card);
}

.donut__center strong {
  color: var(--color-text);
  font-size: 18px;
}

.donut__center span {
  color: var(--color-text-muted);
  font-size: 9px;
}

.reason-legend {
  display: grid;
  gap: 11px;
  min-width: 0;
  flex: 1;
}

.reason-legend__item {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  color: #475467;
  font-size: 10px;
}

.reason-legend__item strong {
  color: #344054;
  font-size: 10px;
}

.reason-legend__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.reason-legend__dot--grades {
  background: #EF4444;
}

.reason-legend__dot--attendance {
  background: #7C3AED;
}

.level-card {
  min-height: 190px;
}

.level-list {
  display: grid;
  gap: 12px;
  padding: 0 16px 8px;
}

.level-row {
  display: grid;
  grid-template-columns: 62px 1fr 55px;
  align-items: center;
  gap: 8px;
  color: #475467;
  font-size: 9px;
}

.level-row b {
  color: #344054;
  font-size: 9px;
  text-align: right;
}

.level-bar {
  height: 7px;
  overflow: hidden;
  border-radius: 3px;
  background: #EEF1F5;
}

.level-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.level-bar__high {
  background: #EF4444;
}

.level-bar__medium {
  background: #F59E0B;
}

.level-bar__low {
  background: #16A34A;
}

.level-bar__none {
  background: #B9C2D0;
}

.level-scale {
  display: flex;
  justify-content: space-between;
  padding: 2px 78px 13px 78px;
  color: #98A2B3;
  font-size: 8px;
}

.side-placeholder {
  min-height: 180px;
}

.risks__loading {
  padding: 60px;
  text-align: center;
  color: var(--color-text-muted);
}

.risks__error {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #FECACA;
  border-radius: var(--radius-sm);
  color: #B91C1C;
  background: #FEF2F2;
  font-size: 11px;
}

@media (max-width: 1180px) {
  .risks__summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .risks__content {
    grid-template-columns: 1fr;
  }

  .risk-side {
    grid-template-columns: 1fr 1fr;
  }

  .side-placeholder {
    display: none;
  }
}

@media (max-width: 760px) {
  .risks__summary,
  .risk-side {
    grid-template-columns: 1fr;
  }

  .risks__toolbar {
    align-items: stretch;
  }

  .risk-switcher {
    overflow-x: auto;
  }

  .period__field {
    flex-wrap: wrap;
  }

  .risk-table__footer {
    flex-wrap: wrap;
  }
}
</style>
