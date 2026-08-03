<script setup>
import { ref, computed, onMounted } from 'vue'
import StudentRow from '../components/StudentRow.vue'
import StudentDetailPanel from '../components/StudentDetailPanel.vue'
import Icon from '../components/Icon.vue'
import { getStudents, getStudentQuickFilters } from '../services/api'

const students = ref([])
const quickFilters = ref([])
const loading = ref(true)

const search = ref('')
const activeFilter = ref('all')
const selectedId = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(async () => {
  const [studentsRes, filtersRes] = await Promise.all([getStudents(), getStudentQuickFilters()])
  students.value = studentsRes
  quickFilters.value = filtersRes
  selectedId.value = studentsRes[0]?.id ?? null
  loading.value = false
})

const filtered = computed(() => {
  let list = students.value

  if (activeFilter.value === 'risk') {
    list = list.filter((s) => s.riskLevel === 'high' || s.riskLevel === 'critical')
  } else if (activeFilter.value === 'absences') {
    list = list.filter((s) => s.absences >= 10)
  } else if (activeFilter.value === 'lowGrade') {
    list = list.filter((s) => s.averageGrade < 3.2)
  }

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter((s) => s.fullName.toLowerCase().includes(q))
  }

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const pagedStudents = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const selectedStudent = computed(() => students.value.find((s) => s.id === selectedId.value) || null)

function selectFilter(value) {
  activeFilter.value = value
  currentPage.value = 1
}

function selectStudent(id) {
  selectedId.value = id
}

function goToPage(page) {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value)
}
</script>

<template>
  <div v-if="!loading" class="students">
    <div class="students__grid">
      <div class="students__col">
        <div class="toolbar">
          <label class="search">
            <Icon name="search" :size="15" />
            <input v-model="search" type="text" placeholder="Поиск по ФИО студента" @input="currentPage = 1" />
          </label>
          <div class="chips">
            <button
              v-for="f in quickFilters"
              :key="f.value"
              type="button"
              class="chip"
              :class="{ 'chip--active': activeFilter === f.value }"
              @click="selectFilter(f.value)"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <section class="card list-card">
          <div class="list-card__header">
            <h3>Список студентов ({{ filtered.length }})</h3>
          </div>

          <div class="list-head">
            <span>Студент</span>
            <span>Средний балл</span>
            <span>Посещаемость</span>
            <span>Пропуски</span>
            <span>Риск</span>
            <span></span>
          </div>

          <div v-if="pagedStudents.length === 0" class="list-empty">Ничего не найдено</div>
          <StudentRow
            v-for="s in pagedStudents"
            :key="s.id"
            :student="s"
            :active="s.id === selectedId"
            @select="selectStudent"
          />

          <div class="pagination">
            <span class="pagination__info">
              Показано {{ pagedStudents.length ? (currentPage - 1) * pageSize + 1 : 0 }}–{{
                (currentPage - 1) * pageSize + pagedStudents.length
              }}
              из {{ filtered.length }}
            </span>
            <div class="pagination__pages">
              <button type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                <Icon name="chevron-right" :size="14" style="transform: rotate(180deg)" />
              </button>
              <button
                v-for="p in totalPages"
                :key="p"
                type="button"
                class="pagination__page"
                :class="{ 'pagination__page--active': p === currentPage }"
                @click="goToPage(p)"
              >
                {{ p }}
              </button>
              <button type="button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
                <Icon name="chevron-right" :size="14" />
              </button>
            </div>
            <label class="pagination__size">
              Показывать по:
              <select v-model.number="pageSize" @change="currentPage = 1">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </label>
          </div>
        </section>
      </div>

      <div class="students__col">
        <StudentDetailPanel v-if="selectedStudent" :student="selectedStudent" />
      </div>
    </div>
  </div>

  <div v-else class="students__loading">Загрузка…</div>
</template>

<style scoped>
.students__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 9px 14px;
  background: var(--color-card);
  flex: 1;
  min-width: 220px;
  color: var(--color-text-muted);
}
.search input {
  border: none;
  outline: none;
  font-size: 13px;
  width: 100%;
  color: var(--color-text);
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--color-border);
  background: var(--color-card);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.chip--active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.list-card {
  padding: 18px;
}
.list-card__header h3 {
  margin: 0 0 10px;
  font-size: 14.5px;
}

.list-head {
  display: grid;
  grid-template-columns: 1fr 60px 130px 70px 90px 28px;
  gap: 8px;
  padding: 0 8px 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 4px;
}

.list-empty {
  padding: 30px 0;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 14px;
  margin-top: 6px;
  border-top: 1px solid var(--color-border);
}
.pagination__info {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.pagination__pages {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pagination__pages button {
  border: 1px solid var(--color-border);
  background: var(--color-card);
  border-radius: var(--radius-sm);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-muted);
}
.pagination__pages button:disabled {
  opacity: 0.4;
}
.pagination__page--active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.pagination__size {
  font-size: 12px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.pagination__size select {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 6px;
  font-size: 12px;
}

.students__loading {
  padding: 60px 0;
  text-align: center;
  color: var(--color-text-muted);
}

@media (max-width: 960px) {
  .students__grid {
    grid-template-columns: 1fr;
  }
}
</style>
