<script setup>
import { ref, onMounted } from 'vue'
import GroupCard from '../components/GroupCard.vue'
import RiskItem from '../components/RiskItem.vue'
import ActivityChart from '../components/ActivityChart.vue'
import { getCurrentUser, getMyGroups, getActivity, getCurrentRisks } from '../services/api'

const user = ref(null)
const groups = ref([])
const activity = ref(null)
const risks = ref([])
const loading = ref(true)

const today = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

onMounted(async () => {
  const [userRes, groupsRes, activityRes, risksRes] = await Promise.all([
    getCurrentUser(),
    getMyGroups(),
    getActivity(),
    getCurrentRisks(),
  ])
  user.value = userRes
  groups.value = groupsRes
  activity.value = activityRes
  risks.value = risksRes
  loading.value = false
})
</script>

<template>
  <div class="dashboard" v-if="!loading">
    <div class="dashboard__greeting">
      <div>
        <h2>Здравствуйте, {{ user.fullName.split(' ').slice(0, 2).join(' ') }}!</h2>
        <p>Вот что происходит в ваших группах сегодня.</p>
      </div>
      <div class="dashboard__date">{{ today }}</div>
    </div>

    <div class="dashboard__grid">
      <div class="dashboard__col dashboard__col--main">
        <section class="card">
          <div class="card__header">
            <h3>Мои группы</h3>
            <select class="card__select">
              <option>Все группы</option>
            </select>
          </div>
          <GroupCard v-for="g in groups" :key="g.shifr" :group="g" />
          <router-link to="/groups" class="card__more">Показать все группы →</router-link>
        </section>

        <section class="card">
          <div class="card__header">
            <h3>Активность студентов</h3>
            <select class="card__select">
              <option>Неделя</option>
            </select>
          </div>
          <ActivityChart :activity="activity" />
          <router-link to="/analytics" class="card__more">Открыть аналитику →</router-link>
        </section>
      </div>

      <div class="dashboard__col dashboard__col--side">
        <section class="card">
          <div class="card__header">
            <h3>Текущие риски</h3>
          </div>
          <RiskItem v-for="r in risks" :key="r.studentId" :risk="r" />
          <router-link to="/risks" class="card__more">Показать все риски →</router-link>
        </section>
      </div>
    </div>
  </div>

  <div v-else class="dashboard__loading">Загрузка…</div>
</template>

<style scoped>
.dashboard__greeting {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.dashboard__greeting h2 {
  margin: 0 0 4px;
  font-size: 19px;
}
.dashboard__greeting p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13.5px;
}
.dashboard__date {
  color: var(--color-text-muted);
  font-size: 13px;
  white-space: nowrap;
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  align-items: start;
}

.dashboard__col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 18px 18px 14px;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.card__header h3 {
  font-size: 14.5px;
  margin: 0;
}

.card__select {
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  color: var(--color-text-muted);
  background: transparent;
}

.card__more {
  display: block;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  padding-top: 12px;
}

.dashboard__loading {
  padding: 60px 0;
  text-align: center;
  color: var(--color-text-muted);
}

@media (max-width: 960px) {
  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}
</style>
