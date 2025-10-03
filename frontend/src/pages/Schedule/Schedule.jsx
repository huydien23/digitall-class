import React, { useEffect } from 'react'
import { Container, Box, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import StudentScheduleView from '../../components/Schedule/StudentScheduleView'
import TeacherScheduleManagement from '../../components/Schedule/TeacherScheduleManagement'

const Schedule = () => {
  const { user } = useSelector((state) => state.auth)
  
  // Normalize role to lowercase for comparison
  const userRole = user?.role ? user.role.toLowerCase() : 'student'

  // Debug log
  useEffect(() => {
    console.log('=== Schedule Component Debug ===')
    console.log('User data:', user)
    console.log('User role (original):', user?.role)
    console.log('User role (normalized):', userRole)
    console.log('================================')
  }, [user, userRole])

  // For teachers and admins, show schedule management interface
  if (userRole === 'teacher' || userRole === 'admin') {
    console.log('✓ Rendering TeacherScheduleManagement for role:', userRole)
    return <TeacherScheduleManagement />
  }

  // For students, show StudentScheduleView component
  console.log('✓ Rendering StudentScheduleView for role:', userRole)
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <StudentScheduleView user={user} />
    </Container>
  )
}

export default Schedule
