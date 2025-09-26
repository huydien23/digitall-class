import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Avatar,
  Badge
} from '@mui/material'
import {
  School as SchoolIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material'

const StudentGradesView = ({ user }) => {
  const [grades, setGrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Load real grades from API
  useEffect(() => {
    const loadGrades = async () => {
      setIsLoading(true)
      try {
        const { default: gradeService } = await import('../../services/gradeService')
        const res = await gradeService.getGrades({
          student_id: user?.student_id || user?.id,
          page_size: 500,
          ordering: '-created_at'
        })
        const list = res.data?.results || res.data || []
        
        // Group by subject to fit the component structure
        const bySubject = {}
        list.forEach(g => {
          const key = g.subject || g.class_name || g.class?.class_name || 'Môn học'
          if (!bySubject[key]) {
            bySubject[key] = {
              id: `${key}`,
              subject: key,
              subjectCode: g.class_id || g.class?.class_id || '',
              teacher: g.teacher || (g.class?.teacher_name || ''),
              semester: g.semester || '',
              components: {
                regular: { weight: 10, maxScore: 10, currentScore: 0, items: [] },
                midterm: { weight: 30, maxScore: 10, currentScore: 0, items: [] },
                final: { weight: 60, maxScore: 10, currentScore: 0, items: [] },
              },
              finalGrade: 0,
              status: 'in_progress'
            }
          }
          const entry = bySubject[key]
          const item = { name: g.grade_type, score: Number(g.score || 0), maxScore: 10, date: g.created_at ? new Date(g.created_at).toISOString().slice(0,10) : '' }
          if (g.grade_type === 'regular') {
            entry.components.regular.currentScore = item.score
            entry.components.regular.items.push(item)
          } else if (g.grade_type === 'midterm') {
            entry.components.midterm.currentScore = item.score
            entry.components.midterm.items.push(item)
          } else if (g.grade_type === 'final') {
            entry.components.final.currentScore = item.score
            entry.components.final.items.push(item)
          }
        })
        
        const computed = Object.values(bySubject).map(s => {
          const regular = (s.components.regular.currentScore * s.components.regular.weight) / 100
          const midterm = (s.components.midterm.currentScore * s.components.midterm.weight) / 100
          const final = (s.components.final.currentScore * s.components.final.weight) / 100
          const total = regular + midterm + final
          return { ...s, finalGrade: Number.isFinite(total) ? total : 0, status: total > 0 ? 'completed' : 'in_progress' }
        })
        
        setGrades(computed)
      } catch (err) {
        setError('Không thể tải điểm số')
      } finally {
        setIsLoading(false)
      }
    }

    loadGrades()
  }, [user?.id, user?.student_id])

  const calculateFinalGrade = (components) => {
    const regular = (components.regular.currentScore * components.regular.weight) / 100
    const midterm = (components.midterm.currentScore * components.midterm.weight) / 100
    const final = (components.final.currentScore * components.final.weight) / 100
    
    return regular + midterm + final
  }

  const getGradeColor = (grade) => {
    if (grade >= 9.0) return 'success'
    if (grade >= 8.0) return 'info'
    if (grade >= 7.0) return 'warning'
    if (grade >= 5.0) return 'default'
    return 'error'
  }

  const getGradeText = (grade) => {
    if (grade >= 9.0) return 'Xuất sắc'
    if (grade >= 8.0) return 'Giỏi'
    if (grade >= 7.0) return 'Khá'
    if (grade >= 5.0) return 'Trung bình'
    return 'Yếu'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon color="success" />
      case 'in_progress': return <WarningIcon color="warning" />
      default: return <InfoIcon color="info" />
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Điểm số của tôi
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Hệ thống chấm điểm: 10% (thường xuyên) + 30% (giữa kỳ) + 60% (cuối kỳ)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Thang điểm 10: Xuất sắc (≥9.0), Giỏi (≥8.0), Khá (≥7.0), Trung bình (≥5.0), Yếu (&lt;5.0)
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {grades.filter(g => g.status === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Môn đã hoàn thành
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {grades.filter(g => g.status === 'in_progress').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Môn đang học
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="info.main">
                    {grades.length > 0 ? (grades.reduce((sum, g) => sum + g.finalGrade, 0) / grades.length).toFixed(1) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điểm TB hiện tại
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {grades.filter(g => g.finalGrade >= 8.0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Môn đạt loại giỏi
                  </Typography>
                </Box>
                <StarIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grades List */}
      {grades.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <GradeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có điểm số nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điểm số sẽ được cập nhật khi giảng viên chấm bài
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {grades.map((grade) => (
            <Accordion key={grade.id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <Box display="flex" alignItems="center" flexGrow={1}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {grade.subject} ({grade.subjectCode})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {grade.teacher} • {grade.semester}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    {getStatusIcon(grade.status)}
                    <Chip
                      label={grade.finalGrade > 0 ? `${grade.finalGrade.toFixed(1)} - ${getGradeText(grade.finalGrade)}` : 'Chưa có điểm'}
                      color={grade.finalGrade > 0 ? getGradeColor(grade.finalGrade) : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Regular Grade (10%) */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="info.main">
                          Thường xuyên (10%)
                        </Typography>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Typography variant="h4" fontWeight={600} sx={{ mr: 2 }}>
                            {grade.components.regular.currentScore}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            / {grade.components.regular.maxScore}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(grade.components.regular.currentScore / grade.components.regular.maxScore) * 100}
                          color="info"
                          sx={{ mb: 2 }}
                        />
                        <List dense>
                          {grade.components.regular.items.map((item, index) => (
                            <ListItem key={index} disablePadding>
                              <ListItemText
                                primary={item.name}
                                secondary={`${item.score}/${item.maxScore} - ${item.date}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Midterm Grade (30%) */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="warning.main">
                          Giữa kỳ (30%)
                        </Typography>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Typography variant="h4" fontWeight={600} sx={{ mr: 2 }}>
                            {grade.components.midterm.currentScore}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            / {grade.components.midterm.maxScore}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(grade.components.midterm.currentScore / grade.components.midterm.maxScore) * 100}
                          color="warning"
                          sx={{ mb: 2 }}
                        />
                        <List dense>
                          {grade.components.midterm.items.map((item, index) => (
                            <ListItem key={index} disablePadding>
                              <ListItemText
                                primary={item.name}
                                secondary={`${item.score}/${item.maxScore} - ${item.date}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Final Grade (60%) */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="error.main">
                          Cuối kỳ (60%)
                        </Typography>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Typography variant="h4" fontWeight={600} sx={{ mr: 2 }}>
                            {grade.components.final.currentScore}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            / {grade.components.final.maxScore}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(grade.components.final.currentScore / grade.components.final.maxScore) * 100}
                          color="error"
                          sx={{ mb: 2 }}
                        />
                        <List dense>
                          {grade.components.final.items.map((item, index) => (
                            <ListItem key={index} disablePadding>
                              <ListItemText
                                primary={item.name}
                                secondary={`${item.score}/${item.maxScore} - ${item.date}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Final Grade Summary */}
                <Divider sx={{ my: 3 }} />
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Điểm tổng kết
                  </Typography>
                  <Typography variant="h2" fontWeight={700} color="primary.main">
                    {grade.finalGrade > 0 ? grade.finalGrade.toFixed(1) : 'Chưa có'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {grade.finalGrade > 0 ? getGradeText(grade.finalGrade) : 'Chờ giảng viên chấm điểm'}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default StudentGradesView
