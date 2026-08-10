import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Profile from '../views/Profile.vue'
import Students from '../views/Students.vue'
import Grades from '../views/Grades.vue'
import Placeholder from '../views/Placeholder.vue'
// Пункты меню — здесь же используются для построения Sidebar (см. components/Sidebar.vue)
// meta.filters — какие селекторы показывать в Topbar на этой странице (по умолчанию все три)
const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { title: 'Главная' } },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { title: 'Профиль преподавателя', filters: ['mode'] },
  },
  { path: '/students', name: 'students', component: Students, meta: { title: 'Студенты' } },
  { path: '/groups', name: 'groups', component: Placeholder, meta: { title: 'Группы' } },
  { path: '/subjects', name: 'subjects', component: Placeholder, meta: { title: 'Дисциплины' } },
  { path: '/grades', name: 'grades', component: Grades, meta: { title: 'Оценки' } },
  { path: '/attendance', name: 'attendance', component: Placeholder, meta: { title: 'Посещаемость' } },
  { path: '/risks', name: 'risks', component: Placeholder, meta: { title: 'Риски' } },
  { path: '/reports', name: 'reports', component: Placeholder, meta: { title: 'Отчёты' } },
  { path: '/analytics', name: 'analytics', component: Placeholder, meta: { title: 'Аналитика' } },
  { path: '/users', name: 'users', component: Placeholder, meta: { title: 'Пользователи' } },
  { path: '/roles', name: 'roles', component: Placeholder, meta: { title: 'Роли и права' } },
  { path: '/settings', name: 'settings', component: Placeholder, meta: { title: 'Настройки' } },
]
export default createRouter({
  history: createWebHistory(),
  routes,
})
