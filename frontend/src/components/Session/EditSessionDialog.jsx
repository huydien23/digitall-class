import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Alert
} from '@mui/material'
import attendanceService from '../../services/attendanceService'

const EditSessionDialog = ({ open, onClose, session, onSaved }) => {
  const [form, setForm] = useState({
    session_name: '',
    description: '',
    session_date: '',
    start_time: '',
    end_time: '',
    location: '',
    session_type: 'lecture',
    group_name: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session && open) {
      setForm({
        session_name: session.session_name || '',
        description: session.description || '',
        session_date: (session.session_date || '').toString().slice(0, 10),
        start_time: (session.start_time || '').toString().slice(0, 5),
        end_time: (session.end_time || '').toString().slice(0, 5),
        location: session.location || '',
        session_type: session.session_type || 'lecture',
        group_name: session.group_name || '',
        is_active: typeof session.is_active === 'boolean' ? session.is_active : true,
      })
      setError('')
    }
  }, [session, open])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!session?.id) return
    try {
      setSaving(true)
      setError('')
      const payload = { ...form }
      // Clean empty strings to avoid overwriting with blanks unintentionally
      Object.keys(payload).forEach(k => {
        if (payload[k] === '') delete payload[k]
      })
      await attendanceService.updateSession(session.id, payload)
      onSaved?.()
      onClose?.()
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Cập nhật buổi học thất bại'
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chỉnh sửa buổi học</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              label="Tên buổi học"
              fullWidth
              value={form.session_name}
              onChange={(e) => handleChange('session_name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Loại buổi học</InputLabel>
              <Select
                label="Loại buổi học"
                value={form.session_type}
                onChange={(e) => handleChange('session_type', e.target.value)}
              >
                <MenuItem value="lecture">Lý thuyết</MenuItem>
                <MenuItem value="practice">Thực hành</MenuItem>
                <MenuItem value="exam">Kiểm tra</MenuItem>
                <MenuItem value="review">Ôn tập</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Ngày học"
              type="date"
              fullWidth
              value={form.session_date}
              onChange={(e) => handleChange('session_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              label="Giờ bắt đầu"
              type="time"
              fullWidth
              value={form.start_time}
              onChange={(e) => handleChange('start_time', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              label="Giờ kết thúc"
              type="time"
              fullWidth
              value={form.end_time}
              onChange={(e) => handleChange('end_time', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Địa điểm"
              fullWidth
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nhóm"
              fullWidth
              value={form.group_name}
              onChange={(e) => handleChange('group_name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" height="100%">
              <FormControlLabel
                control={<Switch checked={!!form.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />}
                label="Buổi học đang hoạt động"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Hủy</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>Lưu</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditSessionDialog
