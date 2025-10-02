import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'
import classService from '../../services/classService'

const ProvisionAccountsDialog = ({
  open,
  onClose,
  selectedStudentIds = [],
  allStudents = [],
  classId,
  onComplete,
}) => {
  const [scope, setScope] = useState('selected') // selected | no_user | all
  const [action, setAction] = useState('create_only') // create_only | create_or_update
  const [passwordPolicy, setPasswordPolicy] = useState('mssv') // mssv | dob | random
  const [requireChangeOnFirstLogin, setRequireChangeOnFirstLogin] = useState(false)
  const [dryRun, setDryRun] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dryRunResult, setDryRunResult] = useState(null)

  const handleReset = () => {
    setScope('selected')
    setAction('create_only')
    setPasswordPolicy('mssv')
    setRequireChangeOnFirstLogin(false)
    setDryRun(false)
    setDryRunResult(null)
    setError('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const getSelectedStudents = () => {
    if (scope === 'selected') {
      return allStudents.filter((s) => selectedStudentIds.includes(s.id))
    } else if (scope === 'no_user') {
      return allStudents.filter((s) => !s.user || !s.user.id)
    } else {
      return allStudents
    }
  }

  const getCandidates = () => {
    const selected = getSelectedStudents()
    if (action === 'create_only') {
      return selected.filter((s) => !s.user || !s.user.id)
    }
    return selected
  }

  const handleDryRun = async () => {
    if (!classId) {
      setError('Vui lòng chọn lớp học hoặc lọc theo lớp trước khi chạy')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const candidates = getCandidates()
      const studentIds = candidates.map((s) => s.student_id)

      // Simulate dry-run response (in real app, backend should support dry_run parameter)
      const payload = {
        student_ids: studentIds.length > 0 ? studentIds : undefined,
        only_without_user: action === 'create_only',
        force: action === 'create_or_update',
        // password_policy: passwordPolicy, // Will be supported by backend
        // require_change_on_first_login: requireChangeOnFirstLogin, // Will be supported by backend
      }

      // For now, simulate dry-run locally
      const wouldCreate = candidates.filter((s) => !s.user || !s.user.id).length
      const wouldUpdate = action === 'create_or_update' ? candidates.filter((s) => s.user && s.user.id).length : 0
      const wouldSkip = candidates.length - wouldCreate - wouldUpdate

      setDryRunResult({
        total_candidates: candidates.length,
        would_create: wouldCreate,
        would_update: wouldUpdate,
        would_skip: wouldSkip,
        sample: candidates.slice(0, 10),
      })
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Dry-run thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!classId) {
      setError('Vui lòng chọn lớp học hoặc lọc theo lớp trước khi thực thi')
      return
    }

    const confirm = window.confirm(
      `Bạn có chắc chắn muốn ${action === 'create_or_update' ? 'TẠO/CẬP NHẬT' : 'TẠO'} tài khoản cho ${getCandidates().length} sinh viên?\n\n` +
      `Mật khẩu sẽ được đặt theo: ${passwordPolicy === 'mssv' ? 'MSSV' : passwordPolicy === 'dob' ? 'Ngày sinh' : 'Ngẫu nhiên'}\n` +
      (requireChangeOnFirstLogin ? 'Sinh viên sẽ phải đổi mật khẩu khi đăng nhập lần đầu.' : '')
    )
    
    if (!confirm) return

    try {
      setLoading(true)
      setError('')

      const candidates = getCandidates()
      const studentIds = candidates.map((s) => s.student_id)

      const payload = {
        student_ids: studentIds.length > 0 ? studentIds : undefined,
        only_without_user: action === 'create_only',
        force: action === 'create_or_update',
        // password_policy: passwordPolicy, // TODO: Backend support
        // require_change_on_first_login: requireChangeOnFirstLogin, // TODO: Backend support
      }

      const res = await classService.createStudentAccounts(classId, payload)
      const data = res?.data || {}
      
      if (onComplete) {
        onComplete({
          success: true,
          created: data.created || 0,
          updated: data.updated || 0,
          skipped: data.skipped || 0,
        })
      }

      handleClose()
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Thực thi thất bại')
    } finally {
      setLoading(false)
    }
  }

  const candidates = getCandidates()

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon />
          <Typography variant="h6">Tạo/Cập nhật tài khoản sinh viên</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Scope */}
        <Box mb={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Phạm vi</FormLabel>
            <RadioGroup value={scope} onChange={(e) => {
              setScope(e.target.value)
              setDryRunResult(null)
            }}>
              <FormControlLabel
                value="selected"
                control={<Radio />}
                label={`Sinh viên đã chọn (${selectedStudentIds.length})`}
                disabled={selectedStudentIds.length === 0}
              />
              <FormControlLabel
                value="no_user"
                control={<Radio />}
                label="Chỉ sinh viên chưa có tài khoản"
              />
              <FormControlLabel value="all" control={<Radio />} label="Tất cả sinh viên trong phạm vi" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Action */}
        <Box mb={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Hành động</FormLabel>
            <RadioGroup value={action} onChange={(e) => {
              setAction(e.target.value)
              setDryRunResult(null)
            }}>
              <FormControlLabel
                value="create_only"
                control={<Radio />}
                label="Chỉ tạo mới (bỏ qua SV đã có tài khoản)"
              />
              <FormControlLabel
                value="create_or_update"
                control={<Radio />}
                label="Tạo mới hoặc cập nhật (đặt lại mật khẩu cho SV đã có TK)"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Password Policy */}
        <Box mb={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Chính sách mật khẩu mặc định</FormLabel>
            <RadioGroup value={passwordPolicy} onChange={(e) => setPasswordPolicy(e.target.value)}>
              <FormControlLabel value="mssv" control={<Radio />} label="MSSV (Mã sinh viên)" />
              <FormControlLabel value="dob" control={<Radio />} label="Ngày sinh (YYYYMMDD)" disabled />
              <FormControlLabel value="random" control={<Radio />} label="Ngẫu nhiên (10-12 ký tự)" disabled />
            </RadioGroup>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Lưu ý: Chỉ MSSV được hỗ trợ hiện tại. Các tùy chọn khác đang phát triển.
            </Typography>
          </FormControl>
        </Box>

        {/* Require change on first login */}
        <Box mb={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={requireChangeOnFirstLogin}
                onChange={(e) => setRequireChangeOnFirstLogin(e.target.checked)}
                disabled
              />
            }
            label="Yêu cầu đổi mật khẩu khi đăng nhập lần đầu (chưa hỗ trợ)"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Summary */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Tóm tắt:
          </Typography>
          <Typography variant="body2">
            • Sẽ xử lý: <strong>{candidates.length}</strong> sinh viên
          </Typography>
          <Typography variant="body2">
            • Hành động: <strong>{action === 'create_only' ? 'Chỉ tạo mới' : 'Tạo/Cập nhật'}</strong>
          </Typography>
          <Typography variant="body2">
            • Mật khẩu: <strong>{passwordPolicy === 'mssv' ? 'MSSV' : passwordPolicy}</strong>
          </Typography>
        </Alert>

        {/* Dry-run result */}
        {dryRunResult && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.light' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Kết quả xem trước (Dry-run):
            </Typography>
            <Typography variant="body2">✓ Sẽ tạo mới: {dryRunResult.would_create}</Typography>
            <Typography variant="body2">↻ Sẽ cập nhật: {dryRunResult.would_update}</Typography>
            <Typography variant="body2">⏭ Sẽ bỏ qua: {dryRunResult.would_skip}</Typography>
            
            {dryRunResult.sample && dryRunResult.sample.length > 0 && (
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Mẫu 10 sinh viên đầu tiên:
                </Typography>
                <TableContainer sx={{ mt: 1, maxHeight: 200 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>MSSV</TableCell>
                        <TableCell>Tên</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dryRunResult.sample.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.student_id}</TableCell>
                          <TableCell>{s.last_name} {s.first_name}</TableCell>
                          <TableCell>
                            {s.user?.id ? '✓ Có TK' : '⚠ Chưa có TK'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleDryRun}
          startIcon={loading ? <CircularProgress size={16} /> : <VisibilityIcon />}
          disabled={loading || candidates.length === 0}
          variant="outlined"
        >
          Xem trước
        </Button>
        <Button
          onClick={handleExecute}
          startIcon={loading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
          disabled={loading || candidates.length === 0}
          variant="contained"
          color="primary"
        >
          Thực thi
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProvisionAccountsDialog
