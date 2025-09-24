import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Divider
} from '@mui/material'
import {
  QrCode as QrCodeIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import AttendanceQRGenerator from '../QRCode/AttendanceQRGenerator'
import ManualAttendance from './ManualAttendance'
import SecureAttendanceSubmission from './SecureAttendanceSubmission'
import SecurityDashboard from '../Security/SecurityDashboard'

const AttendanceManager = ({ 
  classData,
  sessionData,
  students = [],
  onClose 
}) => {
  const [tabValue, setTabValue] = useState(0)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [manualDialogOpen, setManualDialogOpen] = useState(false)
  const [securityDashboardOpen, setSecurityDashboardOpen] = useState(false)
  const [attendanceStats, setAttendanceStats] = useState({
    totalSessions: 8,
    avgAttendance: 85,
    securityAlerts: 3,
    manualSessions: 2
  })

  const attendanceMethods = [
    {
      id: 'qr',
      title: 'QR Code Điểm danh',
      description: 'Sinh viên quét mã QR để điểm danh tự động với xác thực bảo mật',
      icon: <QrCodeIcon />,
      color: 'primary',
      pros: ['Nhanh chóng', 'Tự động', 'Có bảo mật'],
      cons: ['Cần thiết bị', 'Phụ thuộc mạng'],
      action: () => setQrDialogOpen(true)
    },
    {
      id: 'manual',
      title: 'Điểm danh thủ công',
      description: 'Giáo viên điểm danh thủ công cho từng sinh viên',
      icon: <GroupIcon />,
      color: 'success',
      pros: ['Không cần thiết bị', 'Linh hoạt', 'Chính xác 100%'],
      cons: ['Mất thời gian', 'Dễ nhầm lẫn'],
      action: () => setManualDialogOpen(true)
    }
  ]

  const securityFeatures = [
    {
      title: 'Xác thực vị trí GPS',
      description: 'Kiểm tra sinh viên có trong phạm vi lớp học',
      status: 'active'
    },
    {
      title: 'Kiểm tra thời gian',
      description: 'Chỉ cho phép điểm danh trong khung giờ học',
      status: 'active'
    },
    {
      title: 'Device Fingerprinting',
      description: 'Theo dõi thiết bị để phát hiện gian lận',
      status: 'active'
    },
    {
      title: 'Rate Limiting',
      description: 'Giới hạn số lần thử từ cùng IP',
      status: 'active'
    }
  ]

  const handleSaveManualAttendance = async (attendanceData) => {
    try {
      // Xử lý lưu điểm danh thủ công
      console.log('Manual attendance saved:', attendanceData)
      setManualDialogOpen(false)
    } catch (error) {
      console.error('Error saving manual attendance:', error)
      throw error
    }
  }

  const handleQRSessionUpdate = (sessionData) => {
    console.log('QR session updated:', sessionData)
  }

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Quản lý điểm danh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {classData?.class_name} - {sessionData?.date || 'Hôm nay'}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Phương thức điểm danh" />
            <Tab label="Bảo mật & Giám sát" />
            <Tab label="Thống kê" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Tab 0: Attendance Methods */}
          {tabValue === 0 && (
            <Box>
              {/* Quick Stats */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {attendanceStats.totalSessions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng buổi học
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {attendanceStats.avgAttendance}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tỷ lệ có mặt TB
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {attendanceStats.securityAlerts}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cảnh báo bảo mật
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {attendanceStats.manualSessions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Điểm danh thủ công
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Attendance Methods */}
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Chọn phương thức điểm danh
              </Typography>
              
              <Grid container spacing={3}>
                {attendanceMethods.map((method, index) => (
                  <Grid item xs={12} md={6} key={method.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          }
                        }}
                        onClick={method.action}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Box color={`${method.color}.main`}>
                              {method.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {method.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="success.main" gutterBottom>
                                Ưu điểm
                              </Typography>
                              {method.pros.map((pro, idx) => (
                                <Typography key={idx} variant="body2" color="text.secondary">
                                  • {pro}
                                </Typography>
                              ))}
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="subtitle2" color="warning.main" gutterBottom>
                                Hạn chế
                              </Typography>
                              {method.cons.map((con, idx) => (
                                <Typography key={idx} variant="body2" color="text.secondary">
                                  • {con}
                                </Typography>
                              ))}
                            </Grid>
                          </Grid>

                          <Box mt={2}>
                            <Button
                              variant="contained"
                              color={method.color}
                              fullWidth
                              startIcon={method.icon}
                              onClick={(e) => {
                                e.stopPropagation()
                                method.action()
                              }}
                            >
                              Bắt đầu {method.title}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Tab 1: Security & Monitoring */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Tính năng bảo mật điểm danh
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {securityFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <CheckCircleIcon color="success" />
                        <Box flexGrow={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                        <Chip
                          label="Hoạt động"
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<SecurityIcon />}
                  onClick={() => setSecurityDashboardOpen(true)}
                >
                  Dashboard bảo mật
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                >
                  Cài đặt bảo mật
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 2: Statistics */}
          {tabValue === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Tính năng thống kê chi tiết sẽ được cung cấp trong phiên bản tiếp theo.
                Hiện tại bạn có thể xem thống kê cơ bản ở tab đầu tiên.
              </Alert>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Lịch sử điểm danh gần đây
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Buổi 8 - 2024-09-21"
                        secondary="QR Code - 45/50 sinh viên có mặt (90%)"
                      />
                      <Chip label="Hoàn thành" color="success" size="small" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <HistoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Buổi 7 - 2024-09-14"
                        secondary="Thủ công - 42/50 sinh viên có mặt (84%)"
                      />
                      <Chip label="Hoàn thành" color="success" size="small" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>
          Đóng
        </Button>
        <Button variant="contained" startIcon={<AssessmentIcon />}>
          Xuất báo cáo
        </Button>
      </DialogActions>

      {/* QR Code Dialog */}
      {qrDialogOpen && (
        <AttendanceQRGenerator
          open={qrDialogOpen}
          onClose={() => setQrDialogOpen(false)}
          sessionData={{
            id: 'session-' + Date.now(),
            subject: classData?.class_name || 'Lập trình Python',
            class_id: classData?.class_id || '110101101010',
            start_time: '07:00',
            end_time: '11:00',
            location: classData?.location || 'Phòng 14-02'
          }}
          title="QR Code Điểm Danh"
          onSessionUpdate={handleQRSessionUpdate}
        />
      )}

      {/* Manual Attendance Dialog */}
      {manualDialogOpen && (
        <ManualAttendance
          sessionData={{
            id: 'manual-' + Date.now(),
            subject: classData?.class_name || 'Lập trình Python',
            class_id: classData?.class_id || '110101101010',
            location: classData?.location || 'Phòng 14-02'
          }}
          students={students}
          existingAttendance={{}}
          onSave={handleSaveManualAttendance}
          onClose={() => setManualDialogOpen(false)}
        />
      )}

      {/* Security Dashboard */}
      {securityDashboardOpen && (
        <Dialog
          open={securityDashboardOpen}
          onClose={() => setSecurityDashboardOpen(false)}
          maxWidth="xl"
          fullWidth
        >
          <SecurityDashboard
            classId={classData?.class_id}
            onClose={() => setSecurityDashboardOpen(false)}
          />
        </Dialog>
      )}
    </Dialog>
  )
}

export default AttendanceManager