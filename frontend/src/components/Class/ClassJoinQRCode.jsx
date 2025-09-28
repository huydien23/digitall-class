import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Stack,
  Chip,
  Divider,
  Paper
} from '@mui/material'
import {
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import QRCode from 'qrcode'
import classService from '../../services/classService'

const ClassJoinQRCode = ({ open, onClose, classData }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [joinLink, setJoinLink] = useState('')
  const [joinToken, setJoinToken] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const canvasRef = useRef(null)
  const [expires, setExpires] = useState(120) // phút
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (open && classData?.id) {
      generateQRCode()
    }
  }, [open, classData?.id])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      // Gọi backend để tạo token hợp lệ
      const res = await classService.createJoinToken(classData.id, {
        expires_in_minutes: Number(expires) || 0,
        max_uses: 0,
      })
      const token = res?.data?.token
      if (!token) throw new Error('Không lấy được token')
      setJoinToken(token)
      setExpiresAt(res?.data?.expires_at || '')

      // Tạo link tham gia thân thiện cho người dùng (đi qua trang join-class của FE)
      const baseUrl = window.location.origin
      const link = `${baseUrl}/join-class?token=${encodeURIComponent(token)}`
      setJoinLink(link)

      // Tạo QR Code từ link
      const qrDataUrl = await QRCode.toDataURL(link, {
        width: 300,
        height: 300,
        color: {
          dark: '#1976D2',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
      setSnackbar({
        open: true,
        message: 'Lỗi tạo mã QR tham gia lớp',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink)
    setSnackbar({
      open: true,
      message: 'Đã copy link vào clipboard!',
      severity: 'success'
    })
  }

  const handleCopyToken = () => {
    if (!joinToken) return
    navigator.clipboard.writeText(joinToken)
    setSnackbar({ open: true, message: 'Đã copy mã tham gia!', severity: 'success' })
  }

  const handleShareWhatsApp = () => {
    const message = `🎓 Tham gia lớp học: ${classData.class_name}\n\n📚 Mô tả: ${classData.description}\n\n🔗 Link tham gia: ${joinLink}\n\n👨‍🏫 Giảng viên: ${classData.teacher_name}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleShareEmail = () => {
    const subject = `Mời tham gia lớp học: ${classData.class_name}`
    const body = `Xin chào,\n\nBạn được mời tham gia lớp học:\n\n📚 Lớp: ${classData.class_name}\n📝 Mô tả: ${classData.description || ''}\n👨‍🏫 Giảng viên: ${classData.teacher_name || ''}\n\n🔗 Link tham gia: ${joinLink}\n\nHoặc quét mã QR để tham gia nhanh chóng.\n\nTrân trọng!`
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.download = `qr-code-${classData.class_id}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${classData.class_name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .header { margin-bottom: 20px; }
            .qr-container { margin: 20px 0; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${classData.class_name}</h2>
            <p><strong>Mã lớp:</strong> ${classData.class_id}</p>
            <p><strong>Giảng viên:</strong> ${classData.teacher_name || 'Chưa xác định'}</p>
          </div>
          <div class="qr-container">
            <img src="${qrCodeUrl}" alt="QR Code" />
          </div>
          <div class="footer">
            <p>Quét mã QR để tham gia lớp học</p>
            <p>${joinLink}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <QrCodeIcon color="primary" />
              <Typography variant="h6">
                Mã QR tham gia lớp
              </Typography>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Class Info */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {classData?.class_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mã lớp: <strong>{classData?.class_id}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {classData?.description}
            </Typography>
          </Paper>

          {/* Controls: set expiry */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} mb={2}>
            <TextField
              type="number"
              size="small"
              label="Hết hạn (phút)"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              sx={{ width: { xs: '100%', sm: 180 } }}
            />
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={generateQRCode} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo/Đổi mã'}
            </Button>
            {expiresAt && (
              <Chip size="small" label={`Hết hạn: ${new Date(expiresAt).toLocaleString('vi-VN')}`} />
            )}
          </Stack>

          {/* QR Code */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            {qrCodeUrl && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  style={{ display: 'block' }}
                />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Sinh viên có thể quét mã QR này để tham gia lớp
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Join Link */}
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Link tham gia lớp:
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                value={joinLink}
                variant="outlined"
                size="small"
                InputProps={{
                  readOnly: true,
                  sx: { fontSize: '0.875rem' }
                }}
              />
              <Tooltip title="Copy link">
                <IconButton onClick={handleCopyLink} color="primary">
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Join Token */}
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>
              Mã tham gia (token):
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                value={joinToken}
                variant="outlined"
                size="small"
                InputProps={{ readOnly: true, sx: { fontFamily: 'monospace' } }}
              />
              <Tooltip title="Copy token">
                <IconButton onClick={handleCopyToken} color="primary">
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Typography variant="subtitle2" gutterBottom>
            Chia sẻ:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<WhatsAppIcon />}
              onClick={handleShareWhatsApp}
              sx={{ color: '#25D366', borderColor: '#25D366' }}
            >
              WhatsApp
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EmailIcon />}
              onClick={handleShareEmail}
            >
              Email
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadQR}
            >
              Tải QR
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrintQR}
            >
              In
            </Button>
          </Stack>

          {/* Instructions */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Hướng dẫn:</strong>
              <br />• Chia sẻ mã QR hoặc link cho sinh viên
              <br />• Sinh viên quét QR hoặc click link để tham gia
              <br />• Hệ thống sẽ tự động thêm sinh viên vào lớp
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>
            Đóng
          </Button>
          <Button 
            variant="contained" 
            startIcon={<ShareIcon />}
            onClick={handleCopyLink}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ClassJoinQRCode