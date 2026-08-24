<script setup>
import { computed, onMounted, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { getAttendance, saveAttendance } from '../services/api'

const props = defineProps({
  filters: { type: Object, required: true },
})

const loading = ref(true)
const saving = ref(false)
const attendanceBook = ref(null)
const period = ref('month')
const startDate = ref('')
const endDate = ref('')
const editingCell = ref(null)
const error = ref('')

const periodOptions = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'semester', label: 'Семестр' },
  { value: 'year', label: 'Весь период' },
]

const statusOptions = [
  { value: 'present', label: 'Присутствует', short: '✓' },
  { value: 'late', label: 'Опоздал', short: 'У' },
  { value: 'absent', label: 'Отсутствует', short: '×' },
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
        day: String(current.getDate()).padStart(2, '0'),
        month: String(current.getMonth() + 1).padStart(2, '0'),
        weekday: current.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''),
      })
    }
    current.setDate(current.getDate() + 1)
  }

  return result
})

const students = computed(() => attendanceBook.value?.students || [])

const totalStudents = computed(() => students.value.length)

const totalScheduledHours = computed(() => {
  return totalStudents.value * dates.value.length * 2
})

const totalMissedHours = computed(() => {
  return students.value.reduce((sum, student) => sum + getStudentMissedHours(student), 0)
})

const totalPresentHours = computed(() => Math.max(0, totalScheduledHours.value - totalMissedHours.value))

const overallAttendance = computed(() => {
  if (!totalScheduledHours.value) return 0
  return Math.round((totalPresentHours.value / totalScheduledHours.value) * 100)
})

const totalAbsences = computed(() => {
  return students.value.reduce((sum, student) => {
    return sum + Object.values(student.attendance || {}).filter((item) => item.status !== 'present').length
  }, 0)
})

const excusedHours = computed(() => {
  return students.value.reduce((sum, student) => {
    return sum + Object.values(student.attendance || {})
      .filter((item) => item.status === 'absent' && item.reason === 'excused')
      .reduce((hours, item) => hours + statusHours(item.status), 0)
  }, 0)
})

const unexcusedHours = computed(() => {
  return students.value.reduce((sum, student) => {
    return sum + Object.values(student.attendance || {})
      .filter((item) => item.status === 'absent' && item.reason !== 'excused')
      .reduce((hours, item) => hours + statusHours(item.status), 0)
  }, 0)
})

const studentsWithoutAbsences = computed(() => {
  return students.value.filter((student) => getStudentMissedHours(student) === 0).length
})

const noAbsencePercent = computed(() => {
  if (!totalStudents.value) return 0
  return Math.round((studentsWithoutAbsences.value / totalStudents.value) * 100)
})

const attendanceTrend = computed(() => {
  return dates.value.map((date) => {
    let scheduled = students.value.length * 2
    let missed = 0

    students.value.forEach((student) => {
      const item = student.attendance?.[date.value]
      missed += item ? statusHours(item.status) : 0
    })

    if (!scheduled) return 0
    return Math.round(((scheduled - missed) / scheduled) * 100)
  })
})

const missesTrend = computed(() => {
  return dates.value.map((date) => {
    return students.value.reduce((sum, student) => {
      const item = student.attendance?.[date.value]
      return sum + (item ? statusHours(item.status) : 0)
    }, 0)
  })
})

const dailyDistribution = computed(() => {
  return dates.value.map((date) => {
    let scheduled = students.value.length * 2
    let missed = 0
    let late = 0

    students.value.forEach((student) => {
      const item = student.attendance?.[date.value]
      if (!item) return
      missed += statusHours(item.status)
      if (item.status === 'late') late += 1
    })

    return {
      ...date,
      attendance: scheduled ? Math.round(((scheduled - missed) / scheduled) * 100) : 0,
      late,
    }
  })
})

const attendancePath = computed(() => buildLinePath(attendanceTrend.value, 50, 100))
const missesPath = computed(() => buildLinePath(missesTrend.value, 0, Math.max(4, ...missesTrend.value)))

