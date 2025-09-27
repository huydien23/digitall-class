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
  Box,
  Typography,
  Chip,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon
} from '@mui/icons-material'
import attendanceService from '../../services/attendanceService'

// Preset templates
const SESSION_TEMPLATES = {
  theory: {
    name: 'Lý thuyết',
    data: {
      session_type: 'lecture',
      start_time: '07:00',
      end_time: '11:00',
      location: 'Phòng học lý thuyết'
    }
  },
  practice: {
    name: 'Thực hành',
    data: {
      session_type: 'practice',
      start_time: '13:00',
      end_time: '17:00',
      location: 'Phòng máy'
    }
  },
  exam: {
    name: 'Kiểm tra',
    data: {
      session_type: 'exam',
      start_time: '07:00',
      end_time: '09:00',
      location: 'Phòng thi'
    }
  }
}

const QuickCreateSession = ({ open, onClose, classId, onSuccess, lastSession = null }) => {
  const [formData, setFormData] = useState({
    session_name: '',
    description: '',
    session_date: new Date().toISOString().split('T')[0],
    start_time: '07:00',
    end_time: '11:00',
    location: '',
    session_type: 'lecture'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [recentLocations, setRecentLocations] = useState([])
  const [sessionNumber, setSessionNumber] = useState(1)

  // Load recent locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentLocations')
    if (saved) {
      setRecentLocations(JSON.parse(saved))
    }
  }, [])

  // Auto-fill from last session
  useEffect(() => {
    if (lastSession) {
      // Calculate next session number
      const match = lastSession.session_name?.match(/\d+/)
      if (match) {
        setSessionNumber(parseInt(match[0]) + 1)
      }
      
      // Copy common fields from last session
      setFormData(prev => ({
        ...prev,
        start_time: lastSession.start_time || '07:00',
        end_time: lastSession.end_time || '11:00',
        location: lastSession.location || '',
        session_type: lastSession.session_type || 'lecture',
        // Auto-increment date by 1 week
        session_date: incrementDate(lastSession.session_date, 7)
      }))
    }
  }, [lastSession])

  // Auto-generate session name based on number
  useEffect(() => {
    if (!formData.session_name && sessionNumber) {
      let name = `Buổi ${sessionNumber}`
      if (formData.session_type === 'practice') {
        name += ' - Thực hành'
      } else if (formData.session_type === 'exam') {
        name += ' - Kiểm tra'
      }
      setFormData(prev => ({ ...prev, session_name: name }))
    }
  }, [sessionNumber, formData.session_type])

  const incrementDate = (dateString, days) => {
    const date = new Date(dateString)
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      ...SESSION_TEMPLATES[template].data
    }))
  }

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQuickFillLocation = (location) => {
    setFormData(prev => ({ ...prev, location }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!formData.session_name) {
        setError('Vui lòng nhập tên buổi học')
        return
      }
      
      const sessionData = {
        ...formData,
        class_id: classId
      }
      
      await attendanceService.createSession(sessionData)
      
      // Save location to recent list
      if (formData.location && !recentLocations.includes(formData.location)) {
        const updated = [formData.location, ...recentLocations].slice(0, 5)
        setRecentLocations(updated)
        localStorage.setItem('recentLocations', JSON.stringify(updated))
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAndContinue = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!formData.session_name) {
        setError('Vui lòng nhập tên buổi học')
        return
      }
      
      const sessionData = {
        ...formData,
        class_id: classId
      }
      
      await attendanceService.createSession(sessionData)
      
      // Save location to recent list
      if (formData.location && !recentLocations.includes(formData.location)) {
        const updated = [formData.location, ...recentLocations].slice(0, 5)
        setRecentLocations(updated)
        localStorage.setItem('recentLocations', JSON.stringify(updated))
      }
      
      // Reset for next session but keep common fields
      setFormData(prev => ({
        session_name: '',
        description: '',
        session_date: incrementDate(prev.session_date, 7),
        start_time: prev.start_time,
        end_time: prev.end_time,
        location: prev.location,
        session_type: prev.session_type
      }))
      setSessionNumber(prev => prev + 1)
      
      // Show success briefly
      setError('')
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Tạo buổi học mới</Typography>
          <Box>
            <Chip 
              label={`Buổi ${sessionNumber}`} 
              color="primary" 
              size="small"
              sx={{ mr: 1 }}
            />
            {selectedTemplate && (
              <Chip 
                label={SESSION_TEMPLATES[selectedTemplate].name} 
                color="secondary" 
                size="small"
              />
            )}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* Template Selection */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Chọn mẫu nhanh:
          </Typography>
          <ToggleButtonGroup
            value={selectedTemplate}
            exclusive
            onChange={(e, value) => handleTemplateSelect(value)}
            size="small"
            fullWidth
          >
            {Object.entries(SESSION_TEMPLATES).map(([key, template]) => (
              <ToggleButton key={key} value={key}>
                {template.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        
        <Grid container spacing={2}>
          {/* Session Name with Auto-generate */}
          <Grid item xs={12}>
            <Box display="flex" gap={1}>
              <TextField
                label="Tên buổi học"
                fullWidth
                required
                value={formData.session_name}
                onChange={(e) => handleFieldChange('session_name', e.target.value)}
                placeholder="VD: Buổi 1 - Giới thiệu Python"
                InputProps={{
                  startAdornment: (
                    <Box display="flex" alignItems="center" mr={1}>
                      <TextField
                        type="number"
                        size="small"
                        value={sessionNumber}
                        onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
                        sx={{ width: 60 }}
                        inputProps={{ min: 1, max: 99 }}
                      />
                    </Box>
                  )
                }}
              />
            </Box>
          </Grid>
          
          {/* Description */}
          <Grid item xs={12}>
            <TextField
              label="Mô tả buổi học"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Nội dung chi tiết buổi học..."
            />
          </Grid>
          
          {/* Date and Type */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Ngày học"
              type="date"
              fullWidth
              required
              value={formData.session_date}
              onChange={(e) => handleFieldChange('session_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Loại buổi học</InputLabel>
              <Select
                value={formData.session_type}
                onChange={(e) => handleFieldChange('session_type', e.target.value)}
              >
                <MenuItem value="lecture">Lý thuyết</MenuItem>
                <MenuItem value="practice">Thực hành</MenuItem>
                <MenuItem value="exam">Kiểm tra</MenuItem>
                <MenuItem value="review">Ôn tập</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Time */}
          <Grid item xs={6}>
            <TextField
              label="Giờ bắt đầu"
              type="time"
              fullWidth
              required
              value={formData.start_time}
              onChange={(e) => handleFieldChange('start_time', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Giờ kết thúc"
              type="time"
              fullWidth
              required
              value={formData.end_time}
              onChange={(e) => handleFieldChange('end_time', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {/* Location with recent selections */}
          <Grid item xs={12}>
            <TextField
              label="Địa điểm"
              fullWidth
              value={formData.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="VD: Phòng 14-02 (Phòng máy 8)"
            />
            {recentLocations.length > 0 && (
              <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                <Typography variant="caption" sx={{ mr: 1 }}>
                  Gần đây:
                </Typography>
                {recentLocations.map(loc => (
                  <Chip
                    key={loc}
                    label={loc}
                    size="small"
                    variant="outlined"
                    onClick={() => handleQuickFillLocation(loc)}
                    icon={<LocationIcon />}
                  />
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
        
        {/* Quick tips */}
        <Box mt={2} p={1.5} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="caption" color="text.secondary">
            💡 Mẹo: Nhấn "Lưu và tiếp tục" để tạo nhiều buổi liên tiếp. Hệ thống sẽ tự động tăng số buổi và ngày học.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmitAndContinue}
          variant="outlined"
          disabled={loading}
          startIcon={<CopyIcon />}
        >
          Lưu và tiếp tục
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={<SaveIcon />}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuickCreateSession