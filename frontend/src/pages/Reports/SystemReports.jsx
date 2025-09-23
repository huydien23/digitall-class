import React, { useState } from 'react'
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

  // Mock data for reports
  const mockData = {
    attendanceStats: [
      { month: 'T9', attendance: 85, target: 90 },
      { month: 'T10', attendance: 88, target: 90 },
      { month: 'T11', attendance: 92, target: 90 },
      { month: 'T12', attendance: 89, target: 90 }
    ],
    gradeDistribution: [
      { name: 'A (9.0-10)', value: 15, color: '#4caf50' },
      { name: 'B (8.0-8.9)', value: 25, color: '#8bc34a' },
      { name: 'C (7.0-7.9)', value: 30, color: '#ffc107' },
      { name: 'D (6.0-6.9)', value: 20, color: '#ff9800' },
      { name: 'F (<6.0)', value: 10, color: '#f44336' }
    ],
    systemUsage: [
      { time: '00:00', users: 5 },
      { time: '06:00', users: 15 },
      { time: '08:00', users: 45 },
      { time: '10:00', users: 38 },
      { time: '12:00', users: 25 },
      { time: '14:00', users: 42 },
      { time: '16:00', users: 35 },
      { time: '18:00', users: 20 },
      { time: '20:00', users: 12 },
      { time: '22:00', users: 8 }
    ],
    topClasses: [
      { name: 'Lập trình Python', attendance: 95, avgGrade: 8.2, students: 56 },
      { name: 'Cơ sở dữ liệu', attendance: 89, avgGrade: 7.8, students: 38 },
      { name: 'Mạng máy tính', attendance: 92, avgGrade: 8.0, students: 35 },
      { name: 'Trí tuệ nhân tạo', attendance: 87, avgGrade: 7.5, students: 28 }
    ],
    teacherPerformance: [
      { name: 'Đặng Mạnh Huy', classes: 3, students: 120, avgGrade: 8.5, attendance: 94 },
      { name: 'Nguyễn Văn A', classes: 2, students: 80, avgGrade: 7.8, attendance: 89 },
      { name: 'Trần Thị B', classes: 1, students: 35, avgGrade: 8.0, attendance: 92 },
      { name: 'Lê Văn C', classes: 1, students: 28, avgGrade: 7.5, attendance: 87 }
    ],
    systemHealth: {
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%',
      activeUsers: 45,
      totalRequests: 1250,
      databaseSize: '2.3GB'
    },
    recentActivities: [
      { action: 'Đăng nhập', user: 'Đặng Mạnh Huy', time: '08:30', type: 'info' },
      { action: 'Nhập điểm', user: 'Nguyễn Văn A', time: '09:15', type: 'success' },
      { action: 'Tạo lớp mới', user: 'Admin', time: '10:00', type: 'info' },
      { action: 'Lỗi hệ thống', user: 'System', time: '10:30', type: 'error' },
      { action: 'Xuất báo cáo', user: 'Admin', time: '11:00', type: 'success' }
    ]
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
                    <LineChart data={mockData.attendanceStats}>
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
                        data={mockData.gradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockData.gradeDistribution.map((entry, index) => (
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
                        {mockData.topClasses.map((classItem, index) => (
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
                    <BarChart data={mockData.gradeDistribution}>
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
                    {mockData.teacherPerformance.map((teacher, index) => (
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
                    <LineChart data={mockData.systemUsage}>
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
                        secondary={mockData.systemHealth.uptime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimeIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Thời gian phản hồi"
                        secondary={mockData.systemHealth.responseTime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Tỷ lệ lỗi"
                        secondary={mockData.systemHealth.errorRate}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PeopleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Người dùng hoạt động"
                        secondary={mockData.systemHealth.activeUsers}
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
                    {mockData.recentActivities.map((activity, index) => (
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
