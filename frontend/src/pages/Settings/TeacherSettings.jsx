import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Badge
} from '@mui/material'
import {
  Security as SecurityIcon,
  QrCode2 as QrIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Assessment as ReportsIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

// Import setting components
import AccountSecuritySettings from './components/AccountSecuritySettings'
import QRAttendanceSettings from './components/QRAttendanceSettings'
import NotificationSettings from './components/NotificationSettings'
import UIPreferencesSettings from './components/UIPreferencesSettings'
import DataReportsSettings from './components/DataReportsSettings'

// Redux actions
import {
  loadSettings,
  saveSettings,
  resetSettings,
  setActiveTab,
  clearChanges,
  selectSettings
} from '../../store/slices/teacherSettingsSlice'

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ py: 3 }}>{children}</Box>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// Tab configuration
const SETTINGS_TABS = [
  {
    label: 'Tài khoản & Bảo mật',
    icon: <SecurityIcon />,
    component: AccountSecuritySettings,
    description: 'Quản lý thông tin cá nhân, mật khẩu và bảo mật'
  },
  {
    label: 'QR & Điểm danh',
    icon: <QrIcon />,
    component: QRAttendanceSettings,
    description: 'Cài đặt chính sách QR Code và quy tắc điểm danh'
  },
  {
    label: 'Thông báo',
    icon: <NotificationsIcon />,
    component: NotificationSettings,
    description: 'Quản lý thông báo và nhắc nhở tự động'
  },
  {
    label: 'Giao diện',
    icon: <ThemeIcon />,
    component: UIPreferencesSettings,
    description: 'Tùy chỉnh giao diện và bảng điều khiển'
  },
  {
    label: 'Dữ liệu & Báo cáo',
    icon: <ReportsIcon />,
    component: DataReportsSettings,
    description: 'Cấu hình xuất dữ liệu và báo cáo tự động'
  }
]

const TeacherSettings = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const {
    settings,
    hasChanges,
    isLoading,
    error,
    lastSaved,
    activeTab
  } = useSelector(state => state.teacherSettings)
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Load settings on mount
  useEffect(() => {
    dispatch(loadSettings())
  }, [dispatch])

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời khỏi trang?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  const handleTabChange = (event, newValue) => {
    dispatch(setActiveTab(newValue))
  }

  const handleSaveSettings = async () => {
    try {
      await dispatch(saveSettings(settings)).unwrap()
      setSnackbar({
        open: true,
        message: 'Cài đặt đã được lưu thành công!',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi lưu cài đặt: ' + error.message,
        severity: 'error'
      })
    }
  }

  const handleResetSection = async () => {
    try {
      const tabKey = ['account', 'qrAttendance', 'notifications', 'ui', 'dataReports'][activeTab]
      await dispatch(resetSettings(tabKey)).unwrap()
      setShowResetConfirm(false)
      setSnackbar({
        open: true,
        message: 'Đã khôi phục cài đặt mặc định!',
        severity: 'info'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi khôi phục: ' + error.message,
        severity: 'error'
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (isLoading && !settings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  const CurrentTabComponent = SETTINGS_TABS[activeTab].component

  return (
    <>
      <Helmet>
        <title>Cài đặt - Digital Classroom</title>
      </Helmet>

      <Box>
        {/* Header */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Cài đặt
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý cài đặt tài khoản và tùy chỉnh hệ thống
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              {lastSaved && (
                <Typography variant="caption" color="text.secondary">
                  Lưu lần cuối: {new Date(lastSaved).toLocaleString('vi-VN')}
                </Typography>
              )}
              {hasChanges && (
                <Chip 
                  label="Có thay đổi chưa lưu" 
                  color="warning" 
                  size="small"
                  icon={<InfoIcon />}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          {/* Tabs Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="settings tabs"
            >
              {SETTINGS_TABS.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      {tab.icon}
                      <span>{tab.label}</span>
                      {index === 0 && hasChanges && (
                        <Badge variant="dot" color="warning" />
                      )}
                    </Box>
                  }
                  id={`settings-tab-${index}`}
                  aria-controls={`settings-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Description */}
          <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {SETTINGS_TABS[activeTab].description}
            </Typography>
          </Box>

          {/* Tab Content */}
          <Box sx={{ px: 3, minHeight: '400px' }}>
            {SETTINGS_TABS.map((tab, index) => (
              <TabPanel key={index} value={activeTab} index={index}>
                <CurrentTabComponent />
              </TabPanel>
            ))}
          </Box>

          {/* Action Buttons */}
          <Divider />
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', bgcolor: 'grey.50' }}>
            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={() => setShowResetConfirm(true)}
              disabled={isLoading}
            >
              Khôi phục mặc định
            </Button>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={() => dispatch(clearChanges())}
                disabled={!hasChanges || isLoading}
              >
                Hủy thay đổi
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={!hasChanges || isLoading}
              >
                {isLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => dispatch(clearError())}>
            {error}
          </Alert>
        )}

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}
            onClick={() => setShowResetConfirm(false)}
          >
            <Paper
              sx={{ p: 3, maxWidth: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="h6" gutterBottom>
                Xác nhận khôi phục
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Bạn có chắc muốn khôi phục cài đặt "{SETTINGS_TABS[activeTab].label}" về mặc định?
                Hành động này không thể hoàn tác.
              </Typography>
              <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                <Button onClick={() => setShowResetConfirm(false)}>
                  Hủy
                </Button>
                <Button 
                  variant="contained" 
                  color="warning"
                  onClick={handleResetSection}
                >
                  Khôi phục
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </>
  )
}

export default TeacherSettings