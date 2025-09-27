import React, { useState } from 'react'
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
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Chip,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  AutoAwesome as AutoIcon
} from '@mui/icons-material'
// Remove date picker imports for now - use standard HTML5 inputs
import attendanceService from '../../services/attendanceService'

const BulkCreateSessions = ({ open, onClose, classId, onSuccess }) => {
  const [sessions, setSessions] = useState([{
    session_name: '',
    description: '',
    session_date: new Date(),
    start_time: new Date(),
    end_time: new Date(),
    location: '',
    session_type: 'lecture'
  }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoGenerate, setAutoGenerate] = useState(false)
  const [autoGenConfig, setAutoGenConfig] = useState({
    numberOfWeeks: 15,
    sessionsPerWeek: 1,
    dayOfWeek: 2, // Monday = 1, Tuesday = 2, etc.
    startDate: new Date(),
    sessionPrefix: 'Buổi',
    defaultLocation: '',
    defaultStartTime: '07:00',
    defaultEndTime: '11:00'
  })

  // Auto-generate sessions based on config
  const handleAutoGenerate = () => {
    const generatedSessions = []
    let currentDate = new Date(autoGenConfig.startDate)
    
    for (let week = 1; week <= autoGenConfig.numberOfWeeks; week++) {
      for (let session = 0; session < autoGenConfig.sessionsPerWeek; session++) {
        // Calculate the date for this session
        const sessionDate = new Date(currentDate)
        sessionDate.setDate(currentDate.getDate() + (autoGenConfig.dayOfWeek - currentDate.getDay() + 7) % 7)
        
        if (session > 0) {
          sessionDate.setDate(sessionDate.getDate() + session * 2) // Space sessions 2 days apart if multiple per week
        }

        generatedSessions.push({
          session_name: `${autoGenConfig.sessionPrefix} ${week}${session > 0 ? ` - Nhóm ${session + 1}` : ''}`,
          description: `Nội dung tuần ${week}`,
          session_date: sessionDate,
          start_time: autoGenConfig.defaultStartTime,
          end_time: autoGenConfig.defaultEndTime,
          location: autoGenConfig.defaultLocation,
          session_type: 'lecture'
        })
        
        // Move to next week after all sessions for this week
        if (session === autoGenConfig.sessionsPerWeek - 1) {
          currentDate.setDate(currentDate.getDate() + 7)
        }
      }
    }
    
    setSessions(generatedSessions)
    setAutoGenerate(false)
  }

  const handleAddSession = () => {
    setSessions([...sessions, {
      session_name: '',
      description: '',
      session_date: new Date(),
      start_time: new Date(),
      end_time: new Date(),
      location: sessions[sessions.length - 1]?.location || '',
      session_type: 'lecture'
    }])
  }

  const handleDuplicateSession = (index) => {
    const sessionToCopy = sessions[index]
    const newSession = {
      ...sessionToCopy,
      session_name: sessionToCopy.session_name + ' (Copy)',
      session_date: new Date(sessionToCopy.session_date)
    }
    newSession.session_date.setDate(newSession.session_date.getDate() + 7) // Add 1 week
    
    const newSessions = [...sessions]
    newSessions.splice(index + 1, 0, newSession)
    setSessions(newSessions)
  }

  const handleRemoveSession = (index) => {
    setSessions(sessions.filter((_, i) => i !== index))
  }

  const handleSessionChange = (index, field, value) => {
    const updatedSessions = [...sessions]
    updatedSessions[index][field] = value
    setSessions(updatedSessions)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Validate all sessions
      for (const session of sessions) {
        if (!session.session_name) {
          setError('Vui lòng nhập tên cho tất cả buổi học')
          return
        }
      }
      
      // Create all sessions
      const promises = sessions.map(session => {
        const sessionData = {
          ...session,
          class_id: classId,
          session_date: session.session_date instanceof Date ? 
            session.session_date.toISOString().split('T')[0] : 
            session.session_date,
          start_time: typeof session.start_time === 'string' ? 
            session.start_time : 
            (session.start_time instanceof Date ? session.start_time.toTimeString().slice(0, 5) : '07:00'),
          end_time: typeof session.end_time === 'string' ? 
            session.end_time : 
            (session.end_time instanceof Date ? session.end_time.toTimeString().slice(0, 5) : '11:00')
        }
        return attendanceService.createSession(sessionData)
      })
      
      const results = await Promise.allSettled(promises)
      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      if (failed > 0) {
        setError(`Đã tạo ${succeeded} buổi học. ${failed} buổi gặp lỗi.`)
      } else {
        onSuccess?.()
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tạo buổi học')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Tạo nhiều buổi học</Typography>
          <Box>
            <Button
              startIcon={<AutoIcon />}
              onClick={() => setAutoGenerate(true)}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            >
              Tạo tự động
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddSession}
              variant="contained"
              size="small"
            >
              Thêm buổi học
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {/* Auto-generate dialog */}
        <Dialog open={autoGenerate} onClose={() => setAutoGenerate(false)}>
          <DialogTitle>Tạo tự động buổi học</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  label="Số tuần học"
                  type="number"
                  fullWidth
                  value={autoGenConfig.numberOfWeeks}
                  onChange={(e) => setAutoGenConfig({
                    ...autoGenConfig,
                    numberOfWeeks: parseInt(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Số buổi/tuần"
                  type="number"
                  fullWidth
                  value={autoGenConfig.sessionsPerWeek}
                  onChange={(e) => setAutoGenConfig({
                    ...autoGenConfig,
                    sessionsPerWeek: parseInt(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Ngày trong tuần</InputLabel>
                  <Select
                    value={autoGenConfig.dayOfWeek}
                    onChange={(e) => setAutoGenConfig({
                      ...autoGenConfig,
                      dayOfWeek: e.target.value
                    })}
                  >
                    <MenuItem value={1}>Thứ 2</MenuItem>
                    <MenuItem value={2}>Thứ 3</MenuItem>
                    <MenuItem value={3}>Thứ 4</MenuItem>
                    <MenuItem value={4}>Thứ 5</MenuItem>
                    <MenuItem value={5}>Thứ 6</MenuItem>
                    <MenuItem value={6}>Thứ 7</MenuItem>
                    <MenuItem value={0}>Chủ nhật</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Tiền tố tên buổi"
                  fullWidth
                  value={autoGenConfig.sessionPrefix}
                  onChange={(e) => setAutoGenConfig({
                    ...autoGenConfig,
                    sessionPrefix: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Địa điểm mặc định"
                  fullWidth
                  value={autoGenConfig.defaultLocation}
                  onChange={(e) => setAutoGenConfig({
                    ...autoGenConfig,
                    defaultLocation: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Giờ bắt đầu"
                  type="time"
                  fullWidth
                  value={autoGenConfig.defaultStartTime}
                  onChange={(e) => setAutoGenConfig({
                    ...autoGenConfig,
                    defaultStartTime: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Giờ kết thúc"
                  type="time"
                  fullWidth
                  value={autoGenConfig.defaultEndTime}
                  onChange={(e) => setAutoGenConfig({
                    ...autoGenConfig,
                    defaultEndTime: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAutoGenerate(false)}>Hủy</Button>
            <Button onClick={handleAutoGenerate} variant="contained">
              Tạo {autoGenConfig.numberOfWeeks * autoGenConfig.sessionsPerWeek} buổi học
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Sessions list */}
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {sessions.map((session, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Chip label={`Buổi ${index + 1}`} color="primary" size="small" />
                <Box>
                  <Tooltip title="Nhân đôi buổi học">
                    <IconButton size="small" onClick={() => handleDuplicateSession(index)}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa buổi học">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleRemoveSession(index)}
                      disabled={sessions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Tên buổi học"
                    fullWidth
                    required
                    value={session.session_name}
                    onChange={(e) => handleSessionChange(index, 'session_name', e.target.value)}
                    placeholder="VD: Buổi 1 - Giới thiệu môn học"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Loại buổi học</InputLabel>
                    <Select
                      value={session.session_type}
                      onChange={(e) => handleSessionChange(index, 'session_type', e.target.value)}
                    >
                      <MenuItem value="lecture">Lý thuyết</MenuItem>
                      <MenuItem value="practice">Thực hành</MenuItem>
                      <MenuItem value="exam">Kiểm tra</MenuItem>
                      <MenuItem value="review">Ôn tập</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Mô tả"
                    fullWidth
                    multiline
                    rows={2}
                    value={session.description}
                    onChange={(e) => handleSessionChange(index, 'description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Ngày học"
                    type="date"
                    fullWidth
                    value={session.session_date instanceof Date ? 
                      session.session_date.toISOString().split('T')[0] : 
                      session.session_date}
                    onChange={(e) => handleSessionChange(index, 'session_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    label="Giờ bắt đầu"
                    type="time"
                    fullWidth
                    value={typeof session.start_time === 'string' ? session.start_time : '07:00'}
                    onChange={(e) => handleSessionChange(index, 'start_time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField
                    label="Giờ kết thúc"
                    type="time"
                    fullWidth
                    value={typeof session.end_time === 'string' ? session.end_time : '11:00'}
                    onChange={(e) => handleSessionChange(index, 'end_time', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Địa điểm"
                    fullWidth
                    value={session.location}
                    onChange={(e) => handleSessionChange(index, 'location', e.target.value)}
                    placeholder="VD: Phòng 14-02"
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || sessions.length === 0}
        >
          Tạo {sessions.length} buổi học
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BulkCreateSessions