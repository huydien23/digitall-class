import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  QrCode as QrCodeIcon,
  CameraAlt as CameraIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import QRCodeScanner from './QRCodeScanner'

const QRCodeDemo = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isScanning, setIsScanning] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)

  // Auto-start scanning animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleStartScanning = () => {
    setScannerOpen(true)
  }

  const handleScanSuccess = (data) => {
    console.log('QR Code scanned:', data)
    setScannerOpen(false)
    // Show success message or handle the scanned data
  }

  return (
    <>
      <Paper
        elevation={8}
        sx={{
          position: 'relative',
          width: { xs: 280, md: 320 },
          height: { xs: 280, md: 320 },
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '3px solid',
          borderColor: 'primary.main',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* QR Code Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(90deg, transparent 0%, transparent 20%, #000 20%, #000 30%, transparent 30%, transparent 70%, #000 70%, #000 80%, transparent 80%),
              linear-gradient(0deg, transparent 0%, transparent 20%, #000 20%, #000 30%, transparent 30%, transparent 70%, #000 70%, #000 80%, transparent 80%),
              radial-gradient(circle at 20% 20%, #000 0%, #000 15%, transparent 15%),
              radial-gradient(circle at 80% 20%, #000 0%, #000 15%, transparent 15%),
              radial-gradient(circle at 20% 80%, #000 0%, #000 15%, transparent 15%),
              radial-gradient(circle at 80% 80%, #000 0%, #000 15%, transparent 15%)
            `,
            opacity: 0.8,
          }}
        />

        {/* Scanning Line Animation */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '20%',
                  left: '10%',
                  right: '10%',
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #00ff00, transparent)',
                  borderRadius: 2,
                  boxShadow: '0 0 10px #00ff00',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanning Line Movement */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: 200 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '20%',
                  left: '10%',
                  right: '10%',
                  height: 2,
                  background: 'linear-gradient(90deg, transparent, #00ff00, transparent)',
                  borderRadius: 1,
                  boxShadow: '0 0 8px #00ff00',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner Indicators */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 40,
            height: 40,
            border: '3px solid',
            borderColor: 'primary.main',
            borderRight: 'none',
            borderBottom: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            border: '3px solid',
            borderColor: 'primary.main',
            borderLeft: 'none',
            borderBottom: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            width: 40,
            height: 40,
            border: '3px solid',
            borderColor: 'primary.main',
            borderRight: 'none',
            borderTop: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 40,
            height: 40,
            border: '3px solid',
            borderColor: 'primary.main',
            borderLeft: 'none',
            borderTop: 'none',
          }}
        />

        {/* Center Icon */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <QrCodeIcon
            sx={{
              fontSize: { xs: 40, md: 48 },
              color: 'primary.main',
              opacity: 0.7,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textAlign: 'center',
              px: 2,
            }}
          >
            {isScanning ? 'Đang quét...' : 'QR Code'}
          </Typography>
        </Box>

        {/* Action Button */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<CameraIcon />}
            onClick={handleStartScanning}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Thử ngay
          </Button>
        </Box>

        {/* Pulse Animation */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '80%',
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              opacity: 0.3,
            }}
          />
        </motion.div>
      </Paper>

      {/* QR Scanner Dialog */}
      <QRCodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onScanError={(error) => {
          console.error('QR Scan error:', error)
          setScannerOpen(false)
        }}
      />
    </>
  )
}

export default QRCodeDemo
