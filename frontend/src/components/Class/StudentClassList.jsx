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
import attendanceService from '../../services/attendanceService'
import { useNavigate } from 'react-router-dom'

const StudentClassList = ({ user }) => {
  const [classes, setClasses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const navigate = useNavigate()

  // Helper to format schedule string
  const formatSession = (s) => {
    if (!s) return 'Chưa cập nhật'
    const d = new Date(s.session_date)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const fmt = (t) => (t ? String(t).slice(0,5) : '--:--')
    return `${dd}/${mm}/${yyyy}, ${fmt(s.start_time)}-${fmt(s.end_time)}`
  }

  // Load real classes from API
  useEffect(() => {
    const loadStudentClasses = async () => {
      setIsLoading(true)
      try {
        const res = await (await import('../../services/classService')).default.getMyClasses()
        const apiData = res.data?.results || res.data || []
        const mapped = apiData.map((c) => ({
          id: c.id,
          name: c.class_name || 'Lớp học',
          code: c.class_id || '',
          teacher: c.teacher?.full_name || `${c.teacher?.first_name || ''} ${c.teacher?.last_name || ''}`.trim() || 'Giảng viên',
          schedule: 'Đang tải... ',
          location: 'Đang tải... ',
          status: c.is_active ? 'active' : 'inactive',
          joinedAt: null,
          totalStudents: c.current_students_count || 0,
          description: c.description || ''
        }))
        setClasses(mapped)

        // Fetch next session for each class to populate schedule and location
        const todayStr = new Date().toISOString().slice(0,10)
        await Promise.all(
          mapped.map(async (cls) => {
            try {
              const resSes = await attendanceService.getSessions({ class_id: cls.id, page_size: 200 })
              const list = resSes.data?.results || resSes.data || []
              // Choose the next upcoming session >= today; if none, pick the most recent
              let next = list
                .filter((s) => String(s.session_date) >= todayStr)
                .sort((a, b) => (a.session_date > b.session_date ? 1 : a.session_date < b.session_date ? -1 : String(a.start_time).localeCompare(String(b.start_time))))[0]
              if (!next && list.length > 0) {
                next = list
                  .slice()
                  .sort((a, b) => (a.session_date > b.session_date ? -1 : a.session_date < b.session_date ? 1 : String(b.start_time).localeCompare(String(a.start_time))))[0]
              }
              setClasses((prev) => prev.map((c) => (c.id === cls.id ? { ...c, schedule: formatSession(next), location: next?.location || 'Chưa cập nhật' } : c)))
            } catch (e) {
              // ignore per-class fetch error
            }
          })
        )
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

  const handleViewDetail = (classItem) => {
    if (classItem?.id) navigate(`/classes/${classItem.id}`)
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
                      onClick={() => handleViewDetail(classItem)}
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
        onJoin={async () => {
          // Reload real classes after join
          try {
            const res = await (await import('../../services/classService')).default.getMyClasses()
            const apiData = res.data?.results || res.data || []
            const mapped = apiData.map((c) => ({
              id: c.id,
              name: c.class_name || 'Lớp học',
              code: c.class_id || '',
              teacher: c.teacher?.full_name || `${c.teacher?.first_name || ''} ${c.teacher?.last_name || ''}`.trim() || 'Giảng viên',
              schedule: 'Đang tải... ',
              location: 'Đang tải... ',
              status: c.is_active ? 'active' : 'inactive',
              joinedAt: null,
              totalStudents: c.current_students_count || 0,
              description: c.description || ''
            }))
            setClasses(mapped)
            // Fetch sessions for schedule
            const todayStr = new Date().toISOString().slice(0,10)
            await Promise.all(
              mapped.map(async (cls) => {
                try {
                  const resSes = await attendanceService.getSessions({ class_id: cls.id, page_size: 200 })
                  const list = resSes.data?.results || resSes.data || []
                  let next = list
                    .filter((s) => String(s.session_date) >= todayStr)
                    .sort((a, b) => (a.session_date > b.session_date ? 1 : a.session_date < b.session_date ? -1 : String(a.start_time).localeCompare(String(b.start_time))))[0]
                  if (!next && list.length > 0) {
                    next = list
                      .slice()
                      .sort((a, b) => (a.session_date > b.session_date ? -1 : a.session_date < b.session_date ? 1 : String(b.start_time).localeCompare(String(a.start_time))))[0]
                  }
                  setClasses((prev) => prev.map((c) => (c.id === cls.id ? { ...c, schedule: formatSession(next), location: next?.location || 'Chưa cập nhật' } : c)))
                } catch {}
              })
            )
          } catch {}
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
