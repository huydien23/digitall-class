import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Room as RoomIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material'

const ScheduleManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)

  // Mock data for schedules - Based on real subjects and teachers
  const mockSchedules = [
    {
      id: 1,
      subject: 'Lập trình Python',
      subjectCode: 'DH22TIN06',
      teacher: 'Đặng Mạnh Huy',
      teacherId: 1,
      room: 'Phòng =I4-02',
      building: 'Tòa nhà I',
      dayOfWeek: 2, // Thứ 2
      startTime: '07:00',
      endTime: '11:00',
      duration: 240, // 4 tiết
      type: 'Thực hành',
      semester: 'Học kỳ 1 - 2024',
      isActive: true,
      maxStudents: 42,
      currentStudents: 56,
      created_at: '2024-09-01T00:00:00Z',
      conflicts: []
    },
    {
      id: 2,
      subject: 'Pháp luật về công nghệ thông tin',
      subjectCode: 'DH22TIN06',
      teacher: 'Trần Minh Tâm',
      teacherId: 2,
      room: 'Phòng = T4-01',
      building: 'Tòa nhà T',
      dayOfWeek: 3, // Thứ 3
      startTime: '13:00',
      endTime: '17:00',
      duration: 240, // 4 tiết
      type: 'Lý thuyết',
      semester: 'Học kỳ 1 - 2024',
      isActive: true,
      maxStudents: 40,
      currentStudents: 38,
      created_at: '2024-09-01T00:00:00Z',
      conflicts: []
    },
    {
      id: 3,
      subject: 'Lập trình thiết bị di động',
      subjectCode: 'DH22TIN08',
      teacher: 'Đoàn Chí Trung',
      teacherId: 3,
      room: 'Phòng =I6-03',
      building: 'Tòa nhà I',
      dayOfWeek: 4, // Thứ 4
      startTime: '08:00',
      endTime: '12:00',
      duration: 240, // 4 tiết
      type: 'Thực hành',
      semester: 'Học kỳ 1 - 2024',
      isActive: true,
      maxStudents: 35,
      currentStudents: 45,
      created_at: '2024-09-01T00:00:00Z',
      conflicts: []
    },
    {
      id: 4,
      subject: 'Lịch sử Đảng cộng sản Việt Nam',
      subjectCode: 'DH22TIN06',
      teacher: 'Đinh Cao Tín',
      teacherId: 4,
      room: 'Phòng = D4-01',
      building: 'Hội trường D',
      dayOfWeek: 5, // Thứ 5
      startTime: '14:00',
      endTime: '18:00',
      duration: 240, // 4 tiết
      type: 'Lý thuyết',
      semester: 'Học kỳ 1 - 2024',
      isActive: true,
      maxStudents: 50,
      currentStudents: 50,
      created_at: '2024-09-01T00:00:00Z',
      conflicts: []
    },
    {
      id: 5,
      subject: 'Phát triển phần mềm mã nguồn mở',
      subjectCode: 'DH22TIN06',
      teacher: 'Võ Thanh Vinh',
      teacherId: 5,
      room: 'Phòng = I4-02',
      building: 'Tòa nhà I',
      dayOfWeek: 6, // Thứ 6
      startTime: '08:00',
      endTime: '12:00',
      duration: 240, // 4 tiết
      type: 'Lý thuyết + Thực hành',
      semester: 'Học kỳ 1 - 2024',
      isActive: true,
      maxStudents: 40,
      currentStudents: 40,
      created_at: '2024-09-01T00:00:00Z',
      conflicts: []
    }
  ]

  const activeSchedules = mockSchedules.filter(s => s.isActive)
  const inactiveSchedules = mockSchedules.filter(s => !s.isActive)
  const conflictedSchedules = mockSchedules.filter(s => s.conflicts.length > 0)

  const getDayName = (dayOfWeek) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[dayOfWeek]
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Thực hành': return 'primary'
      case 'Lý thuyết': return 'success'
      case 'Lý thuyết + Thực hành': return 'warning'
      default: return 'default'
    }
  }

  const handleCreateSchedule = () => {
    setSelectedSchedule(null)
    setScheduleDialogOpen(true)
  }

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule)
    setEditDialogOpen(true)
  }

  const handleDeleteSchedule = (scheduleId) => {
    // Handle delete schedule
    console.log('Delete schedule:', scheduleId)
  }

  const handleToggleSchedule = (scheduleId) => {
    // Handle toggle schedule active status
    console.log('Toggle schedule:', scheduleId)
  }

  const ScheduleCard = ({ schedule }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: getTypeColor(schedule.type) }}>
              <ScheduleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{schedule.subject}</Typography>
              <Typography variant="body2" color="text.secondary">
                {schedule.subjectCode} - {schedule.teacher}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip 
                  label={schedule.type} 
                  color={getTypeColor(schedule.type)}
                  size="small"
                />
                <Chip 
                  label={schedule.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  color={schedule.isActive ? 'success' : 'default'}
                  size="small"
                />
                {schedule.conflicts.length > 0 && (
                  <Chip 
                    label="Xung đột" 
                    color="error"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              onClick={() => handleEditSchedule(schedule)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteSchedule(schedule.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
            <FormControlLabel
              control={
                <Switch
                  checked={schedule.isActive}
                  onChange={() => handleToggleSchedule(schedule.id)}
                />
              }
              label=""
            />
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon fontSize="small" color="primary" />
              <Typography variant="body2">
                {getDayName(schedule.dayOfWeek)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <TimeIcon fontSize="small" color="secondary" />
              <Typography variant="body2">
                {schedule.startTime} - {schedule.endTime}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <RoomIcon fontSize="small" color="info" />
              <Typography variant="body2">
                {schedule.room} ({schedule.building})
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon fontSize="small" color="warning" />
              <Typography variant="body2">
                {schedule.currentStudents}/{schedule.maxStudents} sinh viên
              </Typography>
            </Box>
          </Grid>
        </Grid>
        {schedule.conflicts.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Xung đột:</strong> {schedule.conflicts.join(', ')}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  )

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Quản lý thời khóa biểu
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tạo, sửa và quản lý lịch học cho toàn trường
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab 
              label={`Tất cả (${mockSchedules.length})`} 
              icon={<ScheduleIcon />}
            />
            <Tab 
              label={`Đang hoạt động (${activeSchedules.length})`} 
              icon={<CheckCircleIcon />}
            />
            <Tab 
              label={`Tạm dừng (${inactiveSchedules.length})`} 
              icon={<WarningIcon />}
            />
            <Tab 
              label={`Xung đột (${conflictedSchedules.length})`} 
              icon={<WarningIcon />}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSchedule}
          >
            Tạo lịch học mới
          </Button>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={2}>
            {mockSchedules.map((schedule) => (
              <Grid item xs={12} md={6} key={schedule.id}>
                <ScheduleCard schedule={schedule} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={2}>
            {activeSchedules.map((schedule) => (
              <Grid item xs={12} md={6} key={schedule.id}>
                <ScheduleCard schedule={schedule} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={2}>
            {inactiveSchedules.map((schedule) => (
              <Grid item xs={12} md={6} key={schedule.id}>
                <ScheduleCard schedule={schedule} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Grid container spacing={2}>
            {conflictedSchedules.map((schedule) => (
              <Grid item xs={12} md={6} key={schedule.id}>
                <ScheduleCard schedule={schedule} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>

      {/* Create/Edit Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSchedule ? 'Chỉnh sửa lịch học' : 'Tạo lịch học mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên môn học"
                placeholder="VD: Lập trình Python"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã môn học"
                placeholder="VD: DH22TIN06"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Giảng viên</InputLabel>
                <Select>
                  <MenuItem value="huy">Đặng Mạnh Huy</MenuItem>
                  <MenuItem value="tam">Trần Minh Tâm</MenuItem>
                  <MenuItem value="trung">Đoàn Chí Trung</MenuItem>
                  <MenuItem value="tin">Đinh Cao Tín</MenuItem>
                  <MenuItem value="vinh">Võ Thanh Vinh</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Loại lớp</InputLabel>
                <Select>
                  <MenuItem value="thuchanh">Thực hành</MenuItem>
                  <MenuItem value="lythuyet">Lý thuyết</MenuItem>
                  <MenuItem value="both">Lý thuyết + Thực hành</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Thứ trong tuần</InputLabel>
                <Select>
                  <MenuItem value={2}>Thứ 2</MenuItem>
                  <MenuItem value={3}>Thứ 3</MenuItem>
                  <MenuItem value={4}>Thứ 4</MenuItem>
                  <MenuItem value={5}>Thứ 5</MenuItem>
                  <MenuItem value={6}>Thứ 6</MenuItem>
                  <MenuItem value={7}>Thứ 7</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Giờ bắt đầu"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Giờ kết thúc"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
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
                label="Tòa nhà"
                placeholder="VD: Phòng máy 8"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số sinh viên tối đa"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Học kỳ</InputLabel>
                <Select>
                  <MenuItem value="hk1-2024">Học kỳ 1 - 2024</MenuItem>
                  <MenuItem value="hk2-2024">Học kỳ 2 - 2024</MenuItem>
                  <MenuItem value="hk1-2025">Học kỳ 1 - 2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Hủy</Button>
          <Button variant="contained">
            {selectedSchedule ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ScheduleManagement
