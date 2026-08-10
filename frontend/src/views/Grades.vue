<script setup>
import { computed, onMounted, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { getGradebook, saveGrade } from '../services/api'

const props = defineProps({
  filters: { type: Object, required: true },
})

const loading = ref(true)
const saving = ref(false)
const gradebook = ref(null)
const period = ref('month')
const startDate = ref('')
const endDate = ref('')
const editingCell = ref(null)
const draftGrades = ref([])
const error = ref('')

const periodOptions = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'semester', label: 'Семестр' },
  { value: 'year', label: 'Весь год' },
]

const dates = computed(() => {
  if (!startDate.value || !endDate.value) return []
  const result = []
  const current = new Date(`${startDate.value}T00:00:00`)
  const end = new Date(`${endDate.value}T00:00:00`)

  while (current <= end) {
    if (current.getDay() !== 0) {
      result.push({
        value: formatDate(current),
        day: current.getDate(),
        month: current.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''),
        weekday: current.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''),
      })
    }
    current.setDate(current.getDate() + 1)
  }

  return result
})

const students = computed(() => gradebook.value?.students || [])

const allGrades = computed(() => students.value.flatMap((student) => Object.values(student.grades || {}).flat()))

const totalGrades = computed(() => allGrades.value.length)

const averageGrade = computed(() => {
  if (!allGrades.value.length) return 0
  return allGrades.value.reduce((sum, grade) => sum + grade, 0) / allGrades.value.length
})

const failCount = computed(() => allGrades.value.filter((grade) => grade === 2).length)

const knowledgeQuality = computed(() => {
  if (!allGrades.value.length) return 0
  return Math.round((allGrades.value.filter((grade) => grade >= 4).length / allGrades.value.length) * 100)
})

const distribution = computed(() => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  allGrades.value.forEach((grade) => {
    if (counts[grade] !== undefined) counts[grade] += 1
  })
  return [5, 4, 3, 2, 1].map((grade) => ({
    grade,
    count: counts[grade],
    percent: totalGrades.value ? Math.round((counts[grade] / totalGrades.value) * 100) : 0,
  }))
})

const dateDistribution = computed(() =>
  dates.value.map((date) => {
    const values = students.value.flatMap((student) => student.grades?.[date.value] || [])
    return {
      ...date,
      5: values.filter((grade) => grade === 5).length,
      4: values.filter((grade) => grade === 4).length,
      3: values.filter((grade) => grade === 3).length,
      2: values.filter((grade) => grade === 2).length,
      1: values.filter((grade) => grade === 1).length,
      total: values.length,
    }
  }),
)

const averageTrend = computed(() =>
  dates.value.map((date) => {
    const values = students.value.flatMap((student) => student.grades?.[date.value] || [])
    return values.length ? values.reduce((sum, grade) => sum + grade, 0) / values.length : null
  }),
)

const qualityTrend = computed(() =>
  dates.value.map((date) => {
    const values = students.value.flatMap((student) => student.grades?.[date.value] || [])
    if (!values.length) return null
    return (values.filter((grade) => grade >= 4).length / values.length) * 100
  }),
)

const failsTrend = computed(() =>
  dates.value.map((date) => {
    const values = students.value.flatMap((student) => student.grades?.[date.value] || [])
    return values.filter((grade) => grade === 2).length
  }),
)

const averageChange = computed(() => {
  const value = gradebook.value?.previousAverage
  if (typeof value !== 'number' || !allGrades.value.length) return null
  return averageGrade.value - value
})

const qualityChange = computed(() => {
  const value = gradebook.value?.previousQuality
  if (typeof value !== 'number' || !allGrades.value.length) return null
  return knowledgeQuality.value - value
})

const failsChange = computed(() => {
  const value = gradebook.value?.previousFails
  if (typeof value !== 'number') return null
  return failCount.value - value
})

const averagePath = computed(() => buildLinePath(averageTrend.value, 2, 5))
const qualityPath = computed(() => buildLinePath(qualityTrend.value, 0, 100))
const failsPath = computed(() => buildLinePath(failsTrend.value, 0, Math.max(5, ...failsTrend.value, failCount.value)))

