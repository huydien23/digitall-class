import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Upload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material'
import * as XLSX from 'xlsx'

const StudentImportDialog = ({ open, onClose, classData, onImportComplete }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [studentData, setStudentData] = useState([])
  const [importResult, setImportResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const steps = ['Chọn file Excel', 'Xem trước dữ liệu', 'Kết quả import']

  const handleReset = () => {
    setActiveStep(0)
    setFile(null)
    setStudentData([])
    setImportResult(null)
    setLoading(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    // Kiểm tra định dạng file
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ]
    
    const fileType = selectedFile.type || selectedFile.name.toLowerCase()
    const isValidType = validTypes.some(type => fileType.includes(type.replace('.', '')))
    
    if (!isValidType) {
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
      return
    }

    setFile(selectedFile)
    parseExcelFile(selectedFile)
  }

  const parseExcelFile = (file) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Chuyển đổi sang JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length < 2) {
          alert('File Excel phải có ít nhất 2 dòng (header và data)')
          return
        }

        // Lấy header và data
        const headers = jsonData[0]
        const rows = jsonData.slice(1)

        // Map dữ liệu với format mong muốn
        const students = rows
          .filter(row => row.some(cell => cell)) // Loại bỏ dòng trống
          .map((row, index) => {
            const student = {}
            headers.forEach((header, headerIndex) => {
              if (header && row[headerIndex]) {
                student[normalizeHeader(header)] = row[headerIndex]
              }
            })
            
            // Validate dữ liệu cơ bản
            student.rowNumber = index + 2 // +2 vì bắt đầu từ dòng 2 trong Excel
            student.isValid = validateStudentData(student)
            student.errors = getValidationErrors(student)
            
            return student
          })

        setStudentData(students)
        setActiveStep(1)
      } catch (error) {
        console.error('Error parsing Excel file:', error)
        alert('Lỗi đọc file Excel. Vui lòng kiểm tra định dạng file.')
      }
    }
    
    reader.readAsArrayBuffer(file)
  }

  const normalizeHeader = (header) => {
    const headerMappings = {
      'mssv': 'student_id',
      'mã sinh viên': 'student_id',
      'student_id': 'student_id',
      'họ': 'first_name',
      'first_name': 'first_name',
      'họ tên': 'full_name',
      'tên': 'last_name',
      'last_name': 'last_name',
      'email': 'email',
      'điện thoại': 'phone',
      'số điện thoại': 'phone',
      'phone': 'phone',
      'giới tính': 'gender',
      'gender': 'gender',
      'ngày sinh': 'date_of_birth',
      'date_of_birth': 'date_of_birth',
      'địa chỉ': 'address',
      'address': 'address'
    }
    
    const normalizedKey = header.toString().toLowerCase().trim()
    return headerMappings[normalizedKey] || normalizedKey
  }

  const validateStudentData = (student) => {
    return !!(student.student_id && student.email && (student.first_name || student.full_name))
  }

  const getValidationErrors = (student) => {
    const errors = []
    
    if (!student.student_id) errors.push('Thiếu MSSV')
    if (!student.email) errors.push('Thiếu email')
    if (!student.first_name && !student.full_name) errors.push('Thiếu họ tên')
    
    // Validate email format
    if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      errors.push('Email không hợp lệ')
    }
    
    return errors
  }

  const handleImport = async () => {
    setLoading(true)
    
    try {
      // Filter valid students
      const validStudents = studentData.filter(s => s.isValid)
      
      // Simulate API call - replace with actual API
      const response = await mockImportAPI(validStudents)
      
      setImportResult(response)
      setActiveStep(2)
      
      if (onImportComplete) {
        onImportComplete(response)
      }
    } catch (error) {
      console.error('Import error:', error)
      setImportResult({
        success: false,
        error: 'Lỗi khi import sinh viên',
        created_count: 0,
        errors: [{ error: error.message }]
      })
      setActiveStep(2)
    } finally {
      setLoading(false)
    }
  }

  const mockImportAPI = async (students) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      success: true,
      created_count: students.length,
      errors: [],
      message: `Đã import thành công ${students.length} sinh viên vào lớp ${classData?.class_name}`
    }
  }

  const downloadTemplate = () => {
    const template = [
      ['MSSV', 'Họ', 'Tên', 'Email', 'Số điện thoại', 'Giới tính', 'Ngày sinh', 'Địa chỉ'],
      ['DH2200001', 'Nguyễn Văn', 'An', 'nguyenvanan@student.edu.vn', '0123456789', 'male', '2002-05-15', 'TP.HCM'],
      ['DH2200002', 'Trần Thị', 'Bình', 'tranthibinh@student.edu.vn', '0987654321', 'female', '2002-08-20', 'TP.HCM'],
      ['DH2200003', 'Lê Hoàng', 'Cường', 'lehoangcuong@student.edu.vn', '0369852147', 'male', '2002-03-10', 'TP.HCM']
    ]
    
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(template)
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sinh viên')
    XLSX.writeFile(wb, 'template_import_sinh_vien.xlsx')
  }

  const validCount = studentData.filter(s => s.isValid).length
  const errorCount = studentData.filter(s => !s.isValid).length

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <UploadIcon color="primary" />
            <Typography variant="h6">
              Import sinh viên từ Excel
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Class Info */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Lớp:</strong> {classData?.class_name} ({classData?.class_id})
          </Typography>
        </Alert>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: File Upload */}
        {activeStep === 0 && (
          <Box>
            {/* Download Template */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">
                1. Tải file mẫu Excel
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
              >
                Tải file mẫu
              </Button>
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Yêu cầu:</strong>
                <br />• File Excel (.xlsx hoặc .xls)
                <br />• Cột bắt buộc: MSSV, Email, Họ tên
                <br />• Dòng đầu tiên là tiêu đề
              </Typography>
            </Alert>

            {/* File Drop Zone */}
            <Paper
              sx={{
                p: 4,
                border: `2px dashed ${dragActive ? '#1976d2' : '#ccc'}`,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: dragActive ? 'action.hover' : 'background.default',
                transition: 'all 0.2s'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {file ? file.name : 'Kéo thả file Excel vào đây'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hoặc click để chọn file
              </Typography>
            </Paper>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files[0])}
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
            />
          </Box>
        )}

        {/* Step 1: Preview Data */}
        {activeStep === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Xem trước dữ liệu ({studentData.length} dòng)
              </Typography>
              <Box display="flex" gap={1}>
                <Chip 
                  label={`${validCount} hợp lệ`} 
                  color="success" 
                  size="small" 
                  icon={<CheckIcon />}
                />
                {errorCount > 0 && (
                  <Chip 
                    label={`${errorCount} lỗi`} 
                    color="error" 
                    size="small" 
                    icon={<ErrorIcon />}
                  />
                )}
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Dòng</TableCell>
                    <TableCell>MSSV</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>SĐT</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentData.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>{student.rowNumber}</TableCell>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>
                        {student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim()}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone || '-'}</TableCell>
                      <TableCell>
                        {student.isValid ? (
                          <Chip label="Hợp lệ" color="success" size="small" />
                        ) : (
                          <Tooltip title={student.errors.join(', ')}>
                            <Chip label="Lỗi" color="error" size="small" />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {errorCount > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Có {errorCount} dòng dữ liệu không hợp lệ sẽ bị bỏ qua khi import.
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Step 2: Import Result */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Kết quả Import
            </Typography>

            {importResult?.success ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  {importResult.message}
                </Typography>
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body1">
                  {importResult?.error || 'Lỗi không xác định'}
                </Typography>
              </Alert>
            )}

            <Box display="flex" gap={2} mt={2}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">
                  {importResult?.created_count || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sinh viên đã thêm
                </Typography>
              </Box>
              
              {importResult?.errors?.length > 0 && (
                <Box textAlign="center">
                  <Typography variant="h4" color="error.main">
                    {importResult.errors.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lỗi
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {loading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose}>Hủy</Button>
            <Button 
              variant="contained" 
              disabled={!file}
              onClick={() => setActiveStep(1)}
            >
              Tiếp tục
            </Button>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={() => setActiveStep(0)}>Quay lại</Button>
            <Button onClick={handleClose}>Hủy</Button>
            <Button 
              variant="contained" 
              disabled={validCount === 0 || loading}
              onClick={handleImport}
            >
              Import {validCount} sinh viên
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <>
            <Button onClick={handleReset}>Import lại</Button>
            <Button variant="contained" onClick={handleClose}>
              Hoàn tất
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default StudentImportDialog