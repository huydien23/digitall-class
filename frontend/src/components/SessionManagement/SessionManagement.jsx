import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Close as CloseIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import attendanceService from '../../services/attendanceService'
import classService from '../../services/classService'

const SessionManagement = ({ 
  open, 
  onClose, 
  onSessionCreated,
  onSessionUpdated 
}) => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    session_name: '',
    class_id: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    is_active: false
  })
  
  // Data
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])
  const [editingSession, setEditingSession] = useState(null)

  useEffect(() => {
    if (open) {
      loadClasses()
      loadSessions()
    }
  }, [open])

  const loadClasses = async () => {
    try {
      const response = await classService.getClasses()
      // Backend đã lọc theo giảng viên (nếu không phải admin). Tránh lọc sai ở FE.
      const allClasses = response.data?.results || response.data || []
      // Nếu là admin, giữ nguyên; nếu là teacher, fallback lọc theo teacher.id khi BE chưa lọc.
      const teacherClasses = (user?.role === 'admin')
        ? allClasses
        : allClasses.filter(ci => (ci?.teacher?.id ?? ci?.teacher) === user?.id || !ci?.teacher)
      setClasses(teacherClasses)
    } catch (err) {
      console.error('Failed to load classes:', err)
    }
  }

  const loadSessions = async () => {
    try {
      const response = await attendanceService.getSessions({
        teacher_id: user.id
      })
      setSessions(response.data?.results || [])
    } catch (err) {
      console.error('Failed to load sessions:', err)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.session_name || !formData.class_id || !formData.start_time || !formData.end_time) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const sessionData = {
        ...formData,
        teacher_id: user.id,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      }

      if (editingSession) {
        // Update existing session
        await attendanceService.updateSession(editingSession.id, sessionData)
        setSuccess('Cập nhật phiên điểm danh thành công!')
        if (onSessionUpdated) onSessionUpdated()
      } else {
        // Create new session
        await attendanceService.createSession(sessionData)
        setSuccess('Tạo phiên điểm danh thành công!')
        if (onSessionCreated) onSessionCreated()
      }

      // Reset form
      setFormData({
        session_name: '',
        class_id: '',
        start_time: '',
        end_time: '',
        location: '',
        description: '',
        is_active: false
      })
      setEditingSession(null)
      loadSessions()
      
    } catch (err) {
      console.error('Session operation failed:', err)
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (session) => {
    setEditingSession(session)
    setFormData({
      session_name: session.session_name || '',
      class_id: session.class_id || '',
      start_time: session.start_time ? new Date(session.start_time).toISOString().slice(0, 16) : '',
      end_time: session.end_time ? new Date(session.end_time).toISOString().slice(0, 16) : '',
      location: session.location || '',
      description: session.description || '',
      is_active: session.is_active || false
    })
  }

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiên điểm danh này?')) {
      return
    }

    try {
      await attendanceService.deleteSession(sessionId)
      loadSessions()
    } catch (err) {
      console.error('Failed to delete session:', err)
      setError('Không thể xóa phiên điểm danh')
    }
  }

  const handleToggleActive = async (session) => {
    try {
      await attendanceService.updateSession(session.id, {
        is_active: !session.is_active
      })
      loadSessions()
    } catch (err) {
      console.error('Failed to toggle session:', err)
      setError('Không thể thay đổi trạng thái phiên điểm danh')
    }
  }

  const handleGenerateQR = async (sessionId) => {
    try {
      const response = await attendanceService.generateQRCode(sessionId)
      // Handle QR code generation
      console.log('QR Code generated:', response.data)
      setSuccess('Tạo mã QR thành công!')
    } catch (err) {
      console.error('Failed to generate QR code:', err)
      setError('Không thể tạo mã QR')
    }
  }

  const handleClose = () => {
    setFormData({
      session_name: '',
      class_id: '',
      start_time: '',
      end_time: '',
      location: '',
      description: '',
      is_active: false
    })
    setEditingSession(null)
    setError(null)
    setSuccess(false)
    onClose()
  }

  const formatTime = (t) => {
    if (!t) return ''
    if (typeof t === 'string') {
      // Expect HH:MM[:SS]
      const parts = t.split(':')
      if (parts.length >= 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`
      return t
    }
    const d = new Date(t)
    return isNaN(d) ? String(t) : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateDisplay = (d) => {
    if (!d) return ''
    const dateObj = new Date(d)
    return isNaN(dateObj) ? String(d) : dateObj.toLocaleDateString('vi-VN')
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon />
            <Typography variant="h6">
              {editingSession ? 'Chỉnh sửa phiên điểm danh' : 'Tạo phiên điểm danh mới'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin phiên điểm danh
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên phiên điểm danh"
                      value={formData.session_name}
                      onChange={(e) => handleInputChange('session_name', e.target.value)}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Lớp học</InputLabel>
                      <Select
                        value={formData.class_id}
                        onChange={(e) => handleInputChange('class_id', e.target.value)}
                        label="Lớp học"
                      >
                        {classes.map((classItem) => (
                          <MenuItem key={classItem.id} value={classItem.id}>
                            {classItem.class_name || classItem.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Thời gian bắt đầu"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Thời gian kết thúc"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => handleInputChange('end_time', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Địa điểm"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mô tả"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        />
                      }
                      label="Kích hoạt ngay"
                    />
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Sessions List */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Danh sách phiên điểm danh
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {sessions.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Chưa có phiên điểm danh nào
                  </Typography>
                </Box>
              ) : (
                <List>
                  {sessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListItem 
                        divider
                        sx={{ 
                          bgcolor: session.is_active ? 'success.light' : 'grey.50',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemText
                          primary={session.session_name}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatDateDisplay(session.session_date)} {formatTime(session.start_time)} - {formatTime(session.end_time)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {session.location}
                              </Typography>
                              <Box mt={1}>
                                <Chip
                                  label={session.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                                  color={session.is_active ? 'success' : 'default'}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box display="flex" gap={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleActive(session)}
                              color={session.is_active ? 'error' : 'success'}
                            >
                              {session.is_active ? <StopIcon /> : <PlayIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleGenerateQR(session.id)}
                              color="primary"
                            >
                              <QrCodeIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(session)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(session.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Đóng
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {editingSession ? 'Cập nhật' : 'Tạo phiên điểm danh'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SessionManagement
