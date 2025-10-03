import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  InputAdornment,
  Stack,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  alpha,
  useTheme
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import scheduleService from '../../services/scheduleService'
import classService from '../../services/classService'
import ScheduleFormDialog from './ScheduleFormDialog'
import { Helmet } from 'react-helmet-async'

const TeacherScheduleManagement = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [classes, setClasses] = useState([])
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterDay, setFilterDay] = useState('')
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load schedules
      const schedulesRes = await scheduleService.getSchedules()
      setSchedules(schedulesRes.data?.results || schedulesRes.data || [])

      // Load classes
      const classesRes = await classService.getClasses()
      setClasses(classesRes.data?.results || classesRes.data || [])

      setError('')
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Không thể tải dữ liệu thời khóa biểu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handlers
  const handleCreate = () => {
    setEditData(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (schedule) => {
    setEditData(schedule)
    setFormDialogOpen(true)
  }

  const handleDeleteClick = (schedule) => {
    setDeleteTarget(schedule)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    try {
      await scheduleService.deleteSchedule(deleteTarget.id)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      console.error('Error deleting schedule:', err)
      setError('Không thể xóa thời khóa biểu')
    }
  }

  const handleFormSuccess = () => {
    loadData()
  }

  // Filters
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.class?.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.class?.class_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.room?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClass = !filterClass || schedule.class?.id === parseInt(filterClass)
    const matchesDay = filterDay === '' || schedule.day_of_week === parseInt(filterDay)

    return matchesSearch && matchesClass && matchesDay
  })

  // Helpers
  const getDayName = (dayOfWeek) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[dayOfWeek]
  }

  const getSessionTypeName = (type) => {
    const types = {
      lecture: 'Lý thuyết',
      practice: 'Thực hành',
      seminar: 'Seminar',
      exam: 'Kiểm tra',
      other: 'Khác'
    }
    return types[type] || type
  }

  const getSessionTypeColor = (type) => {
    const colors = {
      lecture: 'primary',
      practice: 'success',
      seminar: 'info',
      exam: 'error',
      other: 'default'
    }
    return colors[type] || 'default'
  }

  // Group schedules by day for display
  const schedulesByDay = filteredSchedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week
    if (!acc[day]) acc[day] = []
    acc[day].push(schedule)
    return acc
  }, {})

  // Sort days (Monday to Sunday)
  const sortedDays = Object.keys(schedulesByDay).sort((a, b) => {
    const aDay = parseInt(a)
    const bDay = parseInt(b)
    if (aDay === 0) return 1 // Sunday last
    if (bDay === 0) return -1
    return aDay - bDay
  })

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Helmet>
        <title>Quản lý thời khóa biểu - EduAttend</title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Quản lý thời khóa biểu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tạo và quản lý lịch học cho các lớp
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadData}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Thêm thời khóa biểu
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Tìm theo lớp, phòng học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Lọc theo lớp</InputLabel>
                  <Select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    label="Lọc theo lớp"
                  >
                    <MenuItem value="">Tất cả lớp</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.class_id} - {cls.class_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Lọc theo thứ</InputLabel>
                  <Select
                    value={filterDay}
                    onChange={(e) => setFilterDay(e.target.value)}
                    label="Lọc theo thứ"
                  >
                    <MenuItem value="">Tất cả các ngày</MenuItem>
                    <MenuItem value="1">Thứ 2</MenuItem>
                    <MenuItem value="2">Thứ 3</MenuItem>
                    <MenuItem value="3">Thứ 4</MenuItem>
                    <MenuItem value="4">Thứ 5</MenuItem>
                    <MenuItem value="5">Thứ 6</MenuItem>
                    <MenuItem value="6">Thứ 7</MenuItem>
                    <MenuItem value="0">Chủ nhật</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={600} color="primary.main">
                  {schedules.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng số tiết
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {new Set(schedules.map(s => s.class?.id)).size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Số lớp học
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={600} color="warning.main">
                  {sortedDays.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ngày có lịch
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={600} color="info.main">
                  {filteredSchedules.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kết quả lọc
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Schedule Table */}
        {filteredSchedules.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có thời khóa biểu
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Bắt đầu bằng cách thêm thời khóa biểu mới cho các lớp học
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                Thêm thời khóa biểu
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Thứ</strong></TableCell>
                    <TableCell><strong>Lớp học</strong></TableCell>
                    <TableCell><strong>Thời gian</strong></TableCell>
                    <TableCell><strong>Phòng học</strong></TableCell>
                    <TableCell><strong>Loại tiết</strong></TableCell>
                    <TableCell><strong>Ghi chú</strong></TableCell>
                    <TableCell align="right"><strong>Thao tác</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedDays.map((day) => (
                    <React.Fragment key={day}>
                      {/* Day Header Row */}
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell colSpan={7}>
                          <Typography variant="subtitle1" fontWeight={600} color="primary">
                            {getDayName(parseInt(day))}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {/* Schedule Rows */}
                      {schedulesByDay[day]
                        .sort((a, b) => a.start_time?.localeCompare(b.start_time))
                        .map((schedule, index) => (
                        <TableRow 
                          key={schedule.id}
                          component={motion.tr}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          hover
                        >
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {schedule.start_time?.slice(0, 5)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <SchoolIcon color="action" fontSize="small" />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {schedule.class?.class_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {schedule.class?.class_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <TimeIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {schedule.start_time?.slice(0, 5)} - {schedule.end_time?.slice(0, 5)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {schedule.room || 'Chưa xác định'}
                                {schedule.building && ` - ${schedule.building}`}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getSessionTypeName(schedule.session_type)}
                              color={getSessionTypeColor(schedule.session_type)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {schedule.notes || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Chỉnh sửa">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleEdit(schedule)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteClick(schedule)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Form Dialog */}
        <ScheduleFormDialog
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          onSuccess={handleFormSuccess}
          editData={editData}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc chắn muốn xóa thời khóa biểu này?
              <br />
              <strong>{deleteTarget?.class?.class_name}</strong> - {getDayName(deleteTarget?.day_of_week)} - {deleteTarget?.start_time?.slice(0, 5)}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default TeacherScheduleManagement
