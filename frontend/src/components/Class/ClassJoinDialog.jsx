import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  Paper
} from '@mui/material'
import {
  QrCode as QrCodeIcon,
  Input as InputIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material'

const ClassJoinDialog = ({ open, onClose, onJoin }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [classCode, setClassCode] = useState('')
  const [classLink, setClassLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    setError('')
    setSuccess('')
  }

  const handleJoinByCode = async () => {
    if (!classCode.trim()) {
      setError('Vui lòng nhập mã lớp học')
      return
    }

    // Validate 12-digit binary code
    if (!/^[01]{12}$/.test(classCode)) {
      setError('Mã lớp học phải là 12 số nhị phân (chỉ chứa 0 và 1)')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock validation
      const mockClassData = {
        name: 'Lập trình Web',
        code: classCode,
        teacher: 'ThS. Nguyễn Văn Minh',
        description: 'Học về HTML, CSS, JavaScript và React'
      }
      
      setSuccess('Tham gia lớp học thành công!')
      setTimeout(() => {
        onJoin(mockClassData)
        handleClose()
      }, 1000)
      
    } catch (err) {
      setError('Không thể tham gia lớp học. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinByLink = async () => {
    if (!classLink.trim()) {
      setError('Vui lòng nhập link lớp học')
      return
    }

    // Validate URL
    try {
      new URL(classLink)
    } catch {
      setError('Link không hợp lệ')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock validation
      const mockClassData = {
        name: 'Cơ sở dữ liệu',
        code: '101010101010',
        teacher: 'TS. Lê Thị Hoa',
        description: 'Học về SQL, MySQL, MongoDB'
      }
      
      setSuccess('Tham gia lớp học thành công!')
      setTimeout(() => {
        onJoin(mockClassData)
        handleClose()
      }, 1000)
      
    } catch (err) {
      setError('Không thể tham gia lớp học. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQRScan = () => {
    // Mock QR scan - in real app, this would open camera
    setError('')
    setSuccess('')
    
    // Simulate QR scan result
    const mockQRCode = '110101101010' // 12-digit binary
    setClassCode(mockQRCode)
    setActiveTab(1) // Switch to code input tab
    setSuccess('Đã quét QR code thành công!')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(classCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setActiveTab(0)
    setClassCode('')
    setClassLink('')
    setError('')
    setSuccess('')
    setCopied(false)
    onClose()
  }

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  )

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Tham gia lớp học
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab 
              label="Quét QR" 
              icon={<QrCodeIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Nhập mã" 
              icon={<InputIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Dán link" 
              icon={<LinkIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* QR Scan Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box textAlign="center">
            <Paper 
              sx={{ 
                p: 4, 
                mb: 3, 
                bgcolor: 'grey.50',
                border: '2px dashed',
                borderColor: 'grey.300'
              }}
            >
              <CameraIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Quét mã QR để tham gia lớp học
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Đặt camera trước mã QR của lớp học để tự động tham gia
              </Typography>
              <Button
                variant="contained"
                startIcon={<QrCodeIcon />}
                onClick={handleQRScan}
                size="large"
                sx={{ borderRadius: 2 }}
              >
                Demo QR Scan
              </Button>
            </Paper>
            
            <Alert severity="info" sx={{ textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> Giảng viên sẽ cung cấp mã QR cho lớp học. 
                Bạn chỉ cần quét mã này để tự động tham gia lớp.
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        {/* Code Input Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Nhập mã lớp học
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Nhập mã 12 số nhị phân của lớp học (chỉ chứa 0 và 1)
            </Typography>
            
            <TextField
              fullWidth
              label="Mã lớp học"
              placeholder="Ví dụ: 110101101010"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              InputProps={{
                endAdornment: classCode && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopyCode} size="small">
                      {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Mã lớp học phải là 12 số nhị phân (0 và 1)"
              sx={{ mb: 3 }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleJoinByCode}
                disabled={isLoading || !classCode.trim()}
                startIcon={isLoading ? <CircularProgress size={20} /> : <CheckIcon />}
                sx={{ flexGrow: 1 }}
              >
                {isLoading ? 'Đang tham gia...' : 'Tham gia lớp học'}
              </Button>
            </Stack>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Ví dụ mã lớp học:</strong> 110101101010, 101010101010, 111100001111
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        {/* Link Input Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Dán link lớp học
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Dán link lớp học mà giảng viên đã chia sẻ
            </Typography>
            
            <TextField
              fullWidth
              label="Link lớp học"
              placeholder="https://eduattend.com/class/join/..."
              value={classLink}
              onChange={(e) => setClassLink(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleJoinByLink}
                disabled={isLoading || !classLink.trim()}
                startIcon={isLoading ? <CircularProgress size={20} /> : <CheckIcon />}
                sx={{ flexGrow: 1 }}
              >
                {isLoading ? 'Đang tham gia...' : 'Tham gia lớp học'}
              </Button>
            </Stack>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Lưu ý:</strong> Link lớp học sẽ được giảng viên gửi qua email hoặc tin nhắn
              </Typography>
            </Alert>
          </Box>
        </TabPanel>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} variant="outlined">
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ClassJoinDialog
