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

const railIcons = ['home', 'calendar', 'map-pin', 'list', 'message-circle', 'settings']

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
      { to: '/subjects', label: 'Дисциплины', icon: 'book' },
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
  <div class="sidebar-group">
    <!-- Тонкая иконочная панель слева. Точное назначение каждой иконки не
         зафиксировано в макете — пока это декоративная навигация,
         home ведёт на дашборд, остальное — заглушки под будущее. -->
    <nav class="rail" aria-label="Быстрая навигация">
      <router-link to="/dashboard" class="rail__item" :class="{ 'rail__item--active': $route.path === '/dashboard' }">
        <Icon name="home" :size="20" />
      </router-link>
      <button v-for="icon in railIcons.slice(1)" :key="icon" class="rail__item" type="button">
        <Icon :name="icon" :size="20" />
      </button>
    </nav>

    <!-- Основная панель с логотипом, поиском и разделами -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <img :src="logoIcon" alt="" class="sidebar__logo-icon" />
        <img :src="logoText" alt="Edex" class="sidebar__logo-text" />
      </div>

      <label class="sidebar__search">
        <Icon name="search" :size="16" />
        <input type="text" placeholder="Поиск" />
      </label>

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
  </div>
</template>

<style scoped>
.sidebar-group {
  display: flex;
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
}

.rail {
  width: 56px;
  background: var(--color-rail);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 0;
  flex-shrink: 0;
}

.rail__item {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #5B6480;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rail__item:hover {
  color: #C7CCDC;
}

.rail__item--active {
  background: var(--color-sidebar-active);
  color: #fff;
}

.sidebar {
  width: 232px;
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
  gap: 8px;
  padding: 0 4px 20px;
}
.sidebar__logo-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.sidebar__logo-text {
  height: 16px;
  object-fit: contain;
}

.sidebar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-sidebar-hover);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  margin-bottom: 16px;
  color: #5B6480;
}
.sidebar__search input {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 13px;
  width: 100%;
}
.sidebar__search input::placeholder {
  color: #5B6480;
}
.sidebar__search input:focus {
  outline: none;
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
