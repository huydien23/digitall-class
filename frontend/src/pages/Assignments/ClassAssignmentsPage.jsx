import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Typography, Button, Paper, Stack, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, Tooltip, LinearProgress, Alert
} from '@mui/material'
import { Add as AddIcon, CloudUpload as UploadIcon, Delete as DeleteIcon, Download as DownloadIcon, PlayArrow as StartIcon, ArrowBack as BackIcon } from '@mui/icons-material'
import dayjs from 'dayjs'
import assignmentService from '../../services/assignmentService'

const StatusChip = ({ assignment }) => {
  const now = dayjs()
  const open = (!assignment.release_at || now.isAfter(dayjs(assignment.release_at))) && (!assignment.due_at || now.isBefore(dayjs(assignment.due_at)))
  return (
    <Chip size="small" color={open ? 'success' : 'default'} label={open ? 'Đang mở' : 'Đã khóa'} />
  )
}

const CreateAssignmentDialog = ({ open, onClose, classId, onCreated }) => {
  const [form, setForm] = useState({
    title: '', description: '', type: 'assignment', session_id: '',
    release_at: '', due_at: '', time_limit_minutes: '', allowed_file_types: 'pdf,doc,docx,zip', max_file_size_mb: 20,
    is_published: true,
  })
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => v !== '' && data.append(k, v))
      data.append('class_id', classId)
      if (file) data.append('attachment', file)
      await assignmentService.create(data)
      onCreated?.()
      onClose?.()
    } catch (e) {
      alert(e?.response?.data?.error || e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo bài tập/thi</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tiêu đề" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
          <TextField label="Mô tả" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
          <TextField select label="Loại" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <MenuItem value="assignment">Bài tập</MenuItem>
            <MenuItem value="exam">Bài thi</MenuItem>
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField type="datetime-local" label="Mở lúc" InputLabelProps={{ shrink: true }} value={form.release_at} onChange={e => setForm({ ...form, release_at: e.target.value })} fullWidth />
            <TextField type="datetime-local" label="Hạn nộp" InputLabelProps={{ shrink: true }} value={form.due_at} onChange={e => setForm({ ...form, due_at: e.target.value })} fullWidth />
          </Stack>
          <TextField type="number" label="Giới hạn thời gian (phút, nếu là thi)" value={form.time_limit_minutes} onChange={e => setForm({ ...form, time_limit_minutes: e.target.value })} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Định dạng cho phép" value={form.allowed_file_types} onChange={e => setForm({ ...form, allowed_file_types: e.target.value })} fullWidth />
            <TextField type="number" label="Dung lượng tối đa (MB)" value={form.max_file_size_mb} onChange={e => setForm({ ...form, max_file_size_mb: e.target.value })} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="outlined" onClick={() => setForm({ ...form, is_published: !form.is_published })}>
              {form.is_published ? 'Đang công khai' : 'Bản nháp (không hiển thị SV)'}
            </Button>
          </Stack>
          <Button variant="outlined" component="label" startIcon={<UploadIcon />}>Chọn file đề
            <input type="file" hidden onChange={e => setFile(e.target.files?.[0])} />
          </Button>
          {file && <Typography variant="body2">Đã chọn: {file.name}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Tạo bài'}</Button>
      </DialogActions>
    </Dialog>
  )
}

const StudentRow = ({ a, onChanged }) => {
  const [subm, setSubm] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadMy = async () => {
    try {
      const res = await assignmentService.mySubmission(a.id)
      if (res?.status === 204) { setSubm(null); return }
      setSubm(res.data || res)
    } catch {}
  }
  useEffect(() => { loadMy() }, [a.id])

  const start = async () => {
    await assignmentService.start(a.id)
    await loadMy()
  }

  const submit = async (file) => {
    try {
      setUploading(true)
      await assignmentService.submit(a.id, file)
      await loadMy()
      onChanged?.()
    } catch (e) {
      alert(e?.response?.data?.error || e.message)
    } finally {
      setUploading(false)
    }
  }

  const now = dayjs(a.server_now || new Date())
  const releaseAt = a.release_at ? dayjs(a.release_at) : null
  const due = subm?.personal_due_at ? dayjs(subm.personal_due_at) : (a.due_at ? dayjs(a.due_at) : null)

  let status = 'open'
  if (releaseAt && now.isBefore(releaseAt)) status = 'locked'
  else if (due && now.isAfter(due)) status = 'closed'

  const remaining = due ? due.diff(now, 'minute') : null
  const disabled = status !== 'open'

  return (
    <>
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>{a.title}</Typography>
          <Typography variant="body2" color="text.secondary">{a.type === 'exam' ? 'Bài thi' : 'Bài tập'}</Typography>
          {a.attachment && (
            <Button size="small" href={a.attachment} startIcon={<DownloadIcon />}>Tải đề</Button>
          )}
          {releaseAt && now.isBefore(releaseAt) && (
            <Typography variant="caption" color={'text.secondary'} display="block">
              Mở: {releaseAt.format('DD/MM/YYYY HH:mm')}
            </Typography>
          )}
          {due && (
            <Typography variant="caption" color={status === 'closed' ? 'error' : 'text.secondary'} display="block">
              Hạn: {due.format('DD/MM/YYYY HH:mm')} {remaining !== null && `(còn ${Math.max(0, remaining)} phút)`}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          {a.type === 'exam' && (!subm || !subm.started_at) && (
            <Button size="small" variant="outlined" startIcon={<StartIcon />} onClick={start} disabled={disabled}>Bắt đầu thi</Button>
          )}
          <Button size="small" variant="text" onClick={() => setDetailOpen(true)}>Chi tiết</Button>
          {subm?.file && (
            <Button size="small" variant="outlined" href={subm.file} startIcon={<DownloadIcon />}>Bài đã nộp</Button>
          )}
          {subm?.file && (
            <Button size="small" color="warning" variant="outlined" onClick={async () => { try { await assignmentService.unsubmit(a.id); await loadMy(); onChanged?.() } catch (e) { alert(e?.response?.data?.error || e.message) } }} disabled={subm?.status === 'graded' || (due && now.isAfter(due))}>
              Hủy nộp
            </Button>
          )}
          <Button component="label" variant="contained" size="small" disabled={uploading || disabled}>
            Nộp bài
            <input type="file" hidden onChange={e => e.target.files?.[0] && submit(e.target.files[0])} />
          </Button>
        </Stack>
      </Stack>
      {uploading && <LinearProgress sx={{ mt: 1 }} />}
      {subm && (
        <>
          <Typography variant="caption" color={subm.is_late ? 'error' : 'text.secondary'} display="block" sx={{ mt: 1 }}>
            Trạng thái: {subm.status} {subm.is_late ? '(trễ)' : ''} {subm.uploaded_at ? `• Nộp: ${dayjs(subm.uploaded_at).format('DD/MM HH:mm')}` : ''}
          </Typography>
          {(subm.grade !== null && subm.grade !== undefined) && (
            <Typography variant="caption" color={'text.secondary'} display="block">
              Điểm: {subm.grade}/10 {subm.feedback ? `• Nhận xét: ${subm.feedback}` : ''}
            </Typography>
          )}
        </>
      )}
    </Paper>

    <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Chi tiết: {a.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography variant="body2">Loại: {a.type === 'exam' ? 'Bài thi' : 'Bài tập'}</Typography>
          <Typography variant="body2">Trạng thái: {subm ? subm.status : 'Chưa nộp'}</Typography>
          <Typography variant="body2">Nộp lúc: {subm?.uploaded_at ? dayjs(subm.uploaded_at).format('DD/MM/YYYY HH:mm') : '-'}</Typography>
          <Typography variant="body2">Điểm: {(subm && subm.grade !== null && subm.grade !== undefined) ? `${subm.grade}/10` : 'Chưa chấm'}</Typography>
          {subm?.feedback && (<Typography variant="body2">Nhận xét: {subm.feedback}</Typography>)}
          {a.release_at && (<Typography variant="body2">Mở: {dayjs(a.release_at).format('DD/MM/YYYY HH:mm')}</Typography>)}
          {a.due_at && (<Typography variant="body2">Hạn: {dayjs(a.due_at).format('DD/MM/YYYY HH:mm')}</Typography>)}
          {subm?.file && (
            <Button size="small" href={subm.file} startIcon={<DownloadIcon />}>Tải bài đã nộp</Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
      </DialogActions>
    </Dialog>
    </>
  )
}

const TeacherRow = ({ a, onChanged }) => {
  const navigate = useNavigate()
  const remove = async () => {
    if (!window.confirm('Xóa bài này?')) return
    await assignmentService.remove(a.id)
    onChanged?.()
  }
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>{a.title}</Typography>
          <Typography variant="body2" color="text.secondary">{a.type === 'exam' ? 'Bài thi' : 'Bài tập'}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusChip assignment={a} />
            {a.release_at && <Chip size="small" label={`Mở: ${dayjs(a.release_at).format('DD/MM HH:mm')}`} />}
            {a.due_at && <Chip size="small" label={`Hạn: ${dayjs(a.due_at).format('DD/MM HH:mm')}`} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          {a.attachment && <Button size="small" href={a.attachment} startIcon={<DownloadIcon />}>Tải đề</Button>}
          <Button size="small" variant="text" onClick={() => navigate(`/classes/${a.class_obj?.id}/assignments/${a.id}/submissions`)}>Bài nộp</Button>
          <IconButton size="small" color="error" onClick={remove}><DeleteIcon /></IconButton>
        </Stack>
      </Stack>
    </Paper>
  )
}

const ClassAssignmentsPage = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin'

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await assignmentService.list({ class_id: classId, page_size: 200 })
      const data = res.data?.results || res.data || []
      setItems(data)
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [classId])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>Quay lại</Button>
          <Typography variant="h5" fontWeight={700}>Bài tập/Thi của lớp</Typography>
        </Stack>
        {isTeacher && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>Tạo bài</Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box textAlign="center" py={4}><LinearProgress /></Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Chưa có bài nào</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {items.map(a => (
            <Grid item xs={12} md={6} key={a.id}>
              {isTeacher ? (
                <TeacherRow a={a} onChanged={load} />
              ) : (
                <StudentRow a={a} onChanged={load} />
              )}
            </Grid>
          ))}
        </Grid>
      )}

      <CreateAssignmentDialog open={openCreate} onClose={() => setOpenCreate(false)} classId={classId} onCreated={load} />
    </Container>
  )
}

export default ClassAssignmentsPage
