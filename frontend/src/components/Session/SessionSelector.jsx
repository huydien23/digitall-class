import React, { useState, useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Alert
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'

const SessionSelector = ({ 
  sessions = [], 
  selectedSession, 
  onSessionChange, 
  error,
  required = true 
}) => {
  const formatSessionLabel = (session) => {
    const date = new Date(session.session_date).toLocaleDateString('vi-VN')
    return `${session.session_name} - ${date}`
  }

  const getSessionTypeColor = (type) => {
    const colors = {
      lecture: 'primary',
      lab: 'success', 
      exam: 'error',
      review: 'warning',
      seminar: 'info'
    }
    return colors[type] || 'default'
  }

  const getSessionTypeLabel = (type) => {
    const labels = {
      lecture: 'Bài giảng',
      lab: 'Thực hành',
      exam: 'Kiểm tra', 
      review: 'Ôn tập',
      seminar: 'Thảo luận'
    }
    return labels[type] || 'Khác'
  }

  const isSessionActive = (session) => {
    const today = new Date()
    const sessionDate = new Date(session.session_date)
    const daysDiff = Math.ceil((sessionDate - today) / (1000 * 60 * 60 * 24))
    
    return daysDiff >= -1 && daysDiff <= 7 // Từ hôm qua đến 7 ngày tới
  }

  const sortedSessions = sessions.sort((a, b) => {
    const dateA = new Date(a.session_date)
    const dateB = new Date(b.session_date)
    return dateB - dateA // Sắp xếp từ mới nhất
  })

  if (sessions.length === 0) {
    return (
      <Alert severity="info">
        Chưa có buổi học nào. Vui lòng tạo buổi học trước khi điểm danh.
      </Alert>
    )
  }

  return (
    <FormControl fullWidth error={!!error} required={required}>
      <InputLabel>Chọn buổi học</InputLabel>
      <Select
        value={selectedSession?.id || ''}
        onChange={(e) => {
          const session = sessions.find(s => s.id === e.target.value)
          onSessionChange(session)
        }}
        label="Chọn buổi học"
        renderValue={(value) => {
          const session = sessions.find(s => s.id === value)
          return session ? formatSessionLabel(session) : ''
        }}
      >
        {sortedSessions.map((session) => (
          <MenuItem key={session.id} value={session.id}>
            <Box sx={{ width: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {session.session_name}
                </Typography>
                <Chip
                  label={getSessionTypeLabel(session.session_type)}
                  color={getSessionTypeColor(session.session_type)}
                  size="small"
                />
              </Box>
              
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(session.session_date).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {session.start_time} - {session.end_time}
                  </Typography>
                </Box>
              </Box>

              {session.location && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {session.location}
                  </Typography>
                </Box>
              )}

              {session.description && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {session.description}
                </Typography>
              )}

              {!isSessionActive(session) && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                  ⚠️ Buổi học không trong thời gian hoạt động
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
      
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </FormControl>
  )
}

export default SessionSelector