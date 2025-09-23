import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab
} from '@mui/material'
import {
  School as SchoolIcon,
  People as PeopleIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTeacherMockData } from '../Dashboard/TeacherMockDataProvider'
import MockDataNotice from '../Dashboard/MockDataNotice'

const TeacherClassManagement = () => {
  const { mockData, isLoading } = useTeacherMockData()
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState(null)
  const [showStudentList, setShowStudentList] = useState(false)
  const [showMockNotice, setShowMockNotice] = useState(true)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)

  // Mock student data for the class
  const mockStudents = [
    { id: 1, student_id: '221222', name: 'Lê Văn Nhựt Anh', attendance_rate: 95 },
    { id: 2, student_id: '222803', name: 'Trần Nguyễn Phương Anh', attendance_rate: 88 },
    { id: 3, student_id: '226969', name: 'Nguyễn Xuân Bách', attendance_rate: 92 },
    { id: 4, student_id: '221605', name: 'Huỳnh Thương Bảo', attendance_rate: 85 },
    { id: 5, student_id: '221330', name: 'Thạch Văn Bảo', attendance_rate: 90 },
    { id: 6, student_id: '222560', name: 'Nguyễn Tiến Chức', attendance_rate: 87 },
    { id: 7, student_id: '223463', name: 'Đặng Thiên Chương', attendance_rate: 93 },
    { id: 8, student_id: '220237', name: 'Nguyễn Đặng Hải Đăng', attendance_rate: 89 },
    { id: 9, student_id: '221761', name: 'Trần Tấn Đạt', attendance_rate: 91 },
    { id: 10, student_id: '223319', name: 'Nguyễn Thị Ngọc Diễm', attendance_rate: 94 },
    { id: 11, student_id: '226514', name: 'Nguyễn Huy Điền', attendance_rate: 96 },
    { id: 12, student_id: '220947', name: 'Trần Huỳnh Đức', attendance_rate: 86 },
  ]

  const handleViewClass = (classItem) => {
    // Navigate to class detail page
    navigate(`/classes/${classItem.id}`)
  }

  const handleCreateSession = () => {
    setSessionDialogOpen(true)
  }

  const handleGenerateQR = () => {
    setQrDialogOpen(true)
  }

  const handleShareClass = () => {
    const classLink = `https://eduattend.app/join/110101101010`
    navigator.clipboard.writeText(classLink)
    alert('Link lớp học đã được copy!')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Đang tải lớp học...
            </Typography>
          </Box>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Lớp của tôi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý lớp học và sinh viên
        </Typography>
      </Box>

      {/* Mock Data Notice */}
      {showMockNotice && (
        <MockDataNotice
          onRefresh={handleRefresh}
          onDismiss={() => setShowMockNotice(false)}
        />
      )}

      {/* Class List */}
      <Grid container spacing={3}>
        {mockData.assignedClasses.map((classItem) => (
          <Grid item xs={12} key={classItem.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ overflow: 'visible' }}>
                <CardContent>
                  <Box display="flex" justifyContent="between" alignItems="flex-start" mb={3}>
                    <Box display="flex" alignItems="center" gap={2} flex={1}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                        <SchoolIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          {classItem.class_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          Mã lớp: <strong>{classItem.class_id}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {classItem.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={classItem.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                        color={classItem.is_active ? 'success' : 'default'}
                      />
                      <Tooltip title="Cài đặt lớp">
                        <IconButton>
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Class Stats */}
                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <PeopleIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                          {classItem.current_students}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sinh viên
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <CalendarIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                          {classItem.schedule}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lịch học
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <LocationIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h6" fontWeight={600} noWrap>
                          Phòng 14-02
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Địa điểm
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center">
                        <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>
                          85%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Điểm danh TB
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Progress Bar */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Sĩ số lớp
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {classItem.current_students}/{classItem.max_students}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(classItem.current_students / classItem.max_students) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Lưu ý:</strong> Lớp đã vượt sĩ số quy định ({classItem.current_students}/{classItem.max_students} sinh viên)
                  </Alert>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewClass(classItem)}
                      >
                        Xem lớp
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={handleCreateSession}
                        color="success"
                      >
                        Tạo buổi học
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<QrCodeIcon />}
                        onClick={handleGenerateQR}
                        color="warning"
                      >
                        QR điểm danh
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ShareIcon />}
                        onClick={handleShareClass}
                        color="info"
                      >
                        Chia sẻ lớp
                      </Button>
                    </Grid>
                  </Grid>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Student List Dialog */}
      <Dialog
        open={showStudentList}
        onClose={() => setShowStudentList(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <SchoolIcon />
            <Box>
              <Typography variant="h6">
                Danh sách sinh viên - {selectedClass?.class_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mockStudents.length} sinh viên
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell align="right">Tỷ lệ điểm danh</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                        <Typography
                          variant="body2"
                          color={
                            student.attendance_rate >= 90 ? 'success.main' :
                            student.attendance_rate >= 80 ? 'warning.main' : 'error.main'
                          }
                          fontWeight={600}
                        >
                          {student.attendance_rate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          student.attendance_rate >= 90 ? 'Xuất sắc' :
                          student.attendance_rate >= 80 ? 'Tốt' : 'Cần cải thiện'
                        }
                        color={
                          student.attendance_rate >= 90 ? 'success' :
                          student.attendance_rate >= 80 ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStudentList(false)}>Đóng</Button>
          <Button variant="contained" startIcon={<GradeIcon />}>
            Nhập điểm
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo QR Code điểm danh</DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={4}>
            <QrCodeIcon sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              QR Code điểm danh
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Sinh viên quét mã này để điểm danh
            </Typography>
            <Alert severity="info">
              <strong>Demo:</strong> Tính năng QR Code đang được phát triển
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Đóng</Button>
          <Button variant="contained" startIcon={<CopyIcon />}>
            Copy link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Session Dialog */}
      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo buổi học mới</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên buổi học"
              fullWidth
              defaultValue="Buổi học tuần 8 - Lập trình Python"
            />
            <TextField
              label="Ngày học"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Giờ bắt đầu"
                type="time"
                defaultValue="07:00"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Giờ kết thúc"
                type="time"
                defaultValue="11:00"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Địa điểm"
              fullWidth
              defaultValue="Phòng 14-02 (Phòng máy 8)"
            />
            <TextField
              label="Ghi chú"
              fullWidth
              multiline
              rows={3}
              placeholder="Nội dung buổi học, yêu cầu chuẩn bị..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => {
            setSessionDialogOpen(false)
            alert('Buổi học đã được tạo thành công!')
          }}>
            Tạo buổi học
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleCreateSession}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}

export default TeacherClassManagement
