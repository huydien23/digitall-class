import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
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
  Stack,
  Tooltip,
  Divider,
  Badge,
  Fab,
  Zoom,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Link
} from '@mui/material'
import {
  Security as SecurityIcon,
  QrCode2 as QrIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
  Assessment as ReportsIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  NavigateNext
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
  clearChanges
} from '../../store/slices/teacherSettingsSlice'

// Tab configuration with icons
const SETTINGS_TABS = [
  {
    label: 'Tài khoản & Bảo mật',
    icon: <SecurityIcon />,
    component: AccountSecuritySettings,
    description: 'Quản lý thông tin cá nhân, mật khẩu và bảo mật tài khoản'
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

// Custom Tab Panel with animation
function TabPanel({ children, value, index }) {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const TeacherSettingsV2 = () => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  
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
  
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
    setIsSaving(true)
    try {
      await dispatch(saveSettings(settings)).unwrap()
      setSnackbar({
        open: true,
        message: '✅ Cài đặt đã được lưu thành công!',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: `❌ Lỗi: ${error.message}`,
        severity: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSection = async () => {
    try {
      const tabKey = ['account', 'qrAttendance', 'notifications', 'ui', 'dataReports'][activeTab]
      await dispatch(resetSettings(tabKey)).unwrap()
      setShowResetDialog(false)
      setSnackbar({
        open: true,
        message: '🔄 Đã khôi phục cài đặt mặc định!',
        severity: 'info'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: `❌ Lỗi: ${error.message}`,
        severity: 'error'
      })
    }
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

      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 8
      }}>
        {/* Sticky Header */}
        <Paper 
          elevation={0}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ px: { xs: 0, sm: 2 }, py: 2 }}>
              {/* Breadcrumbs */}
              <Breadcrumbs 
                separator={<NavigateNext fontSize="small" />}
                sx={{ mb: 2, display: { xs: 'none', sm: 'flex' } }}
              >
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Trang chủ
                </Link>
                <Typography variant="body2" color="text.primary">
                  Cài đặt
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {SETTINGS_TABS[activeTab].label}
                </Typography>
              </Breadcrumbs>

              {/* Header Content */}
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon /> Cài đặt giảng viên
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {SETTINGS_TABS[activeTab].description}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {/* Status Chips */}
                  <AnimatePresence>
                    {hasChanges && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Chip
                          icon={<InfoIcon />}
                          label="Có thay đổi"
                          color="warning"
                          size="small"
                          variant="filled"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {lastSaved && !hasChanges && (
                    <Chip
                      icon={<CheckIcon />}
                      label={`Đã lưu ${new Date(lastSaved).toLocaleTimeString('vi-VN')}`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  )}

                  {/* Action Buttons */}
                  {!isMobile && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ResetIcon />}
                        onClick={() => setShowResetDialog(true)}
                        disabled={isLoading}
                      >
                        Khôi phục
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                        onClick={handleSaveSettings}
                        disabled={!hasChanges || isSaving}
                        sx={{
                          minWidth: 100,
                          boxShadow: hasChanges ? 3 : 0,
                          animation: hasChanges ? 'pulse 2s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { boxShadow: 3 },
                            '50%': { boxShadow: 6 },
                            '100%': { boxShadow: 3 }
                          }
                        }}
                      >
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </>
                  )}
                </Stack>
              </Box>
            </Box>
          </Container>
        </Paper>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider'
            }}
          >
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons="auto"
                sx={{
                  px: { xs: 1, sm: 2 },
                  '& .MuiTab-root': {
                    minHeight: 64,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500
                  }
                }}
              >
                {SETTINGS_TABS.map((tab, index) => (
                  <Tab
                    key={index}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ 
                          color: activeTab === index ? 'primary.main' : 'text.secondary',
                          transition: 'color 0.3s'
                        }}>
                          {React.cloneElement(tab.icon, { fontSize: 'small' })}
                        </Box>
                        <span>{isMobile ? '' : tab.label}</span>
                      </Box>
                    }
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ 
              px: { xs: 2, sm: 3, md: 4 },
              py: 3,
              minHeight: '50vh',
              bgcolor: 'background.default'
            }}>
              {SETTINGS_TABS.map((tab, index) => (
                <TabPanel key={index} value={activeTab} index={index}>
                  <CurrentTabComponent />
                </TabPanel>
              ))}
            </Box>
          </Paper>
        </Container>

        {/* Mobile FAB for Save */}
        {isMobile && (
          <Zoom in={hasChanges}>
            <Fab
              color="primary"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1200
              }}
              onClick={handleSaveSettings}
              disabled={isSaving}
            >
              {isSaving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
            </Fab>
          </Zoom>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ minWidth: 300 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Reset Confirmation Dialog */}
        <AnimatePresence>
          {showResetDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
              }}
              onClick={() => setShowResetDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Paper sx={{ p: 3, maxWidth: 400, mx: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    ⚠️ Xác nhận khôi phục
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Bạn có chắc muốn khôi phục cài đặt "{SETTINGS_TABS[activeTab].label}" về mặc định?
                    Hành động này không thể hoàn tác.
                  </Typography>
                  <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                    <Button onClick={() => setShowResetDialog(false)}>
                      Hủy
                    </Button>
                    <Button 
                      variant="contained" 
                      color="warning"
                      startIcon={<ResetIcon />}
                      onClick={handleResetSection}
                    >
                      Khôi phục
                    </Button>
                  </Box>
                </Paper>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </>
  )
}

export default TeacherSettingsV2