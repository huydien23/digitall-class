import React, { useState, useEffect } from 'react'
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
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  Upload as UploadIcon,
  ContentCopy as CopyIcon,
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
// Mock data imports removed

const ProductionTeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    totalClasses: 0,
    activeStudents: 0,
    attendanceRate: 0,
    averageGrade: 0
  })
  const [todaySessions, setTodaySessions] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  // Mock notice removed

  const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { boxShadow: 8 } : {}
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
              {icon}
            </Avatar>
          </Box>
          <Typography variant="h4" fontWeight={700} color={`${color}.main`} gutterBottom>
            {loading ? <CircularProgress size={20} /> : value}
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

  const handleCreateSession = () => {
    setSessionDialogOpen(true)
  }

  const handleRecordGrades = () => {
    setGradeDialogOpen(true)
  }

  const handleGenerateQR = () => {
    // Mock QR generation
    alert('QR Code đã được tạo! (Demo)')
  }

  const handleViewReports = () => {
    alert('Tính năng báo cáo đang phát triển')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  // Load real data on mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API calls
      // const classesRes = await classService.getClasses()
      // const statsRes = await dashboardService.getTeacherStats()
      
      // For now, set default values
      setStatistics({
        totalClasses: 5,
        activeStudents: 125,
        attendanceRate: 92,
        averageGrade: 8.5
      })
      setTodaySessions([])
      setRecentActivities([])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  return (
    <>
      <Helmet>
        <title>Teacher Dashboard - Student Management System</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <DashboardIcon />
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
        </Box>

        {/* Real data notice */}

        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Lớp của tôi"
              value={statistics.totalClasses}
              icon={<SchoolIcon />}
              color="primary"
              subtitle="Lớp được phân công"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Sinh viên"
              value={statistics.activeStudents}
              icon={<PeopleIcon />}
              color="success"
              subtitle="Tổng sinh viên"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tỷ lệ điểm danh"
              value={`${statistics.attendanceRate}%`}
              icon={<CheckCircleIcon />}
              color="info"
              subtitle="Trung bình hôm nay"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Điểm TB"
              value={statistics.averageGrade}
              icon={<GradeIcon />}
              color="warning"
              subtitle="Điểm trung bình gần đây"
            />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Thao tác nhanh
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={handleCreateSession}
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
                  onClick={handleGenerateQR}
                  sx={{ py: 1.5 }}
                  color="success"
                >
                  Tạo QR điểm danh
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<GradeIcon />}
                  onClick={handleRecordGrades}
                  sx={{ py: 1.5 }}
                  color="warning"
                >
                  Nhập điểm
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VisibilityIcon />}
                  onClick={handleViewReports}
                  sx={{ py: 1.5 }}
                  color="info"
                >
                  Xem báo cáo
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Today's Sessions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Buổi học hôm nay
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {todaySessions.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <AccessTimeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Không có buổi học nào hôm nay
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date().getDay() === 1 ? 'Hôm nay có lớp Python nhưng chưa tạo session' : 'Lớp Python học vào thứ 2'}
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {todaySessions.map((session) => (
                      <ListItem key={session.id} divider>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <ScheduleIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={session.session_name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {session.start_time} - {session.end_time}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {session.location}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={session.is_active ? 'Đang diễn ra' : 'Chưa bắt đầu'}
                            color={session.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* My Classes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Lớp học của tôi
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {recentActivities.map((classItem) => (
                  <Card key={classItem.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {classItem.class_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Mã lớp: {classItem.class_id}
                          </Typography>
                        </Box>
                        <Chip
                          label="Đang hoạt động"
                          color="success"
                          size="small"
                        />
                      </Box>

                      <Stack spacing={1}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {classItem.current_students}/{classItem.max_students} sinh viên
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {classItem.schedule}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {classItem.location}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<VisibilityIcon />}>
                        Xem chi tiết
                      </Button>
                      <Button size="small" startIcon={<QrCodeIcon />}>
                        Điểm danh
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Grades */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Điểm số gần đây
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sinh viên</TableCell>
                        <TableCell>Mã SV</TableCell>
                        <TableCell>Môn học</TableCell>
                        <TableCell>Loại điểm</TableCell>
                        <TableCell align="right">Điểm</TableCell>
                        <TableCell>Ngày nhập</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[].map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell>{grade.student_name}</TableCell>
                          <TableCell>{grade.student_id}</TableCell>
                          <TableCell>{grade.subject}</TableCell>
                          <TableCell>
                            <Chip
                              label={grade.grade_type}
                              size="small"
                              color={
                                grade.grade_type === 'Cuối kỳ' ? 'primary' :
                                grade.grade_type === 'Giữa kỳ' ? 'warning' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={600}
                              color={
                                parseFloat(grade.score) >= 8.5 ? 'success.main' :
                                parseFloat(grade.score) >= 7.0 ? 'warning.main' : 'error.main'
                              }
                            >
                              {grade.score}/10
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(grade.created_at).toLocaleDateString('vi-VN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Create Session Dialog */}
        <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Tạo buổi học mới</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Tên buổi học"
                fullWidth
                defaultValue="Buổi học tuần 8 - Lập trình Python"
              />
              <FormControl fullWidth>
                <InputLabel>Lớp học</InputLabel>
                <Select defaultValue="1">
                  <MenuItem value="1">Lập trình Python - DH22TIN06</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Ngày học"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              <Box display="flex" gap={2}>
                <TextField
                  label="Giờ bắt đầu"
                  type="time"
                  defaultValue="07:00"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Giờ kết thúc"
                  type="time"
                  defaultValue="11:00"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <TextField
                label="Địa điểm"
                fullWidth
                defaultValue="Phòng 14-02 (Phòng máy 8)"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSessionDialogOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={() => {
              setSessionDialogOpen(false)
              alert('Buổi học đã được tạo! (Demo)')
            }}>
              Tạo buổi học
            </Button>
          </DialogActions>
        </Dialog>

        {/* Grade Input Dialog */}
        <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nhập điểm</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Lớp học</InputLabel>
                <Select defaultValue="1">
                  <MenuItem value="1">Lập trình Python - DH22TIN06</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Loại điểm</InputLabel>
                <Select defaultValue="regular">
                  <MenuItem value="regular">Thường xuyên (10%)</MenuItem>
                  <MenuItem value="midterm">Giữa kỳ (30%)</MenuItem>
                  <MenuItem value="final">Cuối kỳ (60%)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Tên bài kiểm tra"
                fullWidth
                placeholder="VD: Bài tập tuần 8, Kiểm tra giữa kỳ..."
              />
              <Alert severity="info">
                Hệ thống chấm điểm: 10% (thường xuyên) + 30% (giữa kỳ) + 60% (cuối kỳ) = 100%
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGradeDialogOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={() => {
              setGradeDialogOpen(false)
              alert('Chuyển đến trang nhập điểm chi tiết! (Demo)')
            }}>
              Tiếp tục
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default ProductionTeacherDashboard
