import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Stack,
  Divider,
  Tooltip,
  Badge,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Class as ClassIcon,
  ContentCopy as ContentCopyIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const Assignments = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [openBulkCreateDialog, setOpenBulkCreateDialog] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);

  // Mock data - Mở rộng với nhiều lớp và assignments hơn
  const assignments = [
    {
      id: 1,
      title: 'Bài tập tuần 1: Giới thiệu Python',
      description: 'Hoàn thành các bài tập cơ bản về Python',
      class: 'CS101',
      className: 'Lập trình Python cơ bản',
      subject: 'Lập trình',
      dueDate: '2025-01-10',
      status: 'active',
      submissions: 25,
      totalStudents: 30,
      ungraded: 5,
      points: 10,
      isUrgent: false,
    },
    {
      id: 2,
      title: 'Bài tập tuần 2: Functions và Modules',
      description: 'Thực hành về hàm và module trong Python',
      class: 'CS101',
      className: 'Lập trình Python cơ bản',
      subject: 'Lập trình',
      dueDate: '2025-01-12',
      status: 'active',
      submissions: 28,
      totalStudents: 30,
      ungraded: 8,
      points: 15,
      isUrgent: true,
    },
    {
      id: 3,
      title: 'Project giữa kỳ: Web Application',
      description: 'Xây dựng ứng dụng web đơn giản sử dụng React',
      class: 'CS201',
      className: 'Phát triển Web',
      subject: 'Web Development',
      dueDate: '2025-01-15',
      status: 'active',
      submissions: 18,
      totalStudents: 30,
      ungraded: 12,
      points: 50,
      isUrgent: false,
    },
    {
      id: 4,
      title: 'Bài tập tuần 1: HTML/CSS Basics',
      description: 'Thiết kế trang web tĩnh với HTML và CSS',
      class: 'CS201',
      className: 'Phát triển Web',
      subject: 'Web Development',
      dueDate: '2025-01-08',
      status: 'closed',
      submissions: 30,
      totalStudents: 30,
      ungraded: 0,
      points: 20,
      isUrgent: false,
    },
    {
      id: 5,
      title: 'Bài tập tuần 1: Giới thiệu Python',
      description: 'Hoàn thành các bài tập cơ bản về Python',
      class: 'CS101-B',
      className: 'Lập trình Python cơ bản (Lớp B)',
      subject: 'Lập trình',
      dueDate: '2025-01-10',
      status: 'active',
      submissions: 22,
      totalStudents: 28,
      ungraded: 3,
      points: 10,
      isUrgent: false,
    },
    {
      id: 6,
      title: 'Lab 3: Database Design',
      description: 'Thiết kế cơ sở dữ liệu cho hệ thống quản lý',
      class: 'CS301',
      className: 'Cơ sở dữ liệu',
      subject: 'Database',
      dueDate: '2025-01-20',
      status: 'upcoming',
      submissions: 0,
      totalStudents: 35,
      ungraded: 0,
      points: 30,
      isUrgent: false,
    },
    {
      id: 7,
      title: 'Bài kiểm tra giữa kỳ',
      description: 'Kiểm tra kiến thức Python và OOP',
      class: 'CS101-B',
      className: 'Lập trình Python cơ bản (Lớp B)',
      subject: 'Lập trình',
      dueDate: '2025-01-14',
      status: 'active',
      submissions: 10,
      totalStudents: 28,
      ungraded: 10,
      points: 100,
      isUrgent: true,
    },
  ];

  // Mock classes data
  const classes = [
    { id: 'CS101', name: 'CS101 - Lập trình Python cơ bản', subject: 'Lập trình', students: 30 },
    { id: 'CS101-B', name: 'CS101-B - Lập trình Python cơ bản (Lớp B)', subject: 'Lập trình', students: 28 },
    { id: 'CS201', name: 'CS201 - Phát triển Web', subject: 'Web Development', students: 30 },
    { id: 'CS301', name: 'CS301 - Cơ sở dữ liệu', subject: 'Database', students: 35 },
  ];

  // Calculate stats
  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    ungraded: assignments.reduce((sum, a) => sum + a.ungraded, 0),
    urgent: assignments.filter(a => a.isUrgent && a.ungraded > 0).length,
    avgSubmissionRate: Math.round(
      assignments.reduce((sum, a) => sum + (a.submissions / a.totalStudents * 100), 0) / assignments.length
    ),
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, assignment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssignment(assignment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAssignment(null);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    handleFilterClose();
  };

  const handleBulkCreateOpen = () => {
    setOpenBulkCreateDialog(true);
  };

  const handleBulkCreateClose = () => {
    setOpenBulkCreateDialog(false);
    setSelectedClasses([]);
  };

  const handleClassToggle = (classId) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'info';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Đang mở';
      case 'upcoming':
        return 'Sắp tới';
      case 'closed':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.className.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab =
      tabValue === 0 ||
      (tabValue === 1 && assignment.status === 'active') ||
      (tabValue === 2 && assignment.status === 'upcoming') ||
      (tabValue === 3 && assignment.status === 'closed') ||
      (tabValue === 4 && assignment.ungraded > 0);
    
    const matchesClass = selectedClass === 'all' || assignment.class === selectedClass;
    
    return matchesSearch && matchesTab && matchesClass;
  });

  // Group assignments by class
  const groupedAssignments = filteredAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.class]) {
      acc[assignment.class] = {
        classId: assignment.class,
        className: assignment.className,
        assignments: [],
      };
    }
    acc[assignment.class].assignments.push(assignment);
    return acc;
  }, {});

  const classGroups = Object.values(groupedAssignments);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Quản lý Bài tập Tổng quan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi tất cả bài tập từ các lớp học và quản lý tiến độ nộp bài
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            size="large"
            onClick={handleBulkCreateOpen}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Tạo cho nhiều lớp
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Tạo bài tập mới
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tổng bài tập
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    Từ {classes.length} lớp học
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AssignmentIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    {stats.ungraded}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Chưa chấm
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    {stats.urgent} bài cần chấm gấp
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ScheduleIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Đang mở
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    Cần theo dõi
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    {stats.avgSubmissionRate}%
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tỷ lệ nộp bài TB
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    Trung bình tất cả lớp
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <TrendingUpIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
              sx={{ minWidth: 150 }}
            >
              {selectedClass === 'all' ? 'Tất cả lớp' : classes.find(c => c.id === selectedClass)?.id}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Tất cả" />
          <Tab label="Đang mở" />
          <Tab label="Sắp tới" />
          <Tab label="Đã đóng" />
          <Tab 
            label={
              <Badge badgeContent={stats.ungraded} color="error">
                <Box sx={{ pr: 2 }}>Chưa chấm</Box>
              </Badge>
            } 
          />
        </Tabs>
      </Card>

      {/* Assignments List - Grouped by Class */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có bài tập nào
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tạo bài tập đầu tiên để bắt đầu
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />}>
                Tạo bài tập mới
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {classGroups.map((group) => (
            <Card key={group.classId}>
              <CardContent>
                {/* Class Header */}
                <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ClassIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {group.className}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.assignments.length} bài tập • {' '}
                          {group.assignments.reduce((sum, a) => sum + a.ungraded, 0)} chưa chấm • {' '}
                          Tỷ lệ nộp: {Math.round(
                            group.assignments.reduce((sum, a) => sum + (a.submissions / a.totalStudents * 100), 0) / group.assignments.length
                          )}%
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label={group.classId} color="primary" />
                  </Box>
                </Box>

                {/* Assignments in this class */}
                <Stack spacing={2}>
                  {group.assignments.map((assignment) => (
                    <Paper 
                      key={assignment.id}
                      sx={{ 
                        p: 2,
                        '&:hover': { bgcolor: 'action.hover' },
                        border: assignment.isUrgent ? 2 : 1,
                        borderColor: assignment.isUrgent ? 'error.main' : 'divider',
                      }}
                    >
                      {assignment.isUrgent && (
                        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
                          Cần chấm gấp - {assignment.ungraded} bài chưa chấm!
                        </Alert>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h6" fontWeight={600}>
                              {assignment.title}
                            </Typography>
                            <Chip
                              label={getStatusLabel(assignment.status)}
                              color={getStatusColor(assignment.status)}
                              size="small"
                            />
                            {assignment.ungraded > 0 && (
                              <Chip 
                                label={`${assignment.ungraded} chưa chấm`}
                                color="error"
                                size="small"
                              />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {assignment.description}
                          </Typography>

                          <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                Hạn: {assignment.dueDate}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PeopleIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {assignment.submissions}/{assignment.totalStudents} đã nộp
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AssignmentIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {assignment.points} điểm
                              </Typography>
                            </Box>
                          </Stack>

                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Tiến độ nộp bài
                              </Typography>
                              <Typography variant="caption" fontWeight={600}>
                                {Math.round((assignment.submissions / assignment.totalStudents) * 100)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(assignment.submissions / assignment.totalStudents) * 100}
                              sx={{ height: 8, borderRadius: 4 }}
                              color={assignment.submissions === assignment.totalStudents ? 'success' : 'primary'}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, ml: 2 }}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, assignment)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleClassSelect('all')}>
          <ClassIcon fontSize="small" sx={{ mr: 1 }} />
          Tất cả lớp
        </MenuItem>
        <Divider />
        {classes.map((cls) => (
          <MenuItem key={cls.id} onClick={() => handleClassSelect(cls.id)}>
            {cls.name} ({cls.students} SV)
          </MenuItem>
        ))}
      </Menu>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Xem chi tiết
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Bulk Create Dialog */}
      <Dialog 
        open={openBulkCreateDialog} 
        onClose={handleBulkCreateClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Tạo bài tập cho nhiều lớp
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chọn các lớp bạn muốn tạo cùng một bài tập
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Chọn lớp học:
            </Typography>
            {classes.map((cls) => (
              <FormControlLabel
                key={cls.id}
                control={
                  <Checkbox
                    checked={selectedClasses.includes(cls.id)}
                    onChange={() => handleClassToggle(cls.id)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {cls.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cls.students} sinh viên
                    </Typography>
                  </Box>
                }
                sx={{ display: 'block', mb: 1 }}
              />
            ))}
            
            {selectedClasses.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Đã chọn {selectedClasses.length} lớp. Bài tập sẽ được tạo cho tất cả các lớp này.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBulkCreateClose}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // TODO: Navigate to create assignment page with selected classes
              console.log('Creating for classes:', selectedClasses);
              handleBulkCreateClose();
            }}
            disabled={selectedClasses.length === 0}
          >
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Assignments;
