import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Tabs, Tab, TextField, Alert, CircularProgress,
  Paper, Typography, IconButton
} from '@mui/material'
import { 
  Check as CheckIcon, 
  QrCode as QrIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import QrScanner from 'qr-scanner'
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
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef(null)
  const qrScannerRef = useRef(null)

  // Cleanup scanner when dialog closes or tab changes
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  useEffect(() => {
    if (tab === 0 && open) {
      // Start scanner when QR tab is selected
      setTimeout(() => startScanner(), 100)
    } else {
      // Stop scanner when switching tabs or closing
      stopScanner()
    }
  }, [tab, open])

  const startScanner = async () => {
    if (!videoRef.current || isScanning) return
    
    try {
      setError('')
      setIsScanning(true)
      
      // Check camera availability
      const hasCamera = await QrScanner.hasCamera()
      if (!hasCamera) {
        throw new Error('Không tìm thấy camera trên thiết bị')
      }

      // Create and start scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanSuccess(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      )

      await qrScannerRef.current.start()
    } catch (err) {
      console.error('Scanner error:', err)
      setError(err.message || 'Không thể khởi động camera')
      setIsScanning(false)
    }
  }

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScanSuccess = (data) => {
    console.log('QR Code scanned:', data)
    stopScanner()
    doCheckIn(data)
  }

  const doCheckIn = async (qr) => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await attendanceService.checkInWithQR({ qr_code: qr, student_id: studentCode })
      const data = res?.data || res
      setSuccess(data?.message || 'Điểm danh thành công!')
      setTimeout(() => {
        onSuccess?.(data)
        onClose()
      }, 1500)
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Điểm danh thất bại'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={() => {
        stopScanner()
        onClose()
      }} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: tab === 0 ? '600px' : 'auto' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Điểm danh bằng QR Code</Typography>
          <IconButton 
            onClick={() => {
              stopScanner()
              onClose()
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Quét QR" icon={<QrIcon />} iconPosition="start" />
            <Tab label="Nhập mã" icon={<CheckIcon />} iconPosition="start" />
            <Tab label="Dán link" icon={<CheckIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Đưa camera vào mã QR của lớp học để tự động điểm danh
            </Typography>
            
            <Paper 
              elevation={3}
              sx={{ 
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                mx: 'auto',
                borderRadius: 2,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: isScanning ? 'primary.main' : 'grey.400'
              }}
            >
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  display: 'block',
                  backgroundColor: '#000'
                }}
              />
              
              {!isScanning && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CameraIcon />}
                    onClick={startScanner}
                    sx={{
                      borderRadius: 3,
                      px: 4,
                      py: 1.5
                    }}
                  >
                    Mở Camera
                  </Button>
                  <Typography variant="caption" color="white" sx={{ mt: 2 }}>
                    Nhấn để bắt đầu quét mã QR
                  </Typography>
                </Box>
              )}
              
              {isScanning && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="caption">Đang quét mã QR...</Typography>
                </Box>
              )}
            </Paper>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Hướng dẫn: Giảng viên sẽ cung cấp mã QR cho lớp học. 
                Bạn chỉ cần quét mã này để tự động điểm danh.
              </Typography>
            </Box>
          </Box>
        )}

        {tab === 1 && (
          <Box>
            <TextField
              fullWidth
              label="Mã điểm danh"
              placeholder="Nhập mã điểm danh từ giảng viên"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => doCheckIn(parseCode(code))}
              disabled={loading || !code.trim()}
              startIcon={loading ? <CircularProgress size={18} /> : <CheckIcon />}
            >
              {loading ? 'Đang điểm danh...' : 'Điểm danh'}
            </Button>
          </Box>
        )}

        {tab === 2 && (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Dán link chứa mã QR"
              placeholder="Ví dụ: https://example.com?qr_code=ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
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
        <Button onClick={() => {
          stopScanner()
          onClose()
        }}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default StudentCheckInDialog
