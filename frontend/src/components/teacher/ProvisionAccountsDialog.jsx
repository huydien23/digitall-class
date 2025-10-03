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
  TextField,
  Chip,
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
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
  const [passwordPolicy, setPasswordPolicy] = useState('mssv') // mssv | dob | random | custom
  const [customPassword, setCustomPassword] = useState('')
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
    const hasUser = (s) => !!(s?.user?.id || s?.has_user || s?.user_id)
    if (scope === 'selected') {
      return allStudents.filter((s) => selectedStudentIds.includes(s.id))
    } else if (scope === 'no_user') {
      return allStudents.filter((s) => !hasUser(s))
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

      const payload = {
        student_ids: studentIds.length > 0 ? studentIds : undefined,
        only_without_user: action === 'create_only',
        force: action === 'create_or_update',
        password_policy: passwordPolicy,
        ...(passwordPolicy === 'custom' && customPassword ? { password: customPassword } : {}),
        require_change_on_first_login: requireChangeOnFirstLogin,
        dry_run: true,
      }

      const res = await classService.createStudentAccounts(classId, payload)
      const data = res?.data || {}

      setDryRunResult({
        total_candidates: data.total_candidates ?? candidates.length,
        would_create: data.would_create ?? data.created ?? 0,
        would_update: data.would_update ?? data.updated ?? 0,
        would_skip: data.would_skip ?? data.skipped ?? 0,
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
      `Mật khẩu sẽ được đặt theo: ${passwordPolicy === 'mssv' ? 'MSSV' : passwordPolicy === 'dob' ? 'Ngày sinh' : passwordPolicy === 'random' ? 'Ngẫu nhiên' : 'Tự chọn'}\n` +
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
        password_policy: passwordPolicy,
        ...(passwordPolicy === 'custom' && customPassword ? { password: customPassword } : {}),
        require_change_on_first_login: requireChangeOnFirstLogin,
      }

      const res = await classService.createStudentAccounts(classId, payload)
      const data = res?.data || {}
      
      // Affected students (by student_id) – dùng để FE cập nhật trạng thái "Có TK" ngay lập tức
      const affectedStudentIds = studentIds.length > 0 
        ? studentIds 
        : getCandidates().map((s) => s.student_id)
      
      if (onComplete) {
        onComplete({
          success: true,
          created: data.created || 0,
          updated: data.updated || 0,
          skipped: data.skipped || 0,
          affected_student_ids: affectedStudentIds,
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
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Tạo/Cập nhật tài khoản sinh viên</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Scope */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Phạm vi</Typography>
          <FormControl component="fieldset" fullWidth>
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
              <FormControlLabel 
                value="all" 
                control={<Radio />} 
                label="Tất cả sinh viên trong phạm vi"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        {/* Action */}
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Hành động</Typography>
          <FormControl component="fieldset" fullWidth>
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
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Chính sách mật khẩu mặc định</Typography>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={passwordPolicy} onChange={(e) => setPasswordPolicy(e.target.value)}>
              <FormControlLabel 
                value="mssv" 
                control={<Radio />} 
                label="MSSV (Mã sinh viên)"
              />
              <FormControlLabel 
                value="dob" 
                control={<Radio />} 
                label="Ngày sinh (YYYYMMDD)"
              />
              <FormControlLabel 
                value="random" 
                control={<Radio />} 
                label="Ngẫu nhiên (12 ký tự)"
              />
              <FormControlLabel 
                value="custom" 
                control={<Radio />} 
                label="Tự chọn (nhập mật khẩu)"
              />
            </RadioGroup>
            {passwordPolicy === 'custom' && (
              <TextField
                fullWidth
                size="small"
                type="text"
                label="Mật khẩu tùy chọn"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Nhập mật khẩu áp dụng cho tất cả sinh viên"
                sx={{ mt: 2 }}
                helperText="Tối thiểu 6 ký tự"
              />
            )}
          </FormControl>
        </Box>

        {/* Require change on first login */}
        <Box mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={requireChangeOnFirstLogin}
                onChange={(e) => setRequireChangeOnFirstLogin(e.target.checked)}
              />
            }
            label="Yêu cầu đổi mật khẩu khi đăng nhập lần đầu"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Summary */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Tóm tắt
          </Typography>
          <Typography variant="body2">
            • Số lượng: <strong>{getCandidates().length}</strong> sinh viên
          </Typography>
          <Typography variant="body2">
            • Hành động: <strong>{action === 'create_only' ? 'Chỉ tạo mới' : 'Tạo/Cập nhật'}</strong>
          </Typography>
          <Typography variant="body2">
            • Mật khẩu: <strong>{passwordPolicy === 'mssv' ? 'MSSV' : passwordPolicy === 'dob' ? 'Ngày sinh' : passwordPolicy === 'random' ? 'Ngẫu nhiên' : 'Tùy chọn'}</strong>
          </Typography>
        </Alert>
        {/* Dry-run result */}
        {dryRunResult && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Kết quả xem trước
              </Typography>
              <Typography variant="body2">
                Tổng: {dryRunResult.total_candidates || 0} sinh viên • 
                Tạo mới: <strong>{dryRunResult.would_create || 0}</strong> • 
                Cập nhật: <strong>{dryRunResult.would_update || 0}</strong> • 
                Bỏ qua: <strong>{dryRunResult.would_skip || 0}</strong>
              </Typography>
            </Alert>
            
            {dryRunResult.sample && dryRunResult.sample.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mẫu 10 sinh viên đầu tiên:
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>MSSV</TableCell>
                        <TableCell>Họ tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Trạng thái</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dryRunResult.sample.map((s, idx) => {
                        const hasUser = !!(s?.user?.id || s?.has_user || s?.user_id)
                        return (
                          <TableRow key={s.id || idx} hover>
                            <TableCell>{s.student_id}</TableCell>
                            <TableCell>{s.last_name} {s.first_name}</TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {s.email || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                size="small"
                                label={hasUser ? 'Có TK' : 'Chưa TK'}
                                color={hasUser ? 'success' : 'default'}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleDryRun}
          startIcon={loading ? <CircularProgress size={16} /> : <VisibilityIcon />}
          disabled={loading || getCandidates().length === 0}
          variant="outlined"
        >
          Xem trước
        </Button>
        <Button
          onClick={handleExecute}
          startIcon={loading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
          disabled={loading || getCandidates().length === 0}
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
