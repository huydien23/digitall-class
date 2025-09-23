import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Alert,
  LinearProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  CalendarToday as CalendarIcon,
  PersonAdd as PersonAddIcon,
  Class as ClassIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material'
import { useAdminMockData } from '../../components/Dashboard/AdminMockDataProvider'

const ProductionAdminDashboard = () => {
  const { mockData, isLoading, refreshData } = useAdminMockData()
  const [selectedTab, setSelectedTab] = useState(0)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [classAssignmentDialogOpen, setClassAssignmentDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Đang tải dữ liệu hệ thống...
        </Typography>
      </Container>
    )
  }

  if (!mockData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Không thể tải dữ liệu hệ thống. Vui lòng thử lại.
        </Alert>
      </Container>
    )
  }

  const { systemStats, teachers, classes, scheduleTemplates, gradeManagement, systemReports, notifications } = mockData

  const StatCard = ({ title, value, icon, color, description, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
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

  const SystemHealthCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trạng thái hệ thống
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleIcon color="success" />
              <Typography>Hệ thống</Typography>
            </Box>
            <Chip label="Khỏe mạnh" color="success" size="small" />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <BarChartIcon color="primary" />
              <Typography>API</Typography>
            </Box>
            <Chip label="Online" color="success" size="small" />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <AssessmentIcon color="info" />
              <Typography>Cơ sở dữ liệu</Typography>
            </Box>
            <Chip label="Kết nối" color="success" size="small" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const QuickActionsCard = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thao tác nhanh
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setScheduleDialogOpen(true)}
              sx={{ mb: 1 }}
            >
              Quản lý thời khóa biểu
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<GradeIcon />}
              onClick={() => setGradeDialogOpen(true)}
              sx={{ mb: 1 }}
            >
              Nhập điểm cuối kỳ
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<ClassIcon />}
              onClick={() => setClassAssignmentDialogOpen(true)}
              sx={{ mb: 1 }}
            >
              Sắp lớp giảng viên
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAddIcon />}
              sx={{ mb: 1 }}
            >
              Duyệt tài khoản
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  const NotificationsCard = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Thông báo hệ thống
          </Typography>
          <Badge badgeContent={notifications.filter(n => !n.isRead).length} color="error">
            <NotificationsIcon />
          </Badge>
        </Box>
        <List>
          {notifications.slice(0, 3).map((notification) => (
            <ListItem key={notification.id} divider>
              <ListItemAvatar>
                <Avatar>
                  {notification.type === 'warning' && <WarningIcon color="warning" />}
                  {notification.type === 'info' && <InfoIcon color="info" />}
                  {notification.type === 'success' && <CheckCircleIcon color="success" />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                secondary={notification.message}
              />
              {!notification.isRead && (
                <Chip label="Mới" color="error" size="small" />
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )

  const GradeManagementCard = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Quản lý điểm số
          </Typography>
          <Chip 
            label={`${gradeManagement.pendingFinalGrades} lớp cần nhập điểm cuối kỳ`} 
            color="warning" 
          />
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Lớp học</TableCell>
                <TableCell>Giảng viên</TableCell>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gradeManagement.classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>{classItem.name}</TableCell>
                  <TableCell>{classItem.teacher}</TableCell>
                  <TableCell>{classItem.students_count}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Chip 
                        label="10%" 
                        color={classItem.grading_status.regular_10_percent === 'completed' ? 'success' : 'default'}
                        size="small"
                      />
                      <Chip 
                        label="30%" 
                        color={classItem.grading_status.midterm_30_percent === 'completed' ? 'success' : 'default'}
                        size="small"
                      />
                      <Chip 
                        label="60%" 
                        color={classItem.grading_status.final_60_percent === 'completed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<GradeIcon />}
                      onClick={() => setGradeDialogOpen(true)}
                    >
                      Nhập điểm
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const ScheduleManagementCard = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            Quản lý thời khóa biểu
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setScheduleDialogOpen(true)}
          >
            Thêm mới
          </Button>
        </Box>
        <List>
          {scheduleTemplates.slice(0, 3).map((schedule) => (
            <ListItem key={schedule.id} divider>
              <ListItemAvatar>
                <Avatar>
                  <CalendarIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={schedule.subject}
                secondary={`${schedule.teacher} - ${schedule.schedule} - ${schedule.room}`}
              />
              <ListItemSecondaryAction>
                <Box display="flex" gap={1}>
                  <Chip 
                    label={schedule.isActive ? 'Hoạt động' : 'Tạm dừng'} 
                    color={schedule.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý toàn bộ hệ thống và giám sát hoạt động
        </Typography>
      </Box>

      {/* System Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng người dùng"
            value={systemStats.totalUsers}
            icon={<PeopleIcon />}
            color="primary.main"
            description="Tất cả người dùng hệ thống"
            trend={5.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sinh viên"
            value={systemStats.totalStudents}
            icon={<SchoolIcon />}
            color="success.main"
            description="Sinh viên đang hoạt động"
            trend={3.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Giảng viên"
            value={systemStats.totalTeachers}
            icon={<AssignmentIcon />}
            color="info.main"
            description="Giảng viên đang hoạt động"
            trend={1.8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lớp học"
            value={systemStats.totalClasses}
            icon={<ClassIcon />}
            color="warning.main"
            description="Lớp học đang hoạt động"
            trend={-2.3}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Grade Management */}
            <Grid item xs={12}>
              <GradeManagementCard />
            </Grid>
            
            {/* Schedule Management */}
            <Grid item xs={12}>
              <ScheduleManagementCard />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* System Health */}
            <Grid item xs={12}>
              <SystemHealthCard />
            </Grid>
            
            {/* Quick Actions */}
            <Grid item xs={12}>
              <QuickActionsCard />
            </Grid>
            
            {/* Notifications */}
            <Grid item xs={12}>
              <NotificationsCard />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Dialogs */}
      {/* Schedule Management Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Quản lý thời khóa biểu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Cập nhật thời khóa biểu cho tất cả giảng viên và sinh viên
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Môn học</InputLabel>
                <Select value="">
                  <MenuItem value="python">Lập trình Python</MenuItem>
                  <MenuItem value="database">Cơ sở dữ liệu</MenuItem>
                  <MenuItem value="network">Mạng máy tính</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Giảng viên</InputLabel>
                <Select value="">
                  <MenuItem value="huy">Đặng Mạnh Huy</MenuItem>
                  <MenuItem value="a">Nguyễn Văn A</MenuItem>
                  <MenuItem value="b">Trần Thị B</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phòng học"
                placeholder="VD: Phòng 14-02"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Thời gian"
                placeholder="VD: Thứ 2: 07:00-11:00"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Hủy</Button>
          <Button variant="contained">Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>

      {/* Grade Management Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Nhập điểm cuối kỳ (60%)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Chỉ admin mới có quyền nhập điểm cuối kỳ. Giảng viên chỉ có thể nhập điểm thường xuyên (10%) và giữa kỳ (30%).
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã sinh viên</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Điểm thường xuyên (10%)</TableCell>
                  <TableCell>Điểm giữa kỳ (30%)</TableCell>
                  <TableCell>Điểm cuối kỳ (60%)</TableCell>
                  <TableCell>Tổng kết</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>221222</TableCell>
                  <TableCell>Lê Văn Nhựt Anh</TableCell>
                  <TableCell>8.5</TableCell>
                  <TableCell>7.8</TableCell>
                  <TableCell>
                    <TextField size="small" type="number" placeholder="Nhập điểm" />
                  </TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>222803</TableCell>
                  <TableCell>Trần Nguyễn Phương Anh</TableCell>
                  <TableCell>9.0</TableCell>
                  <TableCell>8.2</TableCell>
                  <TableCell>
                    <TextField size="small" type="number" placeholder="Nhập điểm" />
                  </TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Hủy</Button>
          <Button variant="contained">Lưu điểm số</Button>
        </DialogActions>
      </Dialog>

      {/* Class Assignment Dialog */}
      <Dialog open={classAssignmentDialogOpen} onClose={() => setClassAssignmentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sắp lớp cho giảng viên</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Phân công giảng viên dạy các lớp học
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lớp học</InputLabel>
                <Select value="">
                  <MenuItem value="python">Lập trình Python - DH22TIN06</MenuItem>
                  <MenuItem value="database">Cơ sở dữ liệu - DH22TIN05</MenuItem>
                  <MenuItem value="network">Mạng máy tính - DH22TIN04</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Giảng viên</InputLabel>
                <Select value="">
                  <MenuItem value="huy">Đặng Mạnh Huy</MenuItem>
                  <MenuItem value="a">Nguyễn Văn A</MenuItem>
                  <MenuItem value="b">Trần Thị B</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={3}
                placeholder="Ghi chú về việc phân công lớp..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClassAssignmentDialogOpen(false)}>Hủy</Button>
          <Button variant="contained">Phân công lớp</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ProductionAdminDashboard
