import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Divider,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material'

const ImportProgressDialog = ({ 
  open, 
  onClose, 
  progress = 0,
  total = 0,
  current = 0,
  status = 'idle', // idle, importing, preview, completed, error
  students = [],
  results = { success: 0, failed: 0, skipped: 0 },
  errors = [],
  onConfirmImport,
  onCancelImport
}) => {
  const [showErrors, setShowErrors] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(true)

  const getStatusColor = (itemStatus) => {
    switch (itemStatus) {
      case 'success': return 'success'
      case 'error': return 'error'
      case 'skipped': return 'warning'
      case 'processing': return 'info'
      default: return 'default'
    }
  }

  const getStatusIcon = (itemStatus) => {
    switch (itemStatus) {
      case 'success': return <CheckIcon color="success" />
      case 'error': return <ErrorIcon color="error" />
      case 'skipped': return <WarningIcon color="warning" />
      case 'processing': return <CircularProgress size={20} />
      default: return <InfoIcon color="disabled" />
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={status === 'importing' ? null : onClose}
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={status === 'importing'}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {status === 'preview' && '📋 Xem trước danh sách sinh viên'}
            {status === 'importing' && '⏳ Đang import sinh viên...'}
            {status === 'completed' && '✅ Import hoàn tất!'}
            {status === 'error' && '❌ Import thất bại'}
          </Typography>
          {status === 'importing' && (
            <Chip 
              label={`${current}/${total}`} 
              color="primary" 
              size="small"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Progress Bar */}
        {status === 'importing' && (
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Đang xử lý...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        )}

        {/* Statistics */}
        {(status === 'importing' || status === 'completed') && (
          <Box display="flex" gap={2} mb={3}>
            <Paper sx={{ flex: 1, p: 2, bgcolor: 'success.light', textAlign: 'center' }}>
              <Typography variant="h4" color="success.dark">{results.success}</Typography>
              <Typography variant="caption" color="success.dark">Thành công</Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, bgcolor: 'error.light', textAlign: 'center' }}>
              <Typography variant="h4" color="error.dark">{results.failed}</Typography>
              <Typography variant="caption" color="error.dark">Thất bại</Typography>
            </Paper>
            <Paper sx={{ flex: 1, p: 2, bgcolor: 'warning.light', textAlign: 'center' }}>
              <Typography variant="h4" color="warning.dark">{results.skipped}</Typography>
              <Typography variant="caption" color="warning.dark">Bỏ qua</Typography>
            </Paper>
          </Box>
        )}

        {/* Preview Table */}
        {status === 'preview' && students.length > 0 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Tìm thấy <strong>{students.length} sinh viên</strong> trong file Excel. 
              Kiểm tra dữ liệu và nhấn "Xác nhận import" để tiếp tục.
            </Alert>
            
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>MSSV</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Giới tính</TableCell>
                    <TableCell>Ngày sinh</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.slice(0, 50).map((student, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={student.gender === 'male' ? 'Nam' : student.gender === 'female' ? 'Nữ' : 'Khác'}
                          size="small"
                          color={student.gender === 'female' ? 'secondary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{student.date_of_birth}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{student.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {students.length > 50 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Đang hiển thị 50/{students.length} sinh viên đầu tiên
              </Alert>
            )}
          </>
        )}

        {/* Import Progress List */}
        {status === 'importing' && students.length > 0 && (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {students.map((student, index) => (
              <ListItem 
                key={index}
                sx={{ 
                  bgcolor: student.status === 'processing' ? 'action.hover' : 'transparent',
                  borderRadius: 1,
                  mb: 0.5
                }}
              >
                <ListItemIcon>
                  {getStatusIcon(student.status)}
                </ListItemIcon>
                <ListItemText
                  primary={`${student.student_id} - ${student.full_name}`}
                  secondary={student.error || null}
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                  secondaryTypographyProps={{ color: 'error' }}
                />
                {student.status && (
                  <Chip 
                    label={student.status === 'success' ? 'Thành công' : 
                           student.status === 'error' ? 'Lỗi' :
                           student.status === 'skipped' ? 'Bỏ qua' : 
                           'Đang xử lý'}
                    size="small"
                    color={getStatusColor(student.status)}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}

        {/* Errors Section */}
        {errors.length > 0 && status === 'completed' && (
          <Box mt={2}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle2" color="error">
                Chi tiết lỗi ({errors.length})
              </Typography>
              <IconButton size="small" onClick={() => setShowErrors(!showErrors)}>
                {showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={showErrors}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'error.light', maxHeight: 200, overflow: 'auto' }}>
                {errors.map((err, idx) => (
                  <Typography key={idx} variant="body2" color="error.dark" sx={{ mb: 0.5 }}>
                    • {err}
                  </Typography>
                ))}
              </Paper>
            </Collapse>
          </Box>
        )}

        {/* Completion Message */}
        {status === 'completed' && (
          <Alert 
            severity={results.failed > 0 ? 'warning' : 'success'} 
            sx={{ mt: 2 }}
          >
            <Typography variant="body2">
              Import hoàn tất! <strong>{results.success}</strong> sinh viên được thêm thành công.
              {results.failed > 0 && ` ${results.failed} sinh viên thất bại.`}
              {results.skipped > 0 && ` ${results.skipped} sinh viên bị bỏ qua.`}
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {status === 'preview' && (
          <>
            <Button onClick={onCancelImport}>
              Hủy
            </Button>
            <Button 
              variant="contained" 
              onClick={onConfirmImport}
              disabled={students.length === 0}
            >
              Xác nhận import ({students.length} SV)
            </Button>
          </>
        )}

        {status === 'importing' && (
          <Button disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Đang import...
          </Button>
        )}

        {status === 'completed' && (
          <Button variant="contained" onClick={onClose}>
            Đóng
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ImportProgressDialog
