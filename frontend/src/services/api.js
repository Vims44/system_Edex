// Единая точка входа для данных дашборда.
//
// Пока бэкенд не готов — все функции возвращают моки из src/mocks.
// Когда Лиза отдаст эндпоинты: поставить USE_MOCKS = false и проверить
// пути ниже (BASE_URL берётся из .env, см. .env.example). Сигнатуры и
// форма возвращаемых данных менять не придётся — компоненты уже на них завязаны.

import {
  currentUser,
  filterOptions,
  myGroups,
  activitySeries,
  currentRisks,
} from '../mocks'

const USE_MOCKS = true
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`, { credentials: 'include' })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export async function getCurrentUser() {
  if (USE_MOCKS) {
    await delay()
    return currentUser
  }
  return request('/me')
}

export async function getFilterOptions() {
  if (USE_MOCKS) {
    await delay()
    return filterOptions
  }
  return request('/filters')
}

export async function getMyGroups() {
  if (USE_MOCKS) {
    await delay()
    return myGroups
  }
  return request('/dashboard/groups')
}

export async function getActivity(period = 'week') {
  if (USE_MOCKS) {
    await delay()
    return activitySeries
  }
  return request(`/dashboard/activity?period=${period}`)
}

export async function getCurrentRisks() {
  if (USE_MOCKS) {
    await delay()
    return currentRisks
  }
  return request('/dashboard/risks')
}
