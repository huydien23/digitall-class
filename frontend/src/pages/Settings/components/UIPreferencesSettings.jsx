import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Slider,
  Button,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Snackbar
} from '@mui/material'
import {
  Palette,
  DarkMode,
  LightMode,
  FormatSize,
  Dashboard,
  ViewCompact,
  Visibility,
  VisibilityOff,
  RestoreOutlined,
  Check,
  Info,
  ColorLens,
  Language,
  Refresh
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { updateSetting, saveSettings } from '../../../store/slices/teacherSettingsSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

const UIPreferencesSettings = () => {
  const dispatch = useDispatch()
  const { settings, hasChanges } = useSelector(state => state.teacherSettings)
  const uiSettings = settings?.ui || {}
  const theme = useTheme()
  const { t, i18n } = useTranslation()
  
  // Local state
  const [showSuccessMsg, setShowSuccessMsg] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Sync with theme context
  useEffect(() => {
    if (theme.updateTheme) {
      theme.updateTheme({
        mode: uiSettings.theme?.mode || 'light',
        primaryColor: uiSettings.theme?.primaryColor || '#1976d2',
        fontSize: uiSettings.theme?.fontSize || 'medium',
        density: uiSettings.theme?.density || 'comfortable'
      })
    }
  }, [])
  
  const handleThemeChange = (field, value) => {
    // Update Redux store
    dispatch(updateSetting({
      section: 'ui',
      field: `theme.${field}`,
      value
    }))
    
    // Update theme context for immediate preview
    if (theme.updateTheme) {
      theme.updateTheme({ [field]: value })
    }
    
    // Show success feedback
    setShowSuccessMsg(true)
    setTimeout(() => setShowSuccessMsg(false), 2000)
  }
  
  const handleDashboardChange = (field, value) => {
    dispatch(updateSetting({
      section: 'ui',
      field: `dashboard.${field}`,
      value
    }))
  }
  
  const handleWidgetToggle = (widget) => {
    dispatch(updateSetting({
      section: 'ui',
      field: `dashboard.widgets.${widget}`,
      value: !uiSettings.dashboard?.widgets?.[widget]
    }))
  }
  
  const handleSidebarChange = (field, value) => {
    dispatch(updateSetting({
      section: 'ui',
      field: `sidebar.${field}`,
      value
    }))
  }
  
  // Language change
  const handleLanguageChange = (lang) => {
    dispatch(updateSetting({ section: 'ui', field: 'language', value: lang }))
    try { localStorage.setItem('appLanguage', lang) } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
    }
    if (i18n && i18n.changeLanguage) i18n.changeLanguage(lang)
    setShowSuccessMsg(true)
    setTimeout(() => setShowSuccessMsg(false), 1500)
  }
  
  useEffect(() => {
    const lang = uiSettings.language || 'vi'
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
    }
  }, [uiSettings.language])
  
  // Theme colors
  const themeColors = [
    { name: 'Mặc định', value: '#1976d2', label: 'primary' },
    { name: 'Xanh lá', value: '#4caf50', label: 'success' },
    { name: 'Tím', value: '#9c27b0', label: 'purple' },
    { name: 'Cam', value: '#ff9800', label: 'orange' },
    { name: 'Đỏ', value: '#f44336', label: 'error' }
  ]
  
  // Dashboard widgets
  const dashboardWidgets = [
    { key: 'attendance_today', label: t('settings:widgets.attendance_today'), icon: <Dashboard /> },
    { key: 'class_schedule', label: t('settings:widgets.class_schedule'), icon: <Dashboard /> },
    { key: 'weekly_report', label: t('settings:widgets.weekly_report'), icon: <Dashboard /> },
    { key: 'recent_activities', label: t('settings:widgets.recent_activities'), icon: <Dashboard /> },
    { key: 'notifications', label: t('settings:widgets.notifications'), icon: <Dashboard /> }
  ]

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Palette sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('teacher_settings')} - {t('settings:tabs.interface')}
              </Typography>
              
              {/* Theme Mode */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('settings:tabs.interface')}
                </Typography>
                <RadioGroup
                  value={uiSettings.theme?.mode || 'light'}
                  onChange={(e) => handleThemeChange('mode', e.target.value)}
                >
                  <motion.div whileHover={{ x: 5 }}>
                    <FormControlLabel
                      value="light"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <LightMode />
                          <span>{t('light')}</span>
                        </Box>
                      }
                    />
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <FormControlLabel
                      value="dark"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <DarkMode />
                          <span>{t('dark')}</span>
                        </Box>
                      }
                    />
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <FormControlLabel
                      value="auto"
                      control={<Radio />}
                      label={t('auto')}
                    />
                  </motion.div>
                </RadioGroup>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Primary Color */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('primary_color')}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {themeColors.map((color) => (
                    <motion.div
                      key={color.value}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Tooltip title={color.name}>
                        <IconButton
                          onClick={() => handleThemeChange('primaryColor', color.value)}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: color.value,
                            border: theme.primaryColor === color.value ? '3px solid' : '2px solid transparent',
                            borderColor: theme.primaryColor === color.value ? 'text.primary' : 'transparent',
                            '&:hover': { 
                              bgcolor: color.value, 
                              opacity: 0.9,
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {theme.primaryColor === color.value && (
                            <Check sx={{ color: 'white', fontSize: 28 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    </motion.div>
                  ))}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Font Size */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('font_size')}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <FormatSize fontSize="small" />
                  <Slider
                    value={
                      uiSettings.theme?.fontSize === 'small' ? 0 :
                      uiSettings.theme?.fontSize === 'large' ? 2 : 1
                    }
                    onChange={(e, value) => {
                      const sizes = ['small', 'medium', 'large']
                      handleThemeChange('fontSize', sizes[value])
                    }}
                    min={0}
                    max={2}
                    step={1}
                    marks={[
                      { value: 0, label: t('small') },
                      { value: 1, label: t('medium') },
                      { value: 2, label: t('large') }
                    ]}
                    sx={{ flex: 1 }}
                  />
                  <FormatSize fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Layout Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <ViewCompact sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('density')}
              </Typography>
              
              {/* Density */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('density')}
                </Typography>
                <RadioGroup
                  value={uiSettings.theme?.density || 'comfortable'}
                  onChange={(e) => handleThemeChange('density', e.target.value)}
                >
                  <FormControlLabel
                    value="comfortable"
                    control={<Radio />}
                    label={
                      <Box>
<Typography variant="body2">{t('comfortable')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('comfortable_desc')}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="compact"
                    control={<Radio />}
                    label={
                      <Box>
<Typography variant="body2">{t('compact')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('compact_desc')}
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Sidebar Settings */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('sidebar')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary={t('collapse_default')}
                      secondary={t('collapse_default_desc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={uiSettings.sidebar?.collapsed || false}
                        onChange={(e) => handleSidebarChange('collapsed', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={t('show_labels')}
                      secondary={t('show_labels_desc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={uiSettings.sidebar?.showLabels !== false}
                        onChange={(e) => handleSidebarChange('showLabels', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Dashboard Widgets */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Dashboard sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('dashboard_customization')}
              </Typography>
              
              {/* Widgets Toggle */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('show_widgets')}
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  {t('widgets_desc')}
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {dashboardWidgets.map((widget) => (
                    <Grid item xs={12} sm={6} md={4} key={widget.key}>
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            border: uiSettings.dashboard?.widgets?.[widget.key] !== false ? '2px solid' : '1px solid',
                            borderColor: uiSettings.dashboard?.widgets?.[widget.key] !== false ? 'primary.main' : 'divider',
                            bgcolor: uiSettings.dashboard?.widgets?.[widget.key] !== false ? 'action.selected' : 'transparent'
                          }}
                          onClick={() => handleWidgetToggle(widget.key)}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={1}>
                              {widget.icon}
                              <Typography variant="body2">
                                {widget.label}
                              </Typography>
                            </Box>
                            {uiSettings.dashboard?.widgets?.[widget.key] !== false && (
                              <Check color="primary" />
                            )}
                          </Box>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Default Time Range */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {t('default_time_range')}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <Select
                    value={uiSettings.dashboard?.defaultTimeRange || 'week'}
                    onChange={(e) => handleDashboardChange('defaultTimeRange', e.target.value)}
                  >
                    <MenuItem value="today">{t('today')}</MenuItem>
                    <MenuItem value="week">{t('week')}</MenuItem>
                    <MenuItem value="month">{t('month')}</MenuItem>
                    <MenuItem value="quarter">{t('quarter')}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Language Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Language sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('language')}
              </Typography>
              
              <FormControl fullWidth size="small">
                <InputLabel>{t('language_display')}</InputLabel>
                <Select
                  value={uiSettings.language || 'vi'}
                  label={t('language_display')}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <MenuItem value="vi">{t('vietnamese')}</MenuItem>
                  <MenuItem value="en">{t('english')}</MenuItem>
                </Select>
              </FormControl>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  {t('language_note')}
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Preview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <Visibility sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('preview')}
              </Typography>
              
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  bgcolor: theme.mode === 'dark' ? 'grey.900' : 'grey.50',
                  color: theme.mode === 'dark' ? 'white' : 'text.primary'
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {t('interface')}: {theme.mode === 'dark' ? t('dark') : t('light')}
                </Typography>
                <Typography variant="body2" paragraph>
                  {t('preview_desc')}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip label={t('sample_chip')} color="primary" size="small" />
                  <Chip label={t('success')} color="success" size="small" />
                  <Chip label={t('warning')} color="warning" size="small" />
                </Box>
              </Paper>
              
              {showSuccessMsg && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {t('interface_updated')}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Info */}
      <Alert severity="info" sx={{ mt: 3 }} icon={<Info />}>
        <Typography variant="body2">
          <strong>{t('note')}:</strong> {t('note_theme')}
        </Typography>
      </Alert>
    </Box>
  )
}

export default UIPreferencesSettings