const donutStyle = computed(() => {
  let start = 0
  const segments = []
  const colors = {
    5: 'var(--color-success)',
    4: '#F4B400',
    3: '#F9C23C',
    2: 'var(--color-danger)',
    1: '#D7DCE5',
  }

  distribution.value.forEach((item) => {
    if (!item.percent) return
    const end = start + item.percent
    segments.push(`${colors[item.grade]} ${start}% ${end}%`)
    start = end
  })

  if (!segments.length) return { background: '#EEF1F6' }
  return { background: `conic-gradient(${segments.join(', ')})` }
})

const editingStudent = computed(() => {
  if (!editingCell.value) return null
  return students.value.find((student) => student.id === editingCell.value.studentId) || null
})

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateRange() {
  if (!startDate.value || !endDate.value) return ''
  const start = new Date(`${startDate.value}T00:00:00`)
  const end = new Date(`${endDate.value}T00:00:00`)
  return `${start.toLocaleDateString('ru-RU')} – ${end.toLocaleDateString('ru-RU')}`
}

function setPeriod(value) {
  period.value = value
  const today = new Date()
  let start = new Date(today)

  if (value === 'week') {
    const day = today.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    start.setDate(today.getDate() + mondayOffset)
  } else if (value === 'month') {
    start = new Date(today.getFullYear(), today.getMonth(), 1)
  } else if (value === 'semester') {
    start = today.getMonth() < 6
      ? new Date(today.getFullYear(), 1, 1)
      : new Date(today.getFullYear(), 8, 1)
  } else {
    start = new Date(today.getFullYear(), 0, 1)
  }

  startDate.value = formatDate(start)
  endDate.value = formatDate(today)
  loadGradebook()
}

function applyCustomPeriod() {
  if (startDate.value && endDate.value) loadGradebook()
}

async function loadGradebook() {
  loading.value = true
  error.value = ''
  editingCell.value = null

  try {
    gradebook.value = await getGradebook({
      group: props.filters.group,
      subject: props.filters.subject,
      startDate: startDate.value,
      endDate: endDate.value,
    })
  } catch (e) {
    error.value = 'Не удалось загрузить оценки'
  } finally {
    loading.value = false
  }
}

function buildLinePath(values, min, max) {
  const valid = values
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value !== null)

  if (!valid.length) return ''
  if (valid.length === 1) return `0,50 ${valid[0].index === 0 ? 0 : 100},50`

  return valid
    .map((item) => {
      const x = values.length === 1 ? 0 : (item.index / (values.length - 1)) * 100
      const ratio = max === min ? 0.5 : (item.value - min) / (max - min)
      const y = 50 - Math.max(0, Math.min(1, ratio)) * 38
      return `${x},${y}`
    })
    .join(' ')
}

function getCellKey(studentId, date) {
  return `${studentId}_${date}`
}

function getGrades(student, date) {
  return student.grades?.[date] || []
}

function openEditor(student, date) {
  editingCell.value = { studentId: student.id, date }
  draftGrades.value = [...getGrades(student, date)]
  if (!draftGrades.value.length) draftGrades.value = [null]
}

function closeEditor() {
  editingCell.value = null
  draftGrades.value = []
}

function addGrade() {
  if (draftGrades.value.length >= 2) return
  draftGrades.value.push(null)
}

function updateDraftGrade(index, value) {
  draftGrades.value[index] = value ? Number(value) : null
}

async function saveCellGrade() {
  if (!editingCell.value || saving.value) return

  const grades = draftGrades.value.filter((grade) => grade !== null)
  if (grades.some((grade) => ![2, 3, 4, 5].includes(grade))) return

  saving.value = true
  error.value = ''

  try {
    await saveGrade({
      studentId: editingCell.value.studentId,
      subjectId: props.filters.subject,
      date: editingCell.value.date,
      grades,
    })

    const student = students.value.find((item) => item.id === editingCell.value.studentId)
    if (student) {
      if (!student.grades) student.grades = {}
      if (grades.length) student.grades[editingCell.value.date] = grades
      else delete student.grades[editingCell.value.date]
      student.averageGrade = calculateStudentAverage(student)
    }

    closeEditor()
  } catch (e) {
    error.value = 'Не удалось сохранить оценку'
  } finally {
    saving.value = false
  }
}

