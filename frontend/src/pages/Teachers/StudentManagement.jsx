import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem as MenuOption,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  VpnKey as VpnKeyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import studentService from '../../services/studentService'
import classService from '../../services/classService'
import ProvisionAccountsDialog from '../../components/Teacher/ProvisionAccountsDialog'

const StudentManagement = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnToClass = searchParams.get('returnToClass')

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Filters
  const [searchText, setSearchText] = useState('')
  const [filterScope, setFilterScope] = useState('my-classes') // all | my-classes | no-user
  const [filterClassId, setFilterClassId] = useState(returnToClass || '')

  // My classes for filter
  const [myClasses, setMyClasses] = useState([])

  // Dialogs
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [filterScope, filterClassId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load my classes for filter dropdown
      const classesRes = await classService.getClasses()
      const classes = classesRes.data?.results || classesRes.data || []
      setMyClasses(classes)

      // Build query params based on filters
      const params = { page_size: 1000 }
      
      if (filterScope === 'my-classes') {
        // Get students from all my classes
        const allStudentIds = new Set()
        await Promise.all(
          classes.map(async (cls) => {
            try {
              const studentsRes = await classService.getClassStudents(cls.id)
              const classStudents = studentsRes.data?.results || studentsRes.data || []
              classStudents.forEach((cs) => {
                const student = cs.student || cs
                if (student?.id) allStudentIds.add(student.id)
              })
            } catch (e) {
              console.warn(`Failed to load students for class ${cls.id}`, e)
            }
          })
        )
        
        // Fetch full student details
        const allStudentsRes = await studentService.getStudents({ page_size: 1000 })
        const allStudents = allStudentsRes.data?.results || allStudentsRes.data || []
        const filtered = allStudents.filter((s) => allStudentIds.has(s.id))
        setStudents(filtered)
        setFilteredStudents(filtered)
      } else if (filterScope === 'no-user') {
        // Students without user account (requires backend support or client-side filter)
        const res = await studentService.getStudents(params)
        const all = res.data?.results || res.data || []
        const filtered = all.filter((s) => !s.user || !s.user.id)
        setStudents(filtered)
        setFilteredStudents(filtered)
      } else if (filterClassId) {
        // Students in specific class
        const studentsRes = await classService.getClassStudents(filterClassId)
        const classStudents = studentsRes.data?.results || studentsRes.data || []
        const studentsList = classStudents.map((cs) => cs.student || cs)
        setStudents(studentsList)
        setFilteredStudents(studentsList)
      } else {
        // All students (for admin fallback)
        const res = await studentService.getStudents(params)
        const all = res.data?.results || res.data || []
        setStudents(all)
        setFilteredStudents(all)
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load students')
      setStudents([])
      setFilteredStudents([])
    } finally {
      setLoading(false)
    }
  }

  // Search filter
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredStudents(students)
      return
    }
    const search = searchText.toLowerCase()
    const filtered = students.filter(
      (s) =>
        s.student_id?.toLowerCase().includes(search) ||
        s.first_name?.toLowerCase().includes(search) ||
        s.last_name?.toLowerCase().includes(search) ||
        s.email?.toLowerCase().includes(search) ||
        s.full_name?.toLowerCase().includes(search)
    )
    setFilteredStudents(filtered)
  }, [searchText, students])

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedStudents(filteredStudents.map((s) => s.id))
      setSelectAll(true)
    } else {
      setSelectedStudents([])
      setSelectAll(false)
    }
  }

  const handleSelectStudent = (studentId) => {
    const idx = selectedStudents.indexOf(studentId)
    if (idx === -1) {
      setSelectedStudents([...selectedStudents, studentId])
    } else {
      const newSelected = [...selectedStudents]
      newSelected.splice(idx, 1)
      setSelectedStudents(newSelected)
    }
  }

  const handleProvisionAccounts = () => {
    setProvisionDialogOpen(true)
  }

  const handleProvisionComplete = (result) => {
    setProvisionDialogOpen(false)
    if (result?.success) {
      setSuccessMessage(
        `Tạo/Cập nhật tài khoản hoàn tất: ${result.created || 0} mới, ${result.updated || 0} cập nhật, ${result.skipped || 0} bỏ qua`
      )
      loadData()
      setSelectedStudents([])
      setSelectAll(false)
    }
  }

  const handleReturnToClass = () => {
    if (returnToClass) {
      navigate(`/classes/${returnToClass}`)
    } else {
      navigate('/classes')
    }
  }

  const getStudentStatus = (student) => {
    if (student.user?.id) {
      return { label: 'Có tài khoản', color: 'success' }
    }
    return { label: 'Chưa có TK', color: 'warning' }
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Quản lý sinh viên
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý tài khoản và thông tin sinh viên trong các lớp của bạn
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          {returnToClass && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleReturnToClass}
            >
              Về lớp học
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Làm mới
          </Button>
        </Stack>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Tìm MSSV, tên, email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Phạm vi</InputLabel>
            <Select
              value={filterScope}
              onChange={(e) => {
                setFilterScope(e.target.value)
                setFilterClassId('')
              }}
              label="Phạm vi"
            >
              <MenuItem value="my-classes">Trong lớp của tôi</MenuItem>
              <MenuItem value="no-user">Chưa có tài khoản</MenuItem>
              <MenuItem value="all">Tất cả</MenuItem>
            </Select>
          </FormControl>
          {myClasses.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Lọc theo lớp</InputLabel>
              <Select
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                label="Lọc theo lớp"
              >
                <MenuItem value="">Tất cả lớp</MenuItem>
                {myClasses.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.class_name} ({cls.class_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Paper>

      {/* Actions Bar */}
      {selectedStudents.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              Đã chọn: {selectedStudents.length}
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleProvisionAccounts}
            >
              Tạo/Cập nhật tài khoản
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedStudents([])
                setSelectAll(false)
              }}
            >
              Bỏ chọn
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectAll}
                  indeterminate={
                    selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>MSSV</TableCell>
              <TableCell>Họ đệm</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Trạng thái TK</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    Không có sinh viên nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudents.includes(student.id)
                const status = getStudentStatus(student)
                return (
                  <TableRow
                    key={student.id}
                    hover
                    selected={isSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectStudent(student.id)}
                      />
                    </TableCell>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{student.last_name}</TableCell>
                    <TableCell>{student.first_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Provision Accounts Dialog */}
      <ProvisionAccountsDialog
        open={provisionDialogOpen}
        onClose={() => setProvisionDialogOpen(false)}
        selectedStudentIds={selectedStudents}
        allStudents={filteredStudents}
        classId={filterClassId}
        onComplete={handleProvisionComplete}
      />
    </Container>
  )
}

export default StudentManagement