const chartDates = computed(() => {
  const step = Math.max(1, Math.ceil(dates.value.length / 5))
  return dates.value.filter((_, index) => index % step === 0).slice(0, 5)
})

const excusedPercent = computed(() => {
  return totalMissedHours.value ? Math.round(excusedHours.value / totalMissedHours.value * 100) : 0
})

const unexcusedPercent = computed(() => {
  return totalMissedHours.value ? Math.round(unexcusedHours.value / totalMissedHours.value * 100) : 0
})

const excusedDonutStyle = computed(() => ({
  background: `conic-gradient(#2A5BFF 0 ${excusedPercent.value}%, #E9EDF5 0)`
}))

const unexcusedDonutStyle = computed(() => ({
  background: `conic-gradient(#8B5CF6 0 ${unexcusedPercent.value}%, #E9EDF5 0)`
}))

function getStatusTitle(student, date) {
  const status = getStudentStatus(student, date).status
  return `${getStatusOption(status).label}: ${statusHours(status)} ч.`
}

function getStatusHoursLabel(student, date) {
  const hours = statusHours(getStudentStatus(student, date).status)
  return `${hours} ${hours === 1 ? 'час' : 'часа'}`
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  loadAttendance()
}

function formatDateRange() {
  if (!startDate.value || !endDate.value) return ''
  const start = new Date(`${startDate.value}T00:00:00`)
  const end = new Date(`${endDate.value}T00:00:00`)
  return `${start.toLocaleDateString('ru-RU')} – ${end.toLocaleDateString('ru-RU')}`
}

function applyCustomPeriod() {
  if (startDate.value && endDate.value) loadAttendance()
}

async function loadAttendance() {
  loading.value = true
  error.value = ''
  editingCell.value = null

  try {
    attendanceBook.value = await getAttendance({
      group: props.filters.group,
      subject: props.filters.subject,
      startDate: startDate.value,
      endDate: endDate.value,
    })
  } catch (e) {
    error.value = 'Не удалось загрузить посещаемость'
  } finally {
    loading.value = false
  }
}

function statusHours(status) {
  if (status === 'absent') return 2
  if (status === 'late') return 1
  return 0
}

function getStudentMissedHours(student) {
  return Object.values(student.attendance || {}).reduce((sum, item) => sum + statusHours(item.status), 0)
}


function getAttendanceClass(value) {
  if (value >= 80) return 'attendance-percent--good'
  if (value >= 65) return 'attendance-percent--warning'
  return 'attendance-percent--bad'
}

function getDailyClass(value) {
  if (value >= 80) return 'daily-value--good'
  if (value >= 65) return 'daily-value--warning'
  return 'daily-value--bad'
}

function getStudentAttendance(student) {
  const scheduled = dates.value.length * 2
  if (!scheduled) return 0
  return Math.round(((scheduled - getStudentMissedHours(student)) / scheduled) * 100)
}

function getStudentStatus(student, date) {
  return student.attendance?.[date] || { status: 'present' }
}

function getStatusOption(status) {
  return statusOptions.find((item) => item.value === status) || statusOptions[0]
}

function getCellKey(studentId, date) {
  return `${studentId}_${date}`
}

function isEditing(student, date) {
  return editingCell.value?.studentId === student.id && editingCell.value?.date === date
}

function openEditor(student, date) {
  editingCell.value = { studentId: student.id, date }
}

function closeEditor() {
  editingCell.value = null
}

async function chooseStatus(student, date, status) {
  if (saving.value) return

  saving.value = true
  error.value = ''

  const current = getStudentStatus(student, date)
  const next = {
    status,
    reason: status === 'absent' ? (current.reason || 'unexcused') : null,
  }

  try {
    await saveAttendance({
      studentId: student.id,
      subjectId: props.filters.subject,
      date,
      status,
      hours: statusHours(status),
      reason: next.reason,
    })

    if (!student.attendance) student.attendance = {}
    student.attendance[date] = next
    closeEditor()
  } catch (e) {
    error.value = 'Не удалось сохранить посещаемость'
  } finally {
    saving.value = false
  }
}

