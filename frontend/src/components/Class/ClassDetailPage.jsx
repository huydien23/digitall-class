import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Stack,
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
  Tab,
  Tabs,
  Alert,
  LinearProgress,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
  QrCode as QrCodeIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import classService from '../../services/classService'
import attendanceService from '../../services/attendanceService'
import gradeService from '../../services/gradeService'
import * as XLSX from 'xlsx'

const ClassDetailPage = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  
  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [classData, setClassData] = useState(null)
  const [students, setStudents] = useState([])
  const [attendanceSessions, setAttendanceSessions] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [grades, setGrades] = useState([])
  const [gradeTypes, setGradeTypes] = useState(['Điểm thường xuyên (10%)', 'Điểm giữa kỳ (30%)', 'Điểm cuối kỳ (60%)'])
  const [anchorEl, setAnchorEl] = useState(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Mock data for demo
  const mockAttendanceSessions = [
    { id: 1, session_name: 'Buổi 1', session_date: '2024-09-02', start_time: '07:00', end_time: '11:00' },
    { id: 2, session_name: 'Buổi 2', session_date: '2024-09-09', start_time: '07:00', end_time: '11:00' },
    { id: 3, session_name: 'Buổi 3', session_date: '2024-09-16', start_time: '07:00', end_time: '11:00' },
    { id: 4, session_name: 'Buổi 4', session_date: '2024-09-23', start_time: '07:00', end_time: '11:00' },
    { id: 5, session_name: 'Buổi 5', session_date: '2024-09-30', start_time: '07:00', end_time: '11:00' },
    { id: 6, session_name: 'Buổi 6', session_date: '2024-10-07', start_time: '07:00', end_time: '11:00' },
    { id: 7, session_name: 'Buổi 7', session_date: '2024-10-14', start_time: '07:00', end_time: '11:00' },
    { id: 8, session_name: 'Buổi 8', session_date: '2024-10-21', start_time: '07:00', end_time: '11:00' },
  ]

  const mockStudentsWithData = [
    {
      id: 1, student_id: '221222', name: 'Lê Văn Nhựt Anh', email: 'anh.le@student.edu.vn',
      attendance: { 1: true, 2: true, 3: false, 4: true, 5: true, 6: true, 7: false, 8: true },
      grades: { regular: 8.5, midterm: 7.5, final: 8.0 }
    },
    {
      id: 2, student_id: '222803', name: 'Trần Nguyễn Phương Anh', email: 'phuonganh.tran@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: false, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 9.0, midterm: 8.5, final: 8.5 }
    },
    {
      id: 3, student_id: '226969', name: 'Nguyễn Xuân Bách', email: 'bach.nguyen@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: false, 6: true, 7: true, 8: true },
      grades: { regular: 7.5, midterm: 8.0, final: 7.8 }
    },
    {
      id: 4, student_id: '221605', name: 'Huỳnh Thương Bảo', email: 'bao.huynh@student.edu.vn',
      attendance: { 1: false, 2: true, 3: true, 4: true, 5: true, 6: false, 7: true, 8: true },
      grades: { regular: 8.0, midterm: 7.0, final: 7.5 }
    },
    {
      id: 5, student_id: '221330', name: 'Thạch Văn Bảo', email: 'baothach@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: false },
      grades: { regular: 9.5, midterm: 9.0, final: 9.2 }
    },
    {
      id: 6, student_id: '222560', name: 'Nguyễn Tiến Chức', email: 'chuc.nguyen@student.edu.vn',
      attendance: { 1: true, 2: false, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 7.0, midterm: 7.5, final: 7.2 }
    },
    {
      id: 7, student_id: '223463', name: 'Đặng Thiên Chương', email: 'chuong.dang@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: false, 8: true },
      grades: { regular: 8.8, midterm: 8.2, final: 8.5 }
    },
    {
      id: 8, student_id: '220237', name: 'Nguyễn Đặng Hải Đăng', email: 'dang.nguyen@student.edu.vn',
      attendance: { 1: true, 2: true, 3: false, 4: false, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 6.5, midterm: 7.0, final: 6.8 }
    },
    {
      id: 9, student_id: '221761', name: 'Trần Tấn Đạt', email: 'dat.tran@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 7: true, 8: true },
      grades: { regular: 8.2, midterm: 8.5, final: 8.3 }
    },
    {
      id: 10, student_id: '223319', name: 'Nguyễn Thị Ngọc Diễm', email: 'diem.nguyen@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 9.2, midterm: 9.5, final: 9.3 }
    },
    {
      id: 11, student_id: '226514', name: 'Nguyễn Huy Điền', email: 'dien.nguyen@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 9.8, midterm: 9.5, final: 9.7 }
    },
    {
      id: 12, student_id: '220947', name: 'Trần Huỳnh Đức', email: 'duc.tran@student.edu.vn',
      attendance: { 1: false, 2: true, 3: true, 4: true, 5: false, 6: true, 7: true, 8: true },
      grades: { regular: 7.8, midterm: 8.0, final: 7.9 }
    }
  ]

  const mockClassData = {
    id: 1,
    class_id: '110101101010',
    class_name: 'Lập trình Python - DH22TIN06',
    description: 'Môn học lập trình Python cơ bản cho sinh viên năm 2',
    teacher: 'Đặng Mạnh Huy',
    max_students: 42,
    current_students: 56,
    is_active: true,
    schedule: 'Thứ 2: 07:00-11:00',
    location: 'Phòng 14-02 (Phòng máy 8)',
    subject: 'Lập trình Python',
    semester: 'Học kỳ 1 - 2024'
  }

  useEffect(() => {
    loadClassData()
  }, [classId])

  const loadClassData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to load real data from API first
      try {
        const response = await classService.getClassDetail(classId)
        const data = response.data
        
        setClassData(data.class)
        setStudents(data.students)
        setAttendanceSessions(data.attendance_sessions)
        
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError)
        // Fallback to mock data if API fails
        setClassData(mockClassData)
        setStudents(mockStudentsWithData)
        setAttendanceSessions(mockAttendanceSessions)
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load class data')
    } finally {
      setLoading(false)
    }
  }

  const calculateAttendanceRate = (student) => {
    const totalSessions = attendanceSessions.length
    const attendedSessions = Object.values(student.attendance).filter(Boolean).length
    return Math.round((attendedSessions / totalSessions) * 100)
  }

  const calculateFinalGrade = (student) => {
    const { regular, midterm, final } = student.grades
    return (regular * 0.1 + midterm * 0.3 + final * 0.6).toFixed(1)
  }

  const handleExportExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Student list sheet
    const studentData = students.map((student, index) => ({
      'STT': index + 1,
      'Mã SV': student.student_id,
      'Họ tên': student.name,
      'Email': student.email,
      'Tỷ lệ điểm danh': `${calculateAttendanceRate(student)}%`,
      'Điểm thường xuyên': student.grades.regular,
      'Điểm giữa kỳ': student.grades.midterm,
      'Điểm cuối kỳ': student.grades.final,
      'Điểm tổng kết': calculateFinalGrade(student)
    }))
    
    const ws1 = XLSX.utils.json_to_sheet(studentData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Danh sách sinh viên')
    
    // Attendance sheet
    const attendanceData = students.map((student, index) => {
      const row = {
        'STT': index + 1,
        'Mã SV': student.student_id,
        'Họ tên': student.name,
      }
      
      mockAttendanceSessions.forEach(session => {
        row[`${session.session_name} (${session.session_date})`] = student.attendance[session.id] ? 'Có mặt' : 'Vắng mặt'
      })
      
      row['Tỷ lệ điểm danh'] = `${calculateAttendanceRate(student)}%`
      return row
    })
    
    const ws2 = XLSX.utils.json_to_sheet(attendanceData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Bảng điểm danh')
    
    // Save file
    const fileName = `${classData.class_name}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEditGrade = (student) => {
    setSelectedStudent(student)
    setGradeDialogOpen(true)
    setAnchorEl(null)
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Đang tải dữ liệu lớp học...
            </Typography>
          </Box>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IconButton onClick={() => navigate('/classes')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <SchoolIcon />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700}>
              {classData.class_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Mã lớp: {classData.class_id} • {classData.schedule} • {classData.location}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
              color="success"
            >
              Xuất Excel
            </Button>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Class Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {classData.current_students}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sinh viên
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <CalendarIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {mockAttendanceSessions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Buổi học
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {Math.round(students.reduce((sum, student) => sum + calculateAttendanceRate(student), 0) / students.length)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điểm danh TB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <GradeIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {(students.reduce((sum, student) => sum + parseFloat(calculateFinalGrade(student)), 0) / students.length).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điểm TB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Danh sách sinh viên" />
          <Tab label="Bảng điểm danh" />
          <Tab label="Bảng điểm số" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách sinh viên ({students.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Mã SV</TableCell>
                      <TableCell>Họ tên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Tỷ lệ điểm danh</TableCell>
                      <TableCell align="center">Điểm TB</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => {
                      const attendanceRate = calculateAttendanceRate(student)
                      const finalGrade = calculateFinalGrade(student)
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                {student.name.split(' ').pop().charAt(0)}
                              </Avatar>
                              {student.name}
                            </Box>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              color={
                                attendanceRate >= 90 ? 'success.main' :
                                attendanceRate >= 80 ? 'warning.main' : 'error.main'
                              }
                              fontWeight={600}
                            >
                              {attendanceRate}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              color={
                                finalGrade >= 8.5 ? 'success.main' :
                                finalGrade >= 7.0 ? 'warning.main' : 'error.main'
                              }
                              fontWeight={600}
                            >
                              {finalGrade}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                attendanceRate >= 90 ? 'Xuất sắc' :
                                attendanceRate >= 80 ? 'Tốt' : 'Cần cải thiện'
                              }
                              color={
                                attendanceRate >= 90 ? 'success' :
                                attendanceRate >= 80 ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEditGrade(student)}
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bảng điểm danh theo buổi học
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 60, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>STT</TableCell>
                      <TableCell sx={{ minWidth: 100, position: 'sticky', left: 60, bgcolor: 'background.paper', zIndex: 1 }}>Mã SV</TableCell>
                      <TableCell sx={{ minWidth: 200, position: 'sticky', left: 160, bgcolor: 'background.paper', zIndex: 1 }}>Họ tên</TableCell>
                      {attendanceSessions.map(session => (
                        <TableCell key={session.id} align="center" sx={{ minWidth: 120 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {session.session_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.session_date}
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ minWidth: 100 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Tỷ lệ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>{index + 1}</TableCell>
                        <TableCell sx={{ position: 'sticky', left: 60, bgcolor: 'background.paper', zIndex: 1 }}>{student.student_id}</TableCell>
                        <TableCell sx={{ position: 'sticky', left: 160, bgcolor: 'background.paper', zIndex: 1 }}>{student.name}</TableCell>
                        {attendanceSessions.map(session => (
                          <TableCell key={session.id} align="center">
                            {student.attendance[session.id] ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <CancelIcon color="error" />
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            color={
                              calculateAttendanceRate(student) >= 90 ? 'success.main' :
                              calculateAttendanceRate(student) >= 80 ? 'warning.main' : 'error.main'
                            }
                            fontWeight={600}
                          >
                            {calculateAttendanceRate(student)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bảng điểm số theo môn học
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Mã SV</TableCell>
                      <TableCell>Họ tên</TableCell>
                      <TableCell align="center">Điểm thường xuyên (10%)</TableCell>
                      <TableCell align="center">Điểm giữa kỳ (30%)</TableCell>
                      <TableCell align="center">Điểm cuối kỳ (60%)</TableCell>
                      <TableCell align="center">Điểm tổng kết</TableCell>
                      <TableCell align="center">Xếp loại</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => {
                      const finalGrade = parseFloat(calculateFinalGrade(student))
                      const classification = 
                        finalGrade >= 9.0 ? 'Xuất sắc' :
                        finalGrade >= 8.0 ? 'Giỏi' :
                        finalGrade >= 7.0 ? 'Khá' :
                        finalGrade >= 5.5 ? 'Trung bình' : 'Yếu'
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600}>
                              {student.grades.regular}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600}>
                              {student.grades.midterm}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600}>
                              {student.grades.final}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              color={
                                finalGrade >= 8.5 ? 'success.main' :
                                finalGrade >= 7.0 ? 'warning.main' : 'error.main'
                              }
                              fontWeight={600}
                            >
                              {finalGrade}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={classification}
                              color={
                                finalGrade >= 8.5 ? 'success' :
                                finalGrade >= 7.0 ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEditGrade(student)}
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => setQrDialogOpen(true)}>
          <ListItemIcon>
            <QrCodeIcon />
          </ListItemIcon>
          <ListItemText>Tạo QR điểm danh</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText>Gửi email thông báo</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText>Cài đặt lớp học</ListItemText>
        </MenuItem>
      </Menu>

      {/* QR Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo QR Code điểm danh</DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={4}>
            <QrCodeIcon sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              QR Code điểm danh - {classData.class_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Sinh viên quét mã này để điểm danh buổi học hôm nay
            </Typography>
            <Alert severity="info">
              <strong>Demo:</strong> Tính năng QR Code đang được phát triển
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Đóng</Button>
          <Button variant="contained">Tạo QR Code</Button>
        </DialogActions>
      </Dialog>

      {/* Grade Edit Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa điểm - {selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Điểm thường xuyên (10%)"
              type="number"
              fullWidth
              defaultValue={selectedStudent?.grades.regular}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
            />
            <TextField
              label="Điểm giữa kỳ (30%)"
              type="number"
              fullWidth
              defaultValue={selectedStudent?.grades.midterm}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
            />
            <TextField
              label="Điểm cuối kỳ (60%)"
              type="number"
              fullWidth
              defaultValue={selectedStudent?.grades.final}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => {
            setGradeDialogOpen(false)
            alert('Điểm đã được cập nhật!')
          }}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add session"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setQrDialogOpen(true)}
      >
        <QrCodeIcon />
      </Fab>
    </Container>
  )
}

export default ClassDetailPage
