// Вычисляет полное количество лет от даты (день рождения / дата приёма на работу) до сегодня
export function yearsSince(dateStr) {
  if (!dateStr) return null
  const start = new Date(dateStr)
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  const monthDiff = now.getMonth() - start.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) {
    years -= 1
  }
  return years
}

// Склонение слова "год" под число: 1 год, 2 года, 5 лет
export function pluralizeYears(n) {
  if (n === null || n === undefined) return ''
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} год`
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${n} года`
  return `${n} лет`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(dateStr)
  )
}
