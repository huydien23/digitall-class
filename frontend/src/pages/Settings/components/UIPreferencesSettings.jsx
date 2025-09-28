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

const UIPreferencesSettings = () => {
  const dispatch = useDispatch()
  const { settings, hasChanges } = useSelector(state => state.teacherSettings)
  const uiSettings = settings?.ui || {}
  const theme = useTheme()
  
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
    { key: 'todaySessions', label: 'Phiên học hôm nay', icon: <Dashboard /> },
    { key: 'myClasses', label: 'Lớp của tôi', icon: <Dashboard /> },
    { key: 'attendanceStats', label: 'Thống kê điểm danh', icon: <Dashboard /> },
    { key: 'recentActivities', label: 'Hoạt động gần đây', icon: <Dashboard /> },
    { key: 'quickActions', label: 'Thao tác nhanh', icon: <Dashboard /> }
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
                Chủ đề giao diện
              </Typography>
              
              {/* Theme Mode */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Chế độ giao diện
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
                          <span>Sáng</span>
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
                          <span>Tối</span>
                        </Box>
                      }
                    />
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }}>
                    <FormControlLabel
                      value="auto"
                      control={<Radio />}
                      label="Tự động (theo hệ thống)"
                    />
                  </motion.div>
                </RadioGroup>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Primary Color */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Màu chủ đạo
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
                  Kích thước chữ
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
                      { value: 0, label: 'Nhỏ' },
                      { value: 1, label: 'Vừa' },
                      { value: 2, label: 'Lớn' }
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
                Bố cục giao diện
              </Typography>
              
              {/* Density */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Mật độ hiển thị
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
                        <Typography variant="body2">Thoải mái</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Khoảng cách lớn, dễ đọc
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="compact"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2">Compact</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hiển thị nhiều thông tin hơn
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
                  Thanh bên (Sidebar)
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Thu gọn mặc định"
                      secondary="Sidebar sẽ thu gọn khi mở trang"
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
                      primary="Hiển thị nhãn"
                      secondary="Hiển thị tên bên cạnh icon"
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
                Tùy chỉnh Dashboard
              </Typography>
              
              {/* Widgets Toggle */}
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Hiển thị widget
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Chọn các widget sẽ hiển thị trên Dashboard
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
                  Phạm vi thời gian mặc định
                </Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <Select
                    value={uiSettings.dashboard?.defaultTimeRange || 'week'}
                    onChange={(e) => handleDashboardChange('defaultTimeRange', e.target.value)}
                  >
                    <MenuItem value="today">Hôm nay</MenuItem>
                    <MenuItem value="week">Tuần này</MenuItem>
                    <MenuItem value="month">Tháng này</MenuItem>
                    <MenuItem value="quarter">Quý này</MenuItem>
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
                Ngôn ngữ
              </Typography>
              
              <FormControl fullWidth size="small">
                <InputLabel>Ngôn ngữ hiển thị</InputLabel>
                <Select
                  value={uiSettings.language || 'vi'}
                  label="Ngôn ngữ hiển thị"
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <MenuItem value="vi">Tiếng Việt</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="ja">日本語</MenuItem>
                  <MenuItem value="ko">한국어</MenuItem>
                  <MenuItem value="zh-CN">简体中文</MenuItem>
                  <MenuItem value="th">ไทย</MenuItem>
                  <MenuItem value="id">Bahasa Indonesia</MenuItem>
                </Select>
              </FormControl>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Ngôn ngữ hiển thị sẽ được áp dụng dần (một số phần có thể chưa dịch hoàn toàn).
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
                Xem trước
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
                  Giao diện {theme.mode === 'dark' ? 'tối' : 'sáng'}
                </Typography>
                <Typography variant="body2" paragraph>
                  Đây là ví dụ về giao diện với các cài đặt hiện tại của bạn.
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip label="Chíp mẫu" color="primary" size="small" />
                  <Chip label="Thành công" color="success" size="small" />
                  <Chip label="Cảnh báo" color="warning" size="small" />
                </Box>
              </Paper>
              
              {showSuccessMsg && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Giao diện đã được cập nhật!
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Info */}
      <Alert severity="info" sx={{ mt: 3 }} icon={<Info />}>
        <Typography variant="body2">
          <strong>Lưu ý:</strong> Một số thay đổi giao diện sẽ được áp dụng ngay lập tức, 
          một số khác cần tải lại trang để hiệu lực hoàn toàn.
        </Typography>
      </Alert>
    </Box>
  )
}

export default UIPreferencesSettings
