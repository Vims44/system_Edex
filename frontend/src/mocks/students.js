// Мок-данные для экрана "Студенты". Поля соответствуют Students + Risks
// + агрегатам из Grades/Attendance, которые на бэкенде считает риск-движок.

function riskLabel(level) {
  return { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' }[level]
}

export const students = [
  { id: 1, fullName: 'Петров Алексей', group: 'ИС-21', averageGrade: 4.21, attendance: 89, absences: 9, riskLevel: 'low', photo: null, birthDate: '2004-03-15', phone: '+7 (999) 123-45-67', email: 'petrov.aleksey@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 2, fullName: 'Сидорова Мария', group: 'ИС-21', averageGrade: 4.53, attendance: 92, absences: 6, riskLevel: 'low', photo: null, birthDate: '2004-06-22', phone: '+7 (999) 234-56-78', email: 'sidorova.maria@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 3, fullName: 'Ким Даниил', group: 'ИС-22', averageGrade: 3.67, attendance: 78, absences: 12, riskLevel: 'medium', photo: null, birthDate: '2004-01-10', phone: '+7 (999) 345-67-89', email: 'kim.daniil@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 4, fullName: 'Волкова Анна', group: 'ИС-22', averageGrade: 3.22, attendance: 71, absences: 15, riskLevel: 'high', photo: null, birthDate: '2004-11-02', phone: '+7 (999) 456-78-90', email: 'volkova.anna@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 5, fullName: 'Попов Илья', group: 'ИС-21', averageGrade: 2.91, attendance: 64, absences: 18, riskLevel: 'high', photo: null, birthDate: '2004-04-18', phone: '+7 (999) 567-89-01', email: 'popov.ilya@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 6, fullName: 'Смирнов Иван', group: 'ПИ-21', averageGrade: 4.10, attendance: 85, absences: 8, riskLevel: 'low', photo: null, birthDate: '2004-02-27', phone: '+7 (999) 678-90-12', email: 'smirnov.ivan@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 7, fullName: 'Кузнецова Елизавета', group: 'ПИ-21', averageGrade: 3.45, attendance: 76, absences: 13, riskLevel: 'medium', photo: null, birthDate: '2004-08-05', phone: '+7 (999) 789-01-23', email: 'kuznecova.eliz@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 8, fullName: 'Лебедев Никита', group: 'ПИ-22', averageGrade: 2.63, attendance: 68, absences: 17, riskLevel: 'high', photo: null, birthDate: '2004-05-30', phone: '+7 (999) 890-12-34', email: 'lebedev.nikita@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 9, fullName: 'Соколов Максим', group: 'ПИ-22', averageGrade: 3.78, attendance: 82, absences: 10, riskLevel: 'low', photo: null, birthDate: '2004-09-14', phone: '+7 (999) 901-23-45', email: 'sokolov.maksim@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 10, fullName: 'Новикова Дарья', group: 'ИС-22', averageGrade: 3.15, attendance: 70, absences: 16, riskLevel: 'medium', photo: null, birthDate: '2004-12-01', phone: '+7 (999) 012-34-56', email: 'novikova.darya@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 11, fullName: 'Морозов Артём', group: 'ИС-21', averageGrade: 4.35, attendance: 91, absences: 5, riskLevel: 'low', photo: null, birthDate: '2004-07-19', phone: '+7 (999) 111-22-33', email: 'morozov.artem@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 12, fullName: 'Васильева Ксения', group: 'ИС-21', averageGrade: 3.05, attendance: 66, absences: 19, riskLevel: 'high', photo: null, birthDate: '2004-03-03', phone: '+7 (999) 222-33-44', email: 'vasileva.kseniya@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 13, fullName: 'Фёдоров Егор', group: 'ИС-22', averageGrade: 4.02, attendance: 87, absences: 7, riskLevel: 'low', photo: null, birthDate: '2004-10-25', phone: '+7 (999) 333-44-55', email: 'fedorov.egor@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 14, fullName: 'Егорова Полина', group: 'ИС-22', averageGrade: 3.51, attendance: 79, absences: 11, riskLevel: 'medium', photo: null, birthDate: '2004-01-29', phone: '+7 (999) 444-55-66', email: 'egorova.polina@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 15, fullName: 'Николаев Пётр', group: 'ПИ-21', averageGrade: 2.78, attendance: 61, absences: 20, riskLevel: 'high', photo: null, birthDate: '2004-06-11', phone: '+7 (999) 555-66-77', email: 'nikolaev.petr@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 16, fullName: 'Андреева Софья', group: 'ПИ-21', averageGrade: 4.44, attendance: 94, absences: 4, riskLevel: 'low', photo: null, birthDate: '2004-08-23', phone: '+7 (999) 666-77-88', email: 'andreeva.sofya@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 17, fullName: 'Дмитриев Роман', group: 'ПИ-22', averageGrade: 3.33, attendance: 74, absences: 14, riskLevel: 'medium', photo: null, birthDate: '2004-02-16', phone: '+7 (999) 777-88-99', email: 'dmitriev.roman@mail.ru', status: 'Академический отпуск', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 18, fullName: 'Козлова Виктория', group: 'ПИ-22', averageGrade: 3.90, attendance: 84, absences: 9, riskLevel: 'low', photo: null, birthDate: '2004-11-07', phone: '+7 (999) 888-99-00', email: 'kozlova.viktoriya@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 19, fullName: 'Тимофеев Глеб', group: 'ИС-21', averageGrade: 2.55, attendance: 58, absences: 22, riskLevel: 'high', photo: null, birthDate: '2004-04-04', phone: '+7 (999) 999-00-11', email: 'timofeev.gleb@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 20, fullName: 'Белова Алина', group: 'ИС-22', averageGrade: 3.68, attendance: 80, absences: 10, riskLevel: 'medium', photo: null, birthDate: '2004-09-09', phone: '+7 (999) 000-11-22', email: 'belova.alina@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 21, fullName: 'Захаров Кирилл', group: 'ПИ-21', averageGrade: 4.18, attendance: 88, absences: 7, riskLevel: 'low', photo: null, birthDate: '2004-05-05', phone: '+7 (999) 121-21-21', email: 'zaharov.kirill@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 22, fullName: 'Орлова Дарина', group: 'ПИ-22', averageGrade: 3.02, attendance: 65, absences: 18, riskLevel: 'high', photo: null, birthDate: '2004-12-19', phone: '+7 (999) 232-32-32', email: 'orlova.darina@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
  { id: 23, fullName: 'Гаврилов Матвей', group: 'ИС-22', averageGrade: 3.87, attendance: 83, absences: 9, riskLevel: 'low', photo: null, birthDate: '2004-07-07', phone: '+7 (999) 343-43-43', email: 'gavrilov.matvey@mail.ru', status: 'Активен', studyForm: 'Очная', curator: 'Иванов И.И.', enrollmentDate: '2022-09-01' },
].map((s) => ({ ...s, riskLabel: riskLabel(s.riskLevel) }))

const trendLabels = ['Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май']

// Заранее прописанный тренд для студента из макета (id: 1), у остальных —
// сгенерированный: небольшая история, сходящаяся к текущим показателям.
const handPickedTrends = {
  1: {
    grade: [3.1, 3.3, 3.6, 3.9, 3.9, 4.21],
    attendance: [86, 83, 85, 90, 87, 89],
  },
}

function generateTrend(current, spread, decimals) {
  const values = []
  for (let i = trendLabels.length - 1; i >= 0; i -= 1) {
    if (i === 0) {
      values.unshift(Number(current.toFixed(decimals)))
    } else {
      const noise = (((current * 97 + i * 31) % 10) / 10 - 0.5) * spread
      const v = Math.max(0, current - noise * i * 0.4)
      values.unshift(Number(v.toFixed(decimals)))
    }
  }
  return values
}

export function getStudentTrend(studentId) {
  const student = students.find((s) => s.id === studentId)
  if (!student) return null
  if (handPickedTrends[studentId]) {
    return {
      labels: trendLabels,
      grade: handPickedTrends[studentId].grade,
      attendance: handPickedTrends[studentId].attendance,
    }
  }
  return {
    labels: trendLabels,
    grade: generateTrend(student.averageGrade, 0.6, 2),
    attendance: generateTrend(student.attendance, 8, 0),
  }
}

export const quickFilters = [
  { value: 'all', label: 'Все студенты' },
  { value: 'risk', label: 'В зоне риска' },
  { value: 'absences', label: 'С пропусками' },
  { value: 'lowGrade', label: 'С низким баллом' },
]
