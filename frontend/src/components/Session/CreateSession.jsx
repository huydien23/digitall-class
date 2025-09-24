import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Paper,
  IconButton,
  Divider
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Add as AddIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const CreateSession = ({ 
  open, 
  onClose, 
  classData, 
  onCreateSession 
}) => {
  const [sessionData, setSessionData] = useState({
    session_name: '',
    session_type: 'lecture', // lecture, lab, exam, review
    date: new Date().toISOString().split('T')[0],
    start_time: '07:00',
    end_time: '11:00',
    location: classData?.location || '',
    description: '',
    max_late_minutes: 15,
    allow_early_minutes: 15
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const sessionTypes = [
    { value: 'lecture', label: 'Bài giảng', color: 'primary' },
    { value: 'lab', label: 'Thực hành', color: 'success' },
    { value: 'exam', label: 'Kiểm tra', color: 'error' },
    { value: 'review', label: 'Ôn tập', color: 'warning' },
    { value: 'seminar', label: 'Thảo luận', color: 'info' }
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!sessionData.session_name.trim()) {
      newErrors.session_name = 'Vui lòng nhập tên buổi học'
    }

    if (!sessionData.date) {
      newErrors.date = 'Vui lòng chọn ngày học'
    }

    if (!sessionData.start_time) {
      newErrors.start_time = 'Vui lòng chọn giờ bắt đầu'
    }

    if (!sessionData.end_time) {
      newErrors.end_time = 'Vui lòng chọn giờ kết thúc'
    }

    if (sessionData.start_time && sessionData.end_time) {
      const startTime = new Date(`2000-01-01T${sessionData.start_time}`)
      const endTime = new Date(`2000-01-01T${sessionData.end_time}`)
      
      if (endTime <= startTime) {
        newErrors.end_time = 'Giờ kết thúc phải sau giờ bắt đầu'
      }
    }

    if (!sessionData.location.trim()) {
      newErrors.location = 'Vui lòng nhập địa điểm'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Ủy quyền việc tạo buổi học cho parent (sẽ gọi API thật)
      await onCreateSession({ ...sessionData })
      
      // Reset form
      setSessionData({
        session_name: '',
        session_type: 'lecture',
        date: new Date().toISOString().split('T')[0],
        start_time: '07:00',
        end_time: '11:00',
        location: classData?.location || '',
        description: '',
        max_late_minutes: 15,
        allow_early_minutes: 15
      })
      
      onClose()
    } catch (error) {
      console.error('Error creating session:', error)
    }
    setLoading(false)
  }

  const handleInputChange = (field, value) => {
    setSessionData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getSessionTypeColor = (type) => {
    const found = sessionTypes.find(t => t.value === type)
    return found ? found.color : 'default'
  }

  const getSessionDuration = () => {
    if (sessionData.start_time && sessionData.end_time) {
      const start = new Date(`2000-01-01T${sessionData.start_time}`)
      const end = new Date(`2000-01-01T${sessionData.end_time}`)
      const diffMs = end - start
      const diffHours = diffMs / (1000 * 60 * 60)
      
      if (diffHours > 0) {
        return `${diffHours} tiếng`
      }
    }
    return ''
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon color="primary" />
            <Box>
              <Typography variant="h6">Tạo buổi học mới</Typography>
              <Typography variant="body2" color="text.secondary">
                {classData?.class_name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Session Name & Type */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Tên buổi học *"
                value={sessionData.session_name}
                onChange={(e) => handleInputChange('session_name', e.target.value)}
                error={!!errors.session_name}
                helperText={errors.session_name}
                placeholder="VD: Buổi 1 - Giới thiệu Python"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Loại buổi học</InputLabel>
                <Select
                  value={sessionData.session_type}
                  onChange={(e) => handleInputChange('session_type', e.target.value)}
                  label="Loại buổi học"
                >
                  {sessionTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={type.label}
                          color={type.color}
                          size="small"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date & Time */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Ngày học *"
                type="date"
                value={sessionData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                error={!!errors.date}
                helperText={errors.date}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Giờ bắt đầu *"
                type="time"
                value={sessionData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                error={!!errors.start_time}
                helperText={errors.start_time}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Giờ kết thúc *"
                type="time"
                value={sessionData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                error={!!errors.end_time}
                helperText={errors.end_time}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa điểm *"
                value={sessionData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                error={!!errors.location}
                helperText={errors.location}
                placeholder="VD: Phòng 14-02 (Phòng máy 8)"
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả buổi học"
                multiline
                rows={3}
                value={sessionData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Nội dung, tài liệu cần chuẩn bị, ghi chú đặc biệt..."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Advanced Settings */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Cài đặt điểm danh
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cho phép vào sớm (phút)"
                type="number"
                value={sessionData.allow_early_minutes}
                onChange={(e) => handleInputChange('allow_early_minutes', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 60 }}
                helperText="Sinh viên có thể điểm danh trước giờ học"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cho phép muộn tối đa (phút)"
                type="number"
                value={sessionData.max_late_minutes}
                onChange={(e) => handleInputChange('max_late_minutes', parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 120 }}
                helperText="Sau thời gian này sẽ không thể điểm danh"
              />
            </Grid>
          </Grid>

          {/* Session Summary */}
          <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tóm tắt buổi học
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Chip
                icon={<SchoolIcon />}
                label={sessionTypes.find(t => t.value === sessionData.session_type)?.label || 'Bài giảng'}
                color={getSessionTypeColor(sessionData.session_type)}
              />
              <Chip
                icon={<CalendarIcon />}
                label={sessionData.date || 'Chưa chọn ngày'}
                variant="outlined"
              />
              <Chip
                icon={<ScheduleIcon />}
                label={`${sessionData.start_time || '--:--'} - ${sessionData.end_time || '--:--'} ${getSessionDuration() ? `(${getSessionDuration()})` : ''}`}
                variant="outlined"
              />
              <Chip
                icon={<LocationIcon />}
                label={sessionData.location || 'Chưa có địa điểm'}
                variant="outlined"
              />
            </Box>
          </Paper>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? null : <AddIcon />}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
          }}
        >
          {loading ? 'Đang tạo...' : 'Tạo buổi học'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateSession