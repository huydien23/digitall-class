import React from 'react'
import { useSelector } from 'react-redux'
import { Box, CircularProgress, Typography } from '@mui/material'
import ProductionAdminDashboard from './ProductionAdminDashboard'
import ProperTeacherDashboard from './ProperTeacherDashboard'
import ProductionStudentDashboard from './ProductionStudentDashboard'
import { AdminMockDataProvider } from '../../components/Dashboard/AdminMockDataProvider'
import { useTranslation } from 'react-i18next'

const Dashboard = () => {
  const { user, isLoading } = useSelector((state) => state.auth)
  const { t } = useTranslation()

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          {t('loading', 'Đang tải...')}
        </Typography>
      </Box>
    )
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6" color="error">
          {t('please_login', 'Vui lòng đăng nhập để tiếp tục')}
        </Typography>
      </Box>
    )
  }

  // Role-based dashboard rendering
  const userRole = user.role || 'student' // Default to student if no role
  
  switch (userRole) {
    case 'admin':
      return (
        <AdminMockDataProvider user={user}>
          <ProductionAdminDashboard />
        </AdminMockDataProvider>
      )
    case 'teacher':
      return <ProperTeacherDashboard />
    case 'student':
    default:
      return <ProductionStudentDashboard />
  }
}

export default Dashboard
