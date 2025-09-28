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

const NotificationSettings = () => {
  const dispatch = useDispatch()
  const { settings } = useSelector(state => state.teacherSettings)
  const notificationSettings = settings?.notifications || {}
  
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
      label: 'Khi phiên học bắt đầu',
      icon: <Schedule />,
      description: 'Nhận thông báo khi phiên điểm danh mở'
    },
    {
      key: 'studentCheckIn',
      label: 'Khi sinh viên điểm danh',
      icon: <People />,
      description: 'Thông báo realtime khi có sinh viên check-in',
      warning: 'Có thể gây nhiễu với lớp đông'
    },
    {
      key: 'lowAttendance',
      label: 'Cảnh báo điểm danh thấp',
      icon: <Warning />,
      description: 'Khi tỷ lệ điểm danh < 60%'
    },
    {
      key: 'suspiciousActivity',
      label: 'Hoạt động đáng ngờ',
      icon: <Warning />,
      description: 'Phát hiện điểm danh bất thường',
      important: true
    }
  ]
  
  const studentReminders = [
    {
      key: 'reminderBeforeClass',
      label: 'Nhắc nhở trước giờ học',
      type: 'slider',
      min: 0,
      max: 60,
      step: 5,
      unit: 'phút'
    },
    {
      key: 'reminderDuringClass',
      label: 'Nhắc nhở trong giờ học',
      type: 'switch',
      description: 'Tự động nhắc sinh viên chưa điểm danh'
    },
    {
      key: 'absenceNotification',
      label: 'Thông báo vắng mặt',
      type: 'switch',
      description: 'Gửi email cho sinh viên vắng'
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
              Cài đặt thông báo đã được cập nhật!
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
                Kênh thông báo
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsActive color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Thông báo trong ứng dụng"
                    secondary="Hiển thị popup và badge"
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
                    primary="Email"
                    secondary={`Gửi đến: ${settings?.account?.email || 'email@example.com'}`}
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
                    primary="SMS"
                    secondary="Tin nhắn điện thoại (Premium)"
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Tính năng Premium">
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
                  {testEmailSent ? 'Email test đã gửi!' : 'Gửi email test'}
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
                Sự kiện thông báo
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
                                <Chip label="Quan trọng" size="small" color="warning" />
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
                Nhắc nhở sinh viên
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
                          marks={[
                            { value: 0, label: 'Tắt' },
                            { value: 15, label: '15p' },
                            { value: 30, label: '30p' },
                            { value: 60, label: '1h' }
                          ]}
                          sx={{ flex: 1 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 50 }}>
                          {notificationSettings.events?.[reminder.key] || 15} {reminder.unit}
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
                Tóm tắt & Người nhận
              </Typography>
              
              {/* Digest Settings */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Tóm tắt định kỳ
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tần suất</InputLabel>
                      <Select
                        value={
                          notificationSettings.digest?.daily ? 'daily' :
                          notificationSettings.digest?.weekly ? 'weekly' : 'none'
                        }
                        onChange={(e) => {
                          handleDigestChange('daily', e.target.value === 'daily')
                          handleDigestChange('weekly', e.target.value === 'weekly')
                        }}
                        label="Tần suất"
                      >
                        <MenuItem value="none">Không gửi</MenuItem>
                        <MenuItem value="daily">Hàng ngày</MenuItem>
                        <MenuItem value="weekly">Hàng tuần</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Thời gian gửi"
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
                  Email nhận thông báo bổ sung
                </Typography>
                <Box display="flex" gap={1} mb={2}>
                  <TextField
                    placeholder="email@example.com"
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
          <strong>Lưu ý:</strong> Thông báo email chỉ hoạt động khi bạn đã xác thực địa chỉ email.
          SMS là tính năng Premium và cần đăng ký gói dịch vụ.
        </Typography>
      </Alert>
    </Box>
  )
}

export default NotificationSettings
