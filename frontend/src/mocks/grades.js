import { students as sourceStudents } from './students'

const initialGrades = {
  1: {
    '2026-08-03': [4],
    '2026-08-04': [5],
    '2026-08-05': [4, 5],
    '2026-08-06': [4],
    '2026-08-07': [5],
    '2026-08-10': [4],
  },
  2: {
    '2026-08-03': [5],
    '2026-08-04': [4],
    '2026-08-05': [5],
    '2026-08-06': [5, 4],
    '2026-08-07': [5],
    '2026-08-10': [5],
  },
  3: {
    '2026-08-03': [4],
    '2026-08-04': [3],
    '2026-08-05': [4],
    '2026-08-06': [3],
    '2026-08-07': [4],
  },
  4: {
    '2026-08-03': [3],
    '2026-08-04': [4],
    '2026-08-05': [3],
    '2026-08-06': [3],
    '2026-08-07': [3],
  },
  5: {
    '2026-08-03': [3],
    '2026-08-04': [3],
    '2026-08-05': [2],
    '2026-08-06': [3],
    '2026-08-07': [2],
    '2026-08-10': [3],
  },
  6: {
    '2026-08-03': [4],
    '2026-08-04': [4],
    '2026-08-05': [5],
    '2026-08-06': [4],
    '2026-08-07': [4],
  },
  7: {
    '2026-08-03': [4],
    '2026-08-04': [3],
    '2026-08-05': [3],
    '2026-08-06': [4],
    '2026-08-07': [3],
  },
  8: {
    '2026-08-03': [2],
    '2026-08-04': [3],
    '2026-08-05': [2],
    '2026-08-06': [3],
    '2026-08-07': [2],
  },
  9: {
    '2026-08-03': [4],
    '2026-08-04': [4],
    '2026-08-05': [4],
    '2026-08-06': [3],
    '2026-08-07': [4],
  },
  10: {
    '2026-08-03': [3],
    '2026-08-04': [3],
    '2026-08-05': [3],
    '2026-08-06': [4],
    '2026-08-07': [3],
  },
}

function cloneGrades(grades) {
  return Object.fromEntries(
    Object.entries(grades || {}).map(([date, values]) => [date, [...values]]),
  )
}

function studentAverage(grades) {
  const values = Object.values(grades).flat()
  if (!values.length) return 0
  return values.reduce((sum, grade) => sum + grade, 0) / values.length
}

export const gradebook = sourceStudents.map((student) => {
  const grades = cloneGrades(initialGrades[student.id] || {})
  return {
    id: student.id,
    fullName: student.fullName,
    group: student.group,
    photo: student.photo,
    grades,
    averageGrade: studentAverage(grades) || student.averageGrade,
  }
})

export function getGradebookMock({ group, subject, startDate, endDate }) {
  const result = gradebook.filter((student) => !group || student.group === group)

  return {
    group,
    subject,
    startDate,
    endDate,
    previousAverage: 3.44,
    previousQuality: 49,
    previousFails: 8,
    students: result,
  }
}

export function saveGradeMock({ studentId, date, grades }) {
  const student = gradebook.find((item) => item.id === studentId)
  if (!student) throw new Error('Student not found')

  if (grades.length) {
    student.grades[date] = [...grades]
  } else {
    delete student.grades[date]
  }

  student.averageGrade = studentAverage(student.grades)

  return {
    studentId,
    date,
    grades: [...grades],
    averageGrade: student.averageGrade,
  }
}
