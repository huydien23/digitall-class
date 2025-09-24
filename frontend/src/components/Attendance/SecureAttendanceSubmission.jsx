import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material'
import {
  Security as SecurityIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Devices as DevicesIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Fingerprint as FingerprintIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import attendanceSecurityService from '../../services/attendanceSecurityService'

const SecureAttendanceSubmission = ({ 
  sessionData, 
  studentData,
  onAttendanceSubmit,
  onClose 
}) => {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [location, setLocation] = useState(null)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [securityChecks, setSecurityChecks] = useState({
    enrollment: { status: 'pending', message: '' },
    timeWindow: { status: 'pending', message: '' },
    location: { status: 'pending', message: '' },
    device: { status: 'pending', message: '' },
    rateLimit: { status: 'pending', message: '' },
    duplicate: { status: 'pending', message: '' }
  })

  const locationWatchId = useRef(null)

  const steps = [
    'Xác thực thông tin',
    'Kiểm tra vị trí',
    'Kiểm tra bảo mật',
    'Xác nhận điểm danh'
  ]

  useEffect(() => {
    if (step === 0) {
      initializeSecurityChecks()
    }
  }, [step])

  useEffect(() => {
    return () => {
      // Cleanup location watching
      if (locationWatchId.current) {
        navigator.geolocation.clearWatch(locationWatchId.current)
      }
    }
  }, [])

  /**
   * Khởi tạo các kiểm tra bảo mật
   */
  const initializeSecurityChecks = async () => {
    setLoading(true)

    // 1. Thu thập thông tin thiết bị
    const deviceData = await collectDeviceInfo()
    setDeviceInfo(deviceData)

    // 2. Lấy vị trí hiện tại
    getCurrentLocation()

    // 3. Bắt đầu kiểm tra bảo mật
    await performSecurityChecks(deviceData)
  }

  /**
   * Thu thập thông tin thiết bị
   */
  const collectDeviceInfo = async () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.fillText('Device fingerprint', 2, 2)

    const deviceData = {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      canvas: canvas.toDataURL(),
      timestamp: Date.now(),
      ip: await getPublicIP()
    }

    return deviceData
  }

  /**
   * Lấy IP công khai (thông qua service)
   */
  const getPublicIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error getting IP:', error)
      return 'unknown'
    }
  }

  /**
   * Lấy vị trí hiện tại
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      updateSecurityCheck('location', 'error', 'Trình duyệt không hỗ trợ định vị')
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    }

    updateSecurityCheck('location', 'loading', 'Đang xác định vị trí...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }
        setLocation(locationData)
        updateSecurityCheck('location', 'success', `Vị trí: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)} (±${Math.round(locationData.accuracy)}m)`)
      },
      (error) => {
        let message = 'Không thể xác định vị trí'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Bạn đã từ chối quyền truy cập vị trí'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Thông tin vị trí không khả dụng'
            break
          case error.TIMEOUT:
            message = 'Hết thời gian chờ khi xác định vị trí'
            break
        }
        updateSecurityCheck('location', 'error', message)
      },
      options
    )
  }

  /**
   * Thực hiện các kiểm tra bảo mật
   */
  const performSecurityChecks = async (deviceData) => {
    const attendanceData = {
      studentId: studentData.id,
      sessionId: sessionData.id,
      classId: sessionData.class_id,
      location: location,
      deviceInfo: deviceData,
      timestamp: new Date().toISOString()
    }

    try {
      // Kiểm tra từng bước
      updateSecurityCheck('enrollment', 'loading', 'Kiểm tra đăng ký lớp...')
      const enrollmentCheck = await attendanceSecurityService.checkStudentEnrollment(
        studentData.id, 
        sessionData.class_id
      )
      updateSecurityCheck('enrollment', 
        enrollmentCheck ? 'success' : 'error', 
        enrollmentCheck ? 'Sinh viên hợp lệ' : 'Sinh viên không có trong lớp'
      )

      updateSecurityCheck('timeWindow', 'loading', 'Kiểm tra thời gian...')
      const timeCheck = attendanceSecurityService.validateTimeWindow(
        sessionData.id, 
        new Date().toISOString()
      )
      updateSecurityCheck('timeWindow', 
        timeCheck.isValid ? 'success' : 'warning', 
        timeCheck.isValid ? 'Thời gian hợp lệ' : timeCheck.reason
      )

      updateSecurityCheck('device', 'loading', 'Kiểm tra thiết bị...')
      const deviceCheck = attendanceSecurityService.validateDeviceFingerprint(
        studentData.id, 
        deviceData
      )
      updateSecurityCheck('device', 
        deviceCheck.isValid ? 'success' : 'warning', 
        deviceCheck.isValid ? 'Thiết bị được xác nhận' : deviceCheck.reason
      )

      updateSecurityCheck('rateLimit', 'loading', 'Kiểm tra tần suất...')
      const rateCheck = attendanceSecurityService.checkRateLimit(
        deviceData.ip, 
        sessionData.id
      )
      updateSecurityCheck('rateLimit', 
        rateCheck.isValid ? 'success' : 'error', 
        rateCheck.isValid ? 'Tần suất hợp lệ' : rateCheck.reason
      )

      updateSecurityCheck('duplicate', 'loading', 'Kiểm tra trùng lặp...')
      const duplicateCheck = await attendanceSecurityService.checkDuplicateAttendance(
        studentData.id, 
        sessionData.id
      )
      updateSecurityCheck('duplicate', 
        duplicateCheck.isValid ? 'success' : 'error', 
        duplicateCheck.isValid ? 'Chưa điểm danh' : duplicateCheck.reason
      )

      // Chờ location được lấy xong nếu chưa có
      let finalLocation = location
      if (!finalLocation) {
        await new Promise((resolve) => {
          const checkLocation = () => {
            if (location || securityChecks.location.status === 'error') {
              finalLocation = location
              resolve()
            } else {
              setTimeout(checkLocation, 500)
            }
          }
          checkLocation()
        })
      }

      // Kiểm tra vị trí cuối cùng
      if (finalLocation) {
        const locationCheck = await attendanceSecurityService.validateLocation(
          finalLocation, 
          sessionData.class_id
        )
        updateSecurityCheck('location', 
          locationCheck.isValid ? 'success' : 'warning', 
          locationCheck.isValid ? `Trong phạm vi cho phép (${locationCheck.distance}m)` : locationCheck.reason
        )
      }

      // Tính tổng kết quả
      const finalAttendanceData = {
        ...attendanceData,
        location: finalLocation
      }

      const validation = await attendanceSecurityService.validateAttendanceAttempt(finalAttendanceData)
      setValidationResult(validation)

    } catch (error) {
      console.error('Security check failed:', error)
      updateSecurityCheck('enrollment', 'error', 'Lỗi khi kiểm tra bảo mật')
    }

    setLoading(false)
    setStep(1)
  }

  /**
   * Cập nhật trạng thái kiểm tra bảo mật
   */
  const updateSecurityCheck = (checkType, status, message) => {
    setSecurityChecks(prev => ({
      ...prev,
      [checkType]: { status, message }
    }))
  }

  /**
   * Tiến hành bước tiếp theo
   */
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    }
  }

  /**
   * Quay lại bước trước
   */
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  /**
   * Xác nhận điểm danh cuối cùng
   */
  const handleSubmitAttendance = async () => {
    if (!validationResult?.isValid) {
      return
    }

    setLoading(true)
    try {
      await onAttendanceSubmit({
        studentId: studentData.id,
        sessionId: sessionData.id,
        location: location,
        deviceInfo: deviceInfo,
        validationResult: validationResult
      })
    } catch (error) {
      console.error('Failed to submit attendance:', error)
    }
    setLoading(false)
  }

  /**
   * Render icon trạng thái
   */
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />
      case 'warning':
        return <WarningIcon color="warning" />
      case 'error':
        return <CancelIcon color="error" />
      case 'loading':
        return <CircularProgress size={20} />
      default:
        return <CircularProgress size={20} />
    }
  }

  /**
   * Render màu chip theo trạng thái
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  return (
    <Dialog 
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon color="primary" />
          Điểm danh bảo mật
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Student Info */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <PersonIcon color="primary" />
            </Grid>
            <Grid item xs>
              <Typography variant="h6">{studentData.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                MSSV: {studentData.student_id} | Lớp: {sessionData.subject}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Security Checks */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              Kiểm tra bảo mật
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon>
                  {renderStatusIcon(securityChecks.enrollment.status)}
                </ListItemIcon>
                <ListItemText
                  primary="Xác thực đăng ký lớp"
                  secondary={securityChecks.enrollment.message}
                />
                <Chip 
                  label={securityChecks.enrollment.status === 'success' ? 'Hợp lệ' : 
                        securityChecks.enrollment.status === 'error' ? 'Lỗi' : 'Đang kiểm tra'}
                  size="small"
                  color={getStatusColor(securityChecks.enrollment.status)}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  {renderStatusIcon(securityChecks.timeWindow.status)}
                </ListItemIcon>
                <ListItemText
                  primary="Kiểm tra thời gian"
                  secondary={securityChecks.timeWindow.message}
                />
                <Chip 
                  label={securityChecks.timeWindow.status === 'success' ? 'Đúng giờ' : 
                        securityChecks.timeWindow.status === 'error' ? 'Quá giờ' : 'Đang kiểm tra'}
                  size="small"
                  color={getStatusColor(securityChecks.timeWindow.status)}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  {renderStatusIcon(securityChecks.location.status)}
                </ListItemIcon>
                <ListItemText
                  primary="Xác thực vị trí"
                  secondary={securityChecks.location.message}
                />
                <Chip 
                  label={securityChecks.location.status === 'success' ? 'Trong lớp' : 
                        securityChecks.location.status === 'error' ? 'Ngoài lớp' : 
                        securityChecks.location.status === 'warning' ? 'Xa lớp' : 'Đang định vị'}
                  size="small"
                  color={getStatusColor(securityChecks.location.status)}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  {renderStatusIcon(securityChecks.device.status)}
                </ListItemIcon>
                <ListItemText
                  primary="Xác thực thiết bị"
                  secondary={securityChecks.device.message}
                />
                <Chip 
                  label={securityChecks.device.status === 'success' ? 'Tin cậy' : 
                        securityChecks.device.status === 'warning' ? 'Đáng nghi' : 'Đang kiểm tra'}
                  size="small"
                  color={getStatusColor(securityChecks.device.status)}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  {renderStatusIcon(securityChecks.rateLimit.status)}
                </ListItemIcon>
                <ListItemText
                  primary="Kiểm tra tần suất"
                  secondary={securityChecks.rateLimit.message}
                />
                <Chip 
                  label={securityChecks.rateLimit.status === 'success' ? 'Bình thường' : 
                        securityChecks.rateLimit.status === 'error' ? 'Quá nhiều' : 'Đang kiểm tra'}
                  size="small"
                  color={getStatusColor(securityChecks.rateLimit.status)}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  {renderStatusIcon(securityChecks.duplicate.status)}
                </ListItemIcon>
                <ListItemText
                  primary="Kiểm tra trùng lặp"
                  secondary={securityChecks.duplicate.message}
                />
                <Chip 
                  label={securityChecks.duplicate.status === 'success' ? 'Chưa điểm danh' : 
                        securityChecks.duplicate.status === 'error' ? 'Đã điểm danh' : 'Đang kiểm tra'}
                  size="small"
                  color={getStatusColor(securityChecks.duplicate.status)}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Validation Result */}
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert 
              severity={validationResult.isValid ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">
                {validationResult.isValid ? 'Điểm danh được chấp nhận' : 'Điểm danh bị từ chối'}
              </Typography>
              <Typography variant="body2">
                Điểm rủi ro: {validationResult.riskScore}/100
              </Typography>
              {validationResult.reasons.length > 0 && (
                <Box mt={1}>
                  <Typography variant="body2" fontWeight={600}>Lý do:</Typography>
                  <ul>
                    {validationResult.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Alert>
          </motion.div>
        )}

        {/* Loading indicator */}
        {loading && !validationResult && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Đang thực hiện kiểm tra bảo mật...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmitAttendance}
          disabled={!validationResult?.isValid || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận điểm danh'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SecureAttendanceSubmission