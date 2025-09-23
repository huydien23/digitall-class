import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material'
import {
  ExpandMore,
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  Dashboard,
  People,
  Class,
  Grade,
  EventAvailable,
  Storage,
  Api,
  Security,
  Speed,
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const SystemStatus = () => {
  const [refreshing, setRefreshing] = useState(false)

  // Mock system status data - in real app, this would come from API
  const systemStatus = {
    overall: 'healthy', // healthy, warning, error
    lastUpdated: new Date().toLocaleString('vi-VN'),
    services: {
      backend: { status: 'online', url: 'http://localhost:8000', responseTime: '45ms' },
      frontend: { status: 'online', url: 'http://localhost:3001', responseTime: '12ms' },
      database: { status: 'online', type: 'SQLite', size: '2.4 MB' },
    },
    features: {
      authentication: { status: 'working', lastTest: '2 phút trước' },
      studentManagement: { status: 'working', lastTest: '5 phút trước' },
      classManagement: { status: 'working', lastTest: '3 phút trước' },
      gradeManagement: { status: 'working', lastTest: '1 phút trước' },
      attendance: { status: 'working', lastTest: '4 phút trước' },
    },
    statistics: {
      totalStudents: 25,
      activeClasses: 8,
      totalGrades: 156,
      attendanceSessions: 42,
      uptime: '99.8%',
    },
    recentChanges: [
      { time: '10 phút trước', action: 'Thêm tính năng Enhanced Frontend' },
      { time: '15 phút trước', action: 'Cập nhật Error Boundaries' },
      { time: '20 phút trước', action: 'Thêm Notification System' },
      { time: '25 phút trước', action: 'Cải thiện Form Validation' },
    ]
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'working':
      case 'healthy':
        return 'success'
      case 'warning':
        return 'warning'
      case 'offline':
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'working':
      case 'healthy':
        return <CheckCircle />
      case 'warning':
        return <Warning />
      case 'offline':
      case 'error':
        return <Error />
      default:
        return <Info />
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trạng thái hệ thống
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Đang cập nhật...' : 'Làm mới'}
        </Button>
      </Box>

      {/* Overall Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert
          severity={getStatusColor(systemStatus.overall)}
          sx={{ mb: 3 }}
          icon={getStatusIcon(systemStatus.overall)}
        >
          <Typography variant="h6">
            Hệ thống đang hoạt động {systemStatus.overall === 'healthy' ? 'bình thường' : 'có vấn đề'}
          </Typography>
          <Typography variant="body2">
            Cập nhật lần cuối: {systemStatus.lastUpdated}
          </Typography>
        </Alert>
      </motion.div>

      {/* Statistics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Thống kê tổng quan
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4">{systemStatus.statistics.totalStudents}</Typography>
                  <Typography variant="body2" color="text.secondary">Sinh viên</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Class sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4">{systemStatus.statistics.activeClasses}</Typography>
                  <Typography variant="body2" color="text.secondary">Lớp học</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Grade sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4">{systemStatus.statistics.totalGrades}</Typography>
                  <Typography variant="body2" color="text.secondary">Điểm số</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Speed sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4">{systemStatus.statistics.uptime}</Typography>
                  <Typography variant="body2" color="text.secondary">Uptime</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Detailed Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Paper sx={{ mb: 3 }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Api />
                <Typography variant="h6">Dịch vụ hệ thống</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(systemStatus.services.backend.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Backend API"
                    secondary={`${systemStatus.services.backend.url} - Phản hồi: ${systemStatus.services.backend.responseTime}`}
                  />
                  <Chip
                    label={systemStatus.services.backend.status}
                    color={getStatusColor(systemStatus.services.backend.status)}
                    size="small"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(systemStatus.services.frontend.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary="Frontend"
                    secondary={`${systemStatus.services.frontend.url} - Phản hồi: ${systemStatus.services.frontend.responseTime}`}
                  />
                  <Chip
                    label={systemStatus.services.frontend.status}
                    color={getStatusColor(systemStatus.services.frontend.status)}
                    size="small"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <Storage />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cơ sở dữ liệu"
                    secondary={`${systemStatus.services.database.type} - Kích thước: ${systemStatus.services.database.size}`}
                  />
                  <Chip
                    label={systemStatus.services.database.status}
                    color={getStatusColor(systemStatus.services.database.status)}
                    size="small"
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Dashboard />
                <Typography variant="h6">Tính năng ứng dụng</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {Object.entries(systemStatus.features).map(([feature, data], index) => (
                  <React.Fragment key={feature}>
                    <ListItem>
                      <ListItemIcon>
                        {getStatusIcon(data.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={feature === 'authentication' ? 'Xác thực' :
                                feature === 'studentManagement' ? 'Quản lý sinh viên' :
                                feature === 'classManagement' ? 'Quản lý lớp học' :
                                feature === 'gradeManagement' ? 'Quản lý điểm số' :
                                feature === 'attendance' ? 'Điểm danh' : feature}
                        secondary={`Kiểm tra lần cuối: ${data.lastTest}`}
                      />
                      <Chip
                        label={data.status === 'working' ? 'Hoạt động' : data.status}
                        color={getStatusColor(data.status)}
                        size="small"
                      />
                    </ListItem>
                    {index < Object.entries(systemStatus.features).length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Info />
                <Typography variant="h6">Thay đổi gần đây</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {systemStatus.recentChanges.map((change, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={change.action}
                        secondary={change.time}
                      />
                    </ListItem>
                    {index < systemStatus.recentChanges.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </motion.div>
    </Box>
  )
}

export default SystemStatus
