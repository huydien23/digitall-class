import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Tabs, Tab, TextField, Alert, CircularProgress,
} from '@mui/material'
import { Check as CheckIcon, QrCode as QrIcon } from '@mui/icons-material'
import QRCodeScanner from '../QRCode/QRCodeScanner'
import attendanceService from '../../services/attendanceService'

const parseCode = (raw) => {
  if (!raw) return ''
  try {
    const url = new URL(raw)
    // try common keys
    const keys = ['qr_code', 'qr', 'token']
    for (const k of keys) {
      const v = url.searchParams.get(k)
      if (v) return v
    }
    return raw.trim()
  } catch {
    return raw.trim()
  }
}

const StudentCheckInDialog = ({ open, onClose, studentCode, onSuccess }) => {
  const [tab, setTab] = useState(0)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const doCheckIn = async (qr) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await attendanceService.checkInWithQR({ qr_code: qr, student_id: studentCode })
      const data = res?.data || res
      setSuccess(data?.message || 'Điểm danh thành công!')
      onSuccess?.(data)
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Điểm danh thất bại'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Điểm danh</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Quét QR" icon={<QrIcon />} iconPosition="start" />
            <Tab label="Nhập mã" icon={<CheckIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <QRCodeScanner
            open={true}
            onClose={() => {}}
            onScanSuccess={(qr) => doCheckIn(qr)}
            allowManual={false}
          />
        )}

        {tab === 1 && (
          <Box>
            <TextField
              fullWidth
              label="Mã điểm danh hoặc liên kết"
              placeholder="Dán mã QR hoặc liên kết có tham số qr_code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={() => doCheckIn(parseCode(code))}
              disabled={loading || !code.trim()}
              startIcon={loading ? <CircularProgress size={18} /> : <CheckIcon />}
            >
              {loading ? 'Đang điểm danh...' : 'Điểm danh'}
            </Button>
          </Box>
        )}

        {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}
        {success && <Alert sx={{ mt: 2 }} severity="success">{success}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default StudentCheckInDialog