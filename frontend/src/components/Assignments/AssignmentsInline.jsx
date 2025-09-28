import React, { useEffect, useState } from 'react'
import { Box, Paper, Stack, Typography, Button, Chip, LinearProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Download as DownloadIcon, Upload as UploadIcon, Add as AddIcon, ArrowForward as ArrowForwardIcon, PlayArrow as StartIcon } from '@mui/icons-material'
import dayjs from 'dayjs'
import assignmentService from '../../services/assignmentService'
import { useNavigate } from 'react-router-dom'

const fmtRemain = (target, now) => {
  if (!target) return ''
  const ms = target.diff(now)
  if (ms <= 0) return '0s'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${ss}s`
  return `${ss}s`
}

const StudentItem = ({ a, onChanged }) => {
  const [subm, setSubm] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [tick, setTick] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000) // refresh mỗi 30s
    return () => clearInterval(id)
  }, [])

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

  const now = dayjs(a.server_now || new Date()).add(tick, 'second')
  const releaseAt = a.release_at ? dayjs(a.release_at) : null
  const due = subm?.personal_due_at ? dayjs(subm.personal_due_at) : (a.due_at ? dayjs(a.due_at) : null)

  let status = 'open'
  if (releaseAt && now.isBefore(releaseAt)) status = 'locked'
  else if (due && now.isAfter(due)) status = 'closed'

  const disabled = status !== 'open'

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>{a.title}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={a.type === 'exam' ? 'Bài thi' : 'Bài tập'} />
            {status === 'locked' && (
              <Chip color="default" size="small" label={`Chưa mở • còn ${fmtRemain(releaseAt, now)}`} />
            )}
            {status === 'open' && due && (
              <Chip color="success" size="small" label={`Đang mở • còn ${fmtRemain(due, now)}`} />
            )}
            {status === 'closed' && (
              <Chip color="error" size="small" label="Đã hết hạn" />
            )}
          </Stack>
          {a.attachment && (
            <Box mt={0.5}>
              <Button size="small" href={a.attachment} startIcon={<DownloadIcon />}>Tải đề</Button>
            </Box>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          {a.type === 'exam' && (!subm || !subm.started_at) && (
            <Button size="small" variant="outlined" startIcon={<StartIcon />} onClick={start} disabled={disabled}>Bắt đầu</Button>
          )}
          <Button size="small" variant="text" onClick={() => setDetailOpen(true)}>Chi tiết</Button>
          <Button size="small" component="label" variant="contained" disabled={uploading || disabled}>
            Nộp
            <input type="file" hidden onChange={(e) => e.target.files?.[0] && submit(e.target.files[0])} />
          </Button>
        </Stack>
      </Stack>
      {uploading && <LinearProgress sx={{ mt: 1 }} />}
      {subm && (subm.grade !== null && subm.grade !== undefined) && (
        <Typography variant="caption" color={'text.secondary'} display="block" sx={{ mt: 0.5 }}>
          Điểm: {subm.grade}/10 {subm.feedback ? `• Nhận xét: ${subm.feedback}` : ''}
        </Typography>
      )}

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
    </Paper>
  )
}

const AssignmentsInline = ({ classId, isTeacher }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const res = await assignmentService.list({ class_id: classId, page_size: 5 })
      const data = res.data?.results || res.data || []
      setItems(data)
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { if (classId) load() }, [classId])

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={600}>Bài tập/Thi</Typography>
        <Stack direction="row" spacing={1}>
          {isTeacher && (
            <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/classes/${classId}/assignments`)}>
              Tạo bài
            </Button>
          )}
          <Button size="small" variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => navigate(`/classes/${classId}/assignments`)}>
            Xem tất cả
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ p: 2 }}><LinearProgress /></Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Chưa có bài tập/thi.</Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {items.map((a) => (
            isTeacher ? (
              <Paper key={a.id} sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{a.title}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip size="small" label={a.type === 'exam' ? 'Bài thi' : 'Bài tập'} />
                      {a.release_at && <Chip size="small" label={`Mở: ${dayjs(a.release_at).format('DD/MM HH:mm')}`} />}
                      {a.due_at && <Chip size="small" label={`Hạn: ${dayjs(a.due_at).format('DD/MM HH:mm')}`} />}
                    </Stack>
                  </Box>
                  <Button size="small" variant="text" onClick={() => navigate(`/classes/${classId}/assignments`)}>Quản lý</Button>
                </Stack>
              </Paper>
            ) : (
              <StudentItem key={a.id} a={a} onChanged={load} />
            )
          ))}
        </Stack>
      )}
    </Box>
  )
}

export default AssignmentsInline