function calculateStudentAverage(student) {
  const values = Object.values(student.grades || {}).flat()
  if (!values.length) return 0
  return values.reduce((sum, grade) => sum + grade, 0) / values.length
}

function isEditing(student, date) {
  return editingCell.value?.studentId === student.id && editingCell.value?.date === date
}

function gradeClass(grade) {
  return {
    'grade--good': grade >= 4,
    'grade--warning': grade === 3,
    'grade--bad': grade === 2,
  }
}

function changeClass(value) {
  if (value === null) return ''
  return value > 0 ? 'trend--up' : value < 0 ? 'trend--down' : 'trend--neutral'
}

function formatChange(value, suffix = '') {
  if (value === null) return ''
  if (value > 0) return `↑ ${value.toFixed(value % 1 ? 2 : 0)}${suffix}`
  if (value < 0) return `↓ ${Math.abs(value).toFixed(value % 1 ? 2 : 0)}${suffix}`
  return `→ 0${suffix}`
}

function formatPercent(value) {
  return `${Math.round(value)}%`
}

onMounted(() => {
  setPeriod('month')
})
</script>

<template>
  <div class="grades">
    <div class="grades__toolbar">
      <div class="period">
        <span class="period__label">Период</span>
        <div class="period__field">
          <input v-model="startDate" type="date" @change="applyCustomPeriod" />
          <span>–</span>
          <input v-model="endDate" type="date" @change="applyCustomPeriod" />
          <Icon name="calendar" :size="15" />
        </div>
      </div>

      <div class="period-switcher">
        <button
          v-for="item in periodOptions"
          :key="item.value"
          type="button"
          :class="{ 'period-switcher__item--active': period === item.value }"
          @click="setPeriod(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <div class="grades__summary">
      <section class="analytics-card">
        <div class="analytics-card__header">
          <div>
            <span class="analytics-card__title">Средний балл</span>
            <strong class="analytics-card__value">{{ averageGrade.toFixed(2) }}</strong>
          </div>
          <span v-if="averageChange !== null" class="trend" :class="changeClass(averageChange)">
            {{ formatChange(averageChange) }} к периоду {{ formatDateRange() }}
          </span>
        </div>
        <div class="chart chart--line">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="avgFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stop-color="#2F80ED" stop-opacity="0.2" />
                <stop offset="1" stop-color="#2F80ED" stop-opacity="0" />
              </linearGradient>
            </defs>
            <polygon v-if="averagePath" :points="`0,60 ${averagePath} 100,60`" fill="url(#avgFill)" />
            <polyline v-if="averagePath" :points="averagePath" fill="none" stroke="#2F80ED" stroke-width="1.8" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
        <div class="chart-labels">
          <span v-for="date in dates.filter((_, index) => index % Math.max(1, Math.ceil(dates.length / 5)) === 0).slice(0, 5)" :key="date.value">{{ date.day }} {{ date.month }}</span>
        </div>
      </section>

      <section class="analytics-card distribution-card">
        <div class="analytics-card__title">Распределение оценок</div>
        <div class="distribution">
          <div class="donut" :style="donutStyle">
            <div class="donut__center">
              <strong>{{ totalGrades }}</strong>
              <span>оценок</span>
            </div>
          </div>
          <div class="distribution__legend">
            <div v-for="item in distribution" :key="item.grade" class="distribution__item">
              <span class="distribution__dot" :class="`distribution__dot--${item.grade}`"></span>
              <span>{{ item.grade }} ({{ item.percent }}%)</span>
              <strong>{{ item.count }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="analytics-card">
        <div class="analytics-card__header">
          <div>
            <span class="analytics-card__title">Качество знаний</span>
            <strong class="analytics-card__value">{{ knowledgeQuality }}%</strong>
          </div>
          <span v-if="qualityChange !== null" class="trend" :class="changeClass(qualityChange)">
            {{ formatChange(qualityChange, '%') }} к периоду
          </span>
        </div>
        <div class="chart chart--quality">
          <div class="chart-grid"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div>
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <polyline v-if="qualityPath" :points="qualityPath" fill="none" stroke="#8B5CF6" stroke-width="1.8" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
        <div class="chart-labels">
          <span v-for="date in dates.filter((_, index) => index % Math.max(1, Math.ceil(dates.length / 5)) === 0).slice(0, 5)" :key="date.value">{{ date.day }} {{ date.month }}</span>
        </div>
      </section>

      <section class="analytics-card">
        <div class="analytics-card__header">
          <div>
            <span class="analytics-card__title">Двоек</span>
            <strong class="analytics-card__value">{{ failCount }}</strong>
          </div>
          <span v-if="failsChange !== null" class="trend" :class="changeClass(-failsChange)">
            {{ formatChange(-failsChange) }} к периоду
          </span>
        </div>
        <div class="chart chart--fails">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <polyline v-if="failsPath" :points="failsPath" fill="none" stroke="#E45757" stroke-width="1.8" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
        <div class="chart-labels">
          <span v-for="date in dates.filter((_, index) => index % Math.max(1, Math.ceil(dates.length / 5)) === 0).slice(0, 5)" :key="date.value">{{ date.day }} {{ date.month }}</span>
        </div>
      </section>
    </div>

    <div class="grades__content">
      <section v-if="!loading" class="card gradebook-card">
        <div class="gradebook-card__header">
          <div>
            <h3>Оценки студентов</h3>
            <span>{{ students.length }} студентов · {{ totalGrades }} оценок</span>
          </div>
          <span class="gradebook-card__sort">По дате (сначала новые) <Icon name="chevron-down" :size="13" /></span>
        </div>

        <div class="table-wrap">
          <table class="gradebook">
            <thead>
              <tr>
                <th class="gradebook__student-head">Студент</th>
                <th class="gradebook__average-head">Средний балл</th>
                <th v-for="date in dates" :key="date.value" class="gradebook__date">
                  <span>{{ date.day }}</span>
                  <small>{{ date.month }}</small>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td class="gradebook__student">
                  <div class="avatar">
                    <img v-if="student.photo" :src="student.photo" alt="" />
                    <span v-else>{{ student.fullName.charAt(0) }}</span>
                  </div>
                  <span>{{ student.fullName }}</span>
                </td>

                <td class="gradebook__average">
                  {{ student.averageGrade ? student.averageGrade.toFixed(2) : '—' }}
                </td>

                <td v-for="date in dates" :key="getCellKey(student.id, date.value)" class="gradebook__cell">
                  <div v-if="isEditing(student, date.value)" class="grade-editor">
                    <div class="grade-editor__fields">
                      <select
                        v-for="(_, index) in draftGrades"
                        :key="index"
                        :value="draftGrades[index] || ''"
                        @change="updateDraftGrade(index, $event.target.value)"
                      >
                        <option value="">—</option>
                        <option :value="2">2</option>
                        <option :value="3">3</option>
                        <option :value="4">4</option>
                        <option :value="5">5</option>
                      </select>
                    </div>

                    <div class="grade-editor__actions">
                      <button v-if="draftGrades.length < 2" type="button" class="grade-editor__add" @click="addGrade">+</button>
                      <button type="button" class="grade-editor__cancel" @click="closeEditor">×</button>
                      <button type="button" class="grade-editor__save" :disabled="saving" @click="saveCellGrade">✓</button>
                    </div>
                  </div>

                  <button v-else type="button" class="grade-cell" @click="openEditor(student, date.value)">
                    <span
                      v-for="(grade, index) in getGrades(student, date.value)"
                      :key="`${date.value}_${index}`"
                      class="grade"
                      :class="gradeClass(grade)"
                    >
                      {{ index ? `/${grade}` : grade }}
                    </span>
                    <span v-if="!getGrades(student, date.value).length" class="grade-cell__empty">+</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!students.length" class="grades__empty">В выбранной группе нет студентов</div>
      </section>

      <section v-else class="grades__loading">Загрузка…</section>

      <aside v-if="!loading" class="card date-distribution-card">
        <div class="date-distribution-card__header">
          <h3>Распределение оценок по датам</h3>
        </div>
        <div class="date-table-wrap">
          <table class="date-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>5</th>
                <th>4</th>
                <th>3</th>
                <th>2</th>
                <th>1</th>
                <th>Всего</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in dateDistribution" :key="row.value">
                <td>{{ row.day }}.{{ row.value.slice(5, 7) }}</td>
                <td><span class="date-value date-value--5">{{ row[5] }}</span></td>
                <td><span class="date-value date-value--4">{{ row[4] }}</span></td>
                <td><span class="date-value date-value--3">{{ row[3] }}</span></td>
                <td><span class="date-value date-value--2">{{ row[2] }}</span></td>
                <td>{{ row[1] }}</td>
                <td>{{ row.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </aside>
    </div>

    <div v-if="error" class="grades__error">{{ error }}</div>
  </div>
</template>

<style scoped>
.grades {
  min-width: 0;
}

.grades__toolbar {
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
  border: none;
  outline: none;
  color: var(--color-text);
  font-size: 12px;
  width: 105px;
  background: transparent;
}

.period__field span {
  color: var(--color-text-muted);
}

.period__field svg {
  color: var(--color-text-muted);
}

.period-switcher {
  display: flex;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-card);
}

.period-switcher button {
  border: none;
  background: transparent;
  border-radius: 6px;
  padding: 7px 12px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.period-switcher__item--active {
  background: var(--color-primary);
  color: #fff !important;
}

.grades__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  min-width: 0;
  min-height: 174px;
  padding: 16px;
  overflow: hidden;
}

.analytics-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.analytics-card__title {
  display: block;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 5px;
}

.analytics-card__value {
  display: block;
  color: var(--color-text);
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.3px;
}

.trend {
  font-size: 9px;
  line-height: 1.35;
  text-align: right;
  max-width: 115px;
}

.trend--up {
  color: var(--color-success);
}

.trend--down {
  color: var(--color-danger);
}

.trend--neutral {
  color: var(--color-text-muted);
}

.chart {
  position: relative;
  height: 82px;
  margin-top: 12px;
}

.chart svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart--quality {
  padding-left: 25px;
}

.chart-grid {
  position: absolute;
  inset: 0 auto 0 0;
  width: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #A2A9B7;
  font-size: 8px;
}

.chart-grid::after {
  content: '';
  position: absolute;
  left: 25px;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: #EEF1F5;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  color: #9AA2B2;
  font-size: 8px;
  margin-top: -1px;
  padding-left: 2px;
}

.distribution-card {
  padding-bottom: 13px;
}

.distribution {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 13px;
}

.donut {
  width: 92px;
  height: 92px;
  flex: 0 0 92px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.donut::before {
  content: '';
  position: absolute;
  inset: 13px;
  border-radius: 50%;
  background: var(--color-card);
}

.donut__center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donut__center strong {
  font-size: 18px;
  line-height: 1;
}

.donut__center span {
  color: var(--color-text-muted);
  font-size: 8px;
  margin-top: 3px;
}

.distribution__legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.distribution__item {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 10px;
}

.distribution__item strong {
  color: var(--color-text);
  font-size: 10px;
}

.distribution__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.distribution__dot--5 { background: var(--color-success); }
.distribution__dot--4 { background: #F4B400; }
.distribution__dot--3 { background: #F9C23C; }
.distribution__dot--2 { background: var(--color-danger); }
.distribution__dot--1 { background: #D7DCE5; }

.grades__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 12px;
  align-items: start;
}

.gradebook-card {
  min-width: 0;
  overflow: hidden;
}

.gradebook-card__header,
.date-distribution-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
}

.gradebook-card__header h3,
.date-distribution-card__header h3 {
  margin: 0;
  font-size: 13px;
}

.gradebook-card__header span {
  display: block;
  margin-top: 3px;
  color: var(--color-text-muted);
  font-size: 9px;
}

.gradebook-card__sort {
  display: flex !important;
  align-items: center;
  gap: 5px;
  margin: 0 !important;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.table-wrap,
.date-table-wrap {
  width: 100%;
  overflow: auto;
}

.gradebook {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 11px;
}

.gradebook th,
.gradebook td {
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
}

.gradebook th:last-child,
.gradebook td:last-child {
  border-right: none;
}

.gradebook th {
  height: 48px;
  background: #FAFBFD;
  color: var(--color-text-muted);
  font-weight: 600;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 2;
}

.gradebook__student-head {
  width: 205px;
  min-width: 205px;
  text-align: left !important;
  padding: 0 12px;
  position: sticky !important;
  left: 0;
  z-index: 4 !important;
}

.gradebook__average-head {
  width: 82px;
  min-width: 82px;
  position: sticky !important;
  left: 205px;
  z-index: 4 !important;
}

.gradebook__date {
  width: 52px;
  min-width: 52px;
  line-height: 1.1;
}

.gradebook__date span {
  display: block;
  color: var(--color-text);
  font-size: 11px;
}

.gradebook__date small {
  display: block;
  margin-top: 3px;
  color: var(--color-text-muted);
  font-size: 8px;
  font-weight: 500;
}

.gradebook__student {
  width: 205px;
  min-width: 205px;
  padding: 7px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-card);
  position: sticky;
  left: 0;
  z-index: 1;
  font-weight: 600;
  white-space: nowrap;
}

.avatar {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 50%;
  overflow: hidden;
  background: #EDEFF5;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gradebook__average {
  width: 82px;
  min-width: 82px;
  text-align: center;
  font-weight: 600;
  background: var(--color-card);
  position: sticky;
  left: 205px;
  z-index: 1;
}

.gradebook__cell {
  width: 52px;
  min-width: 52px;
  height: 42px;
  padding: 3px;
  text-align: center;
  background: var(--color-card);
}

.grade-cell {
  width: 100%;
  height: 28px;
  border: none;
  border-radius: 5px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 0;
  color: var(--color-text);
  font-size: 11px;
  font-weight: 700;
}

.grade-cell:hover {
  background: var(--color-primary-soft);
}

.grade-cell__empty {
  color: #B8BFCE;
  font-size: 15px;
  font-weight: 400;
}

.grade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 12px;
}

.grade--good { color: var(--color-success); }
.grade--warning { color: var(--color-warning); }
.grade--bad { color: var(--color-danger); }

.grade-editor {
  width: 126px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-card);
  box-shadow: 0 5px 18px rgba(16, 24, 40, 0.12);
  position: relative;
  z-index: 5;
}

.grade-editor__fields {
  display: flex;
  gap: 4px;
}

.grade-editor select {
  width: 50px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  padding: 4px;
  font-size: 11px;
  background: var(--color-card);
}

.grade-editor__actions {
  display: flex;
  justify-content: flex-end;
  gap: 3px;
  margin-top: 5px;
}

.grade-editor__actions button {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grade-editor__add { background: var(--color-primary-soft); color: var(--color-primary); }
.grade-editor__cancel { background: #F3F4F7; color: var(--color-text-muted); }
.grade-editor__save { background: var(--color-primary); color: #fff; }
.grade-editor__save:disabled { opacity: 0.5; }

.date-distribution-card {
  overflow: hidden;
}

.date-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.date-table th,
.date-table td {
  padding: 7px 4px;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.date-table th {
  color: var(--color-text-muted);
  font-weight: 600;
  background: #FAFBFD;
}

.date-table td:first-child,
.date-table th:first-child {
  text-align: left;
  padding-left: 10px;
}

.date-value {
  display: inline-flex;
  min-width: 24px;
  justify-content: center;
  padding: 2px 4px;
  border-radius: 4px;
}

.date-value--5 { background: #E5F5EB; color: #2E9B59; }
.date-value--4 { background: #EDF8EF; color: #4AA667; }
.date-value--3 { background: #FFF4D8; color: #C99019; }
.date-value--2 { background: #FCE7E7; color: #D95353; }

.grades__error {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: #FEF2F2;
  color: var(--color-danger);
  font-size: 12px;
}

.grades__empty,
.grades__loading {
  padding: 50px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

@media (max-width: 1180px) {
  .grades__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grades__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .grades__summary {
    grid-template-columns: 1fr;
  }

  .grades__toolbar {
    align-items: stretch;
  }

  .period {
    flex-wrap: wrap;
  }
}
</style>
