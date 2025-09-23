import React, { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  Divider
} from '@mui/material'
import {
  QrCode as QrCodeIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import QrScanner from 'qr-scanner'

const QRCodeScanner = ({ open, onClose, onScanSuccess, onScanError }) => {
  const videoRef = useRef(null)
  const qrScannerRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [scannedData, setScannedData] = useState(null)

  useEffect(() => {
    if (open && videoRef.current) {
      startScanner()
    } else {
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [open])

  const startScanner = async () => {
    try {
      setError(null)
      setIsScanning(true)
      
      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera()
      if (!hasCamera) {
        throw new Error('Không tìm thấy camera trên thiết bị')
      }

      // Create QR scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanSuccess(result.data)
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment' // Use back camera on mobile
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
    setScannedData(data)
    setSuccess(true)
    setIsScanning(false)
    
    // Stop scanner
    stopScanner()
    
    // Call success callback
    if (onScanSuccess) {
      onScanSuccess(data)
    }
  }

  const handleClose = () => {
    stopScanner()
    setError(null)
    setSuccess(false)
    setScannedData(null)
    onClose()
  }

  const handleRetry = () => {
    setError(null)
    setSuccess(false)
    setScannedData(null)
    startScanner()
  }

  const handleManualInput = () => {
    const manualCode = prompt('Nhập mã QR thủ công:')
    if (manualCode && manualCode.trim()) {
      handleScanSuccess(manualCode.trim())
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <QrCodeIcon />
            <Typography variant="h6">Điểm danh bằng QR Code</Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box textAlign="center">
          {error ? (
            <Box>
              <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button 
                variant="contained" 
                onClick={handleRetry}
                startIcon={<CameraIcon />}
              >
                Thử lại
              </Button>
            </Box>
          ) : success ? (
            <Box>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Alert severity="success" sx={{ mb: 2 }}>
                Quét QR Code thành công!
              </Alert>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Mã QR: <strong>{scannedData}</strong>
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" gutterBottom>
                Đưa camera vào mã QR để điểm danh
              </Typography>
              
              <Box 
                sx={{ 
                  position: 'relative',
                  width: '100%',
                  maxWidth: '400px',
                  mx: 'auto',
                  mt: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              >
                <video
                  ref={videoRef}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover'
                  }}
                />
                
                {isScanning && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
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
                    <CircularProgress size={20} color="inherit" />
                    <Typography variant="body2">Đang quét...</Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Button
                variant="outlined"
                onClick={handleManualInput}
                startIcon={<QrCodeIcon />}
                sx={{ mt: 1 }}
              >
                Nhập mã thủ công
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Đóng
        </Button>
        {success && (
          <Button 
            variant="contained" 
            onClick={handleClose}
            startIcon={<CheckCircleIcon />}
          >
            Hoàn thành
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default QRCodeScanner