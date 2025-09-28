import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Fab,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  QrCodeScanner,
  QrCode2,
  Add,
  Visibility,
  Edit,
  Delete,
  FilterList,
  Refresh,
  EventAvailable,
  People,
  Analytics,
  Schedule,
  CheckCircle,
  Cancel,
  Timer,
  Search,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs from 'dayjs'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Helmet } from 'react-helmet-async'

// Components
import QRCodeScanner from '../../components/QRCode/QRCodeScanner'
import AttendanceQRGenerator from '../../components/QRCode/AttendanceQRGenerator'
import { useNotification } from '../../components/Notification/NotificationProvider'
import { useSelector } from 'react-redux'
import attendanceService from '../../services/attendanceService'
import classService from '../../services/classService'

// Validation schema for creating attendance session
const sessionSchema = yup.object({
  subject: yup.string().required('Môn học là bắt buộc'),
  class_id: yup.string().required('Lớp học là bắt buộc'),
  session_date: yup.date().required('Ngày học là bắt buộc'),
  start_time: yup.string().required('Thời gian bắt đầu là bắt buộc'),
  end_time: yup.string().required('Thời gian kết thúc là bắt buộc'),
})

const QRAttendanceManager = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useSelector((state) => state.auth)
  const { showSuccess, showError, showInfo } = useNotification()

  // State management
  const [scannerOpen, setScannerOpen] = useState(false)
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [createSessionOpen, setCreateSessionOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, active, completed
  const [searchQuery, setSearchQuery] = useState('')

  // Form for creating sessions
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(sessionSchema),
    defaultValues: {
      subject: '',
      class_id: '',
      session_date: dayjs(),
      start_time: dayjs().format('HH:mm'),
      end_time: dayjs().add(2, 'hour').format('HH:mm'),
    }
  })

  // Load data on component mount
  useEffect(() => {
    loadSessions()
    loadClasses()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const data = await attendanceService.getAttendanceSessions()
      setSessions(data)
    } catch (error) {
      console.error('Load sessions error:', error)
      showError('Không thể tải danh sách phiên điểm danh')
    } finally {
      setLoading(false)
    }
  }

  const loadClasses = async () => {
    try {
      const data = await classService.getClasses()
      setClasses(data)
    } catch (error) {
      console.error('Load classes error:', error)
    }
  }

  const handleCreateSession = async (data) => {
    try {
      const sessionData = {
        ...data,
        session_date: data.session_date.format('YYYY-MM-DD'),
        start_time: data.start_time,
        end_time: data.end_time,
        qr_code_data: attendanceService.generateQRCodeData(Date.now().toString())
      }

      const result = await attendanceService.createAttendanceSession(sessionData)
      
      showSuccess(result.message)
      setCreateSessionOpen(false)
      reset()
      loadSessions()
    } catch (error) {
      console.error('Create session error:', error)
      showError(error.message || 'Tạo phiên điểm danh thất bại')
    }
  }

  const handleViewQR = (session) => {
    setSelectedSession(session)
    setGeneratorOpen(true)
  }

  const handleScannerSuccess = (result) => {
    showSuccess(`Điểm danh thành công! ${result.message}`)
    setScannerOpen(false)
    loadSessions() // Refresh to show updated stats
  }

  const handleSessionUpdate = (updatedSession) => {
    setSelectedSession(updatedSession)
    // Update in local state
    setSessions(prev => 
      prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      )
    )
  }

  const getSessionStatus = (session) => {
    const now = new Date()
    const sessionDate = new Date(session.session_date)
    const startTime = new Date(`${session.session_date}T${session.start_time}`)
    const endTime = new Date(`${session.session_date}T${session.end_time}`)

    if (now < startTime) {
      return { status: 'upcoming', label: 'Sắp diễn ra', color: 'info' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', label: 'Đang diễn ra', color: 'success' }
    } else {
      return { status: 'completed', label: 'Đã kết thúc', color: 'default' }
    }
  }

  const getFilteredSessions = () => {
    let filtered = sessions

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(session => {
        const { status } = getSessionStatus(session)
        return status === filter
      })
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const isTeacher = userProfile?.role === 'teacher'
  const isStudent = userProfile?.role === 'student'

  return (
    <>
      <Helmet>
        <title>Quản lý Điểm danh QR Code - Student Management</title>
      </Helmet>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Điểm danh QR Code
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isTeacher 
              ? 'Tạo và quản lý phiên điểm danh cho các lớp học của bạn'
              : 'Quét QR code để điểm danh các buổi học'
            }
          </Typography>
        </Box>

        {/* Action Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center" flexGrow={1}>
              <TextField
                placeholder="Tìm kiếm môn học, lớp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Lọc theo</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="upcoming">Sắp diễn ra</MenuItem>
                  <MenuItem value="active">Đang diễn ra</MenuItem>
                  <MenuItem value="completed">Đã kết thúc</MenuItem>
                </Select>
              </FormControl>
              <IconButton onClick={loadSessions} disabled={loading}>
                <Refresh />
              </IconButton>
            </Stack>

            <Stack direction="row" spacing={2}>
              {isStudent && (
                <Button
                  variant="contained"
                  startIcon={<QrCodeScanner />}
                  onClick={() => setScannerOpen(true)}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Quét QR Điểm danh
                </Button>
              )}
              {isTeacher && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateSessionOpen(true)}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Tạo phiên điểm danh
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* Sessions List */}
        <AnimatePresence>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {getFilteredSessions().map((session, index) => {
                const { status, label, color } = getSessionStatus(session)
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={session.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          border: status === 'active' ? '2px solid' : '1px solid',
                          borderColor: status === 'active' ? 'success.main' : 'divider',
                          '&:hover': { boxShadow: 3 }
                        }}
                      >
                        <CardContent>
                          <Stack spacing={2}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                  {session.subject}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {session.class_name || 'N/A'}
                                </Typography>
                              </Box>
                              <Chip
                                label={label}
                                color={color}
                                size="small"
                                icon={
                                  status === 'active' ? <Timer /> :
                                  status === 'upcoming' ? <Schedule /> :
                                  <CheckCircle />
                                }
                              />
                            </Box>

                            {/* Session Info */}
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventAvailable sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {new Date(session.session_date).toLocaleDateString('vi-VN')}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {session.start_time} - {session.end_time}
                                </Typography>
                              </Box>
                              {session.attendance_count !== undefined && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    {session.attendance_count} sinh viên đã điểm danh
                                  </Typography>
                                </Box>
                              )}
                            </Stack>

                            {/* Actions */}
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {isTeacher && (
                                <>
                                  <Tooltip title="Xem QR Code">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewQR(session)}
                                      color="primary"
                                    >
                                      <QrCode2 />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xem chi tiết">
                                    <IconButton size="small" color="primary">
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Chỉnh sửa">
                                    <IconButton size="small" color="secondary">
                                      <Edit />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {isStudent && status === 'active' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<QrCodeScanner />}
                                  onClick={() => setScannerOpen(true)}
                                  fullWidth
                                >
                                  Điểm danh
                                </Button>
                              )}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                )
              })}
            </Grid>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && getFilteredSessions().length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <EventAvailable sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {searchQuery || filter !== 'all' 
                ? 'Không tìm thấy phiên điểm danh nào'
                : 'Chưa có phiên điểm danh nào'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {isTeacher 
                ? 'Tạo phiên điểm danh mới để bắt đầu'
                : 'Liên hệ giáo viên để tạo phiên điểm danh'
              }
            </Typography>
            {isTeacher && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateSessionOpen(true)}
              >
                Tạo phiên điểm danh
              </Button>
            )}
          </Paper>
        )}

        {/* Floating Action Button for mobile */}
        {isMobile && (
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
            onClick={() => {
              if (isStudent) setScannerOpen(true)
              else if (isTeacher) setCreateSessionOpen(true)
            }}
          >
            {isStudent ? <QrCodeScanner /> : <Add />}
          </Fab>
        )}
      </Box>

      {/* QR Code Scanner Dialog */}
      <QRCodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSuccess={handleScannerSuccess}
      />

      {/* QR Code Generator Dialog (unified) */}
      <AttendanceQRGenerator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        classData={{
          class_name: selectedSession?.class_name || (classes.find(c => c.id === selectedSession?.class_id)?.name),
          class_id: selectedSession?.class_id,
          subject: selectedSession?.subject
        }}
        availableSessions={sessions}
        initialSessionId={selectedSession?.id}
        title="QR Code Điểm Danh"
        onSessionUpdate={handleSessionUpdate}
      />

      {/* Create Session Dialog */}
      <Dialog
        open={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Tạo phiên điểm danh mới
          </Typography>
        </DialogTitle>
        
        <form onSubmit={handleSubmit(handleCreateSession)}>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Môn học"
                    placeholder="Nhập tên môn học"
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                    fullWidth
                    required
                  />
                )}
              />

              <Controller
                name="class_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.class_id} required>
                    <InputLabel>Lớp học</InputLabel>
                    <Select {...field} label="Lớp học">
                      {classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.class_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.class_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Controller
                name="session_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Ngày học"
                    minDate={dayjs()}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.session_date}
                        helperText={errors.session_date?.message}
                        required
                      />
                    )}
                  />
                )}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Controller
                    name="start_time"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        {...field}
                        label="Giờ bắt đầu"
                        value={field.value ? dayjs(field.value, 'HH:mm') : null}
                        onChange={(value) => field.onChange(value ? value.format('HH:mm') : '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.start_time}
                            helperText={errors.start_time?.message}
                            required
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="end_time"
                    control={control}
                    render={({ field }) => (
                      <TimePicker
                        {...field}
                        label="Giờ kết thúc"
                        value={field.value ? dayjs(field.value, 'HH:mm') : null}
                        onChange={(value) => field.onChange(value ? value.format('HH:mm') : '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.end_time}
                            helperText={errors.end_time?.message}
                            required
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCreateSessionOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <Add />}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo phiên điểm danh'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}

export default QRAttendanceManager
