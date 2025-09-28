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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import SessionManagement from '../../components/SessionManagement/SessionManagement'
import ClassJoinTokenDialog from '../../components/Class/ClassJoinTokenDialog'
import classService from '../../services/classService'
import attendanceService from '../../services/attendanceService'
import gradeService from '../../services/gradeService'

const ProperTeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
const [sessionManagementOpen, setSessionManagementOpen] = useState(false)
  const [joinTokenDialogOpen, setJoinTokenDialogOpen] = useState(false)
  const [teacherData, setTeacherData] = useState({
    statistics: {
      totalClasses: 0,
      activeStudents: 0,
      attendanceRate: 0,
      averageGrade: 0
    },
    todaySessions: [],
    assignedClasses: []
  })

  const loadTeacherData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load teacher's assigned classes
      const classesResponse = await classService.getClasses()
      // Backend đã lọc theo giảng viên cho vai trò 'teacher'
      const teacherClasses = classesResponse.data?.results || classesResponse.data || []

      // Load today's attendance sessions for teacher's classes
      const todaySessions = []
      for (const classItem of teacherClasses) {
        try {
          const sessionsResponse = await attendanceService.getSessions({
            class_id: classItem.id,
            session_date: new Date().toISOString().split('T')[0]
          })
          todaySessions.push(...(sessionsResponse.data?.results || []))
        } catch (err) {
          console.warn(`Failed to load sessions for class ${classItem.id}:`, err)
        }
      }

      // Load recent grades for teacher's classes
      const recentGrades = []
      for (const classItem of teacherClasses) {
        try {
          const gradesResponse = await gradeService.getGrades({
            class_id: classItem.id,
            ordering: '-created_at'
          })
          recentGrades.push(...(gradesResponse.data?.results || []).slice(0, 5))
        } catch (err) {
          console.warn(`Failed to load grades for class ${classItem.id}:`, err)
        }
      }

      // Calculate statistics
      const totalStudents = teacherClasses.reduce((sum, classItem) => 
        sum + (classItem.current_students_count || 0), 0
      )

      // Ensure numeric calculations (backend returns Decimal as string)
      const attendanceRateNum = todaySessions.length > 0 
        ? todaySessions.reduce((sum, session) => sum + (parseFloat(session.attendance_rate ?? 0) || 0), 0) / todaySessions.length
        : 0

      const averageGradeNum = recentGrades.length > 0
        ? recentGrades.reduce((sum, grade) => sum + (parseFloat(grade.score ?? 0) || 0), 0) / recentGrades.length
        : 0

      const safeAvg = Number.isFinite(averageGradeNum) ? Math.round(averageGradeNum * 100) / 100 : 0
      const safeRate = Number.isFinite(attendanceRateNum) ? Math.round(attendanceRateNum) : 0

      setTeacherData({
        assignedClasses: teacherClasses,
        todaySessions,
        recentGrades: recentGrades.slice(0, 10),
        statistics: {
          totalClasses: teacherClasses.length,
          activeStudents: totalStudents,
          attendanceRate: safeRate,
          averageGrade: safeAvg
        }
      })
    } catch (err) {
      console.error('Error loading teacher data:', err)
      setError('Failed to load teacher data')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadTeacherData()
  }, [loadTeacherData])

  const handleRefresh = () => {
    loadTeacherData()
  }

  const handleGenerateQR = async (sessionId) => {
    try {
      const response = await attendanceService.generateQRCode(sessionId)
      // Handle QR code generation
      console.log('QR Code generated:', response.data)
    } catch (err) {
      console.error('Error generating QR code:', err)
    }
  }

  // Quick action: generate QR for the first available session today, otherwise open session management
  const handleQuickGenerateQR = () => {
    if (teacherData.todaySessions && teacherData.todaySessions.length > 0) {
      handleGenerateQR(teacherData.todaySessions[0].id)
    } else {
      setSessionManagementOpen(true)
    }
  }

  const handleStartSession = async (sessionId) => {
    try {
      await attendanceService.updateSession(sessionId, { is_active: true })
      loadTeacherData()
    } catch (err) {
      console.error('Error starting session:', err)
    }
  }

  const handleStopSession = async (sessionId) => {
    try {
      await attendanceService.updateSession(sessionId, { is_active: false })
      loadTeacherData()
    } catch (err) {
      console.error('Error stopping session:', err)
    }
  }


  const handleSessionCreated = () => {
    console.log('Session created successfully')
    loadTeacherData() // Refresh teacher data
  }

  const handleSessionUpdated = () => {
    console.log('Session updated successfully')
    loadTeacherData() // Refresh teacher data
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
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
        <title>Dashboard Giảng viên - Hệ thống Quản lý Sinh viên</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <AssignmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Dashboard Giảng viên
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Chào mừng, {user.first_name} {user.last_name}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton onClick={handleRefresh} color="primary">
                  <RefreshIcon />
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

        {/* Teacher Statistics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp của tôi"
              value={teacherData.statistics.totalClasses}
              icon={<SchoolIcon />}
              color="primary"
              subtitle="Lớp được phân công"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sinh viên"
              value={teacherData.statistics.activeStudents}
              icon={<PeopleIcon />}
              color="success"
              subtitle="Tổng sinh viên"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ điểm danh"
              value={`${Number.isFinite(teacherData.statistics.attendanceRate) ? teacherData.statistics.attendanceRate : 0}%`}
              icon={<ScheduleIcon />}
              color="info"
              subtitle="Trung bình hôm nay"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Điểm trung bình"
              value={Number.isFinite(teacherData.statistics.averageGrade) ? teacherData.statistics.averageGrade : 0}
              icon={<AssignmentIcon />}
              color="warning"
              subtitle="Điểm gần đây"
            />
          </Grid>
        </Grid>

        {/* Today's Sessions */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Buổi điểm danh hôm nay
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {teacherData.todaySessions.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Hôm nay chưa có buổi điểm danh
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {teacherData.todaySessions.map((session) => (
                      <ListItem key={session.id} divider>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: session.is_active ? 'success.main' : 'grey.400' }}>
                            <ScheduleIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={session.session_name}
                          secondary={`${session.start_time} - ${session.end_time} | ${session.location}`}
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" gap={1}>
                            {!session.is_active ? (
                              <Button
                                size="small"
                                startIcon={<PlayArrowIcon />}
                                onClick={() => handleStartSession(session.id)}
                              >
                                Bắt đầu
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                startIcon={<StopIcon />}
                                onClick={() => handleStopSession(session.id)}
                                color="error"
                              >
                                Kết thúc
                              </Button>
                            )}
                            <Button
                              size="small"
                              startIcon={<QrCodeIcon />}
                              onClick={() => handleGenerateQR(session.id)}
                            >
                              QR điểm danh
                            </Button>
                          <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => setSessionManagementOpen(true)}
                            >
                              Xem
                            </Button>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Lớp của tôi
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {teacherData.assignedClasses.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Chưa được phân công lớp nào
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {teacherData.assignedClasses.map((classItem) => (
                      <ListItem key={classItem.id} divider>
                        <ListItemText
                          primary={classItem.class_name}
                          secondary={`${classItem.current_students_count || 0} sinh viên`}
                        />
                        <ListItemSecondaryAction>
                          <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/classes/${classItem.id}`)}>
                            Manage
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Thao tác nhanh
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => setSessionManagementOpen(true)}
                  sx={{ py: 1.5 }}
                >
                  Tạo buổi học
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<QrCodeIcon />}
                  onClick={handleQuickGenerateQR}
                  sx={{ py: 1.5 }}
>
                  Tạo QR điểm danh
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<QrCodeIcon />}
                  onClick={() => setJoinTokenDialogOpen(true)}
                  sx={{ py: 1.5 }}
                  color="secondary"
                >
                  Mã tham gia lớp
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AssignmentIcon />}
                  onClick={() => {
                    const firstId = teacherData.assignedClasses?.[0]?.id
                    if (firstId) navigate(`/classes/${firstId}/assignments`)
                    else navigate('/classes')
                  }}
                  sx={{ py: 1.5 }}
                >
                  Nhập điểm
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VisibilityIcon />}
                  onClick={() => window.alert('Tính năng báo cáo đang phát triển')}
                  sx={{ py: 1.5 }}
                >
                  Xem báo cáo
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Import từ Excel đã ẩn cho giao diện gọn hơn */}
        {/* Session Management Dialog */}
        <SessionManagement
          open={sessionManagementOpen}
          onClose={() => setSessionManagementOpen(false)}
          onSessionCreated={handleSessionCreated}
          onSessionUpdated={handleSessionUpdated}
        />


        <ClassJoinTokenDialog
          open={joinTokenDialogOpen}
          onClose={() => setJoinTokenDialogOpen(false)}
          classOptions={teacherData.assignedClasses || []}
          defaultClassId={teacherData.assignedClasses?.[0]?.id}
        />
      </Container>
    </>
  )
}

export default ProperTeacherDashboard
