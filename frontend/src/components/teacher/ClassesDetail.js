import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  People,
  Assessment,
  Assignment,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  Add,
  FilterList
} from '@mui/icons-material';
import classService from '../../services/classService';
import attendanceService from '../../services/attendanceService';
import gradeService from '../../services/gradeService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`class-tabpanel-${index}`}
      aria-labelledby={`class-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ClassesDetail() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [classStudents, setClassStudents] = useState([]);
  const [classStats, setClassStats] = useState(null);
  const [filters, setFilters] = useState({
    year_id: '',
    subject_id: '',
    search: ''
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [classes, filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [classesResponse, yearsResponse, subjectsResponse] = await Promise.all([
        classService.getMyClasses(),
        classService.getYears(),
        classService.getSubjects()
      ]);
      
      setClasses(classesResponse.data.results || classesResponse.data || []);
      setYears(yearsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...classes];

    if (filters.year_id) {
      filtered = filtered.filter(cls => 
        cls.term && cls.term.year && cls.term.year.id === parseInt(filters.year_id)
      );
    }

    if (filters.subject_id) {
      filtered = filtered.filter(cls => 
        cls.subject && cls.subject.id === parseInt(filters.subject_id)
      );
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(cls => 
        (cls.class_name || '').toLowerCase().includes(search) ||
        (cls.class_id || '').toLowerCase().includes(search)
      );
    }

    setFilteredClasses(filtered);
  };

  const handleViewClass = async (classItem) => {
    setSelectedClass(classItem);
    setDetailDialogOpen(true);
    setTabValue(0);
    
    try {
      // Load class details
      const [studentsResponse, statsResponse] = await Promise.all([
        classService.getClassStudents(classItem.id),
        getClassStats(classItem.id)
      ]);
      
      setClassStudents(studentsResponse.data || []);
      setClassStats(statsResponse);
    } catch (error) {
      console.error('Error loading class details:', error);
      setClassStudents([]);
      setClassStats(null);
    }
  };

  const getClassStats = async (classId) => {
    try {
      // Get basic stats - you can extend this based on your needs
      const today = new Date().toISOString().split('T')[0];
      const attendanceResponse = await attendanceService.getSessions({
        class_id: classId,
        session_date: today
      });
      
      const gradesResponse = await gradeService.getGrades({
        class_id: classId,
        ordering: '-created_at'
      });

      return {
        totalStudents: classStudents.length || 0,
        todayAttendance: attendanceResponse.data?.results?.length || 0,
        totalGrades: gradesResponse.data?.results?.length || 0
      };
    } catch (error) {
      console.error('Error getting class stats:', error);
      return {
        totalStudents: 0,
        todayAttendance: 0,
        totalGrades: 0
      };
    }
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedClass(null);
    setClassStudents([]);
    setClassStats(null);
  };

  const getClassDisplayName = (classItem) => {
    const termName = classItem.term ? 
      (classItem.term.display_name || `HK${classItem.term.term_number} ${classItem.term.year?.code}`) : 
      '';
    const subjectName = classItem.subject?.name || '';
    return `${classItem.class_name || 'Lớp học'} - ${subjectName} ${termName}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lớp học
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Quản lý chi tiết các lớp học của bạn
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Năm học</InputLabel>
                <Select
                  value={filters.year_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, year_id: e.target.value }))}
                  label="Năm học"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {years.map(year => (
                    <MenuItem key={year.id} value={year.id}>
                      {year.display_name || `Năm học ${year.code}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Môn học</InputLabel>
                <Select
                  value={filters.subject_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, subject_id: e.target.value }))}
                  label="Môn học"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {subjects.map(subject => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Tìm kiếm lớp học"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FilterList />}
                onClick={() => setFilters({ year_id: '', subject_id: '', search: '' })}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Alert severity="info">
          Không tìm thấy lớp học nào. {classes.length === 0 ? 'Hãy tạo lớp học mới trong tab "Quản lý giảng dạy".' : 'Thử điều chỉnh bộ lọc.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {classItem.class_name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Mã lớp: {classItem.class_id}
                  </Typography>
                  {classItem.subject && (
                    <Chip 
                      label={classItem.subject.name} 
                      size="small" 
                      color="primary" 
                      sx={{ mb: 1, mr: 1 }}
                    />
                  )}
                  {classItem.term && (
                    <Chip 
                      label={classItem.term.display_name || `HK${classItem.term.term_number}`}
                      size="small" 
                      color="secondary"
                      sx={{ mb: 1 }}
                    />
                  )}
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Sĩ số: {classItem.student_count || 0} học sinh
                  </Typography>
                  {classItem.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {classItem.description}
                    </Typography>
                  )}
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => handleViewClass(classItem)}
                  >
                    Xem chi tiết
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Class Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        {selectedClass && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {getClassDisplayName(selectedClass)}
                </Typography>
                <IconButton onClick={handleCloseDialog}>
                  <Cancel />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Tổng quan" icon={<Assessment />} />
                <Tab label="Học sinh" icon={<People />} />
                <Tab label="Điểm danh" icon={<CheckCircle />} />
                <Tab label="Điểm số" icon={<Assignment />} />
              </Tabs>

              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Thông tin lớp học
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Tên lớp:
                            </Typography>
                            <Typography variant="body1">
                              {selectedClass.class_name}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Mã lớp:
                            </Typography>
                            <Typography variant="body1">
                              {selectedClass.class_id}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Môn học:
                            </Typography>
                            <Typography variant="body1">
                              {selectedClass.subject?.name || 'Chưa xác định'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Học kỳ:
                            </Typography>
                            <Typography variant="body1">
                              {selectedClass.term?.display_name || 'Chưa xác định'}
                            </Typography>
                          </Grid>
                          {selectedClass.description && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="textSecondary">
                                Mô tả:
                              </Typography>
                              <Typography variant="body1">
                                {selectedClass.description}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Thống kê
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            Sĩ số:
                          </Typography>
                          <Typography variant="h4" color="primary">
                            {classStudents.length}
                          </Typography>
                        </Box>
                        {classStats && (
                          <>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="textSecondary">
                                Điểm danh hôm nay:
                              </Typography>
                              <Typography variant="h6">
                                {classStats.todayAttendance}
                              </Typography>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="textSecondary">
                                Tổng điểm số:
                              </Typography>
                              <Typography variant="h6">
                                {classStats.totalGrades}
                              </Typography>
                            </Box>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Students Tab */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Danh sách học sinh ({classStudents.length})
                </Typography>
                {classStudents.length === 0 ? (
                  <Alert severity="info">
                    Lớp học chưa có học sinh. Hãy thêm học sinh vào lớp.
                  </Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>STT</TableCell>
                          <TableCell>Mã học sinh</TableCell>
                          <TableCell>Họ tên</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {classStudents.map((student, index) => (
                          <TableRow key={student.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{student.student_id}</TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {student.full_name?.charAt(0)}
                                </Avatar>
                                {student.full_name}
                              </Box>
                            </TableCell>
                            <TableCell>{student.user?.email}</TableCell>
                            <TableCell>
                              <Chip 
                                label="Đang học" 
                                color="success" 
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              {/* Attendance Tab */}
              <TabPanel value={tabValue} index={2}>
                <Alert severity="info">
                  Chức năng điểm danh sẽ được phát triển trong phiên bản tiếp theo.
                </Alert>
              </TabPanel>

              {/* Grades Tab */}
              <TabPanel value={tabValue} index={3}>
                <Alert severity="info">
                  Chức năng quản lý điểm số sẽ được phát triển trong phiên bản tiếp theo.
                </Alert>
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default ClassesDetail;