import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material'
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Devices as DevicesIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import attendanceSecurityService from '../../services/attendanceSecurityService'

const SecurityDashboard = ({ classId = null }) => {
  const [tabValue, setTabValue] = useState(0)
  const [timeRange, setTimeRange] = useState('24h')
  const [securityReport, setSecurityReport] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSecurityReport()
  }, [timeRange, classId])

  const loadSecurityReport = async () => {
    setLoading(true)
    try {
      const report = attendanceSecurityService.getSuspiciousActivitiesReport(classId, timeRange)
      setSecurityReport(report)
    } catch (error) {
      console.error('Failed to load security report:', error)
    }
    setLoading(false)
  }

  const handleViewDetail = (activity) => {
    setSelectedActivity(activity)
    setDetailDialogOpen(true)
  }

  const getRiskLevelColor = (riskScore) => {
    if (riskScore >= 90) return 'error'
    if (riskScore >= 70) return 'warning'
    if (riskScore >= 50) return 'info'
    return 'success'
  }

  const getRiskLevelText = (riskScore) => {
    if (riskScore >= 90) return 'Rất cao'
    if (riskScore >= 70) return 'Cao'
    if (riskScore >= 50) return 'Trung bình'
    return 'Thấp'
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN')
  }

  const SecurityStatsCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h3" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography color="textSecondary" variant="body2">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard Bảo mật
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Theo dõi hoạt động đáng nghi trong hệ thống điểm danh
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Thời gian</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Thời gian"
          >
            <MenuItem value="1h">1 giờ qua</MenuItem>
            <MenuItem value="24h">24 giờ qua</MenuItem>
            <MenuItem value="7d">7 ngày qua</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Statistics Cards */}
      {securityReport && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SecurityStatsCard
              title="Tổng cảnh báo"
              value={securityReport.total}
              icon={<SecurityIcon sx={{ fontSize: 40 }} />}
              color="primary"
              subtitle="Hoạt động đáng nghi"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SecurityStatsCard
              title="Mức độ cao"
              value={securityReport.highRisk}
              icon={<ErrorIcon sx={{ fontSize: 40 }} />}
              color="error"
              subtitle="Cần xử lý ngay"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SecurityStatsCard
              title="Mức độ trung bình"
              value={securityReport.mediumRisk}
              icon={<WarningIcon sx={{ fontSize: 40 }} />}
              color="warning"
              subtitle="Cần theo dõi"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SecurityStatsCard
              title="Tỷ lệ an toàn"
              value={`${Math.round(((securityReport.total - securityReport.highRisk) / Math.max(securityReport.total, 1)) * 100)}%`}
              icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
              color="success"
              subtitle="Hoạt động bình thường"
            />
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Hoạt động đáng nghi" />
            <Tab label="Phân tích xu hướng" />
            <Tab label="Cài đặt bảo mật" />
          </Tabs>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Box mt={3}>
              {securityReport?.activities?.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Sinh viên</TableCell>
                        <TableCell>Mức độ rủi ro</TableCell>
                        <TableCell>Lý do</TableCell>
                        <TableCell>Vị trí</TableCell>
                        <TableCell align="center">Hành động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {securityReport.activities.map((activity, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          component="tr"
                        >
                          <TableCell>
                            {formatTimestamp(activity.timestamp)}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon fontSize="small" />
                              {activity.studentId}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${activity.riskScore}/100 - ${getRiskLevelText(activity.riskScore)}`}
                              color={getRiskLevelColor(activity.riskScore)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              {activity.reasons.slice(0, 2).map((reason, i) => (
                                <Typography key={i} variant="body2" color="text.secondary">
                                  • {reason}
                                </Typography>
                              ))}
                              {activity.reasons.length > 2 && (
                                <Typography variant="body2" color="primary">
                                  +{activity.reasons.length - 2} lý do khác
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {activity.location ? (
                              <Tooltip title={`${activity.location.latitude}, ${activity.location.longitude}`}>
                                <Chip
                                  icon={<LocationIcon />}
                                  label={`±${Math.round(activity.location.accuracy || 0)}m`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Không xác định
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Xem chi tiết">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetail(activity)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chặn IP">
                              <IconButton size="small" color="error">
                                <BlockIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={8}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Không có hoạt động đáng nghi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hệ thống hoạt động bình thường trong khoảng thời gian này
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box mt={3}>
              <Alert severity="info">
                Tính năng phân tích xu hướng sẽ được cung cấp trong phiên bản tiếp theo.
              </Alert>
            </Box>
          )}

          {tabValue === 2 && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Cài đặt kiểm tra bảo mật
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Kiểm tra vị trí
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bán kính cho phép: 100m từ phòng học
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Giới hạn tần suất
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tối đa 5 lần thử/phút từ cùng IP
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Thời gian điểm danh
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        15 phút trước - 30 phút sau giờ học
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Device Fingerprint
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Theo dõi thiết bị không khớv với lần trước
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết hoạt động đáng nghi
        </DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sinh viên
                  </Typography>
                  <Typography variant="body1">
                    {selectedActivity.studentId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Thời gian
                  </Typography>
                  <Typography variant="body1">
                    {formatTimestamp(selectedActivity.timestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Điểm rủi ro
                  </Typography>
                  <Chip
                    label={`${selectedActivity.riskScore}/100`}
                    color={getRiskLevelColor(selectedActivity.riskScore)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Session ID
                  </Typography>
                  <Typography variant="body1">
                    {selectedActivity.sessionId}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Chi tiết lý do
              </Typography>
              <List>
                {selectedActivity.reasons.map((reason, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={reason}
                      secondary={`Lý do ${index + 1}`}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedActivity.location && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin vị trí
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Latitude: {selectedActivity.location.latitude}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Longitude: {selectedActivity.location.longitude}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Độ chính xác: ±{Math.round(selectedActivity.location.accuracy || 0)}m
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {selectedActivity.deviceInfo && (
                <Box mt={2}>
                  <Typography variant="h6" gutterBottom>
                    Thông tin thiết bị
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      IP: {selectedActivity.deviceInfo.ip}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User Agent: {selectedActivity.deviceInfo.userAgent?.substring(0, 100)}...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Screen: {selectedActivity.deviceInfo.screen}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Platform: {selectedActivity.deviceInfo.platform}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Đóng
          </Button>
          <Button variant="contained" color="error">
            Chặn IP này
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SecurityDashboard