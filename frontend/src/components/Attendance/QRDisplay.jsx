import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material'
import {
  QrCode2,
  Refresh,
  Close,
  Timer,
  ContentCopy,
  CheckCircle,
  School,
  CalendarToday,
  AccessTime,
  Groups
} from '@mui/icons-material'
import QRCode from 'qrcode'
import { motion } from 'framer-motion'

const QRDisplay = ({ 
  sessionData, 
  open, 
  onClose,
  onRefresh 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    percentage: 0
  })

  // Generate QR code when dialog opens
  useEffect(() => {
    if (open && sessionData) {
      generateQRCode()
      loadAttendanceStats()
    }
  }, [open, sessionData])

  // Auto-refresh QR code every 5 minutes for security
  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        generateQRCode()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [open])

  const generateQRCode = async () => {
    if (!sessionData) return

    setLoading(true)
    try {
      // Generate QR data with session info
      const qrData = JSON.stringify({
        sessionId: sessionData.id,
        classId: sessionData.class_id,
        className: sessionData.class_name || sessionData.subject,
        teacher: sessionData.teacher_name,
        timestamp: new Date().toISOString(),
        token: sessionData.qr_token || Math.random().toString(36).substr(2, 9),
        validUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString() // Valid for 15 minutes
      })

      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1976d2',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H'
      })
      
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAttendanceStats = () => {
    // Mock stats - replace with actual API call
    setAttendanceStats({
      total: sessionData?.max_students || 45,
      present: sessionData?.attendance_count || 12,
      percentage: Math.round(((sessionData?.attendance_count || 12) / (sessionData?.max_students || 45)) * 100)
    })
  }

  const handleCopyCode = () => {
    if (sessionData?.qr_token) {
      navigator.clipboard.writeText(sessionData.qr_token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = () => {
    generateQRCode()
    if (onRefresh) {
      onRefresh()
    }
  }

  if (!sessionData) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <QrCode2 sx={{ fontSize: 28, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Mã QR Điểm danh
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sessionData.subject || sessionData.class_name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* QR Code Section */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3,
                textAlign: 'center',
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: '2px solid',
                borderColor: 'primary.main'
              }}
            >
              {loading ? (
                <Box sx={{ py: 8 }}>
                  <CircularProgress size={60} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Đang tạo mã QR...
                  </Typography>
                </Box>
              ) : qrCodeUrl ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'white',
                      display: 'inline-block',
                      borderRadius: 2,
                      boxShadow: 2
                    }}
                  >
                    <img
                      src={qrCodeUrl}
                      alt="QR Code điểm danh"
                      style={{
                        width: 300,
                        height: 300,
                        display: 'block'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h5" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                    Quét mã để điểm danh
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Mã QR có hiệu lực trong 15 phút
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Refresh />}
                      onClick={handleRefresh}
                    >
                      Làm mới
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                      onClick={handleCopyCode}
                      color={copied ? 'success' : 'primary'}
                    >
                      {copied ? 'Đã sao chép' : 'Sao chép mã'}
                    </Button>
                  </Box>
                </motion.div>
              ) : (
                <Box sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    Không thể tạo mã QR
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={generateQRCode}
                    sx={{ mt: 2 }}
                  >
                    Thử lại
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Info Section */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Session Info */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Thông tin buổi học
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <School sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Lớp học
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {sessionData.class_name || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ngày học
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(sessionData.session_date || sessionData.date).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Thời gian
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {sessionData.start_time} - {sessionData.end_time}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              {/* Attendance Stats */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Thống kê điểm danh
                </Typography>
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ my: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Tiến độ điểm danh
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {attendanceStats.present}/{attendanceStats.total}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        overflow: 'hidden'
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${attendanceStats.percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                          borderRadius: 4
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="h4" 
                      fontWeight={700} 
                      color="success.main"
                      sx={{ mt: 2, textAlign: 'center' }}
                    >
                      {attendanceStats.percentage}%
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="center">
                  <Chip
                    icon={<Groups />}
                    label={`${attendanceStats.present} đã điểm danh`}
                    color="success"
                    size="small"
                  />
                  <Chip
                    icon={<Timer />}
                    label="Đang diễn ra"
                    color="primary"
                    size="small"
                  />
                </Stack>
              </Paper>

              {/* Instructions */}
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Hướng dẫn cho sinh viên:
                </Typography>
                <Typography variant="body2">
                  1. Mở ứng dụng và chọn "Điểm danh QR"<br />
                  2. Quét mã QR này bằng camera<br />
                  3. Hệ thống sẽ tự động xác nhận điểm danh
                </Typography>
              </Alert>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} size="large">
          Đóng
        </Button>
        <Button
          variant="contained"
          onClick={handleRefresh}
          startIcon={<Refresh />}
          size="large"
        >
          Làm mới mã QR
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QRDisplay