import React, { useState, useEffect } from 'react'
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
  TablePagination
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
  CalendarToday as CalendarIcon
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import attendanceService from '../../services/attendanceService'
import StudentCheckInDialog from '../../components/Attendance/StudentCheckInDialog'

const StudentAttendanceView = () => {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await attendanceService.getAttendances({
          student_id: user?.student_id || user?.id,
          page_size: 500
        })
        const list = res.data?.results || res.data || []
        setRecords(list)
      } catch (e) {
        setRecords([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id, user?.student_id])

  const attendanceRecords = records
  
  // Get unique subjects for filter
  const subjects = [...new Set(attendanceRecords.map(record => record.session?.class_obj?.class_name).filter(Boolean))]
  
  // Filter records
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.session?.class_obj?.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.session?.class_obj?.teacher?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.session?.class_obj?.teacher?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.session?.session_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus
    const matchesSubject = filterSubject === 'all' || record.session?.class_obj?.class_name === filterSubject
    
    return matchesSearch && matchesStatus && matchesSubject
  })

  // Calculate statistics
  const totalRecords = attendanceRecords.length
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <ScheduleIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Lịch sử điểm danh
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Theo dõi lịch sử điểm danh của tất cả các môn học
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<QrCodeIcon />}
            size="large"
            onClick={() => setCheckInOpen(true)}
          >
            Điểm danh QR
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {attendanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ điểm danh
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {presentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Có mặt
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {lateCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đi muộn
                  </Typography>
                </Box>
                <AccessTimeIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {absentCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vắng mặt
                  </Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm môn học, giảng viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Môn học</InputLabel>
              <Select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                label="Môn học"
              >
                <MenuItem value="all">Tất cả môn học</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="present">Có mặt</MenuItem>
                <MenuItem value="absent">Vắng mặt</MenuItem>
                <MenuItem value="late">Đi muộn</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setFilterSubject('all')
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Attendance Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Chi tiết điểm danh ({filteredRecords.length} bản ghi)
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Môn học</TableCell>
                  <TableCell>Buổi học</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Địa điểm</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {record.session?.class_obj?.class_name || 'Unknown Subject'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.session?.class_obj?.teacher ? 
                            `${record.session.class_obj.teacher.first_name} ${record.session.class_obj.teacher.last_name}`.trim() : 
                            'Unknown Teacher'
                          }
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.session?.session_name || 'Unknown Session'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.session?.session_date ? 
                          new Date(record.session.session_date).toLocaleDateString('vi-VN') :
                          record.check_in_time ?
                            new Date(record.check_in_time).toLocaleDateString('vi-VN') :
                            'N/A'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {record.session?.start_time && record.session?.end_time ? 
                          `${record.session.start_time.slice(0,5)} - ${record.session.end_time.slice(0,5)}` :
                          record.check_in_time ? 
                            new Date(record.check_in_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) :
                            'N/A'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.status === 'present' ? 'Có mặt' : record.status === 'absent' ? 'Vắng mặt' : record.status === 'late' ? 'Đi muộn' : record.status}
                        color={record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {record.session?.location || 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredRecords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </CardContent>
      </Card>

      {/* Check-in Dialog */}
      <StudentCheckInDialog
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        studentCode={user?.student_id || user?.id}
        onSuccess={() => setCheckInOpen(false)}
      />
    </Container>
  )
}

const Attendance = () => {
  const { user } = useSelector((state) => state.auth)
  const userRole = user?.role || 'student'

  // For students, show detailed attendance view
  if (userRole === 'student') {
    return (
      <StudentAttendanceView />
    )
  }

  // For admin/teacher, keep same view for now
  return (
    <StudentAttendanceView />
  )
}

export default Attendance