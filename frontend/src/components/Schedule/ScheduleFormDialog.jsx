import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  CircularProgress,
  Autocomplete,
  Chip
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import dayjs from 'dayjs'
import classService from '../../services/classService'
import scheduleService from '../../services/scheduleService'

const ScheduleFormDialog = ({ open, onClose, onSuccess, editData = null }) => {
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    class_id: '',
    day_of_week: '',
    start_time: null,
    end_time: null,
    room: '',
    building: '',
    session_type: 'lecture',
    notes: '',
    effective_from: null,
    effective_until: null,
    is_recurring: true
  })

  // Load classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await classService.getClasses()
        setClasses(response.data?.results || response.data || [])
      } catch (err) {
        console.error('Error loading classes:', err)
      }
    }
    if (open) {
      loadClasses()
    }
  }, [open])

  // Load edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        class_id: editData.class_id || editData.class?.id || '',
        day_of_week: editData.day_of_week || '',
        start_time: editData.start_time ? parseTime(editData.start_time) : null,
        end_time: editData.end_time ? parseTime(editData.end_time) : null,
        room: editData.room || '',
        building: editData.building || '',
        session_type: editData.session_type || 'lecture',
        notes: editData.notes || '',
        effective_from: editData.effective_from ? dayjs(editData.effective_from) : null,
        effective_until: editData.effective_until ? dayjs(editData.effective_until) : null,
        is_recurring: editData.is_recurring !== undefined ? editData.is_recurring : true
      })
    } else {
      // Reset form for new schedule
      setFormData({
        class_id: '',
        day_of_week: '',
        start_time: null,
        end_time: null,
        room: '',
        building: '',
        session_type: 'lecture',
        notes: '',
        effective_from: null,
        effective_until: null,
        is_recurring: true
      })
    }
    setError('')
  }, [editData, open])

  const parseTime = (timeString) => {
    if (!timeString) return null
    // Accept formats: HH:mm or HH:mm:ss
    const pure = timeString.length > 5 ? timeString.slice(0,5) : timeString
    return dayjs(`1970-01-01T${pure}`)
  }

  const formatTime = (value) => {
    if (!value) return null
    const d = dayjs(value)
    return d.isValid() ? d.format('HH:mm') : null
  }

  const formatDate = (value) => {
    if (!value) return null
    const d = dayjs(value)
    return d.isValid() ? d.format('YYYY-MM-DD') : null
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.class_id) {
      setError('Vui lòng chọn lớp học')
      return false
    }
    if (!formData.day_of_week) {
      setError('Vui lòng chọn thứ trong tuần')
      return false
    }
    if (!formData.start_time) {
      setError('Vui lòng chọn giờ bắt đầu')
      return false
    }
    if (!formData.end_time) {
      setError('Vui lòng chọn giờ kết thúc')
      return false
    }
    if (formData.start_time >= formData.end_time) {
      setError('Giờ kết thúc phải sau giờ bắt đầu')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const submitData = {
        class_id: formData.class_id,
        day_of_week: formData.day_of_week,
        start_time: formatTime(formData.start_time),
        end_time: formatTime(formData.end_time),
        room: formData.room,
        building: formData.building,
        session_type: formData.session_type,
        notes: formData.notes,
        effective_from: formatDate(formData.effective_from),
        effective_until: formatDate(formData.effective_until),
        is_recurring: formData.is_recurring
      }

      if (editData) {
        await scheduleService.updateSchedule(editData.id, submitData)
      } else {
        await scheduleService.createSchedule(submitData)
      }

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error saving schedule:', err)
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thời khóa biểu')
    } finally {
      setLoading(false)
    }
  }

  const dayOfWeekOptions = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 7' },
    { value: 0, label: 'Chủ nhật' }
  ]

  const sessionTypeOptions = [
    { value: 'lecture', label: 'Lý thuyết' },
    { value: 'practice', label: 'Thực hành' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'exam', label: 'Kiểm tra' },
    { value: 'other', label: 'Khác' }
  ]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editData ? 'Chỉnh sửa thời khóa biểu' : 'Thêm thời khóa biểu mới'}
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Class Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Lớp học *</InputLabel>
              <Select
                value={formData.class_id}
                onChange={(e) => handleChange('class_id', e.target.value)}
                label="Lớp học *"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.class_id} - {cls.class_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Day of Week */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Thứ trong tuần *</InputLabel>
              <Select
                value={formData.day_of_week}
                onChange={(e) => handleChange('day_of_week', e.target.value)}
                label="Thứ trong tuần *"
              >
                {dayOfWeekOptions.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Session Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Loại tiết học</InputLabel>
              <Select
                value={formData.session_type}
                onChange={(e) => handleChange('session_type', e.target.value)}
                label="Loại tiết học"
              >
                {sessionTypeOptions.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Time Pickers */}
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Giờ bắt đầu *"
              value={formData.start_time}
              onChange={(value) => handleChange('start_time', value)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              ampm={false}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Giờ kết thúc *"
              value={formData.end_time}
              onChange={(value) => handleChange('end_time', value)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              ampm={false}
            />
          </Grid>

          {/* Room and Building */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phòng học"
              value={formData.room}
              onChange={(e) => handleChange('room', e.target.value)}
              placeholder="VD: A101"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tòa nhà"
              value={formData.building}
              onChange={(e) => handleChange('building', e.target.value)}
              placeholder="VD: Tòa A"
            />
          </Grid>

          {/* Effective Dates */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Hiệu lực từ ngày"
              value={formData.effective_from}
              onChange={(value) => handleChange('effective_from', value)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              inputFormat="DD/MM/YYYY"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Hiệu lực đến ngày"
              value={formData.effective_until}
              onChange={(value) => handleChange('effective_until', value)}
              renderInput={(params) => <TextField {...params} fullWidth />}
              inputFormat="DD/MM/YYYY"
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Thông tin bổ sung về tiết học..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {editData ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ScheduleFormDialog
