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
import classService from '../../services/classService'
import attendanceService from '../../services/attendanceService'

const StudentScheduleView = ({ user }) => {
  const theme = useTheme()
  const [schedules, setSchedules] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = tuần này, 1 = tuần sau
  const [selectedClass, setSelectedClass] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [error, setError] = useState('')

  // Load real data from student's enrolled classes
  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true)
      try {
        // 1. Get student's enrolled classes
        const myClassesRes = await classService.getMyClasses()
        const myClasses = myClassesRes.data?.results || myClassesRes.data || []
        
        if (myClasses.length === 0) {
          setSchedules([])
          setError('Bạn chưa tham gia lớp học nào.')
          return
        }
        
        // 2. Get all attendance sessions from enrolled classes
        const allSchedules = []
        const colors = ['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#607d8b', '#f44336', '#00bcd4']
        
        await Promise.all(
          myClasses.map(async (classItem, index) => {
            try {
              const sessionsRes = await attendanceService.getSessions({ 
                class_id: classItem.id, 
                page_size: 200 
              })
              const sessions = sessionsRes.data?.results || sessionsRes.data || []
              
              sessions.forEach(session => {
                // Convert session to schedule format
                const sessionDate = new Date(session.session_date)
                let dayOfWeek = sessionDate.getDay() // 0=Sunday, 1=Monday, ..., 6=Saturday
                // Convert to format expected by component: 1=Monday, ..., 7=Sunday
                if (dayOfWeek === 0) {
                  dayOfWeek = 7 // Sunday becomes 7
                } else {
                  // Monday-Saturday remain 1-6
                }
                
                // Calculate duration in minutes
                const startTime = session.start_time
                const endTime = session.end_time
                let duration = 60 // default
                
                if (startTime && endTime) {
                  const [startH, startM] = startTime.split(':').map(Number)
                  const [endH, endM] = endTime.split(':').map(Number)
                  duration = (endH * 60 + endM) - (startH * 60 + startM)
                }
                
                // Only add sessions that are on weekdays (Monday-Saturday)
                if (dayOfWeek >= 1 && dayOfWeek <= 6) {
                  allSchedules.push({
                    id: session.id,
                    subject: classItem.class_name,
                    subjectCode: classItem.class_id,
                    teacher: classItem.teacher ? 
                      `${classItem.teacher.first_name} ${classItem.teacher.last_name}` : 
                      'Chưa có giảng viên',
                    room: session.location || 'Chưa có phòng',
                    building: session.location || 'Chưa xác định',
                    dayOfWeek: dayOfWeek,
                    startTime: startTime?.slice(0, 5) || '00:00',
                    endTime: endTime?.slice(0, 5) || '00:00',
                    duration: duration,
                    type: session.session_type === 'lecture' ? 'Lý thuyết' : 
                          session.session_type === 'practice' ? 'Thực hành' : 
                          session.session_type === 'seminar' ? 'Seminar' : 
                          session.session_type === 'exam' ? 'Kiểm tra' : 'Học',
                    color: colors[index % colors.length],
                    week: 'all',
                    periods: `Buổi: ${session.session_name || 'Không tên'}`,
                    session_date: session.session_date,
                    // Additional data
                    classObj: classItem,
                    sessionObj: session
                  })
                }
              })
            } catch (err) {
              console.warn(`Failed to load sessions for class ${classItem.class_id}:`, err)
            }
          })
        )
        
        // Sort by day of week and time
        allSchedules.sort((a, b) => {
          if (a.dayOfWeek !== b.dayOfWeek) {
            return a.dayOfWeek - b.dayOfWeek
          }
          return a.startTime.localeCompare(b.startTime)
        })
        
        // Debug logging
        console.log('Total schedules loaded:', allSchedules.length)
        allSchedules.forEach(s => {
          console.log(`Schedule: ${s.subject} on day ${s.dayOfWeek} (${s.session_date})`)
        })
        
        setSchedules(allSchedules)
      } catch (err) {
        console.error('Error loading schedule:', err)
        setError('Không thể tải thời khóa biểu. Vui lòng thử lại sau.')
      } finally {
        setIsLoading(false)
      }
    }

    loadSchedule()
  }, [user?.id, user?.student_id])

  const getDayName = (dayOfWeek) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[dayOfWeek]
  }

  const getScheduleForDay = (dayOfWeek) => {
    const targetDate = getWeekDates(selectedWeek)[dayOfWeek === 7 ? 6 : dayOfWeek - 1] // Convert dayOfWeek to array index
    if (!targetDate) return []
    
    console.log(`Getting schedules for day ${dayOfWeek}, target date: ${targetDate.toLocaleDateString()}`);
    
    const filtered = schedules.filter(schedule => {
      if (schedule.dayOfWeek !== dayOfWeek) return false
      
      // Check if the schedule session falls within the selected week
      if (schedule.session_date) {
        const sessionDate = new Date(schedule.session_date)
        const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
        const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
        const matches = sessionDateOnly.getTime() === targetDateOnly.getTime()
        console.log(`  Session ${schedule.subject}: ${schedule.session_date} matches ${targetDate.toLocaleDateString()}? ${matches}`)
        return matches
      }
      
      return true // Show recurring schedules for current week
    })
    
    console.log(`  Found ${filtered.length} sessions for day ${dayOfWeek}`);
    return filtered
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
    for (let i = 0; i < 7; i++) { // Thứ 2 đến Chủ nhật (7 ngày)
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
            {weekDates[0]?.toLocaleDateString('vi-VN')} - {weekDates[6]?.toLocaleDateString('vi-VN')}
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
                {(() => {
                  // Count sessions for current week
                  const weekSchedules = [1, 2, 3, 4, 5, 6, 7].reduce((total, day) => {
                    return total + getScheduleForDay(day).length
                  }, 0)
                  return weekSchedules
                })()}
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
                {(() => {
                  // Count unique subjects for current week
                  const weekSubjects = [1, 2, 3, 4, 5, 6, 7].reduce((subjects, day) => {
                    getScheduleForDay(day).forEach(s => subjects.add(s.subject))
                    return subjects
                  }, new Set())
                  return weekSubjects.size
                })()}
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
                {selectedWeek === 0 ? getScheduleForDay(new Date().getDay()).length : 0}
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
                {(() => {
                  // Calculate total hours for current week
                  const weekMinutes = [1, 2, 3, 4, 5, 6, 7].reduce((total, day) => {
                    return total + getScheduleForDay(day).reduce((sum, s) => sum + s.duration, 0)
                  }, 0)
                  return Math.round(weekMinutes / 60)
                })()}
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
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Empty State */}
      {!isLoading && schedules.length === 0 && !error && (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có lịch học nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn chưa tham gia lớp học nào hoặc chưa có buổi học nào được tạo.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Schedule Grid */}
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6, 7].map((dayOfWeek, index) => {
          const daySchedules = getScheduleForDay(dayOfWeek)
          const isCurrentDay = isToday(dayOfWeek)
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={12/7} key={dayOfWeek}>
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
                        {weekDates[dayOfWeek === 7 ? 6 : dayOfWeek - 1]?.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
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
