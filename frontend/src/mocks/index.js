// Мок-данные для разработки фронтенда без готового бэкенда.
// Поля названы так же, как в согласованной структуре БД (см. Users, Groups,
// Students, Risks), чтобы переход на реальный API не потребовал переименований.

// Соответствует таблице Users. Поле photo на бэкенде пока не заведено —
// нужно согласовать с Лизой добавление, например, avatar_url VARCHAR(255).
export const currentUser = {
  id: 1,
  surname: 'Иванов',
  name: 'Иван',
  patronymic: 'Иванович',
  fullName: 'Иванов Иван Иванович',
  shortName: 'Иванов И.И.',
  role: 'teacher', // 'teacher' | 'curator'
  roleLabel: 'Преподаватель',
  photo: null,
  email: 'ivanov@edurisk.ru',
  phone: '+7 (999) 123-45-67',
  birthDate: '1990-03-15',
  hireDate: '2018-09-01',
  department: 'Информационные системы',
}

// Соответствует Teacher_assignments, сгруппированному по предмету
export const mySubjects = [
  { id: 1, name: 'Математика', groups: ['ИС-21', 'ПИ-22'] },
  { id: 2, name: 'Алгебра и геометрия', groups: ['ИС-21'] },
  { id: 3, name: 'Дискретная математика', groups: ['ПИ-21', 'ИС-22'] },
  { id: 4, name: 'Теория вероятностей', groups: ['ПИ-22'] },
]

export const filterOptions = {
  modes: [
    { value: 'teacher', label: 'Преподавание' },
    { value: 'curator', label: 'Кураторство' },
  ],
  groups: [
    { value: 'ИС-21', label: 'ИС-21' },
    { value: 'ИС-22', label: 'ИС-22' },
    { value: 'ПИ-21', label: 'ПИ-21' },
    { value: 'ПИ-22', label: 'ПИ-22' },
  ],
  subjects: [
    { value: 'math', label: 'Математика' },
    { value: 'prog', label: 'Программирование' },
    { value: 'db', label: 'Базы данных' },
  ],
}

// Соответствует Teacher_assignments + Groups + Risks (агрегаты по группе)
export const myGroups = [
  {
    shifr: 'ИС-21',
    studentsCount: 23,
    averageGrade: 4.05,
    riskCounts: { high: 8, medium: 10, low: 5 },
  },
  {
    shifr: 'ИС-22',
    studentsCount: 22,
    averageGrade: 4.21,
    riskCounts: { high: 4, medium: 6, low: 12 },
  },
  {
    shifr: 'ПИ-21',
    studentsCount: 28,
    averageGrade: 4.33,
    riskCounts: { high: 2, medium: 4, low: 18 },
  },
  {
    shifr: 'ПИ-22',
    studentsCount: 26,
    averageGrade: 3.95,
    riskCounts: { high: 6, medium: 8, low: 12 },
  },
]

// Динамика за неделю: посещаемость (%) и средний балл (0-5, отображается ×10)
export const activitySeries = {
  period: 'week',
  labels: ['11 мая', '12 мая', '13 мая', '14 мая', '15 мая', '16 мая', '17 мая'],
  attendance: [78, 82, 80, 83, 85, 83, 80],
  averageGrade: [3.8, 3.9, 3.85, 4.0, 4.1, 4.15, 4.05],
}

// Соответствует Risks + Students, отсортировано по calculated_at
export const currentRisks = [
  { studentId: 1, fullName: 'Петров Алексей', group: 'ИС-21', riskLevel: 'high', date: '15 мая' },
  { studentId: 2, fullName: 'Сидорова Мария', group: 'ИС-21', riskLevel: 'medium', date: '15 мая' },
  { studentId: 3, fullName: 'Ким Даниил', group: 'ИС-22', riskLevel: 'high', date: '14 мая' },
  { studentId: 4, fullName: 'Волкова Анна', group: 'ИС-22', riskLevel: 'medium', date: '14 мая' },
  { studentId: 5, fullName: 'Попов Илья', group: 'ИС-21', riskLevel: 'medium', date: '13 мая' },
]
