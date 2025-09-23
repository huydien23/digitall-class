import React, { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Badge,
  Fab,
  useTheme,
  useMediaQuery,
  alpha,
  LinearProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as OtherIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  CloudUpload as CloudUploadIcon,
  GetApp as GetAppIcon,
  Assessment as StatsIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'

import StudentForm from '../../components/Form/StudentForm'
import ExcelDragDrop from '../../components/ExcelDragDrop/ExcelDragDrop'
import studentService from '../../services/studentService'

const Students = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useSelector((state) => state.auth)

  // State management
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')
  
  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterGender, setFilterGender] = useState('all')
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [excelDialogOpen, setExcelDialogOpen] = useState(false)
  const [statsDialogOpen, setStatsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  
  // Action menu
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  
  // Statistics
  const [statistics, setStatistics] = useState(null)

  // Load students data
  const loadStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm || undefined,
      }
      
      const response = await studentService.getStudents(params)
      const data = response.data
      
      setStudents(data.results || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load students:', err)
      setError(err.response?.data?.message || 'Không thể tải danh sách sinh viên')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, searchTerm])

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      const response = await studentService.getStudentStatistics()
      setStatistics(response.data)
    } catch (err) {
      console.error('Failed to load statistics:', err)
    }
  }, [])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0) // Reset to first page when searching
      loadStudents()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Event handlers
  const handleAddStudent = () => {
    setEditingStudent(null)
    setFormDialogOpen(true)
  }

  const handleEditStudent = (student) => {
    setEditingStudent(student)
    setFormDialogOpen(true)
  }

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sinh viên ${student.full_name}?`)) {
      try {
        await studentService.deleteStudent(student.id)
        setSuccess(`Đã xóa sinh viên ${student.full_name}`)
        loadStudents()
        loadStatistics()
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể xóa sinh viên')
      }
    }
  }

  const handleFormSuccess = () => {
    setFormDialogOpen(false)
    setSuccess(editingStudent ? 'Cập nhật sinh viên thành công' : 'Thêm sinh viên thành công')
    loadStudents()
    loadStatistics()
  }

  const handleExcelSuccess = () => {
    setExcelDialogOpen(false)
    setSuccess('Import Excel thành công')
    loadStudents()
    loadStatistics()
  }

  const handleExportExcel = async () => {
    try {
      const response = await studentService.exportStudents()
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'students_export.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setSuccess('Export Excel thành công')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể export Excel')
    }
  }

  const handleActionMenuOpen = (event, student) => {
    setAnchorEl(event.currentTarget)
    setSelectedStudent(student)
  }

  const handleActionMenuClose = () => {
    setAnchorEl(null)
    setSelectedStudent(null)
  }

  // Filter students based on status and gender
  const filteredStudents = students.filter(student => {
    if (filterStatus !== 'all' && student.is_active !== (filterStatus === 'active')) {
      return false
    }
    if (filterGender !== 'all' && student.gender !== filterGender) {
      return false
    }
    return true
  })

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'male': return <MaleIcon color="primary" />
      case 'female': return <FemaleIcon color="secondary" />
      default: return <OtherIcon color="action" />
    }
  }

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male': return 'Nam'
      case 'female': return 'Nữ'
      default: return 'Khác'
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Helmet>
        <title>Quản lý sinh viên - Hệ thống quản lý sinh viên</title>
      </Helmet>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Quản lý sinh viên
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý thông tin và hồ sơ sinh viên
          </Typography>
        </Box>

        {/* Statistics Cards */}
        {statistics && (
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{statistics.total_students}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng sinh viên
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                      <ActiveIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{statistics.active_students}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đang hoạt động
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                      <CalendarIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{statistics.recent_registrations}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đăng ký gần đây
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                      <StatsIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{statistics.completion_rate}%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hoàn thiện hồ sơ
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Actions Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {isMobile ? (
              <Box>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm sinh viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Trạng thái"
                      >
                        <MenuItem value="all">Tất cả</MenuItem>
                        <MenuItem value="active">Hoạt động</MenuItem>
                        <MenuItem value="inactive">Không hoạt động</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                        label="Giới tính"
                      >
                        <MenuItem value="all">Tất cả</MenuItem>
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box display="flex" gap={1} mt={2}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadStudents}
                    size="small"
                    sx={{ flex: 1 }}
                  >
                    Làm mới
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddStudent}
                    size="small"
                    sx={{ flex: 1 }}
                  >
                    Thêm SV
                  </Button>
                </Box>
              </Box>
            ) : (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm sinh viên..."
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
                
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Trạng thái"
                      >
                        <MenuItem value="all">Tất cả</MenuItem>
                        <MenuItem value="active">Hoạt động</MenuItem>
                        <MenuItem value="inactive">Không hoạt động</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                        label="Giới tính"
                      >
                        <MenuItem value="all">Tất cả</MenuItem>
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={loadStudents}
                    >
                      Làm mới
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddStudent}
                    >
                      Thêm sinh viên
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Students Table - Desktop */}
        {!isMobile ? (
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã SV</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Giới tính</TableCell>
                    <TableCell>Ngày sinh</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Không có sinh viên nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {student.student_id}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src={student.avatar}
                              sx={{ width: 32, height: 32, mr: 2 }}
                            >
                              {student.first_name?.[0]}{student.last_name?.[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {student.full_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {student.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          {student.phone ? (
                            <Box display="flex" alignItems="center">
                              <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {student.phone}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Chưa cập nhật
                            </Typography>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getGenderIcon(student.gender)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {getGenderText(student.gender)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {dayjs(student.date_of_birth).format('DD/MM/YYYY')}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={student.is_active ? 'Hoạt động' : 'Không hoạt động'}
                            color={student.is_active ? 'success' : 'default'}
                            size="small"
                            icon={student.is_active ? <ActiveIcon /> : <InactiveIcon />}
                          />
                        </TableCell>
                        
                        <TableCell align="center">
                          <IconButton
                            onClick={(e) => handleActionMenuOpen(e, student)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ) : (
          /* Mobile Cards */
          <Box>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : filteredStudents.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Không có sinh viên nào
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              filteredStudents.map((student) => (
                <Card key={student.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={student.avatar}
                          sx={{ width: 48, height: 48, mr: 2 }}
                        >
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="medium">
                            {student.full_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.student_id}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={(e) => handleActionMenuOpen(e, student)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" alignItems="center">
                        <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {student.email}
                        </Typography>
                      </Box>
                      
                      {student.phone && (
                        <Box display="flex" alignItems="center">
                          <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {student.phone}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          {getGenderIcon(student.gender)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {getGenderText(student.gender)}
                          </Typography>
                        </Box>
                        <Chip
                          label={student.is_active ? 'Hoạt động' : 'Không hoạt động'}
                          color={student.is_active ? 'success' : 'default'}
                          size="small"
                          icon={student.is_active ? <ActiveIcon /> : <InactiveIcon />}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Pagination */}
        {!isMobile ? (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
            }
          />
        ) : (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalCount)} của {totalCount}
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Trước
                  </Button>
                  <Button
                    size="small"
                    disabled={(page + 1) * rowsPerPage >= totalCount}
                    onClick={() => setPage(page + 1)}
                  >
                    Sau
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleActionMenuClose}
        >
          <MenuItem onClick={() => {
            handleEditStudent(selectedStudent)
            handleActionMenuClose()
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Chỉnh sửa</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={() => {
            handleDeleteStudent(selectedStudent)
            handleActionMenuClose()
          }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xóa</ListItemText>
          </MenuItem>
        </Menu>

        {/* Floating Action Buttons */}
        {isMobile ? (
          <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Fab
              color="primary"
              onClick={() => setExcelDialogOpen(true)}
              sx={{ bgcolor: theme.palette.secondary.main }}
              size="medium"
            >
              <CloudUploadIcon />
            </Fab>
            
            <Fab
              color="secondary"
              onClick={handleExportExcel}
              sx={{ bgcolor: theme.palette.success.main }}
              size="medium"
            >
              <GetAppIcon />
            </Fab>
          </Box>
        ) : (
          <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Fab
              color="primary"
              onClick={() => setExcelDialogOpen(true)}
              sx={{ bgcolor: theme.palette.secondary.main }}
            >
              <CloudUploadIcon />
            </Fab>
            
            <Fab
              color="secondary"
              onClick={handleExportExcel}
              sx={{ bgcolor: theme.palette.success.main }}
            >
              <GetAppIcon />
            </Fab>
          </Box>
        )}

        {/* Dialogs */}
        <StudentForm
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          onSuccess={handleFormSuccess}
          student={editingStudent}
        />

        <ExcelDragDrop
          open={excelDialogOpen}
          onClose={() => setExcelDialogOpen(false)}
          onImportSuccess={handleExcelSuccess}
        />

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ position: 'fixed', top: 16, left: 16, right: 16, zIndex: 9999 }}
              >
                {error}
              </Alert>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <Alert
                severity="success"
                onClose={() => setSuccess('')}
                sx={{ position: 'fixed', top: 16, left: 16, right: 16, zIndex: 9999 }}
              >
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </LocalizationProvider>
  )
}

export default Students