function buildLinePath(values, min, max) {
  if (!values.length) return ''
  if (values.length === 1) return '0,40'

  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100
    const ratio = max === min ? 0.5 : (value - min) / (max - min)
    const y = 50 - Math.max(0, Math.min(1, ratio)) * 38
    return `${x},${y}`
  }).join(' ')
}

function formatChange(value, suffix = '') {
  if (value === 0) return '→ 0' + suffix
  return value > 0 ? `↑ ${value}${suffix}` : `↓ ${Math.abs(value)}${suffix}`
}

const previousAttendance = computed(() => attendanceBook.value?.previousAttendance ?? 76)
const attendanceChange = computed(() => overallAttendance.value - previousAttendance.value)

const previousMissedHours = computed(() => attendanceBook.value?.previousMissedHours ?? 44)
const missedHoursChange = computed(() => totalMissedHours.value - previousMissedHours.value)
const missedHoursImproved = computed(() => missedHoursChange.value <= 0)

onMounted(() => {
  setPeriod('month')
})
</script>

<template>
  <div class="attendance">
    <div class="attendance__toolbar">
      <div class="period">
        <span class="period__label">Период</span>
        <div class="period__field">
          <input v-model="startDate" type="date" @change="applyCustomPeriod" />
          <span>–</span>
          <input v-model="endDate" type="date" @change="applyCustomPeriod" />
          <span class="period__icon">◫</span>
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

    <div v-if="!loading" class="attendance__summary">
      <section class="analytics-card">
        <div class="analytics-card__header">
          <div>
            <span class="analytics-card__title">Общая посещаемость</span>
            <strong class="analytics-card__value">{{ overallAttendance }}%</strong>
          </div>
          <span class="trend" :class="attendanceChange >= 0 ? 'trend--up' : 'trend--down'">
            {{ formatChange(attendanceChange, '%') }} к предыдущему периоду
          </span>
        </div>

        <div class="chart chart--line">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <polyline
              v-if="attendancePath"
              :points="attendancePath"
              fill="none"
              stroke="#22A55A"
              stroke-width="1.8"
              vector-effect="non-scaling-stroke"
            ></polyline>
          </svg>
        </div>

        <div class="chart-labels">
          <span
            v-for="date in chartDates"
            :key="date.value"
          >
            {{ date.day }} {{ date.month }}
          </span>
        </div>
      </section>

      <section class="analytics-card">
        <div class="analytics-card__header">
          <div>
            <span class="analytics-card__title">Пропуски</span>
            <strong class="analytics-card__value">{{ totalMissedHours }}</strong>
          </div>
          <span class="trend" :class="missedHoursImproved ? 'trend--up' : 'trend--down'">
            {{ formatChange(-missedHoursChange) }} к предыдущему периоду
          </span>
        </div>

        <div class="chart chart--line">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none">
            <polyline
              v-if="missesPath"
              :points="missesPath"
              fill="none"
              stroke="#EF4444"
              stroke-width="1.8"
              vector-effect="non-scaling-stroke"
            ></polyline>
          </svg>
        </div>

        <div class="chart-labels">
          <span
            v-for="date in chartDates"
            :key="date.value"
          >
            {{ date.day }} {{ date.month }}
          </span>
        </div>
      </section>

      <section class="analytics-card donut-card">
        <div class="analytics-card__header">
          <div>
            <span class="analytics-card__title">По уважительной причине</span>
            <strong class="analytics-card__value">{{ excusedHours }}</strong>
          </div>
          <span class="trend trend--blue">
            {{ excusedPercent }}% от всех пропусков
          </span>
        </div>

        <div class="donut-wrap">
          <div
            class="donut"
            :style="excusedDonutStyle"
          >
            <div class="donut__center">
              <strong>{{ excusedPercent }}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="analytics-card donut-card">
        <div class="analytics-card__header">
          <div>
            <span class="analytics-card__title">По неуважительной причине</span>
            <strong class="analytics-card__value">{{ unexcusedHours }}</strong>
          </div>
          <span class="trend trend--purple">
            {{ unexcusedPercent }}% от всех пропусков
          </span>
        </div>

        <div class="donut-wrap">
          <div
            class="donut"
            :style="unexcusedDonutStyle"
          >
            <div class="donut__center">
              <strong>{{ unexcusedPercent }}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="analytics-card no-absence-card">
        <div class="analytics-card__title">Студентов без пропусков</div>
        <strong class="analytics-card__value">{{ studentsWithoutAbsences }}</strong>
        <span class="analytics-card__sub">из {{ totalStudents }}</span>
        <div class="people-dots">
          <span
            v-for="student in students"
            :key="student.id"
            class="people-dot"
            :class="{ 'people-dot--empty': getStudentMissedHours(student) > 0 }"
          >
            ●
          </span>
        </div>
        <strong class="no-absence-card__percent">{{ noAbsencePercent }}%</strong>
      </section>
    </div>

    <div v-if="!loading" class="attendance__content">
      <section class="card attendance-card">
        <div class="attendance-card__header">
          <div>
            <h3>Посещаемость студентов</h3>
            <span>{{ totalStudents }} студентов · {{ totalMissedHours }} часов пропущено</span>
          </div>
          <span class="attendance-card__sort">По дате (сначала новые) <span class="sort-icon">⌄</span></span>
        </div>

        <div class="table-wrap">
          <table class="attendance-table">
            <thead>
              <tr>
                <th class="student-head">Студент</th>
                <th class="attendance-head">Посещаемость</th>
                <th class="absence-head">Пропуски</th>
                <th v-for="date in dates" :key="date.value" class="date-head">
                  <span>{{ date.day }}.{{ date.month }}</span>
                  <small>{{ date.weekday }}</small>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td class="student-cell">
                  <div class="avatar">
                    <img v-if="student.photo" :src="student.photo" alt="" />
                    <span v-else>{{ student.fullName.charAt(0) }}</span>
                  </div>
                  <span>{{ student.fullName }}</span>
                </td>

                <td
                  class="attendance-percent"
                  :class="getAttendanceClass(getStudentAttendance(student))"
                >
                  {{ getStudentAttendance(student) }}%
                </td>

                <td class="absence-count">
                  <span>{{ getStudentMissedHours(student) }}</span>
                  <small>ч</small>
                </td>

                <td v-for="date in dates" :key="getCellKey(student.id, date.value)" class="status-cell">
                  <div v-if="isEditing(student, date.value)" class="status-editor">
                    <button
                      v-for="option in statusOptions"
                      :key="option.value"
                      type="button"
                      :class="`status-editor__item status-editor__item--${option.value}`"
                      :disabled="saving"
                      @click="chooseStatus(student, date.value, option.value)"
                    >
                      <span>{{ option.short }}</span>
                      {{ option.label }}
                    </button>
                  </div>

                  <button
                    v-else
                    type="button"
                    class="status-button"
                    :class="`status-button--${getStudentStatus(student, date.value).status}`"
                    :title="getStatusTitle(student, date.value)"
                    @click="openEditor(student, date.value)"
                  >
                    <span>{{ getStatusOption(getStudentStatus(student, date.value).status).short }}</span>

                    <span class="status-tooltip">
                      {{ getStatusOption(getStudentStatus(student, date.value).status).label }}
                      <strong>{{ getStatusHoursLabel(student, date.value) }}</strong>
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="attendance-card__footer">
          <div class="legend">
            <span><i class="legend__mark legend__mark--present">✓</i> Присутствовал</span>
            <span><i class="legend__mark legend__mark--absent">×</i> Отсутствовал</span>
            <span><i class="legend__mark legend__mark--late">У</i> Опоздал</span>
          </div>

          <div class="pagination">
            <span>Показано 1–{{ Math.min(10, students.length) }} из {{ students.length }}</span>
            <button type="button">‹</button>
            <button type="button" class="pagination__active">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">›</button>
          </div>
        </div>
      </section>

      <aside class="card daily-card">
        <div class="daily-card__header">
          <h3>Посещаемость по дням</h3>
        </div>

        <div class="daily-table-wrap">
          <table class="daily-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Пн</th>
                <th>Вт</th>
                <th>Ср</th>
                <th>Чт</th>
                <th>Пт</th>
                <th>Сб</th>
                <th>Вс</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in dailyDistribution" :key="row.value">
                <td>{{ row.day }}.{{ row.month }}</td>
                <td colspan="7">
                  <span
                    class="daily-value"
                    :class="getDailyClass(row.attendance)"
                  >
                    {{ row.attendance }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </aside>
    </div>

    <div v-if="loading" class="attendance__loading">Загрузка…</div>
    <div v-if="error" class="attendance__error">{{ error }}</div>
  </div>
</template>

<style scoped>
.attendance {
  min-width: 0;
}

.attendance__toolbar {
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

.attendance__summary {
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
  color: var(--color-text);
  font-size: 12px;
  font-weight: 700;
}

.analytics-card__value {
  display: block;
  margin-top: 6px;
  color: var(--color-text);
  font-size: 22px;
  line-height: 1;
}

.analytics-card__sub {
  display: block;
  color: var(--color-text-muted);
  font-size: 11px;
  margin-top: 4px;
}

.trend {
  display: block;
  max-width: 170px;
  color: var(--color-text-muted);
  font-size: 10px;
  line-height: 1.35;
}

.trend--up {
  color: var(--color-success);
}

.trend--down {
  color: var(--color-danger);
}

.trend--blue {
  color: var(--color-primary);
}

.trend--purple {
  color: #8B5CF6;
}

.chart {
  height: 76px;
  margin-top: 10px;
}

.chart svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: 9px;
}

.donut-card {
  display: flex;
  flex-direction: column;
}

.donut-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.donut__center {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--color-card);
  color: var(--color-text);
}

