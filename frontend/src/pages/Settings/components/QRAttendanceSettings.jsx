import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Paper,
  Button,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material'
import {
  QrCode2,
  Security,
  Timer,
  LocationOn,
  Devices,
  Schedule,
  Info,
  Warning,
  CheckCircle,
  Settings,
  School,
  RestartAlt
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { updateSetting } from '../../../store/slices/teacherSettingsSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const QRAttendanceSettings = () => {
  const dispatch = useDispatch()
  const { settings } = useSelector(state => state.teacherSettings)
  const { t } = useTranslation()
  
  const qrSettings = settings?.qrAttendance?.qrCode || {}
  const attendanceRules = settings?.qrAttendance?.rules || {}
  const sessionDefaults = settings?.qrAttendance?.defaultSession || {}
  
  // Visual feedback states
  const [changedFields, setChangedFields] = useState(new Set())
  const [showSaveHint, setShowSaveHint] = useState(false)
  
  // Show save hint when settings change
  useEffect(() => {
    if (changedFields.size > 0) {
      setShowSaveHint(true)
      const timer = setTimeout(() => setShowSaveHint(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [changedFields.size])

  const handleQRSettingChange = (field, value) => {
    dispatch(updateSetting({
      section: 'qrAttendance',
      field: `qrCode.${field}`,
      value
    }))
    // Add visual feedback
    setChangedFields(prev => new Set([...prev, `qr-${field}`]))
    setTimeout(() => {
      setChangedFields(prev => {
        const newSet = new Set(prev)
        newSet.delete(`qr-${field}`)
        return newSet
      })
    }, 2000)
  }

  const handleRuleChange = (field, value) => {
    dispatch(updateSetting({
      section: 'qrAttendance', 
      field: `rules.${field}`,
      value
    }))
  }

  const handleSessionDefaultChange = (field, value) => {
    dispatch(updateSetting({
      section: 'qrAttendance',
      field: `defaultSession.${field}`,
      value
    }))
  }

  // Templates for quick setup
  const templates = [
    { id: 'standard', name: 'Tiêu chuẩn', icon: <School />, color: 'primary' },
    { id: 'lab', name: 'Thực hành', icon: <Settings />, color: 'secondary' },
    { id: 'seminar', name: 'Seminar', icon: <Schedule />, color: 'info' }
  ]

  return (
    <Box>
      {/* Save Hint Animation */}
      <AnimatePresence>
        {showSaveHint && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert 
              severity="success" 
              icon={<CheckCircle />} 
              sx={{ mb: 2 }}
              action={
                <Typography variant="caption" color="success.main">
                  {t('settings:qr.press_save', { action: t('save') })}
                </Typography>
              }
            >
              <Typography variant="body2">
                {t('settings:qr.changed')}
              </Typography>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Info Alert */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t('settings:qr.info')}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* QR Code Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <QrCode2 sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:qr.qr_settings')}
              </Typography>

              <List>
                {/* Auto Refresh Interval */}
                <ListItem
                  sx={{
                    transition: 'all 0.3s',
                    borderRadius: 1,
                    bgcolor: changedFields.has('qr-autoRefreshInterval') ? 'action.selected' : 'transparent'
                  }}
                >
                  <ListItemIcon>
                    <RestartAlt color={changedFields.has('qr-autoRefreshInterval') ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('settings:qr.auto_refresh.title')}
                    secondary={
                      <Box>
                        <Typography variant="caption">
                          {t('settings:qr.auto_refresh.desc', { minutes: qrSettings.autoRefreshInterval || 5, unit: t('minute') })}
                        </Typography>
                        <Slider
                          value={qrSettings.autoRefreshInterval || 5}
                          onChange={(e, value) => handleQRSettingChange('autoRefreshInterval', value)}
                          min={1}
                          max={15}
                          step={1}
                          marks={(() => { const s = t('min_short'); return [
                            { value: 1, label: `1${s}` },
                            { value: 5, label: `5${s}` },
                            { value: 10, label: `10${s}` },
                            { value: 15, label: `15${s}` }
                          ] })()}
                          sx={{ mt: 2 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>

                <Divider />

                {/* Validity Duration */}
                <ListItem>
                  <ListItemIcon>
                    <Timer />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('settings:qr.validity.title')}
                    secondary={
                      <Box>
                        <Typography variant="caption">
                          {t('settings:qr.validity.desc', { minutes: qrSettings.validityDuration || 15, unit: t('minute') })}
                        </Typography>
                        <Slider
                          value={qrSettings.validityDuration || 15}
                          onChange={(e, value) => handleQRSettingChange('validityDuration', value)}
                          min={5}
                          max={60}
                          step={5}
                          marks={(() => { const s = t('min_short'); return [
                            { value: 10, label: `10${s}` },
                            { value: 15, label: `15${s}` },
                            { value: 30, label: `30${s}` },
                            { value: 60, label: `60${s}` }
                          ] })()}
                          sx={{ mt: 2 }}
                        />
                      </Box>
                    }
                  />
                </ListItem>

                <Divider />

                {/* Security Level */}
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('settings:qr.security_level.title')}
                    secondary={t('settings:qr.security_level.desc')}
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={qrSettings.securityLevel || 'medium'}
                        onChange={(e) => handleQRSettingChange('securityLevel', e.target.value)}
                      >
                        <MenuItem value="low">{t('settings:qr.security_level.options.low')}</MenuItem>
                        <MenuItem value="medium">{t('settings:qr.security_level.options.medium')}</MenuItem>
                        <MenuItem value="high">{t('settings:qr.security_level.options.high')}</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                {/* Allow Manual Code */}
                <ListItem>
                  <ListItemText
                    primary={t('settings:qr.manual_code.title')}
                    secondary={t('settings:qr.manual_code.desc')}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={qrSettings.allowManualCode !== false}
                      onChange={(e) => handleQRSettingChange('allowManualCode', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Rules */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Schedule sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:qr.rules.title')}
              </Typography>

              <Grid container spacing={2}>
                {/* Late Threshold */}
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:qr.rules.late_threshold.label')}
                    type="number"
                    value={attendanceRules.lateThreshold || 15}
                    onChange={(e) => handleRuleChange('lateThreshold', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    helperText={t('settings:qr.rules.late_threshold.helper')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{t('minute')}</InputAdornment>
                    }}
                  />
                </Grid>

                {/* Absent Threshold */}
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:qr.rules.absent_threshold.label')}
                    type="number"
                    value={attendanceRules.absentThreshold || 30}
                    onChange={(e) => handleRuleChange('absentThreshold', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    helperText={t('settings:qr.rules.absent_threshold.helper')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{t('minute')}</InputAdornment>
                    }}
                  />
                </Grid>

                {/* Grace Time */}
                <Grid item xs={12}>
                  <TextField
                    label={t('settings:qr.rules.grace_time.label')}
                    type="number"
                    value={attendanceRules.graceTime || 10}
                    onChange={(e) => handleRuleChange('graceTime', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    helperText={t('settings:qr.rules.grace_time.helper')}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{t('minute')}</InputAdornment>
                    }}
                  />
                </Grid>

                {/* Auto Close Session */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={attendanceRules.autoCloseSession !== false}
                        onChange={(e) => handleRuleChange('autoCloseSession', e.target.checked)}
                      />
                    }
                    label={t('settings:qr.rules.auto_close')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Security sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:qr.security.title')}
              </Typography>

              <Grid container spacing={3}>
                {/* Location Settings */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationOn color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {t('settings:qr.security.location.title')}
                      </Typography>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={attendanceRules.requireLocation || false}
                          onChange={(e) => handleRuleChange('requireLocation', e.target.checked)}
                        />
                      }
                      label={t('settings:qr.security.location.require')}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      label={t('settings:qr.security.location.radius_label')}
                      type="number"
                      value={attendanceRules.locationRadius || 50}
                      onChange={(e) => handleRuleChange('locationRadius', parseInt(e.target.value))}
                      disabled={!attendanceRules.requireLocation}
                      fullWidth
                      size="small"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">{t('meter_short')}</InputAdornment>
                      }}
                    />
                    
                      {attendanceRules.requireLocation && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          <Typography variant="caption">
                            {t('settings:qr.security.location.warning', { meters: attendanceRules.locationRadius })}
                          </Typography>
                        </Alert>
                      )}
                  </Paper>
                </Grid>

                {/* Device Settings */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Devices color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {t('settings:qr.security.device.title')}
                      </Typography>
                    </Box>

                    <TextField
                      label={t('settings:qr.security.device.max_per_student')}
                      type="number"
                      value={attendanceRules.maxDevicesPerStudent || 2}
                      onChange={(e) => handleRuleChange('maxDevicesPerStudent', parseInt(e.target.value))}
                      fullWidth
                      size="small"
                      helperText={t('settings:qr.security.device.helper')}
                      InputProps={{
                        inputProps: { min: 1, max: 5 }
                      }}
                      sx={{ mb: 2 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={attendanceRules.preventDuplicateCheckIn !== false}
                          onChange={(e) => handleRuleChange('preventDuplicateCheckIn', e.target.checked)}
                        />
                      }
                      label={t('settings:qr.security.device.prevent_duplicate')}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Default Session Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <School sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:qr.defaults.title')}
              </Typography>

              <Grid container spacing={3}>
                {/* Session Templates */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('settings:qr.defaults.templates_label')}
                  </Typography>
                  <Box display="flex" gap={2}>
                    {templates.map((template) => (
                      <Chip
                        key={template.id}
                        label={t(`settings:qr.defaults.templates.${template.id}`)}
                        icon={template.icon}
                        color={sessionDefaults.template === template.id ? template.color : 'default'}
                        variant={sessionDefaults.template === template.id ? 'filled' : 'outlined'}
                        onClick={() => handleSessionDefaultChange('template', template.id)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Default Duration */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('settings:qr.defaults.default_duration')}
                    type="number"
                    value={sessionDefaults.duration || 120}
                    onChange={(e) => handleSessionDefaultChange('duration', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">{t('minute')}</InputAdornment>
                    }}
                  />
                </Grid>

                {/* Default Location */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('settings:qr.defaults.default_location')}
                    value={sessionDefaults.location || ''}
                    onChange={(e) => handleSessionDefaultChange('location', e.target.value)}
                    fullWidth
                    size="small"
                    placeholder={t('settings:qr.defaults.default_location_placeholder')}
                  />
                </Grid>
              </Grid>

              {/* Template Preview */}
              <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('settings:qr.defaults.preview')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">{t('settings:qr.defaults.preview_fields.auto_refresh')}</Typography>
                    <Typography variant="body2">{`${qrSettings.autoRefreshInterval || 5} ${t('minute')}`}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">{t('settings:qr.defaults.preview_fields.validity')}</Typography>
                    <Typography variant="body2">{`${qrSettings.validityDuration || 15} ${t('minute')}`}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">{t('settings:qr.defaults.preview_fields.late_threshold')}</Typography>
                    <Typography variant="body2">{`${attendanceRules.lateThreshold || 15} ${t('minute')}`}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">{t('settings:qr.defaults.preview_fields.security')}</Typography>
                    <Typography variant="body2">
                      {qrSettings.securityLevel === 'high' ? t('settings:qr.security_level.options.high') : 
                       qrSettings.securityLevel === 'low' ? t('settings:qr.security_level.options.low') : t('settings:qr.security_level.options.medium')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default QRAttendanceSettings