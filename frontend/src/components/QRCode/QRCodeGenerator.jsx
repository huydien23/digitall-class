import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  IconButton,
  Paper,
  Divider,
  LinearProgress,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material'
import {
  QrCode2,
  Close,
  Download,
  Share,
  Print,
  Refresh,
  Timer,
} from '@mui/icons-material'
import QRCode from 'react-qr-code'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../Notification/NotificationProvider'
import attendanceService from '../../services/attendanceService'

const QRCodeGenerator = ({
  open,
  onClose,
  sessionData,
  onSessionUpdate,
  title = "QR Code Điểm Danh"
}) => {
  const [qrCodeData, setQrCodeData] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    totalStudents: 0,
    presentCount: 0,
    attendanceRecords: []
  })
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(null)
  
  const qrRef = useRef(null)
  const refreshInterval = useRef(null)
  const timerInterval = useRef(null)
  const { showSuccess, showError, showInfo } = useNotification()

  // Generate QR code when dialog opens
  useEffect(() => {
    if (open && sessionData) {
      generateQRCode()
      startRealTimeUpdates()
      startTimer()
    }
    return () => {
      stopRealTimeUpdates()
      stopTimer()
    }
  }, [open, sessionData])

  // Auto refresh QR code every 5 minutes for security
  useEffect(() => {
    if (autoRefresh && open && sessionData) {
      const interval = setInterval(() => {
        generateQRCode()
      }, 5 * 60 * 1000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh, open, sessionData])

  const generateQRCode = async () => {
    if (!sessionData?.id) return
    
    setIsGenerating(true)
    try {
      const qrData = attendanceService.generateQRCodeData(sessionData.id)
      setQrCodeData(qrData)
      
      // Update session with new QR code
      if (onSessionUpdate) {
        onSessionUpdate({
          ...sessionData,
          qr_code_data: qrData,
          last_qr_update: new Date().toISOString()
        })
      }
      
      showInfo('QR Code đã được làm mới')
    } catch (error) {
      console.error('QR Generation error:', error)
      showError('Không thể tạo QR Code')
    } finally {
      setIsGenerating(false)
    }
  }

  const startRealTimeUpdates = () => {
    if (!sessionData?.id) return
    
    // Subscribe to real-time attendance updates
    const unsubscribe = attendanceService.subscribeToAttendanceUpdates(
      sessionData.id,
      (payload) => {
        console.log('Real-time attendance update:', payload)
        loadSessionStats()
      }
    )

    // Initial load
    loadSessionStats()
    
    // Set up periodic refresh
    refreshInterval.current = setInterval(loadSessionStats, 30000) // 30 seconds
    
    return unsubscribe
  }

  const stopRealTimeUpdates = () => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current)
      refreshInterval.current = null
    }
  }

  const startTimer = () => {
    if (!sessionData?.end_time) return
    
    const updateTimer = () => {
      const now = new Date()
      const endTime = new Date(`${sessionData.session_date}T${sessionData.end_time}`)
      const diff = endTime - now
      
      if (diff > 0) {
        setTimeRemaining(diff)
      } else {
        setTimeRemaining(0)
        stopTimer()
      }
    }
    
    updateTimer()
    timerInterval.current = setInterval(updateTimer, 1000)
  }

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current)
      timerInterval.current = null
    }
  }

  const loadSessionStats = async () => {
    if (!sessionData?.id) return
    
    try {
      const records = await attendanceService.getAttendanceRecords(sessionData.id)
      setSessionStats({
        totalStudents: sessionData.total_students || 0,
        presentCount: records.length,
        attendanceRecords: records
      })
    } catch (error) {
      console.error('Load stats error:', error)
    }
  }

  const handleDownloadQR = () => {
    if (!qrRef.current) return
    
    try {
      const svg = qrRef.current.querySelector('svg')
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const link = document.createElement('a')
        link.download = `qr-code-${sessionData.subject || 'attendance'}-${Date.now()}.png`
        link.href = canvas.toDataURL()
        link.click()
        
        showSuccess('QR Code đã được tải xuống')
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    } catch (error) {
      console.error('Download error:', error)
      showError('Không thể tải xuống QR Code')
    }
  }

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank')
    const qrElement = qrRef.current
    
    if (qrElement && printWindow) {
      const qrHtml = qrElement.outerHTML
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code Điểm Danh - ${sessionData.subject}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container { margin: 20px 0; }
              .session-info { margin: 20px 0; }
              .footer { margin-top: 40px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>QR Code Điểm Danh</h1>
            <div class="session-info">
              <h2>${sessionData.subject}</h2>
              <p>Lớp: ${sessionData.class_name || 'N/A'}</p>
              <p>Ngày: ${new Date(sessionData.session_date).toLocaleDateString('vi-VN')}</p>
              <p>Thời gian: ${sessionData.start_time} - ${sessionData.end_time}</p>
            </div>
            <div class="qr-container">
              ${qrHtml}
            </div>
            <div class="footer">
              <p>Sinh viên vui lòng quét QR code này để điểm danh</p>
              <p>Được tạo lúc: ${new Date().toLocaleString('vi-VN')}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      
      showSuccess('Đang in QR Code...')
    }
  }

  const handleShareQR = async () => {
    if (navigator.share && qrCodeData) {
      try {
        await navigator.share({
          title: `QR Code Điểm Danh - ${sessionData.subject}`,
          text: `Quét QR code này để điểm danh cho môn ${sessionData.subject}`,
          url: window.location.href
        })
        showSuccess('Đã chia sẻ QR Code')
      } catch (error) {
        // Fallback to copy to clipboard
        handleCopyQR()
      }
    } else {
      handleCopyQR()
    }
  }

  const handleCopyQR = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData)
      showSuccess('Đã sao chép mã QR vào clipboard')
    } catch (error) {
      showError('Không thể sao chép mã QR')
    }
  }

  const formatTimeRemaining = (ms) => {
    if (!ms || ms <= 0) return 'Đã kết thúc'
    
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getAttendanceProgress = () => {
    if (sessionStats.totalStudents === 0) return 0
    return (sessionStats.presentCount / sessionStats.totalStudents) * 100
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <QrCode2 color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
              {sessionData && (
                <Typography variant="body2" color="text.secondary">
                  {sessionData.subject} • {sessionData.class_name}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {/* QR Code Display */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  QR Code Điểm Danh
                </Typography>
                
                {isGenerating ? (
                  <Box sx={{ p: 4 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tạo QR Code...
                    </Typography>
                  </Box>
                ) : qrCodeData ? (
                  <motion.div
                    ref={qrRef}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        border: '2px solid', 
                        borderColor: 'divider',
                        borderRadius: 2,
                        display: 'inline-block',
                        mb: 2
                      }}
                    >
                      <QRCode
                        value={qrCodeData}
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox="0 0 256 256"
                      />
                    </Paper>
                  </motion.div>
                ) : (
                  <Alert severity="warning">
                    Không thể tạo QR Code
                  </Alert>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                  <Tooltip title="Tải xuống">
                    <IconButton 
                      onClick={handleDownloadQR}
                      disabled={!qrCodeData}
                      color="primary"
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="In QR Code">
                    <IconButton 
                      onClick={handlePrintQR}
                      disabled={!qrCodeData}
                      color="primary"
                    >
                      <Print />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chia sẻ">
                    <IconButton 
                      onClick={handleShareQR}
                      disabled={!qrCodeData}
                      color="primary"
                    >
                      <Share />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Làm mới QR Code">
                    <IconButton 
                      onClick={generateQRCode}
                      disabled={isGenerating}
                      color="primary"
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Auto refresh toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Tự động làm mới (5 phút)"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Session Info & Stats */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Session Details */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thông tin phiên điểm danh
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Môn học
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {sessionData?.subject || 'N/A'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Thời gian
                      </Typography>
                      <Typography variant="body1">
                        {sessionData?.start_time} - {sessionData?.end_time}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Ngày học
                      </Typography>
                      <Typography variant="body1">
                        {sessionData?.session_date && 
                          new Date(sessionData.session_date).toLocaleDateString('vi-VN')
                        }
                      </Typography>
                    </Box>
                    {timeRemaining !== null && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Thời gian còn lại
                        </Typography>
                        <Chip
                          icon={<Timer />}
                          label={formatTimeRemaining(timeRemaining)}
                          color={timeRemaining > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Attendance Stats */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê điểm danh
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tỷ lệ tham dự
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {sessionStats.presentCount}/{sessionStats.totalStudents} 
                        ({Math.round(getAttendanceProgress())}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getAttendanceProgress()}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Chip
                      label={`${sessionStats.presentCount} Có mặt`}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`${sessionStats.totalStudents - sessionStats.presentCount} Vắng mặt`}
                      color="error"
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Recent Attendance */}
              {sessionStats.attendanceRecords.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Điểm danh gần đây
                    </Typography>
                    <Stack spacing={1} sx={{ maxHeight: '200px', overflow: 'auto' }}>
                      {sessionStats.attendanceRecords
                        .slice(-5) // Show last 5 records
                        .reverse()
                        .map((record, index) => (
                          <Box 
                            key={record.id}
                            sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 1,
                              px: 2,
                              bgcolor: 'grey.50',
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="body2" fontWeight={600}>
                              {record.user_profiles?.full_name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(record.marked_at).toLocaleTimeString('vi-VN')}
                            </Typography>
                          </Box>
                        ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
        <Button 
          onClick={generateQRCode}
          variant="contained"
          disabled={isGenerating}
          startIcon={<Refresh />}
        >
          Làm mới QR Code
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QRCodeGenerator
