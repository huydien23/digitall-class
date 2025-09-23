import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Tooltip,
  Badge,
  useTheme,
  alpha
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Info as InfoIcon,
  Notifications as NotificationIcon,
  Today as TodayIcon,
  Event as EventIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material'

const StudentScheduleView = ({ user }) => {
  const theme = useTheme()
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = tuần này, 1 = tuần sau
  const [selectedClass, setSelectedClass] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [error, setError] = useState('')

  // Mock data for student schedule
  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock schedule data based on real schedule
        const mockSchedule = [
          // Thứ 2
          {
            id: 1,
            subject: 'Lập trình Python',
            subjectCode: 'DH22TIN06',
            teacher: 'GV: Đặng Mạnh Huy',
            room: 'Phòng 14-02',
            building: 'Phòng máy 8',
            dayOfWeek: 2, // Thứ 2
            startTime: '07:00',
            endTime: '11:00',
            duration: 240, // 4 tiết
            type: 'Thực hành',
            color: '#1976d2',
            week: 'all',
            periods: 'Tiết: 7 - 11'
          },
          // Thứ 4
          {
            id: 2,
            subject: 'Phát triển phần mềm mã nguồn mở - Thực hành',
            subjectCode: 'DH22TIN06',
            teacher: 'GV: Võ Thanh Vinh',
            room: 'Phòng 15-03',
            building: 'Phòng máy 15',
            dayOfWeek: 4, // Thứ 4
            startTime: '07:00',
            endTime: '11:00',
            duration: 240, // 4 tiết
            type: 'Thực hành',
            color: '#4caf50',
            week: 'all',
            periods: 'Tiết: 7 - 11'
          },
          // Thứ 5
          {
            id: 3,
            subject: 'Lịch sử Đảng cộng sản Việt Nam',
            subjectCode: 'DH22TIN06',
            teacher: 'GV: Đinh Cao Tín',
            room: 'Phòng D4-04',
            building: 'Hội trường Khu D',
            dayOfWeek: 5, // Thứ 5
            startTime: '06:45',
            endTime: '08:15',
            duration: 90, // 2 tiết
            type: 'Lý thuyết',
            color: '#ff9800',
            week: 'all',
            periods: 'Tiết: 4 - 6'
          },
          // Thứ 6
          {
            id: 4,
            subject: 'Lập trình thiết bị di động',
            subjectCode: 'DH22TIN06',
            teacher: 'GV: Đoàn Chí Trung',
            room: 'Phòng 14-02',
            building: 'Phòng máy 8',
            dayOfWeek: 6, // Thứ 6
            startTime: '07:00',
            endTime: '11:00',
            duration: 240, // 4 tiết
            type: 'Thực hành',
            color: '#9c27b0',
            week: 'all',
            periods: 'Tiết: 7 - 11'
          },
          // Thứ 7
          {
            id: 5,
            subject: 'Pháp luật về công nghệ thông tin',
            subjectCode: 'DH22TIN06',
            teacher: 'GV: Trần Minh Tâm',
            room: 'Phòng T4-05',
            building: 'Học đường',
            dayOfWeek: 7, // Thứ 7
            startTime: '06:45',
            endTime: '08:15',
            duration: 90, // 2 tiết
            type: 'Lý thuyết',
            color: '#607d8b',
            week: 'all',
            periods: 'Tiết: 1 - 3'
          }
        ]
        
        setSchedules(mockSchedule)
      } catch (err) {
        setError('Không thể tải thời khóa biểu')
      } finally {
        setIsLoading(false)
      }
    }

    loadSchedule()
  }, [])

  const getDayName = (dayOfWeek) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[dayOfWeek]
  }

  const getScheduleForDay = (dayOfWeek) => {
    return schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek)
  }

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem)
    setDetailDialogOpen(true)
  }

  const getWeekDates = (weekOffset = 0) => {
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7))
    
    const weekDates = []
    for (let i = 0; i < 6; i++) { // Thứ 2 đến Thứ 7
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const isToday = (dayOfWeek) => {
    const today = new Date().getDay()
    return dayOfWeek === today && selectedWeek === 0
  }

  const weekDates = getWeekDates(selectedWeek)

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Thời khóa biểu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lịch học các môn trong tuần
        </Typography>
      </Box>

      {/* Week Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <IconButton onClick={() => setSelectedWeek(selectedWeek - 1)}>
          <ChevronLeftIcon />
        </IconButton>
        
        <Box textAlign="center">
          <Typography variant="h6" fontWeight={600}>
            {selectedWeek === 0 ? 'Tuần này' : selectedWeek === 1 ? 'Tuần sau' : `Tuần ${selectedWeek + 1}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {weekDates[0]?.toLocaleDateString('vi-VN')} - {weekDates[5]?.toLocaleDateString('vi-VN')}
          </Typography>
        </Box>
        
        <IconButton onClick={() => setSelectedWeek(selectedWeek + 1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={600} color="primary.main">
                {schedules.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tiết học/tuần
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={600} color="success.main">
                {new Set(schedules.map(s => s.subject)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Môn học
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {schedules.filter(s => isToday(s.dayOfWeek)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tiết hôm nay
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" fontWeight={600} color="info.main">
                {Math.round(schedules.reduce((sum, s) => sum + s.duration, 0) / 60)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Giờ/tuần
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Schedule Grid */}
      <Grid container spacing={2}>
        {[2, 3, 4, 5, 6, 7].map((dayOfWeek, index) => {
          const daySchedules = getScheduleForDay(dayOfWeek)
          const isCurrentDay = isToday(dayOfWeek)
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={dayOfWeek}>
              <Card 
                variant="outlined"
                sx={{ 
                  height: '100%',
                  border: isCurrentDay ? `2px solid ${theme.palette.primary.main}` : undefined,
                  bgcolor: isCurrentDay ? alpha(theme.palette.primary.main, 0.05) : undefined
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* Day Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {getDayName(dayOfWeek)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {weekDates[index]?.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </Typography>
                    </Box>
                    {isCurrentDay && (
                      <Badge color="primary" variant="dot">
                        <TodayIcon color="primary" />
                      </Badge>
                    )}
                  </Box>

                  {/* Classes for this day */}
                  {daySchedules.length === 0 ? (
                    <Box textAlign="center" py={3}>
                      <Typography variant="body2" color="text.secondary">
                        Không có lịch học
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {daySchedules
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((classItem) => (
                        <Paper
                          key={classItem.id}
                          elevation={1}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            borderLeft: `4px solid ${classItem.color}`,
                            '&:hover': {
                              bgcolor: alpha(classItem.color, 0.1)
                            }
                          }}
                          onClick={() => handleClassClick(classItem)}
                        >
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {classItem.subject}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {classItem.startTime} - {classItem.endTime}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" noWrap>
                            {classItem.room}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" noWrap>
                            {classItem.periods}
                          </Typography>
                          <Chip
                            label={classItem.type}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 16,
                              fontSize: '0.6rem',
                              bgcolor: alpha(classItem.color, 0.1),
                              color: classItem.color
                            }}
                          />
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Class Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: selectedClass?.color }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedClass?.subject}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedClass?.subjectCode}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <List>
            <ListItem disablePadding>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText 
                primary="Giảng viên"
                secondary={selectedClass?.teacher}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon><TimeIcon /></ListItemIcon>
              <ListItemText 
                primary="Thời gian"
                secondary={`${selectedClass?.startTime} - ${selectedClass?.endTime} (${selectedClass?.duration} phút) - ${selectedClass?.periods}`}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon><LocationIcon /></ListItemIcon>
              <ListItemText 
                primary="Địa điểm"
                secondary={`${selectedClass?.room}, ${selectedClass?.building}`}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon><EventIcon /></ListItemIcon>
              <ListItemText 
                primary="Loại tiết học"
                secondary={selectedClass?.type}
              />
            </ListItem>
          </List>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentScheduleView
