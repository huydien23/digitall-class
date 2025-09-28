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

const QRAttendanceSettings = () => {
  const dispatch = useDispatch()
  const { settings } = useSelector(state => state.teacherSettings)
  
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
                  Nhấn "Lưu cài đặt" để lưu thay đổi
                </Typography>
              }
            >
              <Typography variant="body2">
                Cài đặt đã thay đổi!
              </Typography>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Info Alert */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Các cài đặt này sẽ được áp dụng mặc định cho tất cả phiên điểm danh mới. 
          Bạn vẫn có thể thay đổi riêng cho từng phiên khi cần.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* QR Code Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <QrCode2 sx={{ verticalAlign: 'middle', mr: 1 }} />
                Cài đặt QR Code
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
                    primary="Tự động làm mới QR"
                    secondary={
                      <Box>
                        <Typography variant="caption">
                          Mã QR sẽ tự động thay đổi sau {qrSettings.autoRefreshInterval || 5} phút
                        </Typography>
                        <Slider
                          value={qrSettings.autoRefreshInterval || 5}
                          onChange={(e, value) => handleQRSettingChange('autoRefreshInterval', value)}
                          min={1}
                          max={15}
                          step={1}
                          marks={[
                            { value: 1, label: '1p' },
                            { value: 5, label: '5p' },
                            { value: 10, label: '10p' },
                            { value: 15, label: '15p' }
                          ]}
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
                    primary="Thời hạn QR Code"
                    secondary={
                      <Box>
                        <Typography variant="caption">
                          Mã QR hết hạn sau {qrSettings.validityDuration || 15} phút kể từ khi tạo
                        </Typography>
                        <Slider
                          value={qrSettings.validityDuration || 15}
                          onChange={(e, value) => handleQRSettingChange('validityDuration', value)}
                          min={5}
                          max={60}
                          step={5}
                          marks={[
                            { value: 10, label: '10p' },
                            { value: 15, label: '15p' },
                            { value: 30, label: '30p' },
                            { value: 60, label: '60p' }
                          ]}
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
                    primary="Mức độ bảo mật"
                    secondary="Kiểm soát mức độ xác thực khi điểm danh"
                  />
                  <ListItemSecondaryAction>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={qrSettings.securityLevel || 'medium'}
                        onChange={(e) => handleQRSettingChange('securityLevel', e.target.value)}
                      >
                        <MenuItem value="low">Thấp</MenuItem>
                        <MenuItem value="medium">Trung bình</MenuItem>
                        <MenuItem value="high">Cao</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                {/* Allow Manual Code */}
                <ListItem>
                  <ListItemText
                    primary="Cho phép nhập mã thủ công"
                    secondary="Sinh viên có thể nhập mã nếu không quét được QR"
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
                Quy tắc điểm danh
              </Typography>

              <Grid container spacing={2}>
                {/* Late Threshold */}
                <Grid item xs={12}>
                  <TextField
                    label="Ngưỡng đi trễ"
                    type="number"
                    value={attendanceRules.lateThreshold || 15}
                    onChange={(e) => handleRuleChange('lateThreshold', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    helperText="Sau thời gian này tính là đi trễ"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">phút</InputAdornment>
                    }}
                  />
                </Grid>

                {/* Absent Threshold */}
                <Grid item xs={12}>
                  <TextField
                    label="Ngưỡng vắng mặt"
                    type="number"
                    value={attendanceRules.absentThreshold || 30}
                    onChange={(e) => handleRuleChange('absentThreshold', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    helperText="Sau thời gian này tính là vắng"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">phút</InputAdornment>
                    }}
                  />
                </Grid>

                {/* Grace Time */}
                <Grid item xs={12}>
                  <TextField
                    label="Thời gian ân hạn"
                    type="number"
                    value={attendanceRules.graceTime || 10}
                    onChange={(e) => handleRuleChange('graceTime', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    helperText="Thời gian cho phép điểm danh trước giờ học"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">phút</InputAdornment>
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
                    label="Tự động đóng phiên khi hết giờ"
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
                Bảo mật điểm danh
              </Typography>

              <Grid container spacing={3}>
                {/* Location Settings */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationOn color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Xác thực vị trí
                      </Typography>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={attendanceRules.requireLocation || false}
                          onChange={(e) => handleRuleChange('requireLocation', e.target.checked)}
                        />
                      }
                      label="Yêu cầu xác thực vị trí"
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      label="Bán kính cho phép"
                      type="number"
                      value={attendanceRules.locationRadius || 50}
                      onChange={(e) => handleRuleChange('locationRadius', parseInt(e.target.value))}
                      disabled={!attendanceRules.requireLocation}
                      fullWidth
                      size="small"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mét</InputAdornment>
                      }}
                    />
                    
                    {attendanceRules.requireLocation && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="caption">
                          Sinh viên phải trong phạm vi {attendanceRules.locationRadius}m từ phòng học
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
                        Giới hạn thiết bị
                      </Typography>
                    </Box>

                    <TextField
                      label="Số thiết bị tối đa/sinh viên"
                      type="number"
                      value={attendanceRules.maxDevicesPerStudent || 2}
                      onChange={(e) => handleRuleChange('maxDevicesPerStudent', parseInt(e.target.value))}
                      fullWidth
                      size="small"
                      helperText="Giới hạn số thiết bị mỗi sinh viên có thể dùng"
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
                      label="Chặn điểm danh trùng lặp"
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
                Phiên học mặc định
              </Typography>

              <Grid container spacing={3}>
                {/* Session Templates */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Mẫu phiên học
                  </Typography>
                  <Box display="flex" gap={2}>
                    {templates.map((template) => (
                      <Chip
                        key={template.id}
                        label={template.name}
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
                    label="Thời lượng mặc định"
                    type="number"
                    value={sessionDefaults.duration || 120}
                    onChange={(e) => handleSessionDefaultChange('duration', parseInt(e.target.value))}
                    fullWidth
                    size="small"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">phút</InputAdornment>
                    }}
                  />
                </Grid>

                {/* Default Location */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vị trí mặc định"
                    value={sessionDefaults.location || ''}
                    onChange={(e) => handleSessionDefaultChange('location', e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="VD: Phòng 14-02"
                  />
                </Grid>
              </Grid>

              {/* Template Preview */}
              <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Xem trước cài đặt mặc định:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">QR tự động làm mới</Typography>
                    <Typography variant="body2">{qrSettings.autoRefreshInterval || 5} phút</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Thời hạn QR</Typography>
                    <Typography variant="body2">{qrSettings.validityDuration || 15} phút</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Ngưỡng trễ</Typography>
                    <Typography variant="body2">{attendanceRules.lateThreshold || 15} phút</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Bảo mật</Typography>
                    <Typography variant="body2">
                      {qrSettings.securityLevel === 'high' ? 'Cao' : 
                       qrSettings.securityLevel === 'low' ? 'Thấp' : 'Trung bình'}
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