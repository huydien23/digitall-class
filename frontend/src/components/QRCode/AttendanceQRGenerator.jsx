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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  TextField
} from '@mui/material'
import {
  QrCode2,
  Close,
  Download,
  Share,
  Print,
  Refresh,
  Timer,
  CheckCircle,
  Person,
  Schedule,
  LocationOn,
  ContentCopy,
  WhatsApp,
  Email
} from '@mui/icons-material'
import QRCode from 'qrcode'
import { motion, AnimatePresence } from 'framer-motion'
import SessionSelector from '../Session/SessionSelector'
import attendanceService from '../../services/attendanceService'

const AttendanceQRGenerator = ({
  open,
  onClose,
  classData,
  availableSessions = [],
  onSessionUpdate,
  title = "QR Code Điểm Danh",
  initialSessionId = null,
  refreshIntervalMs = 5 * 60 * 1000 // 5 phút
}) => {
  const [selectedSession, setSelectedSession] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [attendanceUrl, setAttendanceUrl] = useState('')
  const [attendanceCode, setAttendanceCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    totalStudents: 0,
    presentCount: 0,
    attendanceRecords: []
  })
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false)
  
  const qrRef = useRef(null)
  const timerInterval = useRef(null)

// Auto select session when dialog opens
useEffect(() => {
  if (!open || availableSessions.length === 0) return
  // Ưu tiên chọn theo initialSessionId nếu có
  if (initialSessionId) {
    const found = availableSessions.find(s => String(s.id) === String(initialSessionId))
    if (found && (!selectedSession || String(selectedSession.id) !== String(found.id))) {
      setSelectedSession(found)
      return
    }
  }
  // Nếu chưa có session được chọn, chọn phiên mới nhất
  if (!selectedSession) {
    const latestSession = [...availableSessions].sort((a, b) => 
      new Date(b.session_date) - new Date(a.session_date)
    )[0]
    setSelectedSession(latestSession)
  }
}, [open, availableSessions, initialSessionId])

  // Generate QR code when session is selected
  useEffect(() => {
    if (open && selectedSession) {
      generateQRCode()
      startTimer()
      // Không mô phỏng dữ liệu điểm danh để tránh hiển thị dữ liệu cũ
      setSessionStats(prev => ({ ...prev, attendanceRecords: [], presentCount: 0 }))
    }
    return () => {
      stopTimer()
    }
  }, [open, selectedSession])

  // Auto refresh QR code every refreshIntervalMs while dialog is open
  useEffect(() => {
    if (!(open && selectedSession && refreshIntervalMs > 0)) return
    const id = setInterval(() => {
      generateQRCode()
    }, refreshIntervalMs)
    return () => clearInterval(id)
  }, [open, selectedSession, refreshIntervalMs])

  const generateQRCode = async () => {
    if (!selectedSession) return

    setIsGenerating(true)
    try {
      // Gọi API backend để sinh mã QR hợp lệ và lưu vào DB
      const res = await attendanceService.generateQRCode(selectedSession.id)
      const data = res?.data || res
      const qrCode = data.qr_code // chuỗi để check-in
      const qrImage = data.qr_image // base64 PNG

      // Link điểm danh để chia sẻ/nhập mã (sinh viên có thể dán link hoặc mã thuần)
      const baseUrl = window.location.origin
      const link = `${baseUrl}/checkin?qr_code=${encodeURIComponent(qrCode)}`
      setAttendanceUrl(link)
      setAttendanceCode(qrCode)

      // Hiển thị ảnh QR do backend trả về (đảm bảo khớp với mã qr_code ở DB)
      setQrCodeUrl(qrImage)

      // Callback cập nhật session nếu cần
      if (onSessionUpdate) {
        onSessionUpdate({
          ...selectedSession,
          qr_code: qrCode,
          last_qr_update: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('QR Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // No local token generation; rely on backend generate-qr API
  const generateAttendanceToken = () => ''

  const startTimer = () => {
    if (!selectedSession) return
    
    const updateTimer = () => {
      const now = new Date()
      let endTime
      if (selectedSession?.session_date && selectedSession?.end_time) {
        endTime = new Date(`${selectedSession.session_date}T${selectedSession.end_time}`)
      } else {
        // fallback 2 giờ nếu thiếu dữ liệu
        endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      }
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

  const simulateAttendanceData = () => {
    // Giả lập dữ liệu điểm danh real-time
    const studentNames = [
      'Nguyễn Văn An',
      'Trần Thị Bình', 
      'Lê Hoàng Cường',
      'Phạm Minh Đức',
      'Hoàng Thị Lan',
      'Võ Thanh Nam',
      'Bùi Ngọc Quý',
      'Đặng Hương Giang'
    ]

    const records = studentNames.slice(0, sessionStats.presentCount).map((name, index) => ({
      id: index + 1,
      student_name: name,
      student_id: `DH22${(index + 1).toString().padStart(4, '0')}`,
      check_in_time: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toLocaleTimeString(),
      status: 'present'
    }))

    setSessionStats(prev => ({
      ...prev,
      attendanceRecords: records
    }))
  }

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '00:00:00'
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(attendanceUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleCopyCode = async () => {
    try {
      if (!attendanceCode) return
      await navigator.clipboard.writeText(attendanceCode)
      setCopyCodeSuccess(true)
      setTimeout(() => setCopyCodeSuccess(false), 2000)
    } catch (error) {
      console.error('Copy code failed:', error)
    }
  }

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    const subject = classData?.subject || classData?.class_name || 'attendance'
    link.download = `qr-diem-danh-${subject}-${Date.now()}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const handlePrintQR = () => {
    if (!qrCodeUrl) return
    
    const printWindow = window.open('', '_blank')
    const subject = classData?.subject || classData?.class_name || 'Lớp học'
    const classId = classData?.class_id || selectedSession?.class_id || ''
    const startT = selectedSession?.start_time || '07:00'
    const endT = selectedSession?.end_time || '11:00'
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code Điểm Danh - ${subject}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
              margin: 0;
            }
            .header { 
              margin-bottom: 30px; 
              border-bottom: 2px solid #1976d2;
              padding-bottom: 20px;
            }
            .qr-container { 
              margin: 30px 0; 
              display: flex;
              justify-content: center;
            }
            .footer { 
              margin-top: 30px; 
              font-size: 14px; 
              color: #666; 
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .info { 
              background: #f5f5f5; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0; 
            }
            h1 { color: #1976d2; margin: 0; }
            h2 { color: #333; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎓 EduAttend</h1>
            <h2>QR Code Điểm Danh</h2>
          </div>
          
          <div class="info">
            <h3>${subject}</h3>
            <p><strong>Lớp:</strong> ${classId}</p>
            <p><strong>Ngày:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            <p><strong>Giờ học:</strong> ${startT} - ${endT}</p>
          </div>
          
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 300px; height: 300px;" />
          </div>
          
          <div class="footer">
            <p><strong>Hướng dẫn:</strong></p>
            <p>1. Mở ứng dụng camera hoặc quét QR</p>
            <p>2. Quét mã QR trên</p>
            <p>3. Nhập MSSV để điểm danh</p>
            <p>4. Xác nhận thông tin</p>
            <br>
            <p style="font-size: 12px; color: #999;">
              Tạo lúc: ${new Date().toLocaleString('vi-VN')} | EduAttend System
            </p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleShareWhatsApp = () => {
    const subject = classData?.class_name || classData?.subject || 'Lớp học'
    const message = `📚 Điểm danh lớp học: ${subject}\n\n🕐 Thời gian: ${new Date().toLocaleString('vi-VN')}\n\n📱 Quét QR Code hoặc truy cập link:\n${attendanceUrl}\n\n👨‍🏫 Hệ thống EduAttend`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const attendanceRate = sessionStats.totalStudents > 0 ? 
    Math.round((sessionStats.presentCount / sessionStats.totalStudents) * 100) : 0

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <QrCode2 color="primary" />
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {timeRemaining !== null && (
              <Chip
                icon={<Timer />}
                label={`Còn lại: ${formatTime(timeRemaining)}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Session Selector */}
        <Box sx={{ mb: 3 }}>
          <SessionSelector
            sessions={availableSessions}
            selectedSession={selectedSession}
            onSessionChange={setSelectedSession}
            required={true}
          />
        </Box>

        {/* Session Info */}
        {selectedSession && (
          <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" color="primary" gutterBottom>
                  {selectedSession?.session_name || 'Buổi học'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {classData?.class_name || 'Lập trình Python - DH22TIN06'}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Schedule fontSize="small" />
                    <Typography variant="body2">
                      {selectedSession?.start_time || '07:00'} - {selectedSession?.end_time || '11:00'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">
                      {selectedSession?.location || 'Phòng 14-02'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {sessionStats.presentCount}/{sessionStats.totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đã điểm danh ({attendanceRate}%)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        )}

        <Grid container spacing={3}>
          {/* QR Code */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Quét QR để điểm danh
              </Typography>
              
              {isGenerating ? (
                <Box py={4}>
                  <CircularProgress size={60} />
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Đang tạo QR Code...
                  </Typography>
                </Box>
              ) : qrCodeUrl ? (
                <Box ref={qrRef}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'white',
                        border: '2px solid #e0e0e0',
                        borderRadius: 2,
                        display: 'inline-block',
                        mb: 2
                      }}
                    >
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code Điểm danh" 
                        style={{ display: 'block', width: '250px', height: '250px' }}
                      />
                    </Box>
                  </motion.div>
                </Box>
              ) : (
                <Alert severity="error">Không thể tạo QR Code</Alert>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
                <Tooltip title="Làm mới QR">
                  <IconButton onClick={generateQRCode} disabled={isGenerating}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Tải xuống">
                  <IconButton onClick={handleDownloadQR}>
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="In QR">
                  <IconButton onClick={handlePrintQR}>
                    <Print />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Chia sẻ WhatsApp">
                  <IconButton onClick={handleShareWhatsApp}>
                    <WhatsApp />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Inline code + link right below the QR for immediate visibility */}
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Mã điểm danh
                </Typography>
                <Box display="flex" gap={1} alignItems="center" sx={{ mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={attendanceCode}
                    InputProps={{ readOnly: true }}
                  />
                  <Tooltip title={copyCodeSuccess ? "Đã copy!" : "Copy mã"}>
                    <IconButton onClick={handleCopyCode} color={copyCodeSuccess ? 'success' : 'default'} size="small">
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Link điểm danh
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    fullWidth
                    size="small"
                    value={attendanceUrl}
                    InputProps={{ readOnly: true }}
                  />
                  <Tooltip title={copySuccess ? "Đã copy!" : "Copy link"}>
                    <IconButton onClick={handleCopyUrl} color={copySuccess ? 'success' : 'default'} size="small">
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Live Attendance */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Điểm danh trực tiếp
                </Typography>
                <Chip 
                  icon={<CheckCircle />}
                  label={`${sessionStats.presentCount} sinh viên`}
                  color="success"
                  size="small"
                />
              </Box>

              {sessionStats.attendanceRecords.length > 0 ? (
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <AnimatePresence>
                    {sessionStats.attendanceRecords.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={record.student_name}
                            secondary={`${record.student_id} • ${record.check_in_time}`}
                          />
                        </ListItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có sinh viên nào điểm danh
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    QR Code sẽ tự động cập nhật khi có người điểm danh
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Instructions */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Hướng dẫn sử dụng:</strong>
            <br />• Sinh viên quét QR Code bằng camera điện thoại
            <br />• Nhập MSSV và xác nhận thông tin
            <br />• Hệ thống sẽ ghi nhận điểm danh tự động
            <br />• QR Code tự động làm mới mỗi 5 phút để bảo mật
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Đóng
        </Button>
        <Button 
          variant="contained" 
          startIcon={<Share />}
          onClick={handleShareWhatsApp}
        >
          Chia sẻ
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AttendanceQRGenerator