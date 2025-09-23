import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useSelector, useDispatch } from 'react-redux'
import studentService from '../../services/studentService'
import classService from '../../services/classService'
import attendanceService from '../../services/attendanceService'
import gradeService from '../../services/gradeService'

const ProperAdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSessions: 0,
    totalGrades: 0,
    systemHealth: 'healthy',
    recentActivity: []
  })

  const loadSystemStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all system statistics in parallel
      const [
        studentStats,
        classStats,
        attendanceStats,
        gradeStats
      ] = await Promise.all([
        studentService.getStudentStatistics(),
        classService.getClassStatistics(),
        attendanceService.getAttendanceStatistics(),
        gradeService.getGradeStatistics()
      ])

      setSystemStats({
        totalUsers: (studentStats.data?.total || 0) + (classStats.data?.totalTeachers || 0),
        totalStudents: studentStats.data?.total || 0,
        totalTeachers: classStats.data?.totalTeachers || 0,
        totalClasses: classStats.data?.total || 0,
        totalSessions: attendanceStats.data?.totalSessions || 0,
        totalGrades: gradeStats.data?.total || 0,
        systemHealth: 'healthy',
        recentActivity: [
          { type: 'user_registration', count: studentStats.data?.recentRegistrations || 0, label: 'New Students' },
          { type: 'class_created', count: classStats.data?.recentClasses || 0, label: 'New Classes' },
          { type: 'attendance_session', count: attendanceStats.data?.todaySessions || 0, label: 'Today Sessions' },
          { type: 'grade_recorded', count: gradeStats.data?.recentGrades || 0, label: 'New Grades' }
        ]
      })
    } catch (err) {
      console.error('Error loading system stats:', err)
      setError('Failed to load system statistics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSystemStats()
  }, [loadSystemStats])

  const handleRefresh = () => {
    loadSystemStats()
  }

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
              {icon}
            </Avatar>
            {trend && (
              <Chip
                label={trend}
                size="small"
                color={trend.includes('+') ? 'success' : 'error'}
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="h4" fontWeight={700} color={`${color}.main`} gutterBottom>
            {value}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Student Management System</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <AdminIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Complete system management and oversight
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefresh} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="System Settings">
                <IconButton color="primary">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* System Overview Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={systemStats.totalUsers}
              icon={<PeopleIcon />}
              color="primary"
              subtitle="All system users"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Students"
              value={systemStats.totalStudents}
              icon={<SchoolIcon />}
              color="success"
              subtitle="Active students"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Teachers"
              value={systemStats.totalTeachers}
              icon={<AssignmentIcon />}
              color="info"
              subtitle="Active teachers"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Classes"
              value={systemStats.totalClasses}
              icon={<SchoolIcon />}
              color="warning"
              subtitle="Active classes"
            />
          </Grid>
        </Grid>

        {/* System Activity */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  System Activity Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {systemStats.recentActivity.map((activity, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            <AnalyticsIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {activity.count}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.label}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  System Health
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <SecurityIcon color="success" />
                  <Typography variant="body1">
                    System Status: <Chip label="Healthy" color="success" size="small" />
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <AnalyticsIcon color="info" />
                  <Typography variant="body1">
                    API Status: <Chip label="Online" color="success" size="small" />
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <DashboardIcon color="primary" />
                  <Typography variant="body1">
                    Database: <Chip label="Connected" color="success" size="small" />
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Admin Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PeopleIcon />}
                  sx={{ py: 1.5 }}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SchoolIcon />}
                  sx={{ py: 1.5 }}
                >
                  Manage Classes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AnalyticsIcon />}
                  sx={{ py: 1.5 }}
                >
                  System Reports
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SettingsIcon />}
                  sx={{ py: 1.5 }}
                >
                  System Settings
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </>
  )
}

export default ProperAdminDashboard
