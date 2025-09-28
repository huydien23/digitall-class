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
import { useTranslation } from 'react-i18next'

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
  clearError,
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

// Tab configuration (use translation keys)
const SETTINGS_TABS = [
  {
    labelKey: 'tabs.account',
    icon: <SecurityIcon />,
    component: AccountSecuritySettings,
    descKey: 'desc.account'
  },
  {
    labelKey: 'tabs.qr',
    icon: <QrIcon />,
    component: QRAttendanceSettings,
    descKey: 'desc.qr'
  },
  {
    labelKey: 'tabs.notifications',
    icon: <NotificationsIcon />,
    component: NotificationSettings,
    descKey: 'desc.notifications'
  },
  {
    labelKey: 'tabs.interface',
    icon: <ThemeIcon />,
    component: UIPreferencesSettings,
    descKey: 'desc.interface'
  },
  {
    labelKey: 'tabs.data',
    icon: <ReportsIcon />,
    component: DataReportsSettings,
    descKey: 'desc.data'
  }
]

const TeacherSettings = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
        e.returnValue = t('unsaved_changes_warning')
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
        message: t('settings_saved'),
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('error_saving') + ': ' + error.message,
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
        message: t('settings_restored'),
        severity: 'info'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: t('error_restoring') + ': ' + error.message,
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
        <title>{t('settings')} - Digital Classroom</title>
      </Helmet>

      <Box>
        {/* Header */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {t('settings')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t(SETTINGS_TABS[activeTab].descKey, { ns: 'settings' })}
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              {lastSaved && (
                <Typography variant="caption" color="text.secondary">
                  {t('last_saved')}: {new Date(lastSaved).toLocaleString()}
                </Typography>
              )}
              {hasChanges && (
                <Chip 
                  label={t('has_unsaved_changes')} 
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
                      <span>{t(tab.labelKey, { ns: 'settings' })}</span>
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
              {t(SETTINGS_TABS[activeTab].descKey, { ns: 'settings' })}
            </Typography>
          </Box>

          {/* Tab Content */}
          <Box sx={{ px: 3, minHeight: '400px' }}>
            {SETTINGS_TABS.map((tab, index) => {
              const TabComponent = tab.component
              return (
                <TabPanel key={index} value={activeTab} index={index}>
                  <TabComponent />
                </TabPanel>
              )
            })}
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
              {t('restore')}
            </Button>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={() => dispatch(clearChanges())}
                disabled={!hasChanges || isLoading}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                disabled={!hasChanges || isLoading}
              >
                {isLoading ? t('saving') : t('save')}
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
                {t('restore_confirmation')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('restore_confirm_message', { section: t(SETTINGS_TABS[activeTab].labelKey, { ns: 'settings' }) })}
              </Typography>
              <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                <Button onClick={() => setShowResetConfirm(false)}>
                  {t('cancel')}
                </Button>
                <Button 
                  variant="contained" 
                  color="warning"
                  onClick={handleResetSection}
                >
                  {t('restore')}
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