.donut__center strong {
  font-size: 15px;
}

.no-absence-card {
  position: relative;
}

.people-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 16px;
  max-width: 150px;
  color: #22A55A;
  font-size: 14px;
  line-height: 1;
}

.people-dot--empty {
  color: #C9CFDB;
}

.no-absence-card__percent {
  display: block;
  margin-top: 9px;
  color: var(--color-success);
  font-size: 14px;
}

.attendance__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 12px;
  align-items: start;
}

.attendance-card {
  min-width: 0;
  overflow: hidden;
}

.attendance-card__header,
.daily-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 16px;
  border-bottom: 1px solid var(--color-border);
}

.attendance-card__header h3,
.daily-card__header h3 {
  margin: 0;
  font-size: 13px;
}

.attendance-card__header span,
.attendance-card__sort {
  color: var(--color-text-muted);
  font-size: 10px;
}

.table-wrap {
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  min-width: 1050px;
  border-collapse: separate;
  border-spacing: 0;
}

.attendance-table th,
.attendance-table td {
  border-bottom: 1px solid #EEF1F6;
}

.attendance-table th {
  height: 46px;
  background: #FBFCFE;
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.student-head {
  width: 210px;
  text-align: left !important;
  padding-left: 16px;
  position: sticky;
  left: 0;
  z-index: 3;
}

.attendance-head {
  width: 90px;
}

.absence-head {
  width: 65px;
}

.date-head {
  width: 54px;
  min-width: 54px;
}

.date-head span,
.date-head small {
  display: block;
}

.date-head small {
  margin-top: 3px;
  font-size: 8px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.student-cell {
  height: 46px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 12px 0 16px;
  background: var(--color-card);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  position: sticky;
  left: 0;
  z-index: 2;
}

.avatar {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: #EAF0FF;
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 700;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attendance-percent {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
}

.attendance-percent--good {
  color: var(--color-success);
}

.attendance-percent--warning {
  color: var(--color-warning);
}

.attendance-percent--bad {
  color: var(--color-danger);
}

.absence-count {
  text-align: center;
  color: var(--color-text);
  font-size: 11px;
  font-weight: 600;
}

.absence-count small {
  color: var(--color-text-muted);
  font-size: 9px;
}

.status-cell {
  width: 54px;
  min-width: 54px;
  height: 46px;
  text-align: center;
  position: relative;
}

.status-button {
  position: relative;
  width: 25px;
  height: 25px;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 800;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.status-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(16, 24, 40, 0.12);
}

.status-button--present {
  background: #E9F8EF;
  color: #22A55A;
}

.status-button--absent {
  background: #FDEBEC;
  color: #E45757;
}

.status-button--late {
  background: #FFF4D8;
  color: #F0A61A;
}

.status-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  z-index: 10;
  min-width: 94px;
  padding: 7px 9px;
  border-radius: 7px;
  background: #1B2035;
  color: #fff;
  font-size: 10px;
  line-height: 1.25;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 4px);
  transition: opacity 0.12s ease, transform 0.12s ease;
  white-space: nowrap;
}

.status-tooltip::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 8px;
  height: 8px;
  background: #1B2035;
  transform: translateX(-50%) rotate(45deg);
}

.status-tooltip strong {
  display: block;
  margin-top: 3px;
}

.status-button:hover .status-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.status-editor {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 20;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 3px;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 22px rgba(16, 24, 40, 0.16);
}

.status-editor__item {
  display: grid;
  place-items: center;
  gap: 2px;
  min-width: 68px;
  padding: 6px 5px;
  border: none;
  border-radius: 6px;
  background: #F7F8FB;
  color: var(--color-text);
  font-size: 8px;
}

.status-editor__item span {
  font-size: 12px;
  font-weight: 800;
}

.status-editor__item--present span {
  color: var(--color-success);
}

.status-editor__item--late span {
  color: var(--color-warning);
}

.status-editor__item--absent span {
  color: var(--color-danger);
}

.attendance-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--color-text-muted);
  font-size: 9px;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend__mark {
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  border-radius: 5px;
  font-style: normal;
  font-weight: 800;
}

.legend__mark--present {
  background: #E9F8EF;
  color: #22A55A;
}

.legend__mark--absent {
  background: #FDEBEC;
  color: #E45757;
}

.legend__mark--late {
  background: #FFF4D8;
  color: #F0A61A;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-muted);
  font-size: 9px;
}

.pagination button {
  width: 24px;
  height: 24px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: #fff;
  color: var(--color-text);
}

