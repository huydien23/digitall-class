import React, { useState, useEffect } from 'react'
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
  Fab,
  InputAdornment,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  CircularProgress,
  Menu
} from '@mui/material'
import {
  School as SchoolIcon,
  People as PeopleIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ClassJoinQRCode from './ClassJoinQRCode'
import StudentImportDialog from './StudentImportDialog'

const ImprovedClassManagement = () => {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  
  // Form state for new class
  const [newClass, setNewClass] = useState({
    class_id: '',
    class_name: '',
    description: '',
    max_students: 50,
    schedule: '',
    room: ''
  })

  // Sample data - Replace with actual API call
  const sampleClasses = [
    {
      id: 1,
      class_id: 'CS101',
      class_name: 'Lập trình Web - DH22TIN01',
      description: 'Học phần lập trình web với ReactJS và Django',
      current_students: 45,
      max_students: 50,
      schedule: 'Thứ 2: 07:00-11:00',
      room: 'Phòng 14-02',
      is_active: true,
      attendance_rate: 85,
      created_at: '2024-09-01',
      teacher_name: 'TS. Nguyễn Văn A'
    },
    {
      id: 2,
      class_id: 'CS102',
      class_name: 'Cấu trúc dữ liệu - DH22TIN02',
      description: 'Học phần cấu trúc dữ liệu và giải thuật',
      current_students: 38,
      max_students: 45,
      schedule: 'Thứ 3: 13:00-17:00',
      room: 'Phòng 12-01',
      is_active: true,
      attendance_rate: 90,
      created_at: '2024-09-01',
      teacher_name: 'PGS. Trần Thị B'
    },
    {
      id: 3,
      class_id: 'CS103',
      class_name: 'Cơ sở dữ liệu - DH22TIN03',
      description: 'Học phần cơ sở dữ liệu với MySQL và MongoDB',
      current_students: 42,
      max_students: 50,
      schedule: 'Thứ 4: 07:00-11:00',
      room: 'Phòng 15-03',
      is_active: true,
      attendance_rate: 88,
      created_at: '2024-09-01',
      teacher_name: 'ThS. Lê Văn C'
    }
  ]

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setClasses(sampleClasses)
      setLoading(false)
    }, 1000)
  }

  const handleCreateClass = async () => {
    // Validate form
    if (!newClass.class_id || !newClass.class_name) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        severity: 'error'
      })
      return
    }

    // Simulate API call to create class
    setLoading(true)
    setTimeout(() => {
      const createdClass = {
        ...newClass,
        id: classes.length + 1,
        current_students: 0,
        is_active: true,
        attendance_rate: 0,
        teacher_name: 'Bạn',
        created_at: new Date().toISOString().split('T')[0]
      }
      
      setClasses([createdClass, ...classes])
      setCreateDialogOpen(false)
      setNewClass({
        class_id: '',
        class_name: '',
        description: '',
        max_students: 50,
        schedule: '',
        room: ''
      })
      
      setSnackbar({
        open: true,
        message: 'Tạo lớp học thành công!',
        severity: 'success'
      })
      setLoading(false)
    }, 1500)
  }

  const handleEditClass = (classId) => {
    navigate(`/classes/${classId}/edit`)
  }

  const handleDeleteClass = (classId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lớp học này?')) {
      setClasses(classes.filter(c => c.id !== classId))
      setSnackbar({
        open: true,
        message: 'Đã xóa lớp học',
        severity: 'info'
      })
    }
  }

  const handleViewClass = (classId) => {
    navigate(`/classes/${classId}`)
  }

  const handleShareClass = (classItem) => {
    const classLink = `${window.location.origin}/join/${classItem.class_id}`
    navigator.clipboard.writeText(classLink)
    setSnackbar({
      open: true,
      message: 'Đã copy link lớp học!',
      severity: 'success'
    })
  }

  const handleImportStudents = (classItem = null) => {
    setSelectedClass(classItem)
    setImportDialogOpen(true)
  }

  const handleShowQRCode = (classItem) => {
    setSelectedClass(classItem)
    setQrDialogOpen(true)
  }

  const handleImportComplete = (result) => {
    setSnackbar({
      open: true,
      message: result.success ? 'Import thành công!' : 'Import thất bại',
      severity: result.success ? 'success' : 'error'
    })
    // Refresh class list or update student count
    fetchClasses()
  }

  const handleMenuOpen = (event, classItem) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedClass(classItem)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedClass(null)
  }

  // Filter classes based on search and active status
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          classItem.class_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterActive === 'all' || 
                          (filterActive === 'active' && classItem.is_active) ||
                          (filterActive === 'inactive' && !classItem.is_active)
    return matchesSearch && matchesFilter
  })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Quản lý lớp học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tổng cộng: {classes.length} lớp học
          </Typography>
        </Box>
        
        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => handleImportStudents()}
          >
            Import Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ 
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
            }}
          >
            Tạo lớp mới
          </Button>
        </Stack>
      </Box>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm lớp học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                label="Trạng thái"
                startAdornment={<FilterIcon sx={{ mr: 1, ml: 1 }} />}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="inactive">Tạm dừng</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Class List */}
      <Grid container spacing={3}>
        {filteredClasses.map((classItem, index) => (
          <Grid item xs={12} lg={6} xl={4} key={classItem.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  {/* Class Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        <SchoolIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {classItem.class_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mã lớp: {classItem.class_id}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={classItem.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={classItem.is_active ? 'success' : 'default'}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, classItem)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Class Description */}
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {classItem.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Class Stats */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PeopleIcon fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="h6">
                            {classItem.current_students}/{classItem.max_students}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sinh viên
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CheckCircleIcon fontSize="small" color="success" />
                        <Box>
                          <Typography variant="h6">
                            {classItem.attendance_rate}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Điểm danh
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ScheduleIcon fontSize="small" color="info" />
                        <Typography variant="caption">
                          {classItem.schedule}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon fontSize="small" color="warning" />
                        <Typography variant="caption">
                          {classItem.room}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Progress Bar */}
                  <Box mt={2}>
                    <LinearProgress
                      variant="determinate"
                      value={(classItem.current_students / classItem.max_students) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </CardContent>

                {/* Action Buttons */}
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewClass(classItem.id)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    size="small"
                    startIcon={<QrCodeIcon />}
                    onClick={() => handleShowQRCode(classItem)}
                    sx={{ color: 'success.main' }}
                  >
                    QR tham gia
                  </Button>
                  <Button
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleImportStudents(classItem)}
                  >
                    Thêm SV
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {!loading && filteredClasses.length === 0 && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
        >
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            {searchQuery ? 'Không tìm thấy lớp học nào' : 'Chưa có lớp học nào'}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchQuery ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách tạo lớp học mới'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Tạo lớp đầu tiên
          </Button>
        </Box>
      )}

      {/* Class Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleShowQRCode(selectedClass); handleMenuClose() }}>
          <QrCodeIcon sx={{ mr: 1 }} fontSize="small" />
          Tạo QR tham gia
        </MenuItem>
        <MenuItem onClick={() => { handleImportStudents(selectedClass); handleMenuClose() }}>
          <UploadIcon sx={{ mr: 1 }} fontSize="small" />
          Import sinh viên
        </MenuItem>
        <MenuItem onClick={() => { handleShareClass(selectedClass); handleMenuClose() }}>
          <ShareIcon sx={{ mr: 1 }} fontSize="small" />
          Chia sẻ lớp
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleEditClass(selectedClass?.id); handleMenuClose() }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Chỉnh sửa
        </MenuItem>
        <MenuItem 
          onClick={() => { handleDeleteClass(selectedClass?.id); handleMenuClose() }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Xóa lớp
        </MenuItem>
      </Menu>

      {/* Create Class Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon color="primary" />
            Tạo lớp học mới
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mã lớp *"
                  value={newClass.class_id}
                  onChange={(e) => setNewClass({ ...newClass, class_id: e.target.value })}
                  placeholder="VD: CS101"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số lượng tối đa"
                  type="number"
                  value={newClass.max_students}
                  onChange={(e) => setNewClass({ ...newClass, max_students: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên lớp *"
                  value={newClass.class_name}
                  onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
                  placeholder="VD: Lập trình Web - DH22TIN01"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  multiline
                  rows={3}
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  placeholder="Mô tả về lớp học..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lịch học"
                  value={newClass.schedule}
                  onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
                  placeholder="VD: Thứ 2: 07:00-11:00"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phòng học"
                  value={newClass.room}
                  onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
                  placeholder="VD: Phòng 14-02"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateClass}
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo lớp học'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <ClassJoinQRCode
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        classData={selectedClass}
      />

      {/* Student Import Dialog */}
      <StudentImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        classData={selectedClass}
        onImportComplete={handleImportComplete}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button for quick actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Tạo lớp mới"
          onClick={() => setCreateDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<UploadIcon />}
          tooltipTitle="Import Excel"
          onClick={() => handleImportStudents()}
        />
        <SpeedDialAction
          icon={<QrCodeIcon />}
          tooltipTitle="QR tham gia nhanh"
          onClick={() => {
            if (classes.length > 0) {
              handleShowQRCode(classes[0])
            }
          }}
        />
      </SpeedDial>
    </Container>
  )
}

export default ImprovedClassManagement