import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Fab,
  Tooltip,
  TextField,
  InputAdornment,
  Paper,
  Stack
} from '@mui/material'
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  QrCode as QrCodeIcon,
  Input as InputIcon,
  Link as LinkIcon,
  ExitToApp as ExitIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import ClassJoinDialog from './ClassJoinDialog'

const StudentClassList = ({ user }) => {
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data for student classes
  useEffect(() => {
    const loadStudentClasses = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data based on real schedule
        const mockClasses = [
          {
            id: 1,
            name: 'Lập trình Python',
            code: '110101101010', // 12-digit binary
            teacher: 'GV: Đặng Mạnh Huy',
            schedule: 'Thứ 2 - 07:00-11:00 (Tiết 7-11)',
            location: 'Phòng I4-02 (Phòng máy 8)',
            status: 'active',
            joinedAt: '2025-09-01',
            totalStudents: 42,
            description: 'Học lập trình Python cơ bản và nâng cao, thực hành trên máy tính'
          },
          {
            id: 2,
            name: 'Phát triển phần mềm mã nguồn mở',
            code: '101010101010', // 12-digit binary
            teacher: 'GV: Võ Thanh Vinh',
            schedule: 'Thứ 4 - 07:00-11:00 (Tiết 7-11)',
            location: 'Phòng I5-03 (Phòng máy 15)',
            status: 'active',
            joinedAt: '2025-09-01',
            totalStudents: 38,
            description: 'Thực hành phát triển phần mềm với các công cụ mã nguồn mở'
          },
          {
            id: 3,
            name: 'Lịch sử Đảng cộng sản Việt Nam',
            code: '111100001111', // 12-digit binary
            teacher: 'GV: Đinh Cao Tín',
            schedule: 'Thứ 5 - 06:45-08:15 (Tiết 4-6)',
            location: 'Phòng D4-04 (Hội trường Khu D)',
            status: 'active',
            joinedAt: '2025-09-01',
            totalStudents: 120,
            description: 'Học về lịch sử hình thành và phát triển của Đảng Cộng sản Việt Nam'
          },
          {
            id: 4,
            name: 'Lập trình thiết bị di động',
            code: '100110011001', // 12-digit binary
            teacher: 'GV: Đoàn Chí Trung',
            schedule: 'Thứ 6 - 07:00-11:00 (Tiết 7-11)',
            location: 'Phòng I4-02 (Phòng máy 8)',
            status: 'active',
            joinedAt: '2025-09-01',
            totalStudents: 35,
            description: 'Phát triển ứng dụng di động trên Android và iOS'
          },
          {
            id: 5,
            name: 'Pháp luật về công nghệ thông tin',
            code: '010101010101', // 12-digit binary
            teacher: 'GV: Trần Minh Tâm',
            schedule: 'Thứ 7 - 06:45-08:15 (Tiết 1-3)',
            location: 'Phòng T4-05 (Học đường)',
            status: 'active',
            joinedAt: '2025-09-01',
            totalStudents: 85,
            description: 'Tìm hiểu các quy định pháp lý trong lĩnh vực công nghệ thông tin'
          }
        ]
        
        setClasses(mockClasses)
      } catch (err) {
        setError('Không thể tải danh sách lớp học')
      } finally {
        setIsLoading(false)
      }
    }

    loadStudentClasses()
  }, [])

  const handleJoinClass = () => {
    setJoinDialogOpen(true)
  }

  const handleLeaveClass = (classItem) => {
    setSelectedClass(classItem)
    setLeaveDialogOpen(true)
  }

  const confirmLeaveClass = () => {
    if (selectedClass) {
      setClasses(prev => prev.filter(c => c.id !== selectedClass.id))
      setLeaveDialogOpen(false)
      setSelectedClass(null)
    }
  }

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.code.includes(searchTerm)
    
    const matchesFilter = filterStatus === 'all' || classItem.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'inactive': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang học'
      case 'pending': return 'Chờ duyệt'
      case 'inactive': return 'Đã kết thúc'
      default: return 'Không xác định'
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Lớp học của tôi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleJoinClass}
          sx={{ borderRadius: 2 }}
        >
          Tham gia lớp học
        </Button>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Tìm kiếm lớp học, giảng viên, mã lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            startIcon={<FilterIcon />}
            variant="outlined"
            onClick={() => setFilterStatus(filterStatus === 'all' ? 'active' : 'all')}
          >
            {filterStatus === 'all' ? 'Tất cả' : 'Đang học'}
          </Button>
        </Stack>
      </Paper>

      {/* Classes List */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {filteredClasses.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'Không tìm thấy lớp học nào' : 'Bạn chưa tham gia lớp học nào'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy tham gia lớp học để bắt đầu học tập'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleJoinClass}
            >
              Tham gia lớp học
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => (
            <Grid item xs={12} md={6} lg={4} key={classItem.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Class Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {classItem.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mã lớp: {classItem.code}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusText(classItem.status)}
                      color={getStatusColor(classItem.status)}
                      size="small"
                    />
                  </Box>

                  {/* Class Info */}
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Giảng viên"
                        secondary={classItem.teacher}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <ScheduleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Lịch học"
                        secondary={classItem.schedule}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <LocationIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Địa điểm"
                        secondary={classItem.location}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      />
                    </ListItem>
                  </List>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {classItem.description}
                  </Typography>
                </CardContent>

                {/* Actions */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<InfoIcon />}
                      sx={{ flexGrow: 1 }}
                    >
                      Chi tiết
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<ExitIcon />}
                      onClick={() => handleLeaveClass(classItem)}
                    >
                      Rời lớp
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Join Class Dialog */}
      <ClassJoinDialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        onJoin={(classData) => {
          // Add new class to list
          const newClass = {
            id: Date.now(),
            name: classData.name || 'Lớp học mới',
            code: classData.code || '000000000000',
            teacher: classData.teacher || 'Giảng viên',
            schedule: 'Chưa cập nhật',
            location: 'Chưa cập nhật',
            status: 'pending',
            joinedAt: new Date().toISOString().split('T')[0],
            totalStudents: 0,
            description: 'Lớp học mới tham gia'
          }
          setClasses(prev => [...prev, newClass])
          setJoinDialogOpen(false)
        }}
      />

      {/* Leave Class Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
        <DialogTitle>Xác nhận rời lớp</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn rời khỏi lớp "{selectedClass?.name}" không?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>Hủy</Button>
          <Button onClick={confirmLeaveClass} color="error" variant="contained">
            Rời lớp
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="join class"
        onClick={handleJoinClass}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}

export default StudentClassList
