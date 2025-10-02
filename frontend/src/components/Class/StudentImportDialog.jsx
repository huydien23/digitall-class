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
import studentService from '../../services/studentService'
import classService from '../../services/classService'

const StudentImportDialog = ({ open, onClose, classData, onImportComplete }) => {
  const [activeStep, setActiveStep] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [studentData, setStudentData] = useState([])
  const [importResult, setImportResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fileClassCodes, setFileClassCodes] = useState([])
  const fileInputRef = useRef(null)

  const steps = ['Chọn file Excel', 'Xem trước dữ liệu', 'Kết quả import']

  // Remove Vietnamese diacritics for robust matching
  const strip = (s = '') => s
    .toString()
    // convert non-breaking spaces to normal spaces
    .replace(/\u00A0/g, ' ')
    // remove vietnamese diacritics
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    // collapse multiple spaces
    .replace(/\s+/g, ' ')

  const normalizeHeader = (header) => {
    const h = strip(header)
    const dict = {
      // ignore / order
      'stt': 'ignore',

      // student id
      'mssv': 'student_id',
      'ma sv': 'student_id',
      'ma sinh vien': 'student_id',
      'ma so sinh vien': 'student_id',
      'student id': 'student_id',
      'student_id': 'student_id',

      // names
      'ho': 'last_name',
      'ho dem': 'last_name',
      'ho đem': 'last_name',
      'ho va ten dem': 'last_name',
      'ho va ten lot': 'last_name',
      'ho lot': 'last_name',
      'last_name': 'last_name',
      'lastname': 'last_name',
      'surname': 'last_name',
      'ten': 'first_name',
      'first_name': 'first_name',
      'firstname': 'first_name',
      'given_name': 'first_name',
      'ho ten': 'full_name',
      'ho va ten': 'full_name',
      'full name': 'full_name',
      'fullname': 'full_name',

      // gender
      'gioi tinh': 'gender',
      'gt': 'gender',
      'sex': 'gender',
      'gender': 'gender',

      // dob
      'ngay sinh': 'date_of_birth',
      'ngaysinh': 'date_of_birth',
      'dob': 'date_of_birth',
      'date_of_birth': 'date_of_birth',

      // optional class code in file
      'lop': 'class_code',
      'lop hoc': 'class_code',
      'lophoc': 'class_code',
      'ma lop': 'class_code',
      'class': 'class_code',
    }
    return dict[h] || h
  }

  const normalizeGender = (v = '') => {
    const s = strip(v)
    if (['nam', 'm', 'male'].includes(s)) return 'male'
    if (['nu', 'nữ', 'female', 'f'].includes(s)) return 'female'
    return 'other'
  }

  const excelSerialToISO = (num) => {
    const jsDate = new Date(Math.round((Number(num) - 25569) * 86400 * 1000))
    const y = jsDate.getFullYear()
    const m = String(jsDate.getMonth() + 1).padStart(2, '0')
    const d = String(jsDate.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const normalizeDOB = (v) => {
    if (v == null || v === '') return ''
    if (typeof v === 'number') return excelSerialToISO(v)
    const s = String(v).trim()
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (m) {
      const [, d, mo, y] = m
      return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
    // fallback assume already ISO
    return s
  }

  // Helper: choose provided first/last if available; otherwise split full_name
  const splitName = (student) => {
    const hasDirect = (student.first_name && String(student.first_name).trim()) || (student.last_name && String(student.last_name).trim())
    if (hasDirect) {
      return { first_name: String(student.first_name || '').trim(), last_name: String(student.last_name || '').trim() }
    }
    const full = (student.full_name || '').trim()
    if (!full) return { first_name: '', last_name: '' }
    const parts = full.split(/\s+/)
    if (parts.length === 1) return { first_name: parts[0], last_name: '' }
    const last_name = parts.slice(0, parts.length - 1).join(' ')
    const first_name = parts[parts.length - 1]
    return { first_name, last_name }
  }

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

    // Chấp nhận theo cả MIME type và đuôi file để tránh trường hợp browser trả về application/octet-stream
    const mime = (selectedFile.type || '').toLowerCase()
    const name = (selectedFile.name || '').toLowerCase()
    const isMimeOk =
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mime === 'application/vnd.ms-excel' ||
      mime === 'application/octet-stream' // một số môi trường
    const isExtOk = name.endsWith('.xlsx') || name.endsWith('.xls')

    if (!isMimeOk && !isExtOk) {
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

        // Tìm dòng header thực sự (file trường có thể có nhiều dòng tiêu đề)
        const recognizeSet = new Set(['student_id','first_name','last_name','full_name','gender','date_of_birth','class_code'])
        let bestRow = 0, bestScore = -1
        const maxScan = Math.min(15, jsonData.length)
        for (let i = 0; i < maxScan; i++) {
          const row = jsonData[i] || []
          let score = 0
          row.forEach(cell => {
            const k = normalizeHeader(cell || '')
            if (recognizeSet.has(k)) score += 1
          })
          if (score > bestScore) { bestScore = score; bestRow = i }
        }

        const headers = jsonData[bestRow]
        const rows = jsonData.slice(bestRow + 1)

        // Debug: Log headers to see what we're working with
        console.log('🔍 Excel Headers (raw):', headers)
        console.log('🔍 Excel Headers (normalized):', headers.map(h => `${h} → ${normalizeHeader(h)}`))

        // Map dữ liệu với format mong muốn
        const classSet = new Set()
        const students = rows
          .filter(row => row.some(cell => cell)) // Loại bỏ dòng trống
          .map((row, index) => {
            const student = {}
            headers.forEach((header, headerIndex) => {
              const key = normalizeHeader(header)
              const cell = row[headerIndex]
              if (!key || key === 'ignore') return
              if (key === 'gender') {
                student.gender = normalizeGender(cell)
              } else if (key === 'date_of_birth') {
                student.date_of_birth = normalizeDOB(cell)
              } else if (key === 'class_code') {
                const code = String(cell || '').trim()
                if (code) {
                  student.class_code = code
                  classSet.add(code)
                }
              } else if (cell !== undefined && cell !== null && String(cell).trim() !== '') {
                student[key] = cell
              }
            })
            
            // Validate dữ liệu cơ bản
            student.rowNumber = index + 2 // +2 vì bắt đầu từ dòng 2 trong Excel
            student.isValid = validateStudentData(student)
            student.errors = getValidationErrors(student)
            
            return student
          })

        // Debug: Log first few students to check parsing
        console.log('👨‍🎓 First 3 parsed students:', students.slice(0, 3))

        setStudentData(students)
        setFileClassCodes(Array.from(classSet))
        setActiveStep(1)
      } catch (error) {
        console.error('Error parsing Excel file:', error)
        alert('Lỗi đọc file Excel. Vui lòng kiểm tra định dạng file.')
      }
    }
    
    reader.readAsArrayBuffer(file)
  }


  const validateStudentData = (student) => {
    // Email không bắt buộc ở FE
    return !!(student.student_id && (student.first_name || student.full_name || student.last_name))
  }

  const getValidationErrors = (student) => {
    const errors = []
    
    if (!student.student_id) errors.push('Thiếu MSSV')
    if (!student.first_name && !student.full_name && !student.last_name) errors.push('Thiếu họ tên')
    
    // Validate email format
    if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      errors.push('Email không hợp lệ')
    }
    
    return errors
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      // Filter valid rows prepared from Excel
      const validStudents = studentData.filter(s => s.isValid)

      // Prepare payload for create/enroll
      const studentsPayload = validStudents.map(s => {
        const { first_name, last_name } = splitName(s)
        const email = s.email || `${String(s.student_id).toLowerCase()}@student.local`
        return {
          student_id: String(s.student_id).trim().toUpperCase(),  // Convert to UPPERCASE for backend validation
          first_name: first_name || '-',
          last_name: last_name || '-',
          email,
          phone: s.phone || '',
          gender: s.gender || 'male',
          date_of_birth: s.date_of_birth || '2000-01-01',
          address: s.address || ''
        }
      })

      // Attempt bulk create (ignore failures, we will fall back per-student)
      try {
        await studentService.bulkCreateStudents(studentsPayload)
      } catch (e) {
        console.warn('bulkCreateStudents failed, will try per-student fallback:', e?.response?.data || e?.message)
      }

      // Enroll: ensure student exists first to avoid 500
      let successCount = 0
      const errors = []

      for (const s of studentsPayload) {
        const code = s.student_id
        try {
          // Step 1: ensure student account exists (create or update)
          try {
            await studentService.createStudent({
              student_id: code,
              first_name: s.first_name,
              last_name: s.last_name,
              email: s.email,
              phone: s.phone,
              gender: s.gender,
              date_of_birth: s.date_of_birth,
              address: s.address,
              is_active: true,
            })
          } catch (createErr) {
            // If already exists (409 or 400), ignore and proceed to enroll
            if (![400, 409].includes(createErr?.response?.status)) {
              throw createErr
            }
          }

          // Step 2: enroll into class
          await classService.addStudentToClass(classData.id, code)
          successCount += 1
        } catch (err) {
          const detail = err?.response?.data?.error || err?.message || 'Không rõ lỗi'
          errors.push({ student_id: code, error: detail })
        }
      }

      const response = {
        success: successCount > 0 && errors.length === 0,
        created_count: successCount,
        errors,
        message: errors.length === 0
          ? `Đã thêm ${successCount}/${studentsPayload.length} sinh viên vào lớp ${classData?.class_name}`
          : `Đã thêm ${successCount}/${studentsPayload.length}; ${errors.length} lỗi (có thể do sinh viên chưa tồn tại hoặc API lớp trả về 500).`
      }

      setImportResult(response)
      setActiveStep(2)
      onImportComplete?.(response)
    } catch (error) {
      console.error('Import error:', error)
      setImportResult({
        success: false,
        error: error?.response?.data?.error || error.message || 'Lỗi khi import sinh viên',
        created_count: 0,
        errors: [{ error: error.message }]
      })
      setActiveStep(2)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [
      ['STT', 'Mã sinh viên', 'Họ đệm', 'Tên', 'Giới tính', 'Ngày sinh', 'Lớp học'],
      [1, '221222', 'Lê Văn', 'Nhựt Anh', 'Nam', '30/10/2004', 'DH22TIN06'],
      [2, '222803', 'Trần Nguyễn Phương', 'Anh', 'Nữ', '07/11/2004', 'DH22TIN06']
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
                <br />• Cột bắt buộc: MSSV, Họ tên (Email không bắt buộc)
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

            {/* Optional class check from file */}
            {fileClassCodes.length > 0 && (
              <Alert severity={(fileClassCodes.includes(classData?.class_id) || fileClassCodes.includes(classData?.class_name)) ? 'info' : 'warning'} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Lớp trong file: <strong>{fileClassCodes.join(', ')}</strong>. Lớp đang import: <strong>{classData?.class_name} ({classData?.class_id})</strong>.
                  {!(fileClassCodes.includes(classData?.class_id) || fileClassCodes.includes(classData?.class_name)) && ' Không khớp — vẫn cho phép import, chỉ cảnh báo để bạn kiểm tra đúng file.'}
                </Typography>
              </Alert>
            )}

            <TableContainer component={Paper} sx={{ maxHeight: 420 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Mã sinh viên</TableCell>
                    <TableCell>Họ đệm</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Giới tính</TableCell>
                    <TableCell>Ngày sinh</TableCell>
                    <TableCell>Lớp học</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentData.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.last_name || ''}</TableCell>
                      <TableCell>{student.first_name || ''}</TableCell>
                      <TableCell>{student.gender || '-'}</TableCell>
                      <TableCell>{student.date_of_birth || '-'}</TableCell>
                      <TableCell>{student.class_code || '-'}</TableCell>
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