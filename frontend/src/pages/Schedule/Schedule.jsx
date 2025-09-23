import React from 'react'
import { Container } from '@mui/material'
import { useSelector } from 'react-redux'
import StudentScheduleView from '../../components/Schedule/StudentScheduleView'

const Schedule = () => {
  const { user } = useSelector((state) => state.auth)
  const userRole = user?.role || 'student'

  // For students, show StudentScheduleView component
  if (userRole === 'student') {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <StudentScheduleView user={user} />
      </Container>
    )
  }

  // For admin/teacher, could show different schedule management interface
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <StudentScheduleView user={user} />
    </Container>
  )
}

export default Schedule
