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
      await apiService.post(`/teachers/${teacherId}/approve`)
      showSuccess('Đã phê duyệt tài khoản giáo viên thành công')
      await fetchPendingTeachers()
      setSelectedTeacher(null)
    } catch (error) {
      console.error('Error approving teacher:', error)
      showError('Không thể phê duyệt tài khoản')
    } finally {
      setActionLoading(false)
    }
  }

  const rejectTeacher = async (teacherId) => {
    setActionLoading(true)
    try {
      await apiService.post(`/teachers/${teacherId}/reject`)
      showSuccess('Đã từ chối tài khoản giáo viên')
      await fetchPendingTeachers()
      setSelectedTeacher(null)
    } catch (error) {
      console.error('Error rejecting teacher:', error)
      showError('Không thể từ chối tài khoản')
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Quản lý phê duyệt tài khoản giáo viên
      </Typography>

      {pendingTeachers.length === 0 ? (
        <Alert severity="info">
          Không có tài khoản giáo viên nào cần phê duyệt
        </Alert>
      ) : (
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
              {pendingTeachers.map((teacher) => (
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
            onClick={() => rejectTeacher(selectedTeacher.id)}
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
    </Box>
  )
}

export default TeacherApprovalManagement