.pagination__active {
  border-color: var(--color-primary) !important;
  color: var(--color-primary) !important;
}

.daily-card {
  min-width: 0;
  overflow: hidden;
}

.daily-table-wrap {
  overflow-x: auto;
}

.daily-table {
  width: 100%;
  border-collapse: collapse;
}

.daily-table th,
.daily-table td {
  border-bottom: 1px solid #EEF1F6;
  padding: 8px 6px;
  text-align: center;
  font-size: 9px;
}

.daily-table th {
  color: var(--color-text-muted);
  font-weight: 600;
  background: #FBFCFE;
}

.daily-table td:first-child {
  color: var(--color-text-muted);
  text-align: left;
  white-space: nowrap;
}

.daily-value {
  display: inline-block;
  min-width: 42px;
  padding: 3px 6px;
  border-radius: 5px;
  font-weight: 700;
}

.daily-value--good {
  background: #E9F8EF;
  color: #22A55A;
}

.daily-value--warning {
  background: #FFF4D8;
  color: #D78A00;
}

.daily-value--bad {
  background: #FDEBEC;
  color: #E45757;
}

.attendance__loading,
.attendance__error {
  padding: 40px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 12px;
}

.attendance__error {
  color: var(--color-danger);
}

@media (max-width: 1200px) {
  .attendance__summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .attendance__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 800px) {
  .attendance__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .attendance-card__footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
