import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  TablePagination,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material'
import {
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Today as TodayIcon
} from '@mui/icons-material'

const AttendanceManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Mock data for attendance sessions
  const mockAttendanceSessions = [
    {
      id: 1,
      classId: 'DH22TIN06',
      className: 'Lập trình Python - DH22TIN06',
      teacher: 'Đặng Mạnh Huy',
      room: 'D1-01',
      date: '2024-12-16',
      time: '07:00-11:00',
      status: 'completed',
      totalStudents: 56,
      presentStudents: 52,
      absentStudents: 4,
      lateStudents: 2,
      attendanceRate: 92.9,
      qrCode: 'QR_001_20241216_0700',
      notes: 'Buổi học bình thường, có 2 sinh viên đi muộn'
    },
    {
      id: 2,
      classId: 'DH22TIN07',
      className: 'Pháp luật về công nghệ thông tin - DH22TIN07',
      teacher: 'Trần Minh Tâm',
      room: 'T1-01',
      date: '2024-12-16',
      time: '13:00-17:00',
      status: 'in_progress',
      totalStudents: 38,
      presentStudents: 35,
      absentStudents: 3,
      lateStudents: 1,
      attendanceRate: 92.1,
      qrCode: 'QR_002_20241216_1300',
      notes: 'Đang trong giờ học'
    },
    {
      id: 3,
      classId: 'DH22TIN08',
      className: 'Lập trình thiết bị di động - DH22TIN08',
      teacher: 'Đoàn Chí Trung',
      room: 'I2-01',
      date: '2024-12-15',
      time: '08:00-12:00',
      status: 'completed',
      totalStudents: 45,
      presentStudents: 42,
      absentStudents: 3,
      lateStudents: 0,
      attendanceRate: 93.3,
      qrCode: 'QR_003_20241215_0800',
      notes: 'Tất cả sinh viên có mặt đúng giờ'
    },
    {
      id: 4,
      classId: 'DH22TIN09',
      className: 'Lịch sử Đảng cộng sản Việt Nam - DH22TIN09',
      teacher: 'Đinh Cao Tín',
      room: 'D2-01',
      date: '2024-12-15',
      time: '14:00-18:00',
      status: 'completed',
      totalStudents: 50,
      presentStudents: 48,
      absentStudents: 2,
      lateStudents: 1,
      attendanceRate: 96.0,
      qrCode: 'QR_004_20241215_1400',
      notes: 'Tỷ lệ điểm danh cao'
    },
    {
      id: 5,
      classId: 'DH22TIN10',
      className: 'Phát triển phần mềm mã nguồn mở - DH22TIN10',
      teacher: 'Võ Thanh Vinh',
      room: 'I3-01',
      date: '2024-12-14',
      time: '08:00-12:00',
      status: 'completed',
      totalStudents: 40,
      presentStudents: 38,
      absentStudents: 2,
      lateStudents: 0,
      attendanceRate: 95.0,
      qrCode: 'QR_005_20241214_0800',
      notes: 'Buổi học thực hành tốt'
    }
  ]

  // Mock data for student attendance details
  const mockStudentAttendance = [
    {
      id: 1,
      studentId: '221222',
      studentName: 'Lê Văn Nhựt Anh',
      className: 'Lập trình Python - DH22TIN06',
      date: '2024-12-16',
      time: '07:00-11:00',
      status: 'present',
      checkInTime: '06:58',
      checkOutTime: '11:05',
      notes: 'Có mặt đúng giờ'
    },
    {
      id: 2,
      studentId: '222803',
      studentName: 'Trần Nguyễn Phương Anh',
      className: 'Lập trình Python - DH22TIN06',
      date: '2024-12-16',
      time: '07:00-11:00',
      status: 'late',
      checkInTime: '07:15',
      checkOutTime: '11:10',
      notes: 'Đi muộn 15 phút'
    },
    {
      id: 3,
      studentId: '226969',
      studentName: 'Nguyễn Xuân Bách',
      className: 'Lập trình Python - DH22TIN06',
      date: '2024-12-16',
      time: '07:00-11:00',
      status: 'absent',
      checkInTime: null,
      checkOutTime: null,
      notes: 'Vắng mặt không phép'
    },
    {
      id: 4,
      studentId: '221605',
      studentName: 'Huỳnh Thương Bảo',
      className: 'Pháp luật về công nghệ thông tin - DH22TIN07',
      date: '2024-12-16',
      time: '13:00-17:00',
      status: 'present',
      checkInTime: '12:58',
      checkOutTime: '17:02',
      notes: 'Có mặt đúng giờ'
    },
    {
      id: 5,
      studentId: '221330',
      studentName: 'Thạch Văn Bảo',
      className: 'Pháp luật về công nghệ thông tin - DH22TIN07',
      date: '2024-12-16',
      time: '13:00-17:00',
      status: 'present',
      checkInTime: '12:55',
      checkOutTime: '17:00',
      notes: 'Có mặt đúng giờ'
    }
  ]

  const filteredSessions = mockAttendanceSessions.filter(session => {
    const matchesSearch = session.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.room.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === 'all' || session.classId === filterClass
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    const matchesDate = !filterDate || session.date === filterDate
    
    return matchesSearch && matchesClass && matchesStatus && matchesDate
  })

  const filteredStudents = mockStudentAttendance.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.className.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === 'all' || student.className.includes(filterClass)
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    const matchesDate = !filterDate || student.date === filterDate
    
    return matchesSearch && matchesClass && matchesStatus && matchesDate
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success'
      case 'late': return 'warning'
      case 'absent': return 'error'
      case 'completed': return 'success'
      case 'in_progress': return 'warning'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Có mặt'
      case 'late': return 'Đi muộn'
      case 'absent': return 'Vắng mặt'
      case 'completed': return 'Hoàn thành'
      case 'in_progress': return 'Đang diễn ra'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  const handleViewDetails = (session) => {
    setSelectedAttendance(session)
    setAttendanceDialogOpen(true)
  }

  const handleExportAttendance = () => {
    console.log('Exporting attendance data...')
  }

  const handlePrintAttendance = () => {
    console.log('Printing attendance report...')
  }

  const AttendanceSessionCard = ({ session }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {session.className}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <PersonIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              {session.teacher}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <LocationIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              {session.room}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <CalendarIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              {session.date} - {session.time}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            <Chip 
              label={getStatusText(session.status)} 
              color={getStatusColor(session.status)}
              size="small"
            />
            <Typography variant="h6" color="primary">
              {session.attendanceRate}%
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="success.main">
                {session.presentStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Có mặt
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="error.main">
                {session.absentStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vắng mặt
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="warning.main">
                {session.lateStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đi muộn
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main">
                {session.totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            QR Code: {session.qrCode}
          </Typography>
          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={() => handleViewDetails(session)}>
              <ViewIcon />
            </IconButton>
            <IconButton size="small" onClick={() => console.log('Edit session:', session.id)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => console.log('Delete session:', session.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>
            Quản lý điểm danh
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportAttendance}
            >
              Xuất báo cáo
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintAttendance}
            >
              In báo cáo
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => console.log('Create new attendance session')}
            >
              Tạo buổi điểm danh
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi điểm danh sinh viên
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm lớp học, giảng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Lớp học</InputLabel>
                <Select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <MenuItem value="all">Tất cả lớp</MenuItem>
                  <MenuItem value="DH22TIN06">Lập trình Python</MenuItem>
                  <MenuItem value="DH22TIN07">Pháp luật CNTT</MenuItem>
                  <MenuItem value="DH22TIN08">Lập trình di động</MenuItem>
                  <MenuItem value="DH22TIN09">Lịch sử Đảng</MenuItem>
                  <MenuItem value="DH22TIN10">Phần mềm mã nguồn mở</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="completed">Hoàn thành</MenuItem>
                  <MenuItem value="in_progress">Đang diễn ra</MenuItem>
                  <MenuItem value="cancelled">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Ngày"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSearchTerm('')
                  setFilterClass('all')
                  setFilterStatus('all')
                  setFilterDate('')
                }}
              >
                Làm mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab 
              label={`Buổi điểm danh (${filteredSessions.length})`} 
              icon={<ScheduleIcon />}
            />
            <Tab 
              label={`Chi tiết sinh viên (${filteredStudents.length})`} 
              icon={<PersonIcon />}
            />
            <Tab 
              label="Thống kê" 
              icon={<AssessmentIcon />}
            />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {filteredSessions.map((session) => (
            <AttendanceSessionCard key={session.id} session={session} />
          ))}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Tên sinh viên</TableCell>
                  <TableCell>Lớp học</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Giờ vào</TableCell>
                  <TableCell>Giờ ra</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.className}</TableCell>
                      <TableCell>{student.date}</TableCell>
                      <TableCell>{student.checkInTime || '-'}</TableCell>
                      <TableCell>{student.checkOutTime || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(student.status)} 
                          color={getStatusColor(student.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{student.notes}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => console.log('Edit student:', student.id)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredStudents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
            />
          </TableContainer>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê tổng quan
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <TodayIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tổng số buổi điểm danh" 
                        secondary="25 buổi"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <GroupIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tỷ lệ điểm danh trung bình" 
                        secondary="94.2%"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sinh viên có mặt" 
                        secondary="1,180 lượt"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CancelIcon color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sinh viên vắng mặt" 
                        secondary="72 lượt"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top lớp có tỷ lệ điểm danh cao
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Lịch sử Đảng cộng sản Việt Nam" 
                        secondary="96.0% - 48/50 sinh viên"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Phát triển phần mềm mã nguồn mở" 
                        secondary="95.0% - 38/40 sinh viên"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Lập trình thiết bị di động" 
                        secondary="93.3% - 42/45 sinh viên"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Lập trình Python" 
                        secondary="92.9% - 52/56 sinh viên"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Attendance Details Dialog */}
      <Dialog open={attendanceDialogOpen} onClose={() => setAttendanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết buổi điểm danh - {selectedAttendance?.className}
        </DialogTitle>
        <DialogContent>
          {selectedAttendance && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Giảng viên: {selectedAttendance.teacher}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phòng: {selectedAttendance.room}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày: {selectedAttendance.date}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian: {selectedAttendance.time}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>
                Danh sách sinh viên
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã SV</TableCell>
                      <TableCell>Tên sinh viên</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Giờ vào</TableCell>
                      <TableCell>Ghi chú</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockStudentAttendance
                      .filter(student => student.className === selectedAttendance.className)
                      .map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.studentName}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusText(student.status)} 
                              color={getStatusColor(student.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{student.checkInTime || '-'}</TableCell>
                          <TableCell>{student.notes}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialogOpen(false)}>Đóng</Button>
          <Button variant="contained" onClick={() => console.log('Export details')}>
            Xuất chi tiết
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default AttendanceManagement
