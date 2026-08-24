import { students as sourceStudents } from './students'

const dates = [
  '2026-08-03',
  '2026-08-04',
  '2026-08-05',
  '2026-08-06',
  '2026-08-07',
  '2026-08-10',
  '2026-08-11',
  '2026-08-12',
  '2026-08-13',
  '2026-08-14',
  '2026-08-15',
  '2026-08-17',
  '2026-08-18',
  '2026-08-19',
  '2026-08-20',
  '2026-08-21',
  '2026-08-22',
  '2026-08-24',
]

const statusSets = [
  ['present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'present', 'present'],
  ['present', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present'],
  ['late', 'absent', 'present', 'absent', 'present', 'present', 'late', 'present', 'absent', 'present', 'present', 'absent', 'present', 'present', 'late', 'present', 'present', 'present'],
  ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present'],
  ['absent', 'absent', 'present', 'absent', 'absent', 'present', 'late', 'absent', 'present', 'absent', 'present', 'absent', 'present', 'absent', 'present', 'absent', 'present', 'present'],
  ['present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present'],
  ['present', 'late', 'absent', 'present', 'late', 'present', 'present', 'late', 'present', 'absent', 'present', 'late', 'present', 'present', 'late', 'present', 'absent', 'present'],
  ['absent', 'absent', 'absent', 'present', 'absent', 'present', 'absent', 'present', 'absent', 'present', 'present', 'absent', 'present', 'absent', 'present', 'present', 'present', 'late'],
  ['present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'present', 'present'],
  ['late', 'present', 'present', 'present', 'late', 'present', 'present', 'late', 'present', 'present', 'present', 'present', 'present', 'late', 'present', 'present', 'present', 'present'],
]

function buildAttendance(index) {
  const values = statusSets[index % statusSets.length]
  const result = {}

  dates.forEach((date, dateIndex) => {
    const status = values[dateIndex]
    if (status === 'present') {
      result[date] = { status: 'present', reason: null }
      return
    }

    if (status === 'late') {
      result[date] = { status: 'late', reason: null }
      return
    }

    const reason = (dateIndex + index) % 3 === 0 ? 'excused' : 'unexcused'
    result[date] = { status: 'absent', reason }
  })

  return result
}

export const attendanceBook = sourceStudents.map((student, index) => ({
  id: student.id,
  fullName: student.fullName,
  group: student.group,
  photo: student.photo,
  attendance: buildAttendance(index),
}))

export function getAttendanceMock({ group, subject, startDate, endDate }) {
  return {
    group,
    subject,
    startDate,
    endDate,
    previousAttendance: 76,
    previousMissedHours: 44,
    students: attendanceBook.filter((student) => !group || student.group === group),
  }
}

export function saveAttendanceMock({ studentId, date, status, reason }) {
  const student = attendanceBook.find((item) => item.id === studentId)
  if (!student) throw new Error('Student not found')

  if (!student.attendance) student.attendance = {}

  student.attendance[date] = {
    status,
    reason: status === 'absent' ? (reason || 'unexcused') : null,
  }

  return {
    studentId,
    date,
    status,
    hours: status === 'absent' ? 2 : status === 'late' ? 1 : 0,
    reason: student.attendance[date].reason,
  }
}
