import React, { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material'
import { QrCode2 as QrCode2Icon, Refresh as RefreshIcon, ContentCopy as CopyIcon, Close as CloseIcon } from '@mui/icons-material'
import QRCode from 'qrcode'
import classService from '../../services/classService'

/**
 * Dialog: Generate Join Token (QR/Link) for a class
 */
const ClassJoinTokenDialog = ({ open, onClose, classOptions = [], defaultClassId = null }) => {
  const [classId, setClassId] = useState(defaultClassId || classOptions?.[0]?.id || '')
  const [expires, setExpires] = useState(60) // minutes
  const [maxUses, setMaxUses] = useState(0) // 0 = unlimited
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tokenData, setTokenData] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setError('')
      if (!classId && classOptions?.length) setClassId(classOptions[0].id)
    }
  }, [open, classOptions, classId])

  const joinLink = useMemo(() => {
    if (!tokenData?.token) return ''
    return `/api/classes/join/?token=${tokenData.token}`
  }, [tokenData])

  const generateQR = async (text) => {
    try {
      const url = await QRCode.toDataURL(text, { width: 260 })
      setQrUrl(url)
    } catch (e) {
      setQrUrl('')
    }
  }

  const handleGenerate = async () => {
    if (!classId) {
      setError('Vui lòng chọn lớp')
      return
    }
    setLoading(true)
    setError('')
    setTokenData(null)
    setQrUrl('')
    try {
      const res = await classService.createJoinToken(classId, {
        expires_in_minutes: Number(expires) || 0,
        max_uses: Number(maxUses) || 0,
      })
      const data = res.data
      setTokenData(data)
      if (data?.join_link) {
        generateQR(data.join_link)
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Không thể tạo mã tham gia')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const resetForm = () => {
    setExpires(60)
    setMaxUses(0)
    setTokenData(null)
    setQrUrl('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose?.()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            Tạo mã tham gia lớp
          </Typography>
          <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {classOptions?.length === 0 ? (
          <Alert severity="warning">
            Bạn chưa có lớp nào. Hãy tạo lớp trước khi tạo mã tham gia.
          </Alert>
        ) : (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Lớp học</InputLabel>
              <Select value={classId} label="Lớp học" onChange={(e) => setClassId(e.target.value)}>
                {classOptions.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.class_name || c.class_name === '' ? c.class_name : (c.name || `Lớp #${c.id}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="number"
                label="Hết hạn (phút)"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                fullWidth
              />
              <TextField
                type="number"
                label="Giới hạn lượt (0 = không giới hạn)"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                fullWidth
              />
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            {tokenData ? (
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Chip label="Đã tạo" color="success" />
                  <Tooltip title="Tạo lại">
                    <IconButton size="small" onClick={handleGenerate} disabled={loading}><RefreshIcon /></IconButton>
                  </Tooltip>
                </Stack>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mã tham gia (token):
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <Typography sx={{ fontFamily: 'monospace' }}>{tokenData.token}</Typography>
                  <Tooltip title={copied ? 'Đã copy' : 'Copy token'}>
                    <IconButton size="small" onClick={() => handleCopy(tokenData.token)}><CopyIcon /></IconButton>
                  </Tooltip>
                </Stack>

                {joinLink && (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>Link tham gia:</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <Typography sx={{ wordBreak: 'break-all' }}>{joinLink}</Typography>
                      <Tooltip title={copied ? 'Đã copy' : 'Copy link'}>
                        <IconButton size="small" onClick={() => handleCopy(joinLink)}><CopyIcon /></IconButton>
                      </Tooltip>
                    </Stack>
                  </>
                )}

                {qrUrl && (
                  <Box textAlign="center">
                    <img src={qrUrl} alt="Join QR" style={{ width: 260, height: 260 }} />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Quét QR để tham gia lớp
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : null}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Đóng</Button>
        <Button variant="contained" startIcon={<QrCode2Icon />} onClick={handleGenerate} disabled={loading || !classId}>
          {loading ? 'Đang tạo...' : 'Tạo mã tham gia'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ClassJoinTokenDialog
