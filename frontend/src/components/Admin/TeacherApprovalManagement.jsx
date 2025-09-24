import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { 
  Check, 
  Close, 
  Visibility, 
  Email, 
  School,
  Person 
} from '@mui/icons-material'
import apiService from '../../services/apiService'
import { useNotification } from '../Notification/NotificationProvider'
import { ACCOUNT_STATUS, USER_ROLES } from '../../utils/constants'

const TeacherApprovalManagement = () => {
  const [pendingTeachers, setPendingTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const { showSuccess, showError } = useNotification()

  useEffect(() => {
    fetchPendingTeachers()
  }, [])

  const fetchPendingTeachers = async () => {
    try {
      const response = await apiService.get('/teachers/pending')
      setPendingTeachers(response.data || [])
    } catch (error) {
      console.error('Error fetching pending teachers:', error)
      showError('Không thể tải danh sách giáo viên chờ duyệt')
    } finally {
      setLoading(false)
    }
  }

  const approveTeacher = async (teacherId) => {
    setActionLoading(true)
    try {
      const res = await apiService.post(`/teachers/${teacherId}/approve`)
      if (!res.success) throw new Error(res.error?.message || 'Approve failed')
      showSuccess('Đã phê duyệt tài khoản giáo viên thành công')
      await fetchPendingTeachers()
      setSelectedTeacher(null)
    } catch (error) {
      console.error('Error approving teacher:', error)
      showError(error?.message || 'Không thể phê duyệt tài khoản')
    } finally {
      setActionLoading(false)
    }
  }

  const openRejectDialog = (teacher) => {
    setSelectedTeacher(teacher)
    setRejectReason('')
    setRejectOpen(true)
  }

  const confirmRejectTeacher = async () => {
    if (!selectedTeacher) return
    setActionLoading(true)
    try {
      const res = await apiService.post(`/teachers/${selectedTeacher.id}/reject`, { reason: rejectReason })
      if (!res.success) throw new Error(res.error?.message || 'Reject failed')
      showSuccess('Đã từ chối tài khoản giáo viên')
      await fetchPendingTeachers()
      setSelectedTeacher(null)
      setRejectOpen(false)
    } catch (error) {
      console.error('Error rejecting teacher:', error)
      showError(error?.message || 'Không thể từ chối tài khoản')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusChip = (status) => {
    const statusConfig = {
      [ACCOUNT_STATUS.PENDING]: { color: 'warning', label: 'Chờ duyệt' },
      [ACCOUNT_STATUS.ACTIVE]: { color: 'success', label: 'Đã duyệt' },
      [ACCOUNT_STATUS.SUSPENDED]: { color: 'error', label: 'Tạm khóa' },
      [ACCOUNT_STATUS.REJECTED]: { color: 'error', label: 'Từ chối' },
    }

    const config = statusConfig[status] || { color: 'default', label: status }
    return <Chip label={config.label} color={config.color} size="small" />
  }

  if (loading) return <Typography>Đang tải...</Typography>

  // client-side filter
  const filtered = pendingTeachers.filter(t => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || (t.full_name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q))
    const matchesDept = !departmentFilter || t.department === departmentFilter
    return matchesSearch && matchesDept
  })
  const start = page * rowsPerPage
  const pageRows = filtered.slice(start, start + rowsPerPage)
  const departments = Array.from(new Set(pendingTeachers.map(t => t.department).filter(Boolean)))

  return (
    <Box id="teacher-approvals">
      <Typography variant="h5" gutterBottom>
        Quản lý phê duyệt tài khoản giáo viên
      </Typography>

      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <TextField 
          size="small" 
          placeholder="Tìm theo tên hoặc email"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Khoa</InputLabel>
          <Select 
            label="Khoa" 
            value={departmentFilter}
            onChange={(e) => { setDepartmentFilter(e.target.value); setPage(0) }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {departments.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
          </Select>
        </FormControl>
      </Box>

      {filtered.length === 0 ? (
        <Alert severity="info">
          Không có tài khoản giáo viên nào cần phê duyệt
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Khoa</TableCell>
                  <TableCell>Ngày đăng ký</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>{teacher.full_name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.department}</TableCell>
                    <TableCell>
                      {new Date(teacher.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {getStatusChip(teacher.account_status)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => setSelectedTeacher(teacher)}
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => openRejectDialog(teacher)}
                        sx={{ ml: 1 }}
                      >
                        Từ chối
                      </Button>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => approveTeacher(teacher.id)}
                        sx={{ ml: 1 }}
                      >
                        Duyệt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      {/* Teacher Detail Dialog */}
      <Dialog
        open={!!selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết tài khoản giáo viên</DialogTitle>
        <DialogContent>
          {selectedTeacher && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Person />
                      <Typography variant="h6">
                        {selectedTeacher.full_name}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Email />
                      <Typography>{selectedTeacher.email}</Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <School />
                      <Typography>{selectedTeacher.department}</Typography>
                    </Box>
                    
                    {selectedTeacher.phone && (
                      <Typography>
                        <strong>SĐT:</strong> {selectedTeacher.phone}
                      </Typography>
                    )}
                    
                    <Typography>
                      <strong>Ngày đăng ký:</strong>{' '}
                      {new Date(selectedTeacher.created_at).toLocaleString('vi-VN')}
                    </Typography>
                    
                    <Box mt={2}>
                      <Typography variant="subtitle2">Trạng thái:</Typography>
                      {getStatusChip(selectedTeacher.account_status)}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTeacher(null)}>
            Đóng
          </Button>
          <Button
            onClick={() => openRejectDialog(selectedTeacher)}
            startIcon={<Close />}
            color="error"
            disabled={actionLoading}
          >
            Từ chối
          </Button>
          <Button
            onClick={() => approveTeacher(selectedTeacher.id)}
            startIcon={<Check />}
            color="success"
            variant="contained"
            disabled={actionLoading}
          >
            Phê duyệt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Lý do từ chối tài khoản</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            placeholder="Nhập lý do từ chối (tùy chọn)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={confirmRejectTeacher} disabled={actionLoading}>
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TeacherApprovalManagement
