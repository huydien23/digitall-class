import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Computer as ComputerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const SystemReports = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [dateRange, setDateRange] = useState('month')
  const [selectedSemester, setSelectedSemester] = useState('hk1-2024')

  // State for report data
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState({
    attendanceStats: [],
    gradeDistribution: [],
    systemUsage: [],
    topClasses: [],
    teacherPerformance: [],
    systemHealth: {
      uptime: '0%',
      responseTime: '0ms',
      errorRate: '0%',
      activeUsers: 0,
      totalRequests: 0,
      databaseSize: '0GB'
    },
    recentActivities: []
  })

  // Load data on mount
  useEffect(() => {
    loadReportData()
  }, [dateRange, selectedSemester])

  const loadReportData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API calls
      // const response = await reportService.getSystemReports({ dateRange, selectedSemester })
      // setReportData(response.data)
      
      // For now, set empty data
      setReportData({
        attendanceStats: [],
        gradeDistribution: [],
        systemUsage: [],
        topClasses: [],
        teacherPerformance: [],
        systemHealth: {
          uptime: '99.9%',
          responseTime: '120ms',
          errorRate: '0.1%',
          activeUsers: 0,
          totalRequests: 0,
          databaseSize: '0GB'
        },
        recentActivities: []
      })
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box display="flex" alignItems="center" mt={1}>
            {trend > 0 ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : (
              <TrendingDownIcon color="error" fontSize="small" />
            )}
            <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
              {Math.abs(trend)}% so với tháng trước
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon color="success" />
      case 'error': return <ErrorIcon color="error" />
      case 'warning': return <WarningIcon color="warning" />
      default: return <CheckCircleIcon color="info" />
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Báo cáo hệ thống
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Thống kê và báo cáo chi tiết về hoạt động hệ thống
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Khoảng thời gian</InputLabel>
                <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  <MenuItem value="week">Tuần này</MenuItem>
                  <MenuItem value="month">Tháng này</MenuItem>
                  <MenuItem value="quarter">Quý này</MenuItem>
                  <MenuItem value="year">Năm này</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Học kỳ</InputLabel>
                <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                  <MenuItem value="hk1-2024">Học kỳ 1 - 2024</MenuItem>
                  <MenuItem value="hk2-2024">Học kỳ 2 - 2024</MenuItem>
                  <MenuItem value="hk1-2025">Học kỳ 1 - 2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box display="flex" gap={1}>
                <Button variant="outlined" startIcon={<DownloadIcon />}>
                  Xuất Excel
                </Button>
                <Button variant="outlined" startIcon={<PrintIcon />}>
                  In báo cáo
                </Button>
                <Button variant="outlined" startIcon={<EmailIcon />}>
                  Gửi email
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab label="Tổng quan" icon={<BarChartIcon />} />
            <Tab label="Điểm danh" icon={<AssignmentIcon />} />
            <Tab label="Điểm số" icon={<GradeIcon />} />
            <Tab label="Giảng viên" icon={<PeopleIcon />} />
            <Tab label="Hệ thống" icon={<ComputerIcon />} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng người dùng"
                value="156"
                icon={<PeopleIcon />}
                color="primary.main"
                trend={5.2}
                subtitle="+8 người dùng mới"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tỷ lệ điểm danh"
                value="89.5%"
                icon={<AssignmentIcon />}
                color="success.main"
                trend={3.1}
                subtitle="Mục tiêu: 90%"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Điểm TB"
                value="7.8"
                icon={<GradeIcon />}
                color="info.main"
                trend={1.8}
                subtitle="Thang điểm 10"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Uptime"
                value="99.9%"
                icon={<ComputerIcon />}
                color="warning.main"
                trend={0.1}
                subtitle="Hệ thống ổn định"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Xu hướng điểm danh theo tháng
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.attendanceStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="attendance" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Phân bố điểm số
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.gradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Attendance Tab */}
        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Lớp học có tỷ lệ điểm danh cao nhất
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Lớp học</TableCell>
                          <TableCell>Tỷ lệ điểm danh</TableCell>
                          <TableCell>Sinh viên</TableCell>
                          <TableCell>Điểm TB</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.topClasses.map((classItem, index) => (
                          <TableRow key={index}>
                            <TableCell>{classItem.name}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={classItem.attendance} 
                                  sx={{ width: 100 }}
                                />
                                <Typography variant="body2">
                                  {classItem.attendance}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{classItem.students}</TableCell>
                            <TableCell>{classItem.avgGrade}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê điểm danh
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Tổng buổi học"
                        secondary="45 buổi"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Tỷ lệ điểm danh TB"
                        secondary="89.5%"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Lớp đạt mục tiêu"
                        secondary="3/4 lớp"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Xu hướng"
                        secondary="Tăng 3.1%"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Grades Tab */}
        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Phân bố điểm số chi tiết
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê điểm số
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Điểm trung bình"
                        secondary="7.8/10"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Điểm cao nhất"
                        secondary="9.5/10"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Điểm thấp nhất"
                        secondary="4.2/10"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Tỷ lệ đạt"
                        secondary="85%"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Teachers Tab */}
        <TabPanel value={selectedTab} index={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hiệu suất giảng viên
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Giảng viên</TableCell>
                      <TableCell>Số lớp</TableCell>
                      <TableCell>Sinh viên</TableCell>
                      <TableCell>Điểm TB</TableCell>
                      <TableCell>Tỷ lệ điểm danh</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.teacherPerformance.map((teacher, index) => (
                      <TableRow key={index}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.classes}</TableCell>
                        <TableCell>{teacher.students}</TableCell>
                        <TableCell>{teacher.avgGrade}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={teacher.attendance} 
                              sx={{ width: 100 }}
                            />
                            <Typography variant="body2">
                              {teacher.attendance}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* System Tab */}
        <TabPanel value={selectedTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sử dụng hệ thống theo giờ
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.systemUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trạng thái hệ thống
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Uptime"
                        secondary={reportData.systemHealth.uptime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Thời gian phản hồi"
                        secondary={reportData.systemHealth.responseTime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tỷ lệ lỗi"
                        secondary={reportData.systemHealth.errorRate}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PeopleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Người dùng hoạt động"
                        secondary={reportData.systemHealth.activeUsers}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hoạt động gần đây
                  </Typography>
                  <List>
                    {reportData.recentActivities.map((activity, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.action}
                          secondary={`${activity.user} - ${activity.time}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
    </Container>
  )
}

export default SystemReports

