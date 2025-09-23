import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material'
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as FileIcon,
} from '@mui/icons-material'
import studentService from '../../services/studentService'

const ExcelDragDrop = ({ 
  open, 
  onClose, 
  onImportSuccess 
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [errors, setErrors] = useState([])
  const [importing, setImporting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          droppedFile.type === 'application/vnd.ms-excel' ||
          droppedFile.name.endsWith('.xlsx') ||
          droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile)
        parseExcelFile(droppedFile)
      } else {
        setErrors([{
          row: 0,
          error: 'Chỉ chấp nhận file Excel (.xlsx, .xls)',
          data: droppedFile.name
        }])
      }
    }
  }, [])

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      parseExcelFile(selectedFile)
    }
  }

  const parseExcelFile = async (file) => {
    try {
      setImporting(true)
      setUploadProgress(10)
      
      setUploadProgress(30)
      
      const response = await studentService.importStudents(file)
      
      setUploadProgress(70)
      
      const result = response.data
      
      setUploadProgress(100)
      
      if (result.success || result.created_students?.length > 0) {
        console.log('Excel parse result:', result)
        console.log('Created students:', result.created_students)
        setParsedData(result.created_students || [])
        setErrors(result.errors || [])
        setPreviewMode(true)
      } else {
        // Show errors even if success=false but we have parsed data
        if (result.errors && result.errors.length > 0) {
          setParsedData([])
          setErrors(result.errors)
          setPreviewMode(true)
        } else {
          setErrors([{
            row: 0,
            error: result.error || 'Lỗi parse file Excel',
            data: file.name
          }])
        }
      }
    } catch (error) {
      console.error('Excel import error:', error)
      setErrors([{
        row: 0,
        error: error.response?.data?.message || 'Lỗi kết nối: ' + error.message,
        data: file.name
      }])
    } finally {
      setImporting(false)
      setUploadProgress(0)
    }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return

    setImporting(true)
    try {
      // Since the data is already imported during parseExcelFile, 
      // we just need to notify success
      onImportSuccess?.({
        success: true,
        created_count: parsedData.length,
        created_students: parsedData
      })
      handleClose()
    } catch (error) {
      setErrors([{
        row: 0,
        error: error.response?.data?.message || 'Lỗi kết nối: ' + error.message,
        data: ''
      }])
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setParsedData([])
    setErrors([])
    setImporting(false)
    setPreviewMode(false)
    setUploadProgress(0)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <UploadIcon />
            <Typography variant="h6">Import Excel Sinh Viên</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {!previewMode ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Hướng dẫn:</strong> Kéo thả file Excel vào vùng bên dưới hoặc click để chọn file.
                <br />
                <strong>Format Excel:</strong> Dòng 1: Tiêu đề, Dòng 2: Header, Dòng 3+: Dữ liệu
                <br />
                <strong>Columns:</strong> mã_sinh_viên, họ_đệm, tên, giới_tính, ngày_sinh
              </Typography>
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
                backgroundColor: dragActive ? '#f5f5f5' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                  borderColor: '#1976d2'
                }
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              
              {file ? (
                <Box>
                  <FileIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    File đã chọn: {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  {importing && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        Đang xử lý file... {uploadProgress}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  <UploadIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Kéo thả file Excel vào đây
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    hoặc click để chọn file
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Chấp nhận: .xlsx, .xls
                  </Typography>
                </Box>
              )}
            </Paper>

            {errors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Lỗi xử lý file:
                </Typography>
                <List dense>
                  {errors.slice(0, 3).map((error, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={error.error}
                        secondary={error.data}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}
          </Box>
        ) : (
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h6">
                Kết quả import ({parsedData.length} sinh viên)
              </Typography>
              <Chip 
                label={errors.length > 0 ? `${errors.length} lỗi` : 'Không có lỗi'} 
                color={errors.length > 0 ? 'error' : 'success'} 
              />
              {parsedData.length > 0 && (
                <Chip 
                  label={`${parsedData.length} thành công`} 
                  color="success" 
                  variant="outlined"
                />
              )}
            </Box>

            {errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Các dòng có lỗi:
                </Typography>
                <List dense>
                  {errors.slice(0, 5).map((error, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={`Dòng ${error.row}: ${typeof error.error === 'object' ? JSON.stringify(error.error) : (error.error || 'Lỗi không xác định')}`}
                        secondary={typeof error.data === 'object' ? JSON.stringify(error.data) : error.data}
                      />
                    </ListItem>
                  ))}
                  {errors.length > 5 && (
                    <ListItem>
                      <ListItemText primary={`... và ${errors.length - 5} lỗi khác`} />
                    </ListItem>
                  )}
                </List>
              </Alert>
            )}

            {parsedData && Array.isArray(parsedData) && parsedData.length > 0 && (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã SV</TableCell>
                      <TableCell>Tên</TableCell>
                      <TableCell>Họ</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Giới tính</TableCell>
                      <TableCell>Ngày sinh</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData.slice(0, 10).map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{student?.student_id || ''}</TableCell>
                        <TableCell>{student?.first_name || ''}</TableCell>
                        <TableCell>{student?.last_name || ''}</TableCell>
                        <TableCell>{student?.email || ''}</TableCell>
                        <TableCell>{student?.gender || ''}</TableCell>
                        <TableCell>{student?.date_of_birth || ''}</TableCell>
                      </TableRow>
                    ))}
                    {parsedData.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary">
                            ... và {parsedData.length - 10} sinh viên khác
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="outlined"
                onClick={() => setPreviewMode(false)}
              >
                Chọn file khác
              </Button>
              <Button
                variant="contained"
                onClick={handleImport}
                disabled={parsedData.length === 0 || importing}
                startIcon={importing ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              >
                {importing ? 'Đang import...' : `Import ${parsedData.length} sinh viên`}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExcelDragDrop
