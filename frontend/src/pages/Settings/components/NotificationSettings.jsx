import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Paper,
  Chip,
  Button,
  TextField,
  Alert,
  Tooltip,
  IconButton,
  Snackbar
} from '@mui/material'
import {
  Notifications,
  Email,
  Sms,
  NotificationsActive,
  Schedule,
  School,
  Warning,
  CheckCircle,
  Timer,
  People,
  Info,
  VolumeUp,
  VolumeOff,
  Add,
  Delete
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { updateSetting } from '../../../store/slices/teacherSettingsSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const NotificationSettings = () => {
  const dispatch = useDispatch()
  const { settings } = useSelector(state => state.teacherSettings)
  const notificationSettings = settings?.notifications || {}
  const { t } = useTranslation()
  
  // Local state for UI feedback
  const [showSuccess, setShowSuccess] = useState(false)
  const [testEmailSent, setTestEmailSent] = useState(false)
  const [customEmails, setCustomEmails] = useState(
    notificationSettings.additionalEmails || []
  )
  const [newEmail, setNewEmail] = useState('')
  
  // Handle notification channel changes
  const handleChannelChange = (channel, enabled) => {
    dispatch(updateSetting({
      section: 'notifications',
      field: `channels.${channel}`,
      value: enabled
    }))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }
  
  // Handle event notification changes
  const handleEventChange = (event, value) => {
    dispatch(updateSetting({
      section: 'notifications',
      field: `events.${event}`,
      value
    }))
  }
  
  // Handle digest settings
  const handleDigestChange = (field, value) => {
    dispatch(updateSetting({
      section: 'notifications',
      field: `digest.${field}`,
      value
    }))
  }
  
  // Add custom email
  const handleAddEmail = () => {
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      const updated = [...customEmails, newEmail]
      setCustomEmails(updated)
      dispatch(updateSetting({
        section: 'notifications',
        field: 'additionalEmails',
        value: updated
      }))
      setNewEmail('')
    }
  }
  
  // Remove custom email
  const handleRemoveEmail = (index) => {
    const updated = customEmails.filter((_, i) => i !== index)
    setCustomEmails(updated)
    dispatch(updateSetting({
      section: 'notifications',
      field: 'additionalEmails',
      value: updated
    }))
  }
  
  // Test notification
  const handleTestNotification = () => {
    setTestEmailSent(true)
    setTimeout(() => setTestEmailSent(false), 3000)
  }
  
  const notificationEvents = [
    {
      key: 'sessionStart',
      label: t('settings:notifications.events.sessionStart.label'),
      icon: <Schedule />,
      description: t('settings:notifications.events.sessionStart.description')
    },
    {
      key: 'studentCheckIn',
      label: t('settings:notifications.events.studentCheckIn.label'),
      icon: <People />,
      description: t('settings:notifications.events.studentCheckIn.description'),
      warning: t('settings:notifications.events.studentCheckIn.warning')
    },
    {
      key: 'lowAttendance',
      label: t('settings:notifications.events.lowAttendance.label'),
      icon: <Warning />,
      description: t('settings:notifications.events.lowAttendance.description')
    },
    {
      key: 'suspiciousActivity',
      label: t('settings:notifications.events.suspiciousActivity.label'),
      icon: <Warning />,
      description: t('settings:notifications.events.suspiciousActivity.description'),
      important: true
    }
  ]
  
  const studentReminders = [
    {
      key: 'reminderBeforeClass',
      label: t('settings:notifications.reminders.reminderBeforeClass.label'),
      type: 'slider',
      min: 0,
      max: 60,
      step: 5
    },
    {
      key: 'reminderDuringClass',
      label: t('settings:notifications.reminders.reminderDuringClass.label'),
      type: 'switch',
      description: t('settings:notifications.reminders.reminderDuringClass.description')
    },
    {
      key: 'absenceNotification',
      label: t('settings:notifications.reminders.absenceNotification.label'),
      type: 'switch',
      description: t('settings:notifications.reminders.absenceNotification.description')
    }
  ]

  return (
    <Box>
      {/* Visual feedback */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ marginBottom: 16 }}
          >
            <Alert severity="success" icon={<CheckCircle />}>
              {t('settings:notifications.updated_success')}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Grid container spacing={3}>
        {/* Notification Channels */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <VolumeUp sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:notifications.channels_title')}
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('settings:notifications.in_app.title')}
                    secondary={t('settings:notifications.in_app.desc')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.channels?.inApp !== false}
                      onChange={(e) => handleChannelChange('inApp', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('settings:notifications.email.title')}
                    secondary={t('settings:notifications.email.to', { email: settings?.account?.email || 'email@example.com' })}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notificationSettings.channels?.email || false}
                      onChange={(e) => handleChannelChange('email', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <Sms color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('settings:notifications.sms.title')}
                    secondary={t('settings:notifications.sms.desc')}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title={t('settings:notifications.sms.premium')}>
                      <Switch
                        checked={notificationSettings.channels?.sms || false}
                        onChange={(e) => handleChannelChange('sms', e.target.checked)}
                        disabled
                      />
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Box mt={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Email />}
                  onClick={handleTestNotification}
                  disabled={testEmailSent}
                >
                  {testEmailSent ? t('settings:notifications.test_email_sent') : t('settings:notifications.test_email_send')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Event Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Notifications sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:notifications.events_title')}
              </Typography>
              
              <FormGroup>
                {notificationEvents.map((event) => (
                  <motion.div
                    key={event.key}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Paper
                      variant="outlined"
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        border: event.important ? '2px solid' : '1px solid',
                        borderColor: event.important ? 'warning.main' : 'divider',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.events?.[event.key] || false}
                            onChange={(e) => handleEventChange(event.key, e.target.checked)}
                            color={event.important ? 'warning' : 'primary'}
                          />
                        }
                        label={
                          <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              {event.icon}
                              <Typography variant="subtitle2">
                                {event.label}
                              </Typography>
                              {event.important && (
                                <Chip label={t('settings:notifications.events.suspiciousActivity.important')} size="small" color="warning" />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {event.description}
                            </Typography>
                            {event.warning && (
                              <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                                <Typography variant="caption">{event.warning}</Typography>
                              </Alert>
                            )}
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Paper>
                  </motion.div>
                ))}
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Student Reminders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <School sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:notifications.student_reminders_title')}
              </Typography>
              
              {studentReminders.map((reminder) => (
                <Box key={reminder.key} mb={3}>
                  {reminder.type === 'slider' ? (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {reminder.label}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Slider
                          value={notificationSettings.events?.[reminder.key] || 15}
                          onChange={(e, value) => handleEventChange(reminder.key, value)}
                          min={reminder.min}
                          max={reminder.max}
                          step={reminder.step}
                          marks={(() => { const s = t('min_short'); return [
                            { value: 0, label: t('off') },
                            { value: 15, label: `15${s}` },
                            { value: 30, label: `30${s}` },
                            { value: 60, label: `1${t('hour_short')}` }
                          ] })()}
                          sx={{ flex: 1 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 50 }}>
                          {(notificationSettings.events?.[reminder.key] || 15) + ' ' + t('minute')}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.events?.[reminder.key] || false}
                          onChange={(e) => handleEventChange(reminder.key, e.target.checked)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2">{reminder.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {reminder.description}
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Email Digest & Additional Recipients */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Email sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:notifications.digest_and_recipients_title')}
              </Typography>
              
              {/* Digest Settings */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('settings:notifications.digest.title')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('settings:notifications.digest.frequency_label')}</InputLabel>
                      <Select
                        value={
                          notificationSettings.digest?.daily ? 'daily' :
                          notificationSettings.digest?.weekly ? 'weekly' : 'none'
                        }
                        onChange={(e) => {
                          handleDigestChange('daily', e.target.value === 'daily')
                          handleDigestChange('weekly', e.target.value === 'weekly')
                        }}
                        label={t('settings:notifications.digest.frequency_label')}
                      >
                        <MenuItem value="none">{t('settings:notifications.digest.frequency_value.none')}</MenuItem>
                        <MenuItem value="daily">{t('settings:notifications.digest.frequency_value.daily')}</MenuItem>
                        <MenuItem value="weekly">{t('settings:notifications.digest.frequency_value.weekly')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label={t('settings:notifications.digest.send_time')}
                      type="time"
                      value={notificationSettings.digest?.time || '08:00'}
                      onChange={(e) => handleDigestChange('time', e.target.value)}
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Additional Recipients */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('settings:notifications.recipients.title')}
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    placeholder={t('settings:notifications.recipients.placeholder')}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    size="small"
                    fullWidth
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddEmail}
                    disabled={!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)}
                  >
                    <Add />
                  </Button>
                </Box>
                
                {customEmails.map((email, index) => (
                  <Chip
                    key={index}
                    label={email}
                    onDelete={() => handleRemoveEmail(index)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }} icon={<Info />}>
        <Typography variant="body2">
          <strong>{t('note')}:</strong> {t('settings:notifications.info_note')}
        </Typography>
      </Alert>
    </Box>
  )
}

export default NotificationSettings
