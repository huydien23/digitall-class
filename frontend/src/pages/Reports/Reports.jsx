import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data
  const classes = [
    { id: 1, name: 'CS101 - Lập trình Python' },
    { id: 2, name: 'CS201 - Web Development' },
  ];

  const attendanceData = [
    { studentId: 'SV001', name: 'Nguyễn Văn A', present: 15, absent: 2, late: 1, total: 18, rate: 83 },
    { studentId: 'SV002', name: 'Trần Thị B', present: 17, absent: 1, late: 0, total: 18, rate: 94 },
    { studentId: 'SV003', name: 'Lê Văn C', present: 14, absent: 3, late: 1, total: 18, rate: 78 },
  ];

  const gradesData = [
    { studentId: 'SV001', name: 'Nguyễn Văn A', regular: 8.5, midterm: 7.5, final: 8.0, average: 8.0, grade: 'B' },
    { studentId: 'SV002', name: 'Trần Thị B', regular: 9.0, midterm: 9.5, final: 9.0, average: 9.2, grade: 'A' },
    { studentId: 'SV003', name: 'Lê Văn C', regular: 7.0, midterm: 6.5, final: 7.0, average: 6.8, grade: 'C' },
  ];

  const assignmentsData = [
    { title: 'Bài tập tuần 1', submitted: 28, total: 30, onTime: 25, late: 3, avgScore: 8.5 },
    { title: 'Project giữa kỳ', submitted: 30, total: 30, onTime: 28, late: 2, avgScore: 7.8 },
    { title: 'Bài tập tuần 5', submitted: 25, total: 30, onTime: 22, late: 3, avgScore: 8.2 },
  ];

  const handleExport = (format) => {
    console.log(`Export as ${format}`);
    // TODO: Implement export logic
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'success',
      'B': 'info',
      'C': 'warning',
      'D': 'error',
      'F': 'error',
    };
    return colors[grade] || 'default';
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Báo cáo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Báo cáo và thống kê chi tiết về lớp học
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Xuất PDF">
            <Button
              variant="outlined"
              startIcon={<PdfIcon />}
              onClick={() => handleExport('pdf')}
            >
              PDF
            </Button>
          </Tooltip>
          <Tooltip title="Xuất Excel">
            <Button
              variant="outlined"
              startIcon={<ExcelIcon />}
              onClick={() => handleExport('excel')}
              color="success"
            >
              Excel
            </Button>
          </Tooltip>
          <Tooltip title="In">
            <IconButton color="primary" onClick={() => window.print()}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Chọn lớp</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Chọn lớp"
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Khoảng thời gian</InputLabel>
                <Select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  label="Khoảng thời gian"
                >
                  <MenuItem value="week">Tuần này</MenuItem>
                  <MenuItem value="month">Tháng này</MenuItem>
                  <MenuItem value="semester">Học kỳ</MenuItem>
                  <MenuItem value="year">Năm học</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: 56 }}
                disabled={!selectedClass}
              >
                Tạo báo cáo
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    85%
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tỷ lệ điểm danh
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
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    8.2
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Điểm TB lớp
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AssessmentIcon sx={{ color: 'white', fontSize: 28 }} />
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
                    90%
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tỷ lệ nộp bài
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
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" fontWeight={700} color="white">
                    +5%
                  </Typography>
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    So với kỳ trước
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Báo cáo điểm danh" />
          <Tab label="Báo cáo điểm số" />
          <Tab label="Báo cáo bài tập" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Báo cáo điểm danh chi tiết
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>MSSV</TableCell>
                    <TableCell>Họ và tên</TableCell>
                    <TableCell align="center">Có mặt</TableCell>
                    <TableCell align="center">Vắng</TableCell>
                    <TableCell align="center">Trễ</TableCell>
                    <TableCell align="center">Tổng buổi</TableCell>
                    <TableCell align="center">Tỷ lệ (%)</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.map((row) => (
                    <TableRow key={row.studentId} hover>
                      <TableCell>{row.studentId}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="center">
                        <Chip label={row.present} color="success" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.absent} color="error" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.late} color="warning" size="small" />
                      </TableCell>
                      <TableCell align="center">{row.total}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={row.rate}
                              color={getAttendanceRateColor(row.rate)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {row.rate}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.rate >= 80 ? 'Đạt' : 'Không đạt'}
                          color={row.rate >= 80 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Báo cáo điểm số chi tiết
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>MSSV</TableCell>
                    <TableCell>Họ và tên</TableCell>
                    <TableCell align="center">Điểm TX</TableCell>
                    <TableCell align="center">Điểm GK</TableCell>
                    <TableCell align="center">Điểm CK</TableCell>
                    <TableCell align="center">Điểm TB</TableCell>
                    <TableCell align="center">Xếp loại</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gradesData.map((row) => (
                    <TableRow key={row.studentId} hover>
                      <TableCell>{row.studentId}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="center">{row.regular}</TableCell>
                      <TableCell align="center">{row.midterm}</TableCell>
                      <TableCell align="center">{row.final}</TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" fontWeight={700}>
                          {row.average}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.grade}
                          color={getGradeColor(row.grade)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Báo cáo bài tập chi tiết
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bài tập</TableCell>
                    <TableCell align="center">Đã nộp</TableCell>
                    <TableCell align="center">Tổng số</TableCell>
                    <TableCell align="center">Đúng hạn</TableCell>
                    <TableCell align="center">Trễ hạn</TableCell>
                    <TableCell align="center">Điểm TB</TableCell>
                    <TableCell align="center">Tỷ lệ hoàn thành</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignmentsData.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{row.title}</TableCell>
                      <TableCell align="center">
                        <Chip label={row.submitted} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="center">{row.total}</TableCell>
                      <TableCell align="center">
                        <Chip label={row.onTime} color="success" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.late} color="warning" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" fontWeight={700}>
                          {row.avgScore}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(row.submitted / row.total) * 100}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {Math.round((row.submitted / row.total) * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Reports;
