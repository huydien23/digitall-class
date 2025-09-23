import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  TablePagination,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  LinearProgress,
  Tooltip
} from '@mui/material'
import {
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Grade as GradeIcon,
  Group as GroupIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'

const GradeManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterSemester, setFilterSemester] = useState('all')
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Mock data for grade entries
  const mockGradeEntries = [
    {
      id: 1,
      studentId: '221222',
      studentName: 'Lê Văn Nhựt Anh',
      className: 'Lập trình Python - DH22TIN06',
      subject: 'Lập trình Python',
      teacher: 'Đặng Mạnh Huy',
      semester: 'Học kỳ 1 - 2024',
      thườngXuyên: 8.5, // 10%
      giữaKỳ: 7.0,      // 30%
      cuốiKỳ: 8.0,      // 60%
      finalGrade: 7.8,
      status: 'completed',
      lastUpdated: '2024-12-15',
      notes: 'Điểm tốt, tham gia tích cực'
    },
    {
      id: 2,
      studentId: '222803',
      studentName: 'Trần Nguyễn Phương Anh',
      className: 'Lập trình Python - DH22TIN06',
      subject: 'Lập trình Python',
      teacher: 'Đặng Mạnh Huy',
      semester: 'Học kỳ 1 - 2024',
      thườngXuyên: 9.0,
      giữaKỳ: 8.5,
      cuốiKỳ: 9.0,
      finalGrade: 8.8,
      status: 'completed',
      lastUpdated: '2024-12-15',
      notes: 'Xuất sắc'
    },
    {
      id: 3,
      studentId: '226969',
      studentName: 'Nguyễn Xuân Bách',
      className: 'Lập trình Python - DH22TIN06',
      subject: 'Lập trình Python',
      teacher: 'Đặng Mạnh Huy',
      semester: 'Học kỳ 1 - 2024',
      thườngXuyên: 6.0,
      giữaKỳ: 5.5,
      cuốiKỳ: null, // Chưa có điểm cuối kỳ
      finalGrade: null,
      status: 'pending',
      lastUpdated: '2024-12-10',
      notes: 'Cần cải thiện'
    },
    {
      id: 4,
      studentId: '221605',
      studentName: 'Huỳnh Thương Bảo',
      className: 'Pháp luật về công nghệ thông tin - DH22TIN07',
      subject: 'Pháp luật về công nghệ thông tin',
      teacher: 'Trần Minh Tâm',
      semester: 'Học kỳ 1 - 2024',
      thườngXuyên: 8.0,
      giữaKỳ: 7.5,
      cuốiKỳ: 8.5,
      finalGrade: 8.1,
      status: 'completed',
      lastUpdated: '2024-12-14',
      notes: 'Tốt'
    },
    {
      id: 5,
      studentId: '221330',
      studentName: 'Thạch Văn Bảo',
      className: 'Lập trình thiết bị di động - DH22TIN08',
      subject: 'Lập trình thiết bị di động',
      teacher: 'Đoàn Chí Trung',
      semester: 'Học kỳ 1 - 2024',
      thườngXuyên: 7.5,
      giữaKỳ: 6.5,
      cuốiKỳ: null,
      finalGrade: null,
      status: 'pending',
      lastUpdated: '2024-12-12',
      notes: 'Trung bình'
    }
  ]

  // Mock data for grade statistics
  const mockGradeStats = [
    {
      subject: 'Lập trình Python',
      className: 'DH22TIN06',
      totalStudents: 56,
      completedGrades: 45,
      pendingGrades: 11,
      averageGrade: 7.8,
      excellentCount: 12, // >= 8.5
      goodCount: 20,      // 7.0 - 8.4
      averageCount: 15,   // 5.5 - 6.9
      poorCount: 8,       // < 5.5
      teacher: 'Đặng Mạnh Huy'
    },
    {
      subject: 'Pháp luật về công nghệ thông tin',
      className: 'DH22TIN07',
      totalStudents: 38,
      completedGrades: 32,
      pendingGrades: 6,
      averageGrade: 7.9,
      excellentCount: 8,
      goodCount: 18,
      averageCount: 8,
      poorCount: 4,
      teacher: 'Trần Minh Tâm'
    },
    {
      subject: 'Lập trình thiết bị di động',
      className: 'DH22TIN08',
      totalStudents: 45,
      completedGrades: 35,
      pendingGrades: 10,
      averageGrade: 7.5,
      excellentCount: 10,
      goodCount: 15,
      averageCount: 12,
      poorCount: 8,
      teacher: 'Đoàn Chí Trung'
    }
  ]

  const filteredGrades = mockGradeEntries.filter(grade => {
    const matchesSearch = grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === 'all' || grade.className.includes(filterClass)
    const matchesSubject = filterSubject === 'all' || grade.subject === filterSubject
    const matchesSemester = filterSemester === 'all' || grade.semester === filterSemester
    
    return matchesSearch && matchesClass && matchesSubject && matchesSemester
  })

  const getGradeColor = (grade) => {
    if (grade === null) return 'default'
    if (grade >= 8.5) return 'success'
    if (grade >= 7.0) return 'primary'
    if (grade >= 5.5) return 'warning'
    return 'error'
  }

  const getGradeText = (grade) => {
    if (grade === null) return 'Chưa có'
    if (grade >= 8.5) return 'Xuất sắc'
    if (grade >= 7.0) return 'Giỏi'
    if (grade >= 5.5) return 'Khá'
    return 'Yếu'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'incomplete': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành'
      case 'pending': return 'Chờ nhập điểm'
      case 'incomplete': return 'Thiếu điểm'
      default: return status
    }
  }

  const calculateFinalGrade = (thườngXuyên, giữaKỳ, cuốiKỳ) => {
    if (thườngXuyên === null || giữaKỳ === null || cuốiKỳ === null) return null
    return (thườngXuyên * 0.1 + giữaKỳ * 0.3 + cuốiKỳ * 0.6).toFixed(1)
  }

  const handleEditGrade = (grade) => {
    setSelectedGrade(grade)
    setGradeDialogOpen(true)
  }

  const handleSaveGrade = () => {
    console.log('Saving grade:', selectedGrade)
    setGradeDialogOpen(false)
  }

  const handleExportGrades = () => {
    console.log('Exporting grades...')
  }

  const handlePrintGrades = () => {
    console.log('Printing grade report...')
  }

  const GradeEntryCard = ({ grade }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {grade.studentName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mã SV: {grade.studentId}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Lớp: {grade.className}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Môn: {grade.subject} - {grade.teacher}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
            <Chip 
              label={getStatusText(grade.status)} 
              color={getStatusColor(grade.status)}
              size="small"
            />
            {grade.finalGrade && (
              <Typography variant="h6" color={getGradeColor(grade.finalGrade)}>
                {grade.finalGrade}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main">
                {grade.thườngXuyên || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thường xuyên (10%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main">
                {grade.giữaKỳ || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Giữa kỳ (30%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box textAlign="center">
              <Typography variant="h6" color="primary.main">
                {grade.cuốiKỳ || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cuối kỳ (60%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Box textAlign="center">
              <Typography variant="h6" color={getGradeColor(grade.finalGrade)}>
                {grade.finalGrade || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm tổng kết
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Cập nhật: {grade.lastUpdated}
          </Typography>
          <Box display="flex" gap={1}>
            <IconButton size="small" onClick={() => handleEditGrade(grade)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => console.log('View details:', grade.id)}>
              <ViewIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>
            Quản lý điểm số
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportGrades}
            >
              Xuất báo cáo
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintGrades}
            >
              In báo cáo
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => console.log('Create new grade entry')}
            >
              Nhập điểm mới
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi điểm số sinh viên theo hệ thống 10%-30%-60%
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm sinh viên, lớp học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Lớp học</InputLabel>
                <Select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <MenuItem value="all">Tất cả lớp</MenuItem>
                  <MenuItem value="DH22TIN06">Lập trình Python</MenuItem>
                  <MenuItem value="DH22TIN07">Pháp luật CNTT</MenuItem>
                  <MenuItem value="DH22TIN08">Lập trình di động</MenuItem>
                  <MenuItem value="DH22TIN09">Lịch sử Đảng</MenuItem>
                  <MenuItem value="DH22TIN10">Phần mềm mã nguồn mở</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Môn học</InputLabel>
                <Select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                >
                  <MenuItem value="all">Tất cả môn</MenuItem>
                  <MenuItem value="Lập trình Python">Lập trình Python</MenuItem>
                  <MenuItem value="Pháp luật về công nghệ thông tin">Pháp luật CNTT</MenuItem>
                  <MenuItem value="Lập trình thiết bị di động">Lập trình di động</MenuItem>
                  <MenuItem value="Lịch sử Đảng cộng sản Việt Nam">Lịch sử Đảng</MenuItem>
                  <MenuItem value="Phát triển phần mềm mã nguồn mở">Phần mềm mã nguồn mở</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Học kỳ</InputLabel>
                <Select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                >
                  <MenuItem value="all">Tất cả học kỳ</MenuItem>
                  <MenuItem value="Học kỳ 1 - 2024">Học kỳ 1 - 2024</MenuItem>
                  <MenuItem value="Học kỳ 2 - 2024">Học kỳ 2 - 2024</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSearchTerm('')
                  setFilterClass('all')
                  setFilterSubject('all')
                  setFilterSemester('all')
                }}
              >
                Làm mới
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab 
              label={`Điểm số sinh viên (${filteredGrades.length})`} 
              icon={<PersonIcon />}
            />
            <Tab 
              label={`Thống kê lớp học (${mockGradeStats.length})`} 
              icon={<SchoolIcon />}
            />
            <Tab 
              label="Báo cáo tổng quan" 
              icon={<AssessmentIcon />}
            />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {filteredGrades.map((grade) => (
            <GradeEntryCard key={grade.id} grade={grade} />
          ))}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={3}>
            {mockGradeStats.map((stat) => (
              <Grid item xs={12} md={6} key={stat.className}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {stat.subject} - {stat.className}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Giảng viên: {stat.teacher}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Tiến độ nhập điểm</Typography>
                        <Typography variant="body2">
                          {stat.completedGrades}/{stat.totalStudents} ({Math.round(stat.completedGrades/stat.totalStudents*100)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={stat.completedGrades/stat.totalStudents*100} 
                        color={stat.completedGrades === stat.totalStudents ? 'success' : 'primary'}
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="primary.main">
                            {stat.averageGrade}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Điểm trung bình
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h4" color="warning.main">
                            {stat.pendingGrades}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Chưa hoàn thành
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={1}>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main">
                            {stat.excellentCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Xuất sắc
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="primary.main">
                            {stat.goodCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Giỏi
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="warning.main">
                            {stat.averageCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Khá
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="error.main">
                            {stat.poorCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Yếu
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Thống kê tổng quan
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <GroupIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Tổng số sinh viên" 
                        secondary="229 sinh viên"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <GradeIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Điểm trung bình chung" 
                        secondary="7.7/10"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sinh viên đã hoàn thành" 
                        secondary="187 sinh viên (81.7%)"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sinh viên chưa hoàn thành" 
                        secondary="42 sinh viên (18.3%)"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Phân bố điểm số
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Xuất sắc (8.5-10)" 
                        secondary="30 sinh viên (13.1%)"
                      />
                      <ListItemSecondaryAction>
                        <Chip label="13.1%" color="success" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Giỏi (7.0-8.4)" 
                        secondary="53 sinh viên (23.1%)"
                      />
                      <ListItemSecondaryAction>
                        <Chip label="23.1%" color="primary" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Khá (5.5-6.9)" 
                        secondary="35 sinh viên (15.3%)"
                      />
                      <ListItemSecondaryAction>
                        <Chip label="15.3%" color="warning" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Yếu (<5.5)" 
                        secondary="20 sinh viên (8.7%)"
                      />
                      <ListItemSecondaryAction>
                        <Chip label="8.7%" color="error" size="small" />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Grade Edit Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chỉnh sửa điểm số - {selectedGrade?.studentName}
        </DialogTitle>
        <DialogContent>
          {selectedGrade && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thường xuyên (10%)"
                    type="number"
                    value={selectedGrade.thườngXuyên || ''}
                    onChange={(e) => setSelectedGrade({
                      ...selectedGrade, 
                      thườngXuyên: parseFloat(e.target.value) || null
                    })}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giữa kỳ (30%)"
                    type="number"
                    value={selectedGrade.giữaKỳ || ''}
                    onChange={(e) => setSelectedGrade({
                      ...selectedGrade, 
                      giữaKỳ: parseFloat(e.target.value) || null
                    })}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cuối kỳ (60%)"
                    type="number"
                    value={selectedGrade.cuốiKỳ || ''}
                    onChange={(e) => setSelectedGrade({
                      ...selectedGrade, 
                      cuốiKỳ: parseFloat(e.target.value) || null
                    })}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Điểm tổng kết"
                    type="number"
                    value={calculateFinalGrade(selectedGrade.thườngXuyên, selectedGrade.giữaKỳ, selectedGrade.cuốiKỳ) || ''}
                    disabled
                    helperText="Tự động tính: 10% + 30% + 60%"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    multiline
                    rows={3}
                    value={selectedGrade.notes}
                    onChange={(e) => setSelectedGrade({
                      ...selectedGrade, 
                      notes: e.target.value
                    })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveGrade}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default GradeManagement
