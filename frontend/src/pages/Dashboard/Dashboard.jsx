import React from 'react'
import { useSelector } from 'react-redux'
import { Box, CircularProgress, Typography } from '@mui/material'
import ProductionAdminDashboard from './ProductionAdminDashboard'
import ProperTeacherDashboard from './ProperTeacherDashboard'
import ProductionStudentDashboard from './ProductionStudentDashboard'

const Dashboard = () => {
  const { user, isLoading } = useSelector((state) => state.auth)

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Đang tải...
        </Typography>
      </Box>
    )
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          Vui lòng đăng nhập để tiếp tục
        </Typography>
      </Box>
    )
  }

  // Role-based dashboard rendering
  const userRole = user.role || 'student' // Default to student if no role
  
  switch (userRole) {
    case 'admin':
      return <ProductionAdminDashboard />
    case 'teacher':
      return <ProperTeacherDashboard />
    case 'student':
    default:
      return <ProductionStudentDashboard />
  }
}

export default Dashboard
