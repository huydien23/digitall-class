import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Stack, Chip, LinearProgress, Alert
} from '@mui/material'
import { ArrowBack as BackIcon, Save as SaveIcon, Download as DownloadIcon } from '@mui/icons-material'
import dayjs from 'dayjs'
import assignmentService from '../../services/assignmentService'

const statusLabelVi = (s) => ({
  draft: 'Đang làm',
  submitted: 'Đã nộp',
  late: 'Nộp trễ',
  graded: 'Đã chấm',
  auto_closed: 'Đã khóa',
}[s] || s || '')

const AssignmentSubmissionsPage = () => {
  const { classId, assignmentId } = useParams()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await assignmentService.listSubmissions(assignmentId)
      const data = res.data || []
      setItems(Array.isArray(data.results) ? data.results : data)
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [assignmentId])

  const handleSave = async (row) => {
    try {
      setSavingId(row.id)
      await assignmentService.gradeSubmission(assignmentId, row.id, { grade: row._grade ?? row.grade, feedback: row._feedback ?? row.feedback })
      await load()
    } catch (e) {
      alert(e?.response?.data?.error || e.message)
    } finally {
      setSavingId(null)
    }
  }

  const onEdit = (id, field, value) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>Quay lại</Button>
          <Typography variant="h5" fontWeight={700}>Bài nộp</Typography>
        </Stack>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box textAlign="center" py={4}><LinearProgress /></Box>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Chưa có bài nộp nào</Typography>
        </Paper>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sinh viên</TableCell>
                <TableCell>Nộp lúc</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell width={120}>Điểm</TableCell>
                <TableCell>Nhận xét</TableCell>
                <TableCell width={120}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{row.student?.first_name} {row.student?.last_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.student?.student_id} • {row.student?.email}</Typography>
                  </TableCell>
                  <TableCell>
                    {row.uploaded_at ? dayjs(row.uploaded_at).format('DD/MM/YYYY HH:mm') : '-'}
                  </TableCell>
                  <TableCell>
                    {row.file ? <Button size="small" href={row.file} startIcon={<DownloadIcon />}>Tải</Button> : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" color={row.status === 'graded' ? 'success' : (row.status === 'submitted' ? 'info' : 'default')} label={statusLabelVi(row.status)} />
                    {row.is_late && <Chip size="small" color="error" label="Trễ" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell>
                    <TextField size="small" type="number" inputProps={{ step: '0.1' }} value={row._grade ?? (row.grade ?? '')} onChange={(e) => onEdit(row.id, '_grade', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" fullWidth value={row._feedback ?? (row.feedback ?? '')} onChange={(e) => onEdit(row.id, '_feedback', e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave(row)} disabled={savingId === row.id}>Lưu</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  )
}

export default AssignmentSubmissionsPage
