import React from 'react'
import { Container, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import TeacherManagement from '../../components/Admin/TeacherManagement'

const Teachers = () => {
  const { user } = useSelector((state) => state.auth)
  const userRole = user?.role || 'student'

  // Only admin can access this page
  if (userRole !== 'admin') {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Bạn không có quyền truy cập trang này
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <TeacherManagement />
    </Container>
  )
}

export default Teachers
