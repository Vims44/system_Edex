<script setup>
import { ref, onMounted } from 'vue'
import Icon from './Icon.vue'
import logoIcon from '../assets/icon.PNG'
import logoText from '../assets/inscription.PNG'
import { getCurrentUser } from '../services/api'

const user = ref(null)

onMounted(async () => {
  user.value = await getCurrentUser()
})

const navGroups = [
  {
    label: null,
    items: [{ to: '/dashboard', label: 'Дашборд', icon: 'grid' }],
  },
  {
    label: 'Основное',
    items: [
      { to: '/students', label: 'Студенты', icon: 'users' },
      { to: '/groups', label: 'Группы', icon: 'layers' },
      { to: '/subjects', label: 'Предметы', icon: 'book' },
      { to: '/grades', label: 'Оценки', icon: 'award' },
      { to: '/attendance', label: 'Посещаемость', icon: 'calendar-check' },
      { to: '/risks', label: 'Риски', icon: 'alert-triangle' },
    ],
  },
  {
    label: 'Отчёты',
    items: [
      { to: '/reports', label: 'Отчёты', icon: 'file-text' },
      { to: '/analytics', label: 'Аналитика', icon: 'bar-chart-2' },
    ],
  },
  {
    label: 'Администрирование',
    items: [
      { to: '/users', label: 'Пользователи', icon: 'users' },
      { to: '/roles', label: 'Роли и права', icon: 'shield' },
      { to: '/settings', label: 'Настройки', icon: 'settings' },
    ],
  },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__logo">
      <img :src="logoIcon" alt="" class="sidebar__logo-icon" />
      <img :src="logoText" alt="Edex" class="sidebar__logo-text" />
    </div>

    <nav class="sidebar__nav">
      <div v-for="group in navGroups" :key="group.label || 'root'" class="nav-group">
        <div v-if="group.label" class="nav-group__label">{{ group.label }}</div>
        <router-link
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          <Icon :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <router-link to="/profile" class="sidebar__user" v-if="user">
      <div class="sidebar__avatar">
        <img v-if="user.photo" :src="user.photo" alt="" />
        <span v-else>{{ user.shortName.charAt(0) }}</span>
      </div>
      <div class="sidebar__user-info">
        <div class="sidebar__user-name">{{ user.shortName }}</div>
        <div class="sidebar__user-role">{{ user.roleLabel }}</div>
      </div>
      <Icon name="chevron-down" :size="16" />
    </router-link>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 232px;
  height: 100vh;
  position: sticky;
  top: 0;
  background: var(--color-sidebar);
  color: var(--color-sidebar-text);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 0 16px;
  margin-left: -16px; 
}
.sidebar__logo-icon {
  height: 65px;
  width: auto;
  object-fit: contain;
}
.sidebar__logo-text {
  height: 65px;
  width: auto;
  object-fit: contain;
}

.sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.nav-group__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #4E5773;
  text-transform: uppercase;
  padding: 0 10px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-sidebar-text);
  margin-bottom: 2px;
}

.nav-item:hover {
  background: var(--color-sidebar-hover);
  color: #C7CCDC;
}

.nav-item--active {
  background: var(--color-sidebar-active);
  color: var(--color-sidebar-text-active);
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 8px;
  margin-top: 12px;
  border-top: 1px solid #1F2542;
  cursor: pointer;
}

.sidebar__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
  overflow: hidden;
}
.sidebar__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar__user-info {
  flex: 1;
  min-width: 0;
}
.sidebar__user-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar__user-role {
  font-size: 12px;
  color: #5B6480;
}
</style>
