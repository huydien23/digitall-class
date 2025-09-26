import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Container,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Assessment,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGrades } from '../../store/slices/gradeSlice'
import StudentGradesView from '../../components/Grades/StudentGradesView'

const Grades = () => {
  const dispatch = useDispatch()
  const { grades, isLoading, error } = useSelector((state) => state.grades)
  const { user } = useSelector((state) => state.auth)
  const userRole = user?.role || 'student'

  // For students, show StudentGradesView component
  if (userRole === 'student') {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <StudentGradesView user={user} />
      </Container>
    )
  }

  // For admin/teacher, show the original grade management interface
  React.useEffect(() => {
    dispatch(fetchGrades())
  }, [dispatch])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý điểm số
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
        >
          Thêm điểm số
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Lớp học</TableCell>
                <TableCell>Môn học</TableCell>
                <TableCell>Điểm số</TableCell>
                <TableCell>Loại điểm</TableCell>
                <TableCell>Ngày nhập</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades && Array.isArray(grades) && grades.length > 0 ? (
                grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      {grade.student?.first_name} {grade.student?.last_name}
                    </TableCell>
                    <TableCell>{grade.class?.class_name}</TableCell>
                    <TableCell>{grade.subject?.subject_name ?? grade.subject}</TableCell>
                    <TableCell>
                      <Chip
                        label={grade.score}
                        color={grade.score >= 5 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{grade.grade_type}</TableCell>
                    <TableCell>
                      {grade.created_at ? new Date(grade.created_at).toLocaleDateString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {grades && Array.isArray(grades) && grades.length === 0 
                        ? 'Chưa có dữ liệu điểm số' 
                        : 'Đang tải dữ liệu...'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default Grades