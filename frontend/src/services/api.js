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
  mySubjects,
} from '../mocks'

const USE_MOCKS = true
// В моках изменения профиля храним прямо в объекте из src/mocks, чтобы они
// не пропадали при переходах между страницами в рамках одной сессии
// (при перезагрузке страницы всё равно сбросится — это не БД).
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

export async function getMySubjects() {
  if (USE_MOCKS) {
    await delay()
    return mySubjects
  }
  return request('/me/subjects')
}

// patch: { surname, name, patronymic, email, phone, birthDate, hireDate, department }
export async function updateProfile(patch) {
  if (USE_MOCKS) {
    await delay()
    Object.assign(currentUser, patch)
    currentUser.fullName = `${currentUser.surname} ${currentUser.name} ${currentUser.patronymic}`.trim()
    currentUser.shortName = `${currentUser.surname} ${currentUser.name.charAt(0)}.${currentUser.patronymic.charAt(0)}.`
    return currentUser
  }
  const res = await fetch(`${BASE_URL}/me`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: /me`)
  return res.json()
}

// На реальном бэкенде это должен быть multipart/form-data запрос, который
// вернёт URL сохранённого файла (для этого в Users нужно поле под аватар).
export async function uploadAvatar(file) {
  if (USE_MOCKS) {
    await delay()
    const url = URL.createObjectURL(file)
    currentUser.photo = url
    return { url }
  }
  const formData = new FormData()
  formData.append('avatar', file)
  const res = await fetch(`${BASE_URL}/me/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: /me/avatar`)
  return res.json()
}
