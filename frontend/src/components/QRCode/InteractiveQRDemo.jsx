import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  QrCodeScanner,
  CheckCircle,
  Timer,
  Smartphone,
  School,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'

const InteractiveQRDemo = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [currentStep, setCurrentStep] = useState(0)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const steps = [
    {
      title: 'Giảng viên tạo QR',
      description: 'Nhấn nút để tạo QR code cho lớp học',
      icon: <School sx={{ fontSize: 32 }} />,
      color: '#6366f1',
    },
    {
      title: 'Sinh viên quét QR',
      description: 'Mở camera điện thoại và quét mã QR',
      icon: <Smartphone sx={{ fontSize: 32 }} />,
      color: '#8b5cf6',
    },
    {
      title: 'Điểm danh tự động',
      description: 'Hệ thống tự động ghi nhận và thông báo',
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: '#10b981',
    },
  ]

  const generateQRCode = async () => {
    setIsGenerating(true)
    try {
      // Generate a real QR code with sample data
      const qrData = JSON.stringify({
        classId: 'CS101',
        className: 'Lập trình Web',
        teacher: 'ThS. Nguyễn Văn Minh',
        timestamp: new Date().toISOString(),
        sessionId: Math.random().toString(36).substr(2, 9),
      })
      
      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrCodeUrl(url)
      setCurrentStep(1)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const simulateScan = () => {
    setCurrentStep(2)
    // Simulate processing time
    setTimeout(() => {
      setCurrentStep(0)
      setQrCodeUrl('')
    }, 3000)
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      {/* Step Indicator */}
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                },
              }}
            >
              {step.title}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Main Demo Card */}
      <Card
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Current Step Display */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 3,
                borderRadius: '50%',
                bgcolor: alpha(steps[currentStep]?.color || '#6366f1', 0.1),
                color: steps[currentStep]?.color || '#6366f1',
                mb: 2,
              }}
            >
              {steps[currentStep]?.icon}
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {steps[currentStep]?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {steps[currentStep]?.description}
            </Typography>
          </Box>

          {/* QR Code Display */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AnimatePresence mode="wait">
              {qrCodeUrl ? (
                <motion.div
                  key="qr-code"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      p: 2,
                      display: 'inline-block',
                      borderRadius: 2,
                      bgcolor: 'white',
                    }}
                  >
                    <img
                      src={qrCodeUrl}
                      alt="QR Code for attendance"
                      style={{
                        width: 200,
                        height: 200,
                        display: 'block',
                      }}
                    />
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Quét mã này để điểm danh
                  </Typography>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      bgcolor: 'grey.50',
                    }}
                  >
                    <QrCodeScanner sx={{ fontSize: 48, color: 'text.disabled' }} />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ textAlign: 'center' }}>
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="generate-btn"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={generateQRCode}
                    disabled={isGenerating}
                    startIcon={isGenerating ? <Timer /> : <QrCodeScanner />}
                    sx={{
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isGenerating ? 'Đang tạo...' : 'Tạo QR Code'}
                  </Button>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="scan-btn"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={simulateScan}
                    startIcon={<Smartphone />}
                    sx={{
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(139, 92, 246, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Quét QR Code
                  </Button>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="success"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" color="#10b981" gutterBottom>
                      Điểm danh thành công!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Sinh viên đã được ghi nhận vào lớp học
                    </Typography>
                    <Chip
                      label="Thời gian: 2.3 giây"
                      size="small"
                      sx={{
                        bgcolor: alpha('#10b981', 0.1),
                        color: '#10b981',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          <strong>Lợi ích:</strong>
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip label="Tiết kiệm 80% thời gian" size="small" color="primary" />
          <Chip label="Không cần gọi tên" size="small" color="secondary" />
          <Chip label="Báo cáo tự động" size="small" color="success" />
        </Box>
      </Box>
    </Box>
  )
}

export default InteractiveQRDemo
