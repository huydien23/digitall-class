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
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const Analytics = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [timePeriod, setTimePeriod] = useState('month');

  // Mock data
  const classes = [
    { id: 1, name: 'CS101 - Lập trình Python' },
    { id: 2, name: 'CS201 - Web Development' },
  ];

  const topStudents = [
    { id: 1, name: 'Nguyễn Văn A', score: 9.5, attendance: 98, assignments: 100 },
    { id: 2, name: 'Trần Thị B', score: 9.2, attendance: 95, assignments: 100 },
    { id: 3, name: 'Lê Văn C', score: 8.8, attendance: 92, assignments: 95 },
  ];

  const insights = [
    {
      type: 'success',
      icon: <TrendingUpIcon />,
      title: 'Xu hướng tích cực',
      description: 'Điểm trung bình lớp tăng 5% so với tháng trước',
    },
    {
      type: 'warning',
      icon: <WarningIcon />,
      title: 'Cần chú ý',
      description: '3 sinh viên có tỷ lệ điểm danh dưới 80%',
    },
    {
      type: 'info',
      icon: <AssignmentIcon />,
      title: 'Bài tập',
      description: 'Tỷ lệ nộp bài tập đúng hạn: 85%',
    },
  ];

  const getInsightColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Thống kê & Phân tích
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dashboard phân tích và insights về hoạt động giảng dạy
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<TimelineIcon />}>
          Xem báo cáo chi tiết
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Chọn lớp</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Chọn lớp"
                >
                  <MenuItem value="">Tất cả các lớp</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Khoảng thời gian</InputLabel>
                <Select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  label="Khoảng thời gian"
                >
                  <MenuItem value="week">7 ngày qua</MenuItem>
                  <MenuItem value="month">30 ngày qua</MenuItem>
                  <MenuItem value="semester">Học kỳ này</MenuItem>
                  <MenuItem value="year">Năm học này</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h3" fontWeight={700} color="white">
                    8.5
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Điểm TB chung
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#4ade80' }} />
                    <Typography variant="caption" sx={{ color: '#4ade80' }}>
                      +0.3 so với tháng trước
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AssessmentIcon sx={{ color: 'white', fontSize: 28 }} />
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
                  <Typography variant="h3" fontWeight={700} color="white">
                    87%
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tỷ lệ điểm danh
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#4ade80' }} />
                    <Typography variant="caption" sx={{ color: '#4ade80' }}>
                      +2% so với tuần trước
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
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
                  <Typography variant="h3" fontWeight={700} color="white">
                    92%
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tỷ lệ hoàn thành BT
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <TrendingDownIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                    <Typography variant="caption" sx={{ color: '#fbbf24' }}>
                      -3% so với tuần trước
                    </Typography>
                  </Box>
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
                <Box>
                  <Typography variant="h3" fontWeight={700} color="white">
                    150
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tổng sinh viên
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      Trong 5 lớp học
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PeopleIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Charts Section - Placeholder */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Attendance Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    📊 Xu hướng điểm danh
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tỷ lệ điểm danh theo tuần (30 ngày qua)
                  </Typography>
                  <Box
                    sx={{
                      height: 250,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      mt: 2,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <TimelineIcon sx={{ fontSize: 60, color: 'grey.400', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Line Chart - Tỷ lệ điểm danh theo thời gian
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (Sử dụng Recharts hoặc Chart.js)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Grades Distribution Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    📊 Phân bố điểm số
                  </Typography>
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      mt: 2,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Pie Chart
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        A: 30%, B: 40%, C: 20%, D: 10%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Assignments Completion */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    📊 Hoàn thành bài tập
                  </Typography>
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      mt: 2,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Bar Chart
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tỷ lệ nộp bài theo tuần
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Sidebar - Top Students & Insights */}
        <Grid item xs={12} md={4}>
          {/* Top Students */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrophyIcon color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Top sinh viên
                </Typography>
              </Box>
              <List>
                {topStudents.map((student, index) => (
                  <React.Fragment key={student.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor:
                              index === 0
                                ? 'warning.main'
                                : index === 1
                                ? 'grey.400'
                                : 'orange.600',
                            fontWeight: 700,
                          }}
                        >
                          #{index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={student.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Điểm TB: {student.score} | Điểm danh: {student.attendance}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.score * 10}
                              sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < topStudents.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                💡 Insights
              </Typography>
              <List>
                {insights.map((insight, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, alignItems: 'flex-start' }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: `${getInsightColor(insight.type)}.light`,
                            color: `${getInsightColor(insight.type)}.dark`,
                          }}
                        >
                          {insight.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={insight.title}
                        secondary={insight.description}
                        primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                    {index < insights.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
