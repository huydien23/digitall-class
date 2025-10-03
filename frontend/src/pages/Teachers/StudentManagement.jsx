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
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
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
import { useSelector } from 'react-redux'
import studentService from '../../services/studentService'
import classService from '../../services/classService'
import ProvisionAccountsDialog from '../../components/Teacher/ProvisionAccountsDialog'
import StudentForm from '../../components/Form/StudentForm'

const StudentManagement = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnToClass = searchParams.get('returnToClass')
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  // Filters
  const [searchText, setSearchText] = useState('')
  const [filterScope, setFilterScope] = useState('my-classes') // all | my-classes | no-user
  const [filterClassId, setFilterClassId] = useState(returnToClass || '')

  // My classes for filter
  const [myClasses, setMyClasses] = useState([])

  // Dialogs
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [rowMenuAnchor, setRowMenuAnchor] = useState(null)
  const [rowMenuStudent, setRowMenuStudent] = useState(null)

  // Edit & reset password dialogs
  const [editOpen, setEditOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

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
      const params = { page_size: 10000 }
      
      if (filterScope === 'my-classes') {
        // Aggregate students across all my classes with class labels
        const studentMap = new Map()
        await Promise.all(
          classes.map(async (cls) => {
            try {
              const studentsRes = await classService.getClassStudents(cls.id)
              const classStudents = studentsRes.data?.results || studentsRes.data || []
              const classLabel = cls.class_id || cls.class_name || cls.name || `Lớp ${cls.id}`
              classStudents.forEach((cs) => {
                const s = cs.student || cs
                if (!s?.id) return
                const existing = studentMap.get(s.id) || { ...s, classes: [] }
                existing.classes = existing.classes || []
                // avoid duplicate class labels
                if (!existing.classes.some(c => String(c.id) === String(cls.id))) {
                  existing.classes.push({ id: cls.id, class_id: cls.class_id, class_name: cls.class_name || cls.name, label: classLabel })
                }
                studentMap.set(s.id, existing)
              })
            } catch (e) {
              // silent: keep console clean
            }
          })
        )

        // Overlay with canonical student details to ensure account status is accurate
        const aggregated = Array.from(studentMap.values())
        try {
          const detailsRes = await studentService.getStudents(params)
          const detailList = detailsRes.data?.results || detailsRes.data || []
          const byId = new Map(detailList.map((s) => [String(s.id), s]))
          const byStudentCode = new Map(detailList.map((s) => [String(s.student_id), s]))
          const merged = aggregated.map((s) => {
            const keyId = String(s.id)
            const keyCode = String(s.student_id)
            const d = byId.get(keyId) || byStudentCode.get(keyCode)
            return d ? { ...s, ...d } : s
          })
          // Áp dụng cache local "đã có TK" nếu có
          const mergedApplied = applyLocalHasAccount(merged)
          setStudents(mergedApplied)
          setFilteredStudents(mergedApplied)
        } catch (e) {
          // silent: keep console clean; fallback to aggregated list
          const aggregatedApplied = applyLocalHasAccount(aggregated)
          setStudents(aggregatedApplied)
          setFilteredStudents(aggregatedApplied)
        }
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
        s.full_name?.toLowerCase().includes(search) ||
        (s.classes || []).some((c) => c.label?.toLowerCase().includes(search))
    )
    setFilteredStudents(filtered)
    setPage(0)
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

  // Local cache đánh dấu SV đã có TK (trong trường hợp API chưa expose quan hệ user)
  const HAS_ACCOUNT_CACHE_KEY = 'students_has_account_cache'
  const markLocalHasAccount = (studentIdCodes = []) => {
    try {
      const raw = localStorage.getItem(HAS_ACCOUNT_CACHE_KEY) || '{}'
      const cache = JSON.parse(raw)
      for (const code of studentIdCodes) {
        cache[String(code)] = true
      }
      localStorage.setItem(HAS_ACCOUNT_CACHE_KEY, JSON.stringify(cache))
    } catch {}
  }

  const applyLocalHasAccount = (list) => {
    try {
      const raw = localStorage.getItem(HAS_ACCOUNT_CACHE_KEY)
      if (!raw) return list
      const cache = JSON.parse(raw)
      return list.map((s) => (cache[String(s.student_id)] ? { ...s, local_has_user: true } : s))
    } catch { return list }
  }

  const handleProvisionComplete = (result) => {
    setProvisionDialogOpen(false)
    if (result?.success) {
      setSuccessMessage(
        `Tạo/Cập nhật tài khoản hoàn tất: ${result.created || 0} mới, ${result.updated || 0} cập nhật, ${result.skipped || 0} bỏ qua`
      )
      if (Array.isArray(result.affected_student_ids) && result.affected_student_ids.length > 0) {
        // Đánh dấu ngay trên UI
        const idsSet = new Set(result.affected_student_ids.map((x) => String(x)))
        setStudents((prev) => prev.map((s) => (idsSet.has(String(s.student_id)) ? { ...s, has_user: true, local_has_user: true } : s)))
        setFilteredStudents((prev) => prev.map((s) => (idsSet.has(String(s.student_id)) ? { ...s, has_user: true, local_has_user: true } : s)))
        markLocalHasAccount(result.affected_student_ids)
      }
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

  const hasUserAccount = (student) => {
    // Robust detection across possible backend shapes
    if (!student) return false
    if (student.local_has_user) return true
    if (student.user && typeof student.user === 'object' && student.user.id) return true
    if (typeof student.user === 'number' || typeof student.user === 'string') return true
    if (student.user_id) return true
    if (student.has_user || student.has_account) return true
    if (student.username) return true
    return false
  }

  const getStudentStatus = (student) => {
    if (hasUserAccount(student)) {
      return { label: 'Có tài khoản', color: 'success' }
    }
    return { label: 'Chưa có TK', color: 'warning' }
  }

  // Row menu handlers
  const openRowMenu = (e, student) => {
    setRowMenuAnchor(e.currentTarget)
    setRowMenuStudent(student)
  }
  const closeRowMenu = () => {
    setRowMenuAnchor(null)
    setRowMenuStudent(null)
  }

  const handleEdit = () => {
    setEditingStudent(rowMenuStudent)
    setEditOpen(true)
    closeRowMenu()
  }

  const handleDelete = async () => {
    try {
      if (window.confirm('Xóa sinh viên này khỏi hệ thống?')) {
        await studentService.deleteStudent(rowMenuStudent.id)
        await loadData()
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Không thể xóa sinh viên')
    } finally {
      closeRowMenu()
    }
  }

  const [resetSendEmail, setResetSendEmail] = useState(false)
  const handleReset = async () => {
    try {
      setResetLoading(true)
      if (studentService.resetPasswordBatch && rowMenuStudent?.id && false) {
        // placeholder if single batch not needed
      }
      await studentService.resetPassword(rowMenuStudent.id, resetPassword)
      if (resetSendEmail) {
        try { await studentService.sendPasswordEmail([rowMenuStudent.id]) } catch (e) { /* ignore */ }
      }
      setSuccessMessage('Đã đặt lại mật khẩu cho sinh viên')
      setResetPassword('')
      setResetOpen(false)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Không thể đặt lại mật khẩu')
    } finally {
      setResetLoading(false)
    }
  }

  // Bulk reset password
  const [bulkResetOpen, setBulkResetOpen] = useState(false)
  const [bulkPassword, setBulkPassword] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)

  // Bulk add/remove to class
  const [bulkAddOpen, setBulkAddOpen] = useState(false)
  const [bulkAddClassId, setBulkAddClassId] = useState('')
  const [bulkAddLoading, setBulkAddLoading] = useState(false)
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false)
  const [bulkRemoveClassId, setBulkRemoveClassId] = useState('')
  const [bulkRemoveLoading, setBulkRemoveLoading] = useState(false)

  // Bulk delete from system
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  const [bulkSendEmail, setBulkSendEmail] = useState(false)
  const handleBulkReset = async () => {
    try {
      setBulkLoading(true)
      let ok = 0, fail = 0
      if (studentService.resetPasswordBatch) {
        try {
          await studentService.resetPasswordBatch(selectedStudents, bulkPassword)
          ok = selectedStudents.length
        } catch (e) {
          // fallback to per-student
          for (const id of selectedStudents) {
            try { await studentService.resetPassword(id, bulkPassword); ok++ } catch (err) { fail++ }
          }
        }
      } else {
        for (const id of selectedStudents) {
          try { await studentService.resetPassword(id, bulkPassword); ok++ } catch (err) { fail++ }
        }
      }
      if (bulkSendEmail) {
        try { await studentService.sendPasswordEmail(selectedStudents) } catch (e) { /* ignore */ }
      }
      setSuccessMessage(`Đã đặt lại mật khẩu cho ${ok} SV${fail ? `, lỗi ${fail}` : ''}`)
      setBulkPassword('')
      setBulkResetOpen(false)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Không thể đặt lại mật khẩu hàng loạt')
    } finally {
      setBulkLoading(false)
    }
  }

  // Export selected CSV
  const handleExportSelectedCsv = () => {
    const rows = students.filter(s => selectedStudents.includes(s.id))
    const headers = ['id','student_id','last_name','first_name','email','classes']
    const csv = [headers.join(',')].concat(
      rows.map(s => {
        const classes = (s.classes || []).map(c => c.class_id || c.label).join('|')
        return [s.id, s.student_id, s.last_name, s.first_name, s.email, `"${classes}"`].join(',')
      })
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_selected.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Export selected XLSX (fallback to CSV if library not available)
  const handleExportSelectedXlsx = async () => {
    const rows = students.filter(s => selectedStudents.includes(s.id)).map(s => ({
      id: s.id,
      student_id: s.student_id,
      last_name: s.last_name,
      first_name: s.first_name,
      email: s.email,
      classes: (s.classes || []).map(c => c.class_id || c.label).join('|')
    }))
    try {
      const XLSX = await import('xlsx')
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Students')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'students_selected.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      // Fallback to CSV
      handleExportSelectedCsv()
    }
  }

  // Bulk add to class
  const handleBulkAddToClass = async () => {
    try {
      setBulkAddLoading(true)
      if (!bulkAddClassId) return
      let ok = 0, fail = 0
      for (const id of selectedStudents) {
        try {
          await classService.addStudentToClass(bulkAddClassId, id)
          ok++
        } catch (e) {
          fail++
        }
      }
      setSuccessMessage(`Đã thêm ${ok} SV vào lớp${fail ? `, lỗi ${fail}` : ''}`)
      setBulkAddOpen(false)
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Không thể thêm vào lớp')
    } finally {
      setBulkAddLoading(false)
    }
  }

  // Bulk remove from class
  const [undoRemoval, setUndoRemoval] = useState(null)
  const handleBulkRemoveFromClass = async () => {
    try {
      setBulkRemoveLoading(true)
      const classId = bulkRemoveClassId || filterClassId
      if (!classId) return
      const ids = [...selectedStudents]
      let ok = 0, fail = 0
      for (const id of ids) {
        try {
          await classService.removeStudentFromClass(classId, id)
          ok++
        } catch (e) {
          fail++
        }
      }
      setSuccessMessage(`Đã xóa ${ok} SV khỏi lớp${fail ? `, lỗi ${fail}` : ''}`)
      setUndoRemoval({ classId, studentIds: ids })
      setBulkRemoveOpen(false)
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Không thể xóa khỏi lớp')
    } finally {
      setBulkRemoveLoading(false)
    }
  }

  // Bulk delete from system
  const handleBulkDelete = async () => {
    try {
      setBulkDeleteLoading(true)
      let ok = 0, fail = 0
      for (const id of selectedStudents) {
        try {
          await studentService.deleteStudent(id)
          ok++
        } catch (e) {
          fail++
        }
      }
      setSuccessMessage(`Đã xóa ${ok} SV khỏi hệ thống${fail ? `, lỗi ${fail}` : ''}`)
      setBulkDeleteOpen(false)
      setSelectedStudents([])
      setSelectAll(false)
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Không thể xóa sinh viên')
    } finally {
      setBulkDeleteLoading(false)
    }
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
              startIcon={<VpnKeyIcon />}
              onClick={() => setBulkResetOpen(true)}
            >
              Đổi mật khẩu hàng loạt
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleExportSelectedCsv}
            >
              Xuất CSV
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleExportSelectedXlsx}
            >
              Xuất Excel
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setBulkAddOpen(true)}
            >
              Thêm vào lớp
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => { if (filterClassId) setBulkRemoveClassId(filterClassId); setBulkRemoveOpen(true) }}
              disabled={!filterClassId && myClasses.length === 0}
            >
              Xóa khỏi lớp
            </Button>
            {isAdmin && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => setBulkDeleteOpen(true)}
              >
                Xóa khỏi hệ thống
              </Button>
            )}
            <Button
              variant="text"
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
              <TableCell>Lớp</TableCell>
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
              filteredStudents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((student) => {
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
                      <Tooltip
                        title={(student.classes || []).map((c) => `${c.class_name || c.label || ''}${c.class_id ? ` (${c.class_id})` : ''}`).join(', ') || 'Không có lớp'}
                        arrow
                      >
                        <Box>
                          {(student.classes || []).slice(0, 3).map((c) => (
                            <Chip key={`${student.id}-${c.id}`} label={c.class_id || c.label} size="small" sx={{ mr: 0.5 }} />
                          ))}
                          {student.classes && student.classes.length > 3 && (
                            <Chip label={`+${student.classes.length - 3}`} size="small" />
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip label={status.label} color={status.color} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => openRowMenu(e, student)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Undo removal alert */}
      {undoRemoval && (
        <Alert severity="info" sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={async () => {
              try {
                let ok = 0, fail = 0
                for (const id of undoRemoval.studentIds) {
                  try { await classService.addStudentToClass(undoRemoval.classId, id); ok++ } catch (e) { fail++ }
                }
                setSuccessMessage(`Đã hoàn tác: thêm lại ${ok} SV${fail ? `, lỗi ${fail}` : ''}`)
                setUndoRemoval(null)
                await loadData()
              } catch (e) {
                setError('Không thể hoàn tác')
              }
            }}>
              Hoàn tác
            </Button>
          }
        >
          Đã xóa {undoRemoval.studentIds.length} sinh viên khỏi lớp {(myClasses.find(c => String(c.id) === String(undoRemoval.classId))?.class_name || myClasses.find(c => String(c.id) === String(undoRemoval.classId))?.name) ?? ''}
        </Alert>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <TablePagination
          component="div"
          count={filteredStudents.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[50, 100, 200]}
          labelRowsPerPage="Số dòng mỗi trang"
        />
      </Box>

      {/* Row menu */}
      <Menu anchorEl={rowMenuAnchor} open={Boolean(rowMenuAnchor)} onClose={closeRowMenu}>
        <MenuOption onClick={handleEdit}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuOption>
        <MenuOption onClick={() => { setResetOpen(true); closeRowMenu() }}>
          <ListItemIcon><VpnKeyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Đổi mật khẩu</ListItemText>
        </MenuOption>
        {!isAdmin ? (
          <MenuOption onClick={() => { setSelectedStudents([rowMenuStudent.id]); if (filterClassId) setBulkRemoveClassId(filterClassId); setBulkRemoveOpen(true); closeRowMenu() }}>
            <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Xóa khỏi lớp</ListItemText>
          </MenuOption>
        ) : (
          <MenuOption onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Xóa khỏi hệ thống</ListItemText>
          </MenuOption>
        )}
      </Menu>

      {/* Edit dialog (reuse StudentForm) */}
      <StudentForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => { setEditOpen(false); loadData() }}
        student={editingStudent}
      />

      {/* Reset password dialog */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Đổi mật khẩu sinh viên</DialogTitle>
        <DialogContent>
          <TextField
            label="Mật khẩu mới"
            type="password"
            fullWidth
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            sx={{ mt: 1 }}
          />
          <FormControlLabel
            control={<Checkbox checked={resetSendEmail} onChange={(e) => setResetSendEmail(e.target.checked)} />}
            label="Gửi email thông báo cho sinh viên"
            sx={{ mt: 1 }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Lưu ý: Hệ thống sẽ yêu cầu sinh viên đổi mật khẩu ở lần đăng nhập tiếp theo (nếu backend hỗ trợ).
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleReset} disabled={resetLoading || !resetPassword}>
            {resetLoading ? <CircularProgress size={20} /> : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk reset dialog */}
      <Dialog open={bulkResetOpen} onClose={() => setBulkResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Đổi mật khẩu hàng loạt</DialogTitle>
        <DialogContent>
          <TextField
            label="Mật khẩu mới"
            type="password"
            fullWidth
            value={bulkPassword}
            onChange={(e) => setBulkPassword(e.target.value)}
            helperText={`Áp dụng cho ${selectedStudents.length} sinh viên`}
            sx={{ mt: 1 }}
          />
          <FormControlLabel
            control={<Checkbox checked={bulkSendEmail} onChange={(e) => setBulkSendEmail(e.target.checked)} />}
            label="Gửi email thông báo cho sinh viên"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkResetOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleBulkReset} disabled={bulkLoading || !bulkPassword}>
            {bulkLoading ? <CircularProgress size={20} /> : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk add to class */}
      <Dialog open={bulkAddOpen} onClose={() => setBulkAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Thêm vào lớp</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Chọn lớp</InputLabel>
            <Select value={bulkAddClassId} label="Chọn lớp" onChange={(e) => setBulkAddClassId(e.target.value)}>
              {myClasses.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.class_name || c.name} ({c.class_id})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAddOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleBulkAddToClass} disabled={bulkAddLoading || !bulkAddClassId}>
            {bulkAddLoading ? <CircularProgress size={20} /> : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk remove from class */}
      <Dialog open={bulkRemoveOpen} onClose={() => setBulkRemoveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Xóa khỏi lớp</DialogTitle>
        <DialogContent>
          {filterClassId && !bulkRemoveClassId ? (
            <Typography sx={{ mt: 1 }}>
              Sẽ xóa khỏi lớp: <strong>{(myClasses.find(c => String(c.id) === String(filterClassId))?.class_name || myClasses.find(c => String(c.id) === String(filterClassId))?.name) ?? 'Lớp'}</strong>
            </Typography>
          ) : (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>Chọn lớp</InputLabel>
              <Select value={bulkRemoveClassId || filterClassId} label="Chọn lớp" onChange={(e) => setBulkRemoveClassId(e.target.value)}>
                {myClasses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.class_name || c.name} ({c.class_id})</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkRemoveOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleBulkRemoveFromClass} disabled={bulkRemoveLoading || (!bulkRemoveClassId && !filterClassId)}>
            {bulkRemoveLoading ? <CircularProgress size={20} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk delete from system */}
      <Dialog open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Xóa khỏi hệ thống</DialogTitle>
        <DialogContent>
          <Alert severity="warning">Bạn chắc chắn muốn xóa {selectedStudents.length} sinh viên khỏi hệ thống? Hành động này không thể hoàn tác.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteOpen(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
            {bulkDeleteLoading ? <CircularProgress size={20} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lịch sử thao tác */}
      {successMessage && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2">Thông báo</Typography>
          <Typography variant="caption" color="text.secondary">{successMessage}</Typography>
        </Paper>
      )}

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
