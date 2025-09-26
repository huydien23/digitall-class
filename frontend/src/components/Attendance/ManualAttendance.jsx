import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
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
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
  Tooltip,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  Snackbar,
  LinearProgress,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material'
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  Warning as WarningIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx'
import SessionSelector from '../Session/SessionSelector'

const ManualAttendance = ({ 
  classData,
  availableSessions = [],
  students = [], 
  existingAttendance = {},
  onSave,
  onClose 
}) => {
  const [selectedSession, setSelectedSession] = useState(null)
  const [attendance, setAttendance] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState(new Set())
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [sessionInfo, setSessionInfo] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '07:00',
    endTime: '11:00',
    location: classData?.location || 'Phòng học',
    note: ''
  })

  // Auto select latest session when dialog opens
  useEffect(() => {
    if (availableSessions.length > 0 && !selectedSession) {
      const latestSession = availableSessions.sort((a, b) => 
        new Date(b.session_date) - new Date(a.session_date)
      )[0]
      setSelectedSession(latestSession)
      
      // Update sessionInfo with selected session data
      setSessionInfo({
        date: latestSession.session_date,
        startTime: latestSession.start_time,
        endTime: latestSession.end_time,
        location: latestSession.location || classData?.location || 'Phòng học',
        note: latestSession.description || ''
      })
    }
  }, [availableSessions, classData])

  // Handle session selection change
  const handleSessionChange = (session) => {
    setSelectedSession(session)
    if (session) {
      setSessionInfo({
        date: session.session_date,
        startTime: session.start_time,
        endTime: session.end_time,
        location: session.location || classData?.location || 'Phòng học',
        note: session.description || ''
      })
    }
  }

  // Mock students data nếu không có
  // Không còn dùng dữ liệu mẫu fallback để tránh hiển thị dữ liệu cũ
  const studentList = Array.isArray(students) ? students : []

  useEffect(() => {
    // Khởi tạo attendance state từ existingAttendance
    const initialAttendance = {}
    studentList.forEach(student => {
      initialAttendance[student.id] = existingAttendance[student.id] || {
        status: 'absent', // present, absent, late, excused
        note: '',
        timestamp: null,
        manual: true
      }
    })
    setAttendance(initialAttendance)
  }, [studentList, existingAttendance])

  /**
   * Lọc danh sách sinh viên theo search và filter
   */
  const filteredStudents = studentList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const studentAttendance = attendance[student.id]
    let matchesFilter = true
    
    if (statusFilter !== 'all') {
      matchesFilter = studentAttendance?.status === statusFilter
    }
    
    return matchesSearch && matchesFilter
  })

  /**
   * Cập nhật trạng thái điểm danh cho một sinh viên
   */
  const updateAttendanceStatus = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: status,
        timestamp: status !== 'absent' ? new Date().toISOString() : null
      }
    }))
  }

  /**
   * Cập nhật ghi chú cho sinh viên
   */
  const updateStudentNote = (studentId, note) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note: note
      }
    }))
  }

  /**
   * Thao tác bulk với sinh viên được chọn
   */
  const handleBulkAction = (action) => {
    const updates = {}
    selectedStudents.forEach(studentId => {
      updates[studentId] = {
        ...attendance[studentId],
        status: action,
        timestamp: action !== 'absent' ? new Date().toISOString() : null
      }
    })
    
    setAttendance(prev => ({ ...prev, ...updates }))
    setSelectedStudents(new Set())
    
    setSnackbar({
      open: true,
      message: `Đã cập nhật trạng thái "${getStatusLabel(action)}" cho ${selectedStudents.size} sinh viên`,
      severity: 'success'
    })
  }

  /**
   * Chọn/bỏ chọn tất cả sinh viên hiện tại
   */
  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)))
    }
  }

  /**
   * Mở dialog ghi chú cho sinh viên
   */
  const openNoteDialog = (student) => {
    setSelectedStudent(student)
    setNoteDialogOpen(true)
  }

  /**
   * Lưu điểm danh
   */
  const handleSave = async () => {
    setSaving(true)
    try {
      const attendanceData = {
        sessionInfo: sessionInfo,
        attendance: attendance,
        summary: getAttendanceSummary()
      }
      
      await onSave(attendanceData)
      
      setSnackbar({
        open: true,
        message: 'Đã lưu điểm danh thành công!',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi lưu điểm danh: ' + error.message,
        severity: 'error'
      })
    }
    setSaving(false)
  }

  /**
   * Export Excel
   */
  const handleExportExcel = () => {
    const exportData = filteredStudents.map((student, index) => {
      const studentAttendance = attendance[student.id]
      return {
        'STT': index + 1,
        'MSSV': student.student_id,
        'Họ và tên': student.name,
        'Email': student.email,
        'Trạng thái': getStatusLabel(studentAttendance?.status),
        'Thời gian': studentAttendance?.timestamp ? new Date(studentAttendance.timestamp).toLocaleString('vi-VN') : '',
        'Ghi chú': studentAttendance?.note || ''
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm danh')
    
    const fileName = `DiemDanh_${sessionData?.subject || 'Lop'}_${sessionInfo.date}.xlsx`
    XLSX.writeFile(workbook, fileName)

    setSnackbar({
      open: true,
      message: 'Đã xuất file Excel thành công!',
      severity: 'success'
    })
  }

  /**
   * In danh sách điểm danh
   */
  const handlePrint = () => {
    const printContent = `
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status { font-weight: bold; }
        .present { color: green; }
        .absent { color: red; }
        .late { color: orange; }
        .excused { color: blue; }
      </style>
      <div class="header">
        <h2>BẢNG ĐIỂM DANH</h2>
        <h3>${sessionData?.subject || 'Môn học'}</h3>
      </div>
      <div class="info">
        <p><strong>Ngày:</strong> ${sessionInfo.date}</p>
        <p><strong>Thời gian:</strong> ${sessionInfo.startTime} - ${sessionInfo.endTime}</p>
        <p><strong>Địa điểm:</strong> ${sessionInfo.location}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>MSSV</th>
            <th>Họ và tên</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
            <th>Chữ ký</th>
          </tr>
        </thead>
        <tbody>
          ${filteredStudents.map((student, index) => {
            const studentAttendance = attendance[student.id]
            const statusClass = studentAttendance?.status || 'absent'
            return `
              <tr>
                <td>${index + 1}</td>
                <td>${student.student_id}</td>
                <td>${student.name}</td>
                <td class="status ${statusClass}">${getStatusLabel(studentAttendance?.status)}</td>
                <td>${studentAttendance?.note || ''}</td>
                <td style="width: 100px;"></td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 30px;">
        <p><strong>Tổng kết:</strong></p>
        <p>Có mặt: ${getAttendanceSummary().present} | Vắng: ${getAttendanceSummary().absent} | Muộn: ${getAttendanceSummary().late} | Phép: ${getAttendanceSummary().excused}</p>
      </div>
    `

    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  /**
   * Lấy nhãn trạng thái
   */
  const getStatusLabel = (status) => {
    const labels = {
      present: 'Có mặt',
      absent: 'Vắng',
      late: 'Muộn',
      excused: 'Có phép'
    }
    return labels[status] || 'Chưa xác định'
  }

  /**
   * Lấy màu sắc cho trạng thái
   */
  const getStatusColor = (status) => {
    const colors = {
      present: 'success',
      absent: 'error', 
      late: 'warning',
      excused: 'info'
    }
    return colors[status] || 'default'
  }

  /**
   * Lấy icon cho trạng thái
   */
  const getStatusIcon = (status) => {
    const icons = {
      present: <CheckCircleIcon />,
      absent: <CancelIcon />,
      late: <AccessTimeIcon />,
      excused: <EventNoteIcon />
    }
    return icons[status] || <PersonIcon />
  }

  /**
   * Tính tổng kết điểm danh
   */
  const getAttendanceSummary = () => {
    const summary = {
      total: studentList.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    }

    Object.values(attendance).forEach(record => {
      if (record.status in summary) {
        summary[record.status]++
      }
    })

    return summary
  }

  const summary = getAttendanceSummary()

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '90vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon color="primary" />
            <Box>
              <Typography variant="h6">Điểm danh thủ công</Typography>
              <Typography variant="body2" color="text.secondary">
                {classData?.class_name || selectedSession?.session_name || 'Lớp học'} - {sessionInfo.date}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Session Selector */}
        <Box sx={{ m: 2, mb: 1 }}>
          <SessionSelector
            sessions={availableSessions}
            selectedSession={selectedSession}
            onSessionChange={handleSessionChange}
            required={true}
          />
        </Box>

        {/* Session Info Card */}
        {selectedSession && (
          <Card sx={{ m: 2, mb: 1 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Ngày"
                  type="date"
                  value={sessionInfo.date}
                  onChange={(e) => setSessionInfo(prev => ({ ...prev, date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Giờ bắt đầu"
                  type="time"
                  value={sessionInfo.startTime}
                  onChange={(e) => setSessionInfo(prev => ({ ...prev, startTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Giờ kết thúc"
                  type="time"
                  value={sessionInfo.endTime}
                  onChange={(e) => setSessionInfo(prev => ({ ...prev, endTime: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Địa điểm"
                  value={sessionInfo.location}
                  onChange={(e) => setSessionInfo(prev => ({ ...prev, location: e.target.value }))}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        )}

        {/* Summary Cards */}
        <Box sx={{ px: 2, py: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h4" color="success.main">{summary.present}</Typography>
                <Typography variant="caption" color="text.secondary">Có mặt</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h4" color="error.main">{summary.absent}</Typography>
                <Typography variant="caption" color="text.secondary">Vắng</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h4" color="warning.main">{summary.late}</Typography>
                <Typography variant="caption" color="text.secondary">Muộn</Typography>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h4" color="info.main">{summary.excused}</Typography>
                <Typography variant="caption" color="text.secondary">Có phép</Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Toolbar */}
        <Toolbar sx={{ px: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm sinh viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 200, mr: 2 }}
          />

          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="present">Có mặt</MenuItem>
              <MenuItem value="absent">Vắng</MenuItem>
              <MenuItem value="late">Muộn</MenuItem>
              <MenuItem value="excused">Có phép</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={bulkMode}
                onChange={(e) => setBulkMode(e.target.checked)}
              />
            }
            label="Chế độ chọn nhiều"
          />

          <Box flexGrow={1} />

          {bulkMode && selectedStudents.size > 0 && (
            <Box display="flex" gap={1}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleBulkAction('present')}
              >
                Có mặt ({selectedStudents.size})
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => handleBulkAction('absent')}
              >
                Vắng ({selectedStudents.size})
              </Button>
              <Button
                size="small"
                variant="contained"
                color="warning"
                onClick={() => handleBulkAction('late')}
              >
                Muộn ({selectedStudents.size})
              </Button>
            </Box>
          )}
        </Toolbar>

        {/* Student List */}
        {studentList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="info" sx={{ display: 'inline-flex', textAlign: 'left' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Chưa có sinh viên trong lớp
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vui lòng thêm danh sách sinh viên vào lớp trước, sau đó mở lại Điểm danh thủ công.
                </Typography>
              </Box>
            </Alert>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: '50vh' }}>
            <Table stickyHeader>
            <TableHead>
              <TableRow>
                {bulkMode && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedStudents.size > 0 && selectedStudents.size < filteredStudents.length}
                      checked={filteredStudents.length > 0 && selectedStudents.size === filteredStudents.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                )}
                <TableCell>STT</TableCell>
                <TableCell>MSSV</TableCell>
                <TableCell>Họ và tên</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {filteredStudents.map((student, index) => {
                  const studentAttendance = attendance[student.id] || {}
                  const isSelected = selectedStudents.has(student.id)

                  return (
                    <motion.tr
                      key={student.id}
                      component="tr"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {bulkMode && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              const newSelected = new Set(selectedStudents)
                              if (e.target.checked) {
                                newSelected.add(student.id)
                              } else {
                                newSelected.delete(student.id)
                              }
                              setSelectedStudents(newSelected)
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {student.student_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {student.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {student.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Tooltip title="Có mặt">
                            <IconButton
                              size="small"
                              color={studentAttendance.status === 'present' ? 'success' : 'default'}
                              onClick={() => updateAttendanceStatus(student.id, 'present')}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Vắng">
                            <IconButton
                              size="small"
                              color={studentAttendance.status === 'absent' ? 'error' : 'default'}
                              onClick={() => updateAttendanceStatus(student.id, 'absent')}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Muộn">
                            <IconButton
                              size="small"
                              color={studentAttendance.status === 'late' ? 'warning' : 'default'}
                              onClick={() => updateAttendanceStatus(student.id, 'late')}
                            >
                              <AccessTimeIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Có phép">
                            <IconButton
                              size="small"
                              color={studentAttendance.status === 'excused' ? 'info' : 'default'}
                              onClick={() => updateAttendanceStatus(student.id, 'excused')}
                            >
                              <EventNoteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Chip
                          size="small"
                          label={getStatusLabel(studentAttendance.status)}
                          color={getStatusColor(studentAttendance.status)}
                          sx={{ mt: 1 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ghi chú">
                          <IconButton
                            size="small"
                            onClick={() => openNoteDialog(student)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          In
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportExcel}
        >
          Xuất Excel
        </Button>
        <Button
          variant="contained"
          startIcon={saving ? null : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
        </Button>
      </DialogActions>

      {/* Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Ghi chú cho sinh viên
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar>{selectedStudent.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{selectedStudent.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    MSSV: {selectedStudent.student_id}
                  </Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Ghi chú"
                value={attendance[selectedStudent.id]?.note || ''}
                onChange={(e) => updateStudentNote(selectedStudent.id, e.target.value)}
                placeholder="Nhập ghi chú cho sinh viên này..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setNoteDialogOpen(false)
              setSnackbar({
                open: true,
                message: 'Đã cập nhật ghi chú!',
                severity: 'success'
              })
            }}
          >
            Lưu ghi chú
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      {saving && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(255,255,255,0.7)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <Box textAlign="center">
            <LinearProgress sx={{ width: 200, mb: 2 }} />
            <Typography>Đang lưu điểm danh...</Typography>
          </Box>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default ManualAttendance