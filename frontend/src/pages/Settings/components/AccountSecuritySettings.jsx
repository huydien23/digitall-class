import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Avatar,
  InputAdornment
} from '@mui/material'
import {
  Person,
  Lock,
  Security,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  DevicesOther,
  PhotoCamera,
  Logout
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { updateSetting } from '../../../store/slices/teacherSettingsSlice'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const AccountSecuritySettings = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { settings } = useSelector(state => state.teacherSettings)
  const { t } = useTranslation()
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    bio: user?.bio || ''
  })
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // Security settings state
  const accountSettings = settings?.account || {}
  
  // Error state
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      setErrors({})
      // Simulate API call - In production, this would call a real API
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Update settings in Redux
      dispatch(updateSetting({
        section: 'account',
        field: 'profile',
        value: profileData
      }))
      setIsEditingProfile(false)
      setSuccessMessage(t('settings:account.profile.updated'))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrors({ profile: error.message })
    }
  }

  // Handle password change
  const handlePasswordChange = async () => {
    setErrors({})
    
    // Validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrors({ password: t('settings:account.password.errors.mismatch') })
      return
    }
    
    if (passwordData.new_password.length < 8) {
      setErrors({ password: t('settings:account.password.errors.too_short') })
      return
    }
    
    try {
      // Simulate API call - In production, this would call a real API
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate password validation
          if (passwordData.current_password === '123456') {
            reject(new Error(t('settings:account.password.errors.current_incorrect')))
          } else {
            resolve()
          }
        }, 1000)
      })
      
      // Clear form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      setSuccessMessage(t('settings:account.password.changed'))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrors({ password: error.message || t('settings:account.password.errors.change_failed') })
    }
  }

  // Handle security settings change
  const handleSecuritySettingChange = (field, value) => {
    dispatch(updateSetting({
      section: 'account',
      field,
      value
    }))
  }

  // Session management
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      device: 'Chrome - Windows',
      location: 'Ho Chi Minh City',
      lastActive: 'Hiện tại',
      current: true,
      ip: '192.168.1.100',
      loginTime: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      device: 'Safari - iPhone',
      location: 'Ho Chi Minh City',
      lastActive: '2 giờ trước',
      current: false,
      ip: '192.168.1.101',
      loginTime: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 3,
      device: 'Firefox - MacOS',
      location: 'Ha Noi',
      lastActive: '5 giờ trước',
      current: false,
      ip: '192.168.1.102',
      loginTime: new Date(Date.now() - 18000000).toISOString()
    }
  ])
  
  const handleLogoutSession = (sessionId) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
    setSuccessMessage(t('settings:account.sessions.logged_out_session', { id: sessionId }))
    setTimeout(() => setSuccessMessage(''), 3000)
  }
  
  const handleLogoutAllOthers = () => {
    setActiveSessions(prev => prev.filter(s => s.current))
    setSuccessMessage(t('settings:account.sessions.logged_out_others'))
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <Box>
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('settings:account.profile.title')}
                </Typography>
                {!isEditingProfile ? (
                  <IconButton size="small" onClick={() => setIsEditingProfile(true)}>
                    <EditIcon />
                  </IconButton>
                ) : (
                  <Box>
                    <IconButton size="small" onClick={handleProfileUpdate} color="primary">
                      <SaveIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => setIsEditingProfile(false)}>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Avatar */}
              <Box display="flex" justifyContent="center" mb={3}>
                <Box position="relative">
                  <Avatar
                    sx={{ width: 100, height: 100, fontSize: '2rem' }}
                    src={user?.avatar}
                  >
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </Avatar>
                  {isEditingProfile && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                      size="small"
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Profile Fields */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('settings:account.profile.labels.first_name')}
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    disabled={!isEditingProfile}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('settings:account.profile.labels.last_name')}
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    disabled={!isEditingProfile}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:account.profile.labels.email')}
                    value={user?.email}
                    disabled
                    fullWidth
                    size="small"
                    helperText={t('settings:account.profile.email_fixed_note')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:account.profile.labels.phone')}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditingProfile}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:account.profile.labels.department')}
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    disabled={!isEditingProfile}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:account.profile.labels.bio')}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditingProfile}
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                  />
                </Grid>
              </Grid>

              {errors.profile && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.profile}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Lock sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:account.password.title')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:account.password.current')}
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          >
                            {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:account.password.new')}
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          >
                            {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:account.password.confirm')}
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          >
                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handlePasswordChange}
                    disabled={!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                  >
                    {t('settings:account.password.change_button')}
                  </Button>
                </Grid>
              </Grid>

              {errors.password && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.password}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Security sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:account.security.title')}
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary={t('settings:account.security.two_factor.title')}
                    secondary={t('settings:account.security.two_factor.desc')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={accountSettings.twoFactorAuth?.enabled || false}
                      onChange={(e) => handleSecuritySettingChange('twoFactorAuth.enabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={t('settings:account.security.new_login.title')}
                    secondary={t('settings:account.security.new_login.desc')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={accountSettings.notifyNewLogin || false}
                      onChange={(e) => handleSecuritySettingChange('notifyNewLogin', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={t('settings:account.security.session_timeout.title')}
                    secondary={t('settings:account.security.session_timeout.desc', { minutes: accountSettings.sessionTimeout || 30 })}
                  />
                  <ListItemSecondaryAction>
                    <TextField
                      type="number"
                      value={accountSettings.sessionTimeout || 30}
                      onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                      size="small"
                      sx={{ width: 70 }}
                      InputProps={{
                        endAdornment: <Typography variant="caption">{t('minute')}</Typography>
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Sessions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <DevicesOther sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:account.sessions.title')}
              </Typography>

              <List>
                {activeSessions.map((session, index) => (
                  <React.Fragment key={session.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {session.device}
                            {session.current && (
                              <Chip label={t('settings:account.sessions.current_session')} size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={`${session.location} • ${session.lastActive}`}
                      />
                      {!session.current && (
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => handleLogoutSession(session.id)}
                            color="error"
                          >
                            <Logout />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                    {index < activeSessions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Logout />}
                sx={{ mt: 2 }}
                onClick={handleLogoutAllOthers}
                disabled={activeSessions.length <= 1}
              >
                {t('settings:account.sessions.logout_all_others', { count: activeSessions.filter(s => !s.current).length })}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AccountSecuritySettings