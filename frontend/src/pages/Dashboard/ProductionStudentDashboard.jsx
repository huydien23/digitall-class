import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import attendanceService from '../../services/attendanceService'
import studentService from '../../services/studentService'
import gradeService from '../../services/gradeService'
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
  LinearProgress,
  Alert,
  CircularProgress,
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Skeleton,
  Fade,
  Slide,
  Backdrop,
  Snackbar,
  Alert as MuiAlert,
  Fab,
  Menu,
  MenuItem,
  ListItemButton,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Drawer,
  AppBar,
  Toolbar,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  CameraAlt as CameraAltIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Bookmark as BookmarkIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  Today as TodayIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Subject as SubjectIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  Pending as PendingIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  ExitToApp as ExitToAppIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Done as DoneIcon,
  Clear as ClearIcon,
  FilterAlt as FilterAltIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewComfy as ViewComfyIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  BookmarkBorder as BookmarkBorderIcon,
  BookmarkAdded as BookmarkAddedIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  Comment as CommentIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  AudioFile as AudioFileIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  ShowChart as ShowChartIcon,
  MultilineChart as MultilineChartIcon,
  ScatterPlot as ScatterPlotIcon,
  BubbleChart as BubbleChartIcon,
  DonutLarge as DonutLargeIcon,
  DonutSmall as DonutSmallIcon,
  PieChartOutline as PieChartOutlineIcon,
  BarChartOutlined as BarChartOutlinedIcon,
  ShowChartOutlined as ShowChartOutlinedIcon,
  TimelineOutlined as TimelineOutlinedIcon,
  TrendingUpOutlined as TrendingUpOutlinedIcon,
  TrendingDownOutlined as TrendingDownOutlinedIcon,
  TrendingFlatOutlined as TrendingFlatOutlinedIcon,
  MultilineChartOutlined as MultilineChartOutlinedIcon,
  ScatterPlotOutlined as ScatterPlotOutlinedIcon,
  BubbleChartOutlined as BubbleChartOutlinedIcon,
  DonutLargeOutlined as DonutLargeOutlinedIcon,
  DonutSmallOutlined as DonutSmallOutlinedIcon,
  PieChartOutlineOutlined as PieChartOutlineOutlinedIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import QRCodeScanner from '../../components/QRCode/QRCodeScanner'
import StudentCheckInDialog from '../../components/Attendance/StudentCheckInDialog'
import StudentClassList from '../../components/Class/StudentClassList'
import StudentGradesView from '../../components/Grades/StudentGradesView'
import StudentScheduleView from '../../components/Schedule/StudentScheduleView'

// Custom Hooks
const useErrorHandler = () => {
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const handleError = useCallback((err, retryFn) => {
    setError(err.message || 'An error occurred')
    
    if (retryCount < 3 && retryFn) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        retryFn()
      }, 1000 * Math.pow(2, retryCount)) // Exponential backoff
    }
  }, [retryCount])
  
  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])
  
  return { error, handleError, clearError, retryCount }
}

const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({})
  
  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }))
  }, [])
  
  const isLoading = useCallback((key) => loadingStates[key] || false, [loadingStates])
  
  return { setLoading, isLoading }
}

const useNotification = () => {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' })
  
  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity })
  }, [])
  
  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }))
  }, [])
  
  return { notification, showNotification, hideNotification }
}

// Components
const LoadingSkeleton = ({ height = 200, width = '100%' }) => (
  <Skeleton variant="rectangular" height={height} width={width} animation="wave" />
)

const ErrorBoundary = ({ error, onRetry, onDismiss }) => (
  <Alert 
    severity="error" 
    action={
      <Box>
        {onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )}
        {onDismiss && (
          <IconButton size="small" onClick={onDismiss}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
    }
  >
    {error}
  </Alert>
)

const EmptyState = ({ icon, title, description, action }) => (
  <Box textAlign="center" py={8}>
    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'grey.100' }}>
      {icon}
    </Avatar>
    <Typography variant="h6" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      {description}
    </Typography>
    {action}
  </Box>
)

const StatCard = ({ title, value, icon, color, subtitle, trend, loading, onClick }) => {
  const theme = useTheme()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          height: '100%', 
          position: 'relative', 
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { boxShadow: theme.shadows[8] } : {}
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
              {icon}
            </Avatar>
            {trend && (
              <Chip
                label={trend}
                size="small"
                color={trend.includes('+') ? 'success' : 'error'}
                variant="outlined"
              />
            )}
          </Box>
          {loading ? (
            <LoadingSkeleton height={40} />
          ) : (
            <Typography variant="h4" fontWeight={700} color={`${color}.main`} gutterBottom>
              {value}
            </Typography>
          )}
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const ProductionStudentDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Custom hooks
  const { error, handleError, clearError } = useErrorHandler()
  const { setLoading, isLoading } = useLoadingStates()
  const { notification, showNotification, hideNotification } = useNotification()
  // State management
  const [activeTab, setActiveTab] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [qrCodeInput, setQrCodeInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  // Data state - use mock data as fallback
  const [studentData, setStudentData] = useState({
    profile: null,
    attendanceRecords: [],
    recentGrades: [],
    classSchedule: [],
    assignments: [],
    notifications: [],
    statistics: {
      attendanceRate: 0,
      totalClasses: 0,
      averageGrade: 0,
      thisWeekAttendance: 0,
      gpa: 0,
      creditsEarned: 0,
      creditsRemaining: 0
    }
  })

  
  // Data loading functions
  const loadStudentProfile = useCallback(async () => {
    // Check if user has valid student_id
    if (!user?.id && !user?.student_id) {
      return
    }
    
    try {
      setLoading('profile', true)
      const studentId = user.student_id || user.id
      
      const response = await studentService.getStudent(studentId)
      setStudentData(prev => ({ ...prev, profile: response.data }))
    } catch (err) {
      // Don't retry on 404 - student might not exist
      if (err.response?.status === 404) {
        // Don't show error, just use mock data
        return
      }
      // Only retry on network errors, not 404s
      if (err.code !== 'ERR_BAD_REQUEST') {
        handleError(err, () => loadStudentProfile())
      }
    } finally {
      setLoading('profile', false)
    }
  }, [user.id, user.student_id, setLoading, handleError])
  
  const loadAttendanceRecords = useCallback(async () => {
    // Check if user has valid student_id
    if (!user?.id && !user?.student_id) {
      return
    }
    
    try {
      setLoading('attendance', true)
      const response = await attendanceService.getAttendances({
        student_id: user.student_id || user.id,
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined
      })
      setStudentData(prev => ({ ...prev, attendanceRecords: response.data.results || [] }))
    } catch (err) {
      // Don't retry on 404 - no attendance records yet
      if (err.response?.status === 404) {
        setStudentData(prev => ({ ...prev, attendanceRecords: [] }))
        return
      }
      // Only retry on network errors
      if (err.code !== 'ERR_BAD_REQUEST') {
        handleError(err, () => loadAttendanceRecords())
      }
    } finally {
      setLoading('attendance', false)
    }
  }, [user.id, user.student_id, page, rowsPerPage, searchTerm, filterStatus, setLoading, handleError])
  
  const loadGrades = useCallback(async () => {
    // Check if user has valid student_id
    if (!user?.id && !user?.student_id) {
      return
    }
    
    try {
      setLoading('grades', true)
      const response = await gradeService.getGrades({
        student_id: user.student_id || user.id,
        ordering: '-created_at'
      })
      setStudentData(prev => ({ ...prev, recentGrades: response.data.results || [] }))
    } catch (err) {
      // Don't retry on 404 - no grades yet
      if (err.response?.status === 404) {
        setStudentData(prev => ({ ...prev, recentGrades: [] }))
        return
      }
      // Only retry on network errors
      if (err.code !== 'ERR_BAD_REQUEST') {
        handleError(err, () => loadGrades())
      }
    } finally {
      setLoading('grades', false)
    }
  }, [user.id, user.student_id, setLoading, handleError])
  
  const loadStatistics = useCallback(async () => {
    // Check if user has valid student_id
    if (!user?.id && !user?.student_id) {
      return
    }
    
    try {
      setLoading('statistics', true)
      
      // Load attendance statistics
      const attendanceResponse = await attendanceService.getAttendances({
        student_id: user.student_id || user.id
      })
      const attendanceRecords = attendanceResponse.data.results || []
      
      // Load grade statistics
      const gradesResponse = await gradeService.getGrades({
        student_id: user.student_id || user.id
      })
      const grades = gradesResponse.data.results || []
      
      // Calculate statistics
      const totalClasses = attendanceRecords.length
      const presentClasses = attendanceRecords.filter(record => record.status === 'present').length
      const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0
      
      const averageGrade = grades.length > 0
        ? grades.reduce((sum, grade) => sum + (grade.score || 0), 0) / grades.length
        : 0
      
      // Calculate GPA (assuming 4.0 scale)
      const gpa = grades.length > 0
        ? grades.reduce((sum, grade) => {
            const score = grade.score || 0
            let points = 0
            if (score >= 90) points = 4.0
            else if (score >= 80) points = 3.0
            else if (score >= 70) points = 2.0
            else if (score >= 60) points = 1.0
            return sum + points
          }, 0) / grades.length
        : 0
      
      // Calculate this week's attendance
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const thisWeekRecords = attendanceRecords.filter(record => 
        new Date(record.check_in_time) >= oneWeekAgo
      )
      const thisWeekPresent = thisWeekRecords.filter(record => record.status === 'present').length
      
      setStudentData(prev => ({
        ...prev,
        statistics: {
          attendanceRate,
          totalClasses,
          averageGrade: Math.round(averageGrade * 100) / 100,
          thisWeekAttendance: thisWeekPresent,
          gpa: Math.round(gpa * 100) / 100,
          creditsEarned: 0, // TODO: Calculate from grades
          creditsRemaining: 0 // TODO: Calculate from program requirements
        }
      }))
    } catch (err) {
      // Don't retry on 404 - no data yet
      if (err.response?.status === 404) {
        // Set default statistics
        setStudentData(prev => ({
          ...prev,
          statistics: {
            attendanceRate: 0,
            totalClasses: 0,
            averageGrade: 0,
            thisWeekAttendance: 0,
            gpa: 0,
            creditsEarned: 0,
            creditsRemaining: 0
          }
        }))
        return
      }
      // Only retry on network errors
      if (err.code !== 'ERR_BAD_REQUEST') {
        handleError(err, () => loadStatistics())
      }
    } finally {
      setLoading('statistics', false)
    }
  }, [user.id, user.student_id, setLoading, handleError])
  
  // Load all data - Fixed infinite loop
  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([
        loadStudentProfile(),
        loadAttendanceRecords(),
        loadGrades(),
        loadStatistics()
      ])
    } catch (error) {
      handleError('Không thể tải dữ liệu. Vui lòng thử lại.')
    }
  }, [loadStudentProfile, loadAttendanceRecords, loadGrades, loadStatistics, handleError])
  
  // Effects - Fixed data loading
  useEffect(() => {
    if (user?.id || user?.student_id) {
      loadAllData()
    }
  }, [user?.id, user?.student_id, loadAllData])
  
  // Load data on component mount
  useEffect(() => {
    if (user?.id || user?.student_id) {
      loadAllData()
    }
  }, [])
  
  // Event handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }
  
  const handleQRCodeSubmit = async (qrData) => {
    try {
      setLoading('qrCheckIn', true)
      
      // Call API to check in with QR code
      const response = await attendanceService.checkInWithQR({
        qr_code: qrData,
        student_id: user.student_id || user.id
      })
      
      showNotification('Điểm danh thành công!', 'success')
      setQrDialogOpen(false)
      loadAllData() // Refresh all data
    } catch (err) {
      showNotification('Điểm danh thất bại. Vui lòng thử lại.', 'error')
    } finally {
      setLoading('qrCheckIn', false)
    }
  }
  
  const handleRefresh = () => {
    clearError()
    loadAllData()
  }
  
  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }
  
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  
  // Memoized components
  const StatisticsCards = useMemo(() => (
    <Grid container spacing={3} mb={4}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tỷ lệ điểm danh"
          value={`${studentData.statistics.attendanceRate}%`}
          icon={<ScheduleIcon />}
          color="success"
          subtitle="Tổng tỷ lệ điểm danh"
          trend={studentData.statistics.attendanceRate >= 80 ? '+5%' : studentData.statistics.attendanceRate > 0 ? '-2%' : ''}
          loading={isLoading('statistics')}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tuần này"
          value={studentData.statistics.thisWeekAttendance}
          icon={<TrendingUpIcon />}
          color="info"
          subtitle="Lớp đã tham dự"
          loading={isLoading('statistics')}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Điểm TB"
          value={Number(studentData.statistics.gpa).toFixed(2)}
          icon={<GradeIcon />}
          color="primary"
          subtitle="Điểm trung bình hiện tại"
          loading={isLoading('statistics')}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Tổng lớp học"
          value={studentData.statistics.totalClasses}
          icon={<AssignmentIcon />}
          color="warning"
          subtitle="Tất cả thời gian"
          loading={isLoading('statistics')}
        />
      </Grid>
    </Grid>
  ), [studentData.statistics, isLoading])
  
  const AttendanceTable = useMemo(() => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Lịch sử điểm danh
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              size="small"
              placeholder="Tìm kiếm..."
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="present">Có mặt</MenuItem>
                <MenuItem value="absent">Vắng mặt</MenuItem>
                <MenuItem value="late">Đi muộn</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {isLoading('attendance') ? (
          <LoadingSkeleton height={400} />
        ) : studentData.attendanceRecords.length === 0 ? (
          <EmptyState
            icon={<ScheduleIcon />}
            title="Chưa có lịch sử điểm danh"
            description="Bạn chưa tham dự lớp học nào. Hãy điểm danh để bắt đầu!"
            action={
              <Button variant="contained" startIcon={<QrCodeIcon />} onClick={() => setQrDialogOpen(true)}>
                Điểm danh ngay
              </Button>
            }
          />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Môn học</TableCell>
                    <TableCell>Buổi học</TableCell>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Địa điểm</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentData.attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {typeof record.session?.subject === 'string' 
                              ? record.session.subject 
                              : record.session?.subject?.subject_name ?? 'Unknown Subject'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.session?.teacher?.full_name 
                              ?? record.session?.teacher?.name 
                              ?? record.session?.teacher_name 
                              ?? (typeof record.session?.teacher === 'string' ? record.session.teacher : 'Unknown Teacher')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.session?.session_name || 'Unknown Session'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(record.check_in_time).toLocaleDateString('vi-VN')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.session?.day || 'Unknown Day'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.session?.time || new Date(record.check_in_time).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status === 'present' ? 'Có mặt' : record.status === 'absent' ? 'Vắng mặt' : record.status === 'late' ? 'Đi muộn' : record.status}
                          color={record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {record.session?.location || 'N/A'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={studentData.attendanceRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  ), [studentData.attendanceRecords, isLoading, searchTerm, filterStatus, page, rowsPerPage])
  
  const GradesList = useMemo(() => (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Điểm số gần đây
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {isLoading('grades') ? (
          <LoadingSkeleton height={300} />
        ) : studentData.recentGrades.length === 0 ? (
          <EmptyState
            icon={<GradeIcon />}
            title="Chưa có điểm số"
            description="Điểm số của bạn sẽ hiển thị ở đây khi được ghi nhận."
          />
        ) : (
          <List>
            {studentData.recentGrades.map((grade) => (
              <ListItem key={grade.id} divider>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <GradeIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={grade.subject?.subject_name ?? grade.subject ?? 'Unknown Subject'}
                  secondary={`${grade.grade_type} - ${new Date(grade.created_at).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={grade.score}
                    color="primary"
                    size="small"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  ), [studentData.recentGrades, isLoading])
  
  if (isLoading('profile')) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    )
  }
  
  return (
    <>
      <Helmet>
        <title>Student Dashboard - Student Management System</title>
      </Helmet>
      
      <CssBaseline />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <DashboardIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Dashboard Sinh viên
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Chào mừng, {user.first_name} {user.last_name}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Làm mới dữ liệu">
                <IconButton onClick={handleRefresh} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<QrCodeIcon />}
                onClick={() => setQrDialogOpen(true)}
                sx={{ ml: 2 }}
              >
                Điểm danh
              </Button>
            </Box>
          </Box>
          
          {error && (
            <ErrorBoundary 
              error={error} 
              onRetry={handleRefresh}
              onDismiss={clearError}
            />
          )}
        </Box>
        
        {/* Statistics Cards */}
        {StatisticsCards}
        
        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="dashboard tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Tổng quan" icon={<DashboardIcon />} value={0} iconPosition="start" />
              <Tab label="Điểm danh" icon={<ScheduleIcon />} value={1} iconPosition="start" />
              <Tab label="Lớp học" icon={<SchoolIcon />} value={2} iconPosition="start" />
              <Tab label="Điểm số" icon={<GradeIcon />} value={3} iconPosition="start" />
              <Tab label="Thời khóa biểu" icon={<CalendarIcon />} value={4} iconPosition="start" />
              <Tab label="Bài tập" icon={<AssignmentIcon />} value={5} iconPosition="start" />
            </Tabs>
          </Box>
          
          <CardContent>
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {AttendanceTable}
                </Grid>
                <Grid item xs={12} md={6}>
                  {GradesList}
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              {AttendanceTable}
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <StudentClassList user={user} />
            </TabPanel>
            
            <TabPanel value={activeTab} index={3}>
              <StudentGradesView user={user} />
            </TabPanel>
            
            <TabPanel value={activeTab} index={4}>
              <StudentScheduleView user={user} />
            </TabPanel>
            
            <TabPanel value={activeTab} index={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Bài tập gần đây
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {isLoading('assignments') ? (
                    <LoadingSkeleton height={300} />
                  ) : studentData.assignments.length === 0 ? (
                    <EmptyState
                      icon={<AssignmentIcon />}
                      title="Chưa có bài tập"
                      description="Bài tập và deadline của bạn sẽ hiển thị ở đây."
                    />
                  ) : (
                    <List>
                      {studentData.assignments.map((assignment) => (
                        <ListItem key={assignment.id} divider>
                          <ListItemIcon>
                            <Avatar sx={{ 
                              bgcolor: assignment.status === 'completed' ? 'success.main' : 
                                       assignment.status === 'in_progress' ? 'warning.main' : 'primary.main' 
                            }}>
                              <AssignmentIcon />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={assignment.title}
                            secondary={`${(assignment.subject?.subject_name ?? assignment.subject ?? 'Môn học')} - Hạn: ${new Date(assignment.dueDate).toLocaleDateString('vi-VN')}`}
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={assignment.status === 'completed' ? 'Hoàn thành' : 
                                     assignment.status === 'in_progress' ? 'Đang làm' : 'Chưa làm'}
                              color={assignment.status === 'completed' ? 'success' : 
                                     assignment.status === 'in_progress' ? 'warning' : 'default'}
                              size="small"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
          </CardContent>
        </Card>
        
        {/* Check-in Dialog (QR / Nhập mã) */}
        <StudentCheckInDialog
          open={qrDialogOpen}
          onClose={() => setQrDialogOpen(false)}
          studentCode={user.student_id || user.id}
          onSuccess={() => {
            setQrDialogOpen(false)
            showNotification('Điểm danh thành công!', 'success')
            loadAllData()
          }}
        />
        
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={hideNotification}
        >
          <MuiAlert onClose={hideNotification} severity={notification.severity}>
            {notification.message}
          </MuiAlert>
        </Snackbar>
      </Container>
    </>
  )
}

// Tab Panel Component
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`dashboard-tabpanel-${index}`}
    aria-labelledby={`dashboard-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
)

export default ProductionStudentDashboard
