import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Alert,
  LinearProgress,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  CircularProgress
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Grade as GradeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
  QrCode as QrCodeIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material'
import { PictureAsPdf as PdfIcon, Description as DocIcon, Slideshow as PptIcon, TableChart as XlsIcon, Archive as ZipIcon, Link as LinkIcon, InsertDriveFile as FileIcon } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import classService from '../../services/classService'
import attendanceService from '../../services/attendanceService'
import gradeService from '../../services/gradeService'
import studentService from '../../services/studentService'
import materialService from '../../services/materialService'
import submissionService from '../../services/submissionService'
import * as XLSX from 'xlsx'
import AttendanceQRGenerator from '../QRCode/AttendanceQRGenerator'
import groupingService from '../../services/groupingService'
import ManualAttendance from '../Attendance/ManualAttendance'
import CreateSession from '../Session/CreateSession'
import StudentForm from '../Form/StudentForm'
// New optimized session creation components
import QuickCreateSession from '../Session/QuickCreateSession'
import BulkCreateSessions from '../Session/BulkCreateSessions'
import SessionManagementDialog from '../Session/SessionManagementDialog'
import EditSessionDialog from '../Session/EditSessionDialog'

const ClassDetailPage = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const isTeacher = (user?.role === 'teacher')
  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [classData, setClassData] = useState(null)
  const [students, setStudents] = useState([])
  const [attendanceSessions, setAttendanceSessions] = useState([])
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [grades, setGrades] = useState([])
  const [componentFilter, setComponentFilter] = useState('all') // all | lecture | practice
  const [gradeTypes, setGradeTypes] = useState(['Điểm thường xuyên (10%)', 'Điểm giữa kỳ (30%)', 'Điểm cuối kỳ (60%)'])
  const [anchorEl, setAnchorEl] = useState(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [qrInitialSessionId, setQrInitialSessionId] = useState(null)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [manualAttendanceOpen, setManualAttendanceOpen] = useState(false)
  const [createSessionOpen, setCreateSessionOpen] = useState(false)
  const [quickCreateSessionOpen, setQuickCreateSessionOpen] = useState(false)
  const [bulkCreateSessionsOpen, setBulkCreateSessionsOpen] = useState(false)
  const [sessionManagementOpen, setSessionManagementOpen] = useState(false)
  const [editSessionOpen, setEditSessionOpen] = useState(false)
  const [sessionBeingEdited, setSessionBeingEdited] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  // Local grade edit state
  const [regularScore, setRegularScore] = useState('')
  const [midtermScore, setMidtermScore] = useState('')
  const [finalScore, setFinalScore] = useState('')
  // Student info edit dialog
  const [studentFormOpen, setStudentFormOpen] = useState(false)
  const [editingStudentDetail, setEditingStudentDetail] = useState(null)
  // Materials
  const [materials, setMaterials] = useState([])
  const [materialsLoading, setMaterialsLoading] = useState(true)
  const [materialsError, setMaterialsError] = useState('')
  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false)

  // Grouping state
  const [groupSets, setGroupSets] = useState([])
  const [selectedGroupSetId, setSelectedGroupSetId] = useState(null)
  const [groups, setGroups] = useState([])
  const [groupingLoading, setGroupingLoading] = useState(false)
  const [groupingError, setGroupingError] = useState('')
  const [groupSizeInput, setGroupSizeInput] = useState(3)
  const [groupSeedInput, setGroupSeedInput] = useState('')
  const [availableStudents, setAvailableStudents] = useState([])
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadLink, setUploadLink] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadSaving, setUploadSaving] = useState(false)
  const [deletingMaterialId, setDeletingMaterialId] = useState(null)

  // Submissions (for teacher view)
  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState('')
  const [deletingSubmissionId, setDeletingSubmissionId] = useState(null)
  const [submissionsFilterStudentId, setSubmissionsFilterStudentId] = useState('')

  // Sessions ascending for attendance table (Buổi 1 -> ...)
  const sessionsAsc = useMemo(() => {
    try {
      const arr = Array.isArray(attendanceSessions) ? [...attendanceSessions] : []
      arr.sort((a, b) => {
        const d1 = new Date(a?.session_date)
        const d2 = new Date(b?.session_date)
        const diff = (d1 - d2)
        if (diff !== 0) return diff
        const t1 = (a?.start_time || '').toString().slice(0, 8)
        const t2 = (b?.start_time || '').toString().slice(0, 8)
        return t1.localeCompare(t2)
      })
      return arr
    } catch {
      return attendanceSessions || []
    }
  }, [attendanceSessions])

  // Mock data for demo
  const mockAttendanceSessions = [
    { id: 1, session_name: 'Buổi 1', session_date: '2024-09-02', start_time: '07:00', end_time: '11:00' },
    { id: 2, session_name: 'Buổi 2', session_date: '2024-09-09', start_time: '07:00', end_time: '11:00' },
    { id: 3, session_name: 'Buổi 3', session_date: '2024-09-16', start_time: '07:00', end_time: '11:00' },
    { id: 4, session_name: 'Buổi 4', session_date: '2024-09-23', start_time: '07:00', end_time: '11:00' },
    { id: 5, session_name: 'Buổi 5', session_date: '2024-09-30', start_time: '07:00', end_time: '11:00' },
    { id: 6, session_name: 'Buổi 6', session_date: '2024-10-07', start_time: '07:00', end_time: '11:00' },
    { id: 7, session_name: 'Buổi 7', session_date: '2024-10-14', start_time: '07:00', end_time: '11:00' },
    { id: 8, session_name: 'Buổi 8', session_date: '2024-10-21', start_time: '07:00', end_time: '11:00' },
  ]

  const mockStudentsWithData = [
    {
      id: 1, student_id: '221222', name: 'Lê Văn Nhựt Anh', email: 'anh.le@student.edu.vn',
      attendance: { 1: true, 2: true, 3: false, 4: true, 5: true, 6: true, 7: false, 8: true },
      grades: { regular: 8.5, midterm: 7.5, final: 8.0 }
    },
    {
      id: 2, student_id: '222803', name: 'Trần Nguyễn Phương Anh', email: 'phuonganh.tran@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: false, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 9.0, midterm: 8.5, final: 8.5 }
    },
    {
      id: 3, student_id: '226969', name: 'Nguyễn Xuân Bách', email: 'bach.nguyen@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: false, 6: true, 7: true, 8: true },
      grades: { regular: 7.5, midterm: 8.0, final: 7.8 }
    },
    {
      id: 4, student_id: '221605', name: 'Huỳnh Thương Bảo', email: 'bao.huynh@student.edu.vn',
      attendance: { 1: false, 2: true, 3: true, 4: true, 5: true, 6: false, 7: true, 8: true },
      grades: { regular: 8.0, midterm: 7.0, final: 7.5 }
    },
    {
      id: 5, student_id: '221330', name: 'Thạch Văn Bảo', email: 'baothach@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: false },
      grades: { regular: 9.5, midterm: 9.0, final: 9.2 }
    },
    {
      id: 6, student_id: '222560', name: 'Nguyễn Tiến Chức', email: 'chuc.nguyen@student.edu.vn',
      attendance: { 1: true, 2: false, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 7.0, midterm: 7.5, final: 7.2 }
    },
    {
      id: 7, student_id: '223463', name: 'Đặng Thiên Chương', email: 'chuong.dang@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: false, 8: true },
      grades: { regular: 8.8, midterm: 8.2, final: 8.5 }
    },
    {
      id: 8, student_id: '220237', name: 'Nguyễn Đặng Hải Đăng', email: 'dang.nguyen@student.edu.vn',
      attendance: { 1: true, 2: true, 3: false, 4: false, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 6.5, midterm: 7.0, final: 6.8 }
    },
    {
      id: 9, student_id: '221761', name: 'Trần Tấn Đạt', email: 'dat.tran@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 7: true, 8: true },
      grades: { regular: 8.2, midterm: 8.5, final: 8.3 }
    },
    {
      id: 10, student_id: '223319', name: 'Nguyễn Thị Ngọc Diễm', email: 'diem.nguyen@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 9.2, midterm: 9.5, final: 9.3 }
    },
    {
      id: 11, student_id: '226514', name: 'Nguyễn Huy Điền', email: 'dien.nguyen@student.edu.vn',
      attendance: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true },
      grades: { regular: 9.8, midterm: 9.5, final: 9.7 }
    },
    {
      id: 12, student_id: '220947', name: 'Trần Huỳnh Đức', email: 'duc.tran@student.edu.vn',
      attendance: { 1: false, 2: true, 3: true, 4: true, 5: false, 6: true, 7: true, 8: true },
      grades: { regular: 7.8, midterm: 8.0, final: 7.9 }
    }
  ]

  const mockClassData = {
    id: 1,
    class_id: '110101101010',
    class_name: 'Lập trình Python - DH22TIN06',
    description: 'Môn học lập trình Python cơ bản cho sinh viên năm 2',
    teacher: 'Đặng Mạnh Huy',
    max_students: 42,
    current_students: 56,
    is_active: true,
    schedule: 'Thứ 2: 07:00-11:00',
    location: 'Phòng 14-02 (Phòng máy 8)',
    subject: 'Lập trình Python',
    semester: 'Học kỳ 1 - 2024'
  }

  useEffect(() => {
    loadClassData()
  }, [classId])

  const loadClassData = async () => {
    try {
      setLoading(true)
      setError(null)
      setMaterialsError('')

      // Try to load real data from API first
      try {
        const response = await classService.getClassDetail(classId)
        const data = response.data
        
        setClassData(data.class || data)
        setStudents(data.students || [])
        
        // Luôn cố gắng tải sessions trực tiếp từ API chuyên trách
        try {
          const sessionsRes = await attendanceService.getSessions({ class_id: classId })
          const sessions = sessionsRes?.data?.results || sessionsRes?.data || data.attendance_sessions || []
          setAttendanceSessions(sessions)
        } catch (e) {
          setAttendanceSessions(data.attendance_sessions || [])
        }
        
      } catch (apiError) {
        console.warn('API call failed, using fallback data:', apiError)
        // Hạn chế mock: chỉ dùng dữ liệu mẫu khi phát triển
        setClassData(mockClassData)
        setStudents(mockStudentsWithData)
        
        try {
          const sessionsRes = await attendanceService.getSessions({ class_id: classId })
          const sessions = sessionsRes?.data?.results || sessionsRes?.data || []
          setAttendanceSessions(sessions)
        } catch (e2) {
          setAttendanceSessions(mockAttendanceSessions)
        }
      }

      // Load materials (view-only for students)
      try {
        const resMat = await materialService.getMaterials({ class_id: classId, page_size: 200 })
        const list = resMat?.data?.results || resMat?.data || []
        setMaterials(list)
      } catch (eMat) {
        setMaterialsError('Không thể tải tài liệu lớp')
      } finally {
        setMaterialsLoading(false)
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load class data')
    } finally {
      setLoading(false)
    }
  }

  const calculateAttendanceRate = (student) => {
    const totalSessions = attendanceSessions.length
    const attendedSessions = Object.values(student.attendance).filter(Boolean).length
    return Math.round((attendedSessions / totalSessions) * 100)
  }

  const calculateFinalGrade = (student) => {
    const { regular, midterm, final } = student.grades
    return (regular * 0.1 + midterm * 0.3 + final * 0.6).toFixed(1)
  }

  const handleExportExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Student list sheet
    const studentData = students.map((student, index) => ({
      'STT': index + 1,
      'Mã SV': student.student_id,
      'Họ tên': student.name,
      'Email': student.email,
      'Tỷ lệ điểm danh': `${calculateAttendanceRate(student)}%`,
      'Điểm thường xuyên': student.grades.regular,
      'Điểm giữa kỳ': student.grades.midterm,
      'Điểm cuối kỳ': student.grades.final,
      'Điểm tổng kết': calculateFinalGrade(student)
    }))
    
    const ws1 = XLSX.utils.json_to_sheet(studentData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Danh sách sinh viên')
    
    // Attendance sheet
    const attendanceData = students.map((student, index) => {
      const row = {
        'STT': index + 1,
        'Mã SV': student.student_id,
        'Họ tên': student.name,
      }
      
      attendanceSessions.forEach(session => {
        row[`${session.session_name} (${session.session_date})`] = student.attendance?.[session.id] ? 'Có mặt' : 'Vắng mặt'
      })
      
      row['Tỷ lệ điểm danh'] = `${calculateAttendanceRate(student)}%`
      return row
    })
    
    const ws2 = XLSX.utils.json_to_sheet(attendanceData)
    XLSX.utils.book_append_sheet(wb, ws2, 'Bảng điểm danh')
    
    // Save file
    const fileName = `${classData.class_name}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  const fetchSubmissions = async (opts = {}) => {
    const { class_id = classId, student_id = submissionsFilterStudentId } = opts
    try {
      setSubmissionsError('')
      setSubmissionsLoading(true)
      const params = { class_id, page_size: 2000 }
      const sid = String(student_id || '').trim()
      if (sid) params.student_id = sid
      const res = await submissionService.getSubmissions(params)
      setSubmissions(res.data?.results || res.data || [])
    } catch (e) {
      setSubmissionsError(e?.response?.data?.error || e?.message || 'Không thể tải bài nộp')
    } finally {
      setSubmissionsLoading(false)
    }
  }

  const handleTabChange = async (event, newValue) => {
    setTabValue(newValue)
    if (newValue === 4) {
      await fetchSubmissions()
    }
    if (newValue === 5) {
      // Load latest groupset
      try {
        setGroupingError('')
        setGroupingLoading(true)
        const latest = await groupingService.listGroupSets({ class_id: classId, latest: 1 })
        const gs = latest.data?.results ? (latest.data.results[0] || null) : latest.data
        if (gs && gs.id) {
          setSelectedGroupSetId(gs.id)
          const detail = await groupingService.getGroups({ groupset_id: gs.id })
          setGroups(detail.data?.groups || [])
          try {
            const as = await groupingService.listAvailableStudents({ groupset_id: gs.id })
            setAvailableStudents(as.data?.results || as.data || [])
          } catch {}
        } else {
          setSelectedGroupSetId(null)
          setGroups([])
        }
        // Also list all for selector
        const listAll = await groupingService.listGroupSets({ class_id: classId })
        setGroupSets(listAll.data?.results || listAll.data || [])
      } catch (e) {
        setGroupingError(e?.response?.data?.error || e?.message || 'Không thể tải nhóm')
      } finally {
        setGroupingLoading(false)
      }
    }
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const getMaterialExt = (m) => {
    try {
      const src = m?.file || m?.file_url || m?.link || m?.title || ''
      const clean = String(src).split('?')[0].split('#')[0]
      const base = clean.split('/').pop()
      const parts = base.split('.')
      if (parts.length > 1) return parts.pop().toUpperCase()
      return m?.link ? 'LINK' : '—'
    } catch {
      return '—'
    }
  }

  const getMaterialIcon = (m) => {
    const ext = String(getMaterialExt(m)).toLowerCase()
    if (ext === 'pdf') return <PdfIcon sx={{ color: 'error.main' }} />
    if (ext === 'doc' || ext === 'docx') return <DocIcon sx={{ color: 'info.main' }} />
    if (ext === 'ppt' || ext === 'pptx') return <PptIcon sx={{ color: 'warning.main' }} />
    if (ext === 'xls' || ext === 'xlsx') return <XlsIcon sx={{ color: 'success.main' }} />
    if (ext === 'zip') return <ZipIcon sx={{ color: 'text.secondary' }} />
    if (ext === 'link') return <LinkIcon sx={{ color: 'primary.main' }} />
    return <FileIcon sx={{ color: 'text.disabled' }} />
  }

  const formatBytes = (bytes) => {
    const n = Number(bytes)
    if (!n || n <= 0) return '—'
    const units = ['B','KB','MB','GB','TB']
    const i = Math.floor(Math.log(n) / Math.log(1024))
    const v = n / Math.pow(1024, i)
    return `${v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2)} ${units[i]}`
  }

  const handleUploadMaterial = async () => {
    try {
      setUploadError('')
      if (!uploadFile && !uploadLink) {
        setUploadError('Vui lòng chọn file hoặc nhập link')
        return
      }
      setUploadSaving(true)
      const fd = new FormData()
      fd.append('class_obj', String(classId))
      fd.append('title', uploadTitle || (uploadFile?.name || 'Tài liệu'))
      if (uploadDescription) fd.append('description', uploadDescription)
      if (uploadFile) fd.append('file', uploadFile)
      if (uploadLink) fd.append('link', uploadLink)

      const res = await materialService.createMaterial(fd)
      const created = res?.data
      if (created?.id) {
        setMaterials(prev => [created, ...prev])
      } else {
        try {
          const resMat = await materialService.getMaterials({ class_id: classId, page_size: 200 })
          const list = resMat?.data?.results || resMat?.data || []
          setMaterials(list)
        } catch {}
      }
      setUploadOpen(false)
      setUploadTitle('')
      setUploadDescription('')
      setUploadFile(null)
      setUploadLink('')
    } catch (e) {
      const detail = e?.response?.data || e?.message || 'Tải tài liệu thất bại'
      setUploadError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setUploadSaving(false)
    }
  }

  const handleDeleteMaterial = async (m) => {
    if (!m?.id) return
    if (!window.confirm(`Xóa tài liệu "${m.title}"?`)) return
    try {
      setDeletingMaterialId(m.id)
      await materialService.deleteMaterial(m.id)
      setMaterials(prev => prev.filter(x => x.id !== m.id))
      alert('Đã xóa tài liệu')
    } catch (e) {
      console.error('Delete material failed', e)
      const detail = e?.response?.data?.error || e?.message || 'Xóa tài liệu thất bại'
      alert(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setDeletingMaterialId(null)
    }
  }

const handleEditGrade = (student) => {
    setSelectedStudent(student)
    // Prime dialog state with current values
    setRegularScore(student?.grades?.regular ?? '')
    setMidtermScore(student?.grades?.midterm ?? '')
    setFinalScore(student?.grades?.final ?? '')
    setGradeDialogOpen(true)
  }

  // Open student edit dialog (fetch full detail first)
  const handleEditStudentInfo = async (student) => {
    try {
      const res = await studentService.getStudent(student.student_id)
      // Map id to student_id so StudentForm (which uses updateStudent(id)) works with backend lookup by student_id
      const detail = res.data
      setEditingStudentDetail({ ...detail, id: detail.student_id })
      setStudentFormOpen(true)
    } catch (e) {
      console.error('Failed to load student detail:', e)
      alert('Không thể tải thông tin sinh viên để chỉnh sửa')
    }
  }

  // Remove student from class
  const handleRemoveStudentFromClass = async (student) => {
    const code = student.student_id
    if (!code) {
      alert('Thiếu mã sinh viên (student_id)')
      return
    }
    if (!window.confirm(`Xóa ${student.name || student.full_name || student.email} khỏi lớp?`)) return
    try {
      await classService.removeStudentFromClass(classId, code)
      setStudents(prev => prev.filter(s => (s.student_id) !== code))
      // optionally update class count
      setClassData(prev => prev ? { ...prev, current_students: Math.max(0, (prev.current_students || 0) - 1) } : prev)
      alert('Đã xóa sinh viên khỏi lớp')
    } catch (e) {
      console.error('Failed to remove student from class:', e)
      const detail = e?.response?.data || e?.message
      alert(`Không thể xóa: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
    }
  }

  const handleDeleteSession = async (sessionId, sessionName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa buổi học "${sessionName}"?\n\nLưu ý: Điều này sẽ xóa tất cả dữ liệu điểm danh của buổi học này!`)) {
      return
    }
    
    try {
      await attendanceService.deleteSession(sessionId)
      
      // Update local state
      setAttendanceSessions(prev => prev.filter(s => s.id !== sessionId))
      
      // Show success message
      alert(`Đã xóa buổi học "${sessionName}" thành công!`)
    } catch (error) {
      console.error('Error deleting session:', error)
      const message = error.response?.data?.error || error.message || 'Không thể xóa buổi học'
      alert(`Lỗi: ${message}`)
    }
  }

  const handleSaveManualAttendance = async (attendanceData) => {
    try {
      const sessionId = attendanceData?.sessionId || attendanceData?.session_id
      if (!sessionId) {
        alert('Vui lòng chọn buổi học trước khi lưu điểm danh')
        return
      }

      // Map attendance state (keyed by frontend student.id) -> backend payloads
      const payloads = []
      const attMap = attendanceData?.attendance || {}
      for (const s of students) {
        const rec = attMap[s.id]
        if (!rec) continue
        payloads.push({
          session_id: Number(sessionId),
          student_id: String(s.student_id),
          status: rec.status || 'absent',
          notes: rec.note || ''
        })
      }

      // Persist all records (idempotent on backend via unique_together)
      const results = await Promise.allSettled(payloads.map(p => attendanceService.createAttendance(p)))
      const failed = results.filter(r => r.status === 'rejected').length

      // Update UI table locally so “Bảng điểm danh theo buổi học” phản ánh ngay
      setStudents(prev => prev.map(s => {
        const rec = attMap[s.id]
        if (!rec) return s
        const presentLike = ['present', 'late', 'excused']
        const isPresent = presentLike.includes(rec.status || 'absent')
        return {
          ...s,
          attendance: {
            ...(s.attendance || {}),
            [sessionId]: isPresent
          }
        }
      }))

      setManualAttendanceOpen(false)
      alert(failed === 0 ? 'Đã lưu điểm danh thủ công thành công!' : `Đã lưu, nhưng ${failed} bản ghi bị lỗi.`)

      // Optionally reload from server to be sure
      try {
        const refreshed = await attendanceService.getSessions({ class_id: classId })
        const sessions = refreshed?.data?.results || refreshed?.data || []
        setAttendanceSessions(sessions)
      } catch {}
    } catch (error) {
      console.error('Error saving manual attendance:', error)
      const detail = error?.response?.data || error?.message
      alert(`Lỗi lưu điểm danh: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
      throw error
    }
  }

  const handleCreateSession = async (formData) => {
    try {
      // Chuẩn hóa payload theo API backend
      const normalizeTime = (t) => {
        if (!t) return null
        // Convert '03:00' or '03:00 SA/CH' to 'HH:mm:00'
        const v = String(t).trim()
        if (/SA|CH|AM|PM/i.test(v)) {
          // Browser localized string -> rely on Date parsing
          const d = new Date(`1970-01-01 ${v.replace('SA','AM').replace('CH','PM')}`)
          const hh = String(d.getHours()).padStart(2,'0')
          const mm = String(d.getMinutes()).padStart(2,'0')
          return `${hh}:${mm}:00`
        }
        // Already HH:mm or HH:mm:ss
        const parts = v.split(':')
        if (parts.length === 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:00`
        if (parts.length === 3) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}:${parts[2].padStart(2,'0')}`
        return v
      }

      const payload = {
        class_id: Number(classId),
        class: Number(classId), // phòng hờ nếu backend dùng khóa ngoại tên "class"
        session_name: formData.session_name,
        session_type: formData.session_type,
        session_date: formData.date, // YYYY-MM-DD
        start_time: normalizeTime(formData.start_time),
        end_time: normalizeTime(formData.end_time),
        location: formData.location,
        description: formData.description,
        allow_early_minutes: Number(formData.allow_early_minutes ?? 0),
        max_late_minutes: Number(formData.max_late_minutes ?? 0),
      }

      let res = await attendanceService.createSession(payload)

      // Thử lại với một số trường thay thế nếu 400/422
      if (res?.status === 400 || res?.status === 422 || res?.data?.errors) {
        const altPayload = {
          ...payload,
          date: payload.session_date,
          start_at: payload.start_time,
          end_at: payload.end_time,
        }
        res = await attendanceService.createSession(altPayload)
      }

      if (res && res.data) {
        // Tải lại danh sách buổi học từ DB
        const refreshed = await attendanceService.getSessions({ class_id: classId })
        const sessions = refreshed?.data?.results || refreshed?.data || []
        setAttendanceSessions(sessions)

        alert(`Tạo buổi học "${payload.session_name}" thành công!`)
        setCreateSessionOpen(false)
      } else {
        throw new Error('Không nhận được phản hồi hợp lệ từ API')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      const detail = error?.response?.data || error?.message
      alert(`Tạo buổi học thất bại: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
      throw error
    }
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Đang tải dữ liệu lớp học...
            </Typography>
          </Box>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IconButton onClick={() => navigate('/classes')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <SchoolIcon />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700}>
              {classData.class_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Mã lớp: {classData.class_id} • {classData.schedule} • {classData.location}
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Box>
              <TextField
                select
                size="small"
                label="Học phần"
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
                sx={{ minWidth: 200, mr: 1 }}
              >
                <MenuItem value="all">Tất cả học phần</MenuItem>
                <MenuItem value="lecture">Lý thuyết</MenuItem>
                <MenuItem value="practice">Thực hành</MenuItem>
              </TextField>
            </Box>
            {user?.role !== 'student' && (
              <>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    endIcon={<MoreVertIcon />}
                    color="success"
                    sx={{
                      background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                      boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)'
                    }}
                  >
                    Tạo buổi học
                  </Button>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  onClick={() => { setQrInitialSessionId(null); setQrDialogOpen(true) }}
                  color="primary"
                >
                  QR Điểm danh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => setManualAttendanceOpen(true)}
                  color="secondary"
                >
                  Điểm danh thủ công
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportExcel}
                  color="info"
                >
                  Xuất Excel
                </Button>
                <IconButton onClick={handleMenuClick}>
                  <MoreVertIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Class Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {classData.current_students}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sinh viên
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <CalendarIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {attendanceSessions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Buổi học
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + calculateAttendanceRate(s), 0) / students.length) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điểm danh TB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <GradeIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                  {(students.length ? (students.reduce((sum, student) => sum + parseFloat(calculateFinalGrade(student)), 0) / students.length) : 0).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Điểm TB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box mt={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Danh sách buổi học
            </Typography>
            {user?.role !== 'student' && (
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setSessionManagementOpen(true)}
                variant="outlined"
              >
                Quản lý buổi học
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          {(() => {
            const filtered = sessionsAsc.filter(s => componentFilter === 'all' || s.session_type === componentFilter)
            if (filtered.length === 0) {
              return (
                <Alert severity="info">Chưa có buổi học nào cho học phần đã chọn.</Alert>
              )
            }
            const fmt = (t) => t ? String(t).slice(0,5) : '-'
            return (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Buổi</TableCell>
                      <TableCell>Ngày</TableCell>
                      <TableCell>Giờ</TableCell>
                      <TableCell>Phòng</TableCell>
                      <TableCell>Học phần</TableCell>
                      <TableCell>Nhóm</TableCell>
                      {user?.role !== 'student' && (
                        <TableCell align="center">Thao tác</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((s, idx) => (
                      <TableRow key={s.id || idx} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {s.session_name}
                            </Typography>
                            {s.description && (
                              <Typography variant="caption" color="text.secondary">
                                {s.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{s.session_date}</TableCell>
                        <TableCell>{fmt(s.start_time)} - {fmt(s.end_time)}</TableCell>
                        <TableCell>{s.location || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={s.session_type === 'practice' ? 'Thực hành' : s.session_type === 'exam' ? 'Kiểm tra' : 'Lý thuyết'}
                            size="small"
                            color={s.session_type === 'practice' ? 'info' : s.session_type === 'exam' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{s.group_name || '-'}</TableCell>
                        {user?.role !== 'student' && (
                          <TableCell align="center">
                            <Box display="flex" gap={0.5} justifyContent="center">
                              <Tooltip title="Tạo QR điểm danh">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => {
                                    // Mở QR cho đúng buổi được chọn
                                    setQrInitialSessionId(s.id)
                                    setQrDialogOpen(true)
                                  }}
                                >
                                  <QrCodeIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Chỉnh sửa buổi học">
                                <IconButton 
                                  size="small" 
                                  color="default"
                                  onClick={() => {
                                    setSessionBeingEdited(s)
                                    setEditSessionOpen(true)
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa buổi học">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteSession(s.id, s.session_name)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          })()}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Danh sách sinh viên" />
          <Tab label="Bảng điểm danh" />
          <Tab label="Bảng điểm số" />
          <Tab label="Tài liệu" />
          <Tab label="Bài nộp" />
          <Tab label="Nhóm" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách sinh viên ({students.length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Mã SV</TableCell>
                      <TableCell>Họ tên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Tỷ lệ điểm danh</TableCell>
                      <TableCell align="center">Điểm TB</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => {
                      const attendanceRate = calculateAttendanceRate(student)
                      const finalGrade = calculateFinalGrade(student)
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                {student.name.split(' ').pop().charAt(0)}
                              </Avatar>
                              {student.name}
                            </Box>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              color={
                                attendanceRate >= 90 ? 'success.main' :
                                attendanceRate >= 80 ? 'warning.main' : 'error.main'
                              }
                              fontWeight={600}
                            >
                              {attendanceRate}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              color={
                                finalGrade >= 8.5 ? 'success.main' :
                                finalGrade >= 7.0 ? 'warning.main' : 'error.main'
                              }
                              fontWeight={600}
                            >
                              {finalGrade}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={
                                attendanceRate >= 90 ? 'Xuất sắc' :
                                attendanceRate >= 80 ? 'Tốt' : 'Cần cải thiện'
                              }
                              color={
                                attendanceRate >= 90 ? 'success' :
                                attendanceRate >= 80 ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                              <Tooltip title="Chỉnh sửa sinh viên">
                                <IconButton size="small" onClick={() => handleEditStudentInfo(student)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa khỏi lớp">
                                <IconButton size="small" color="error" onClick={() => handleRemoveStudentFromClass(student)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bảng điểm danh theo buổi học
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 60, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>STT</TableCell>
                      <TableCell sx={{ minWidth: 100, position: 'sticky', left: 60, bgcolor: 'background.paper', zIndex: 1 }}>Mã SV</TableCell>
                      <TableCell sx={{ minWidth: 200, position: 'sticky', left: 160, bgcolor: 'background.paper', zIndex: 1 }}>Họ tên</TableCell>
                      {sessionsAsc.map(session => (
                        <TableCell key={session.id} align="center" sx={{ minWidth: 120 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {session.session_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {session.session_date}
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ minWidth: 100 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Tỷ lệ
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>{index + 1}</TableCell>
                        <TableCell sx={{ position: 'sticky', left: 60, bgcolor: 'background.paper', zIndex: 1 }}>{student.student_id}</TableCell>
                        <TableCell sx={{ position: 'sticky', left: 160, bgcolor: 'background.paper', zIndex: 1 }}>{student.name}</TableCell>
                        {sessionsAsc.map(session => (
                          <TableCell key={session.id} align="center">
                            {student.attendance[session.id] ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <CancelIcon color="error" />
                            )}
                          </TableCell>
                        ))}
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            color={
                              calculateAttendanceRate(student) >= 90 ? 'success.main' :
                              calculateAttendanceRate(student) >= 80 ? 'warning.main' : 'error.main'
                            }
                            fontWeight={600}
                          >
                            {calculateAttendanceRate(student)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bảng điểm số theo môn học
              </Typography>
              <TableContainer>
                <Table>
<TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Mã SV</TableCell>
                      <TableCell>Họ tên</TableCell>
                      <TableCell align="center">Điểm thường xuyên (10%)</TableCell>
                      <TableCell align="center">Điểm giữa kỳ (30%)</TableCell>
                      {!isTeacher && (
                        <TableCell align="center">Điểm cuối kỳ (60%)</TableCell>
                      )}
                      <TableCell align="center">Điểm tổng kết</TableCell>
                      <TableCell align="center">Xếp loại</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student, index) => {
                      const finalGrade = parseFloat(calculateFinalGrade(student))
                      const classification = 
                        finalGrade >= 9.0 ? 'Xuất sắc' :
                        finalGrade >= 8.0 ? 'Giỏi' :
                        finalGrade >= 7.0 ? 'Khá' :
                        finalGrade >= 5.5 ? 'Trung bình' : 'Yếu'
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600}>
                              {student.grades.regular}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600}>
                              {student.grades.midterm}
                            </Typography>
                          </TableCell>
{!isTeacher && (
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={600}>
                              {student.grades.final}
                            </Typography>
                          </TableCell>
                        )}
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              color={
                                finalGrade >= 8.5 ? 'success.main' :
                                finalGrade >= 7.0 ? 'warning.main' : 'error.main'
                              }
                              fontWeight={600}
                            >
                              {finalGrade}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={classification}
                              color={
                                finalGrade >= 8.5 ? 'success' :
                                finalGrade >= 7.0 ? 'warning' : 'error'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => handleEditGrade(student)}
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Tài liệu lớp học
                </Typography>
                {user?.role !== 'student' && (
                  <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setUploadOpen(true)}>
                    Tải tài liệu
                  </Button>
                )}
              </Box>

              {materialsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}>
                  <CircularProgress />
                </Box>
              ) : materialsError ? (
                <Alert severity="error">{materialsError}</Alert>
              ) : materials.length === 0 ? (
                <Alert severity="info">Chưa có tài liệu nào.</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tiêu đề</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Người đăng</TableCell>
                        <TableCell>Ngày</TableCell>
                        <TableCell>Định dạng</TableCell>
                        <TableCell>Kích thước</TableCell>
                        <TableCell align="right">Tải về</TableCell>
                        {user?.role !== 'student' && (
                          <TableCell align="right">Thao tác</TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {materials.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.title}</TableCell>
                          <TableCell>{m.description || '-'}</TableCell>
                          <TableCell>{m.uploader?.full_name || m.uploader?.email || '—'}</TableCell>
                          <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getMaterialIcon(m)}
                              {getMaterialExt(m)}
                            </Box>
                          </TableCell>
                          <TableCell>{m.file_size ? formatBytes(m.file_size) : '—'}</TableCell>
                          <TableCell align="right">
                            {m.file_url ? (
                              <Button size="small" variant="outlined" href={m.file_url} target="_blank" rel="noopener">
                                Tải xuống
                              </Button>
                            ) : m.link ? (
                              <Button size="small" variant="outlined" href={m.link} target="_blank" rel="noopener">
                                Mở liên kết
                              </Button>
                            ) : (
                              <Typography variant="body2" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          {user?.role !== 'student' && (
                            <TableCell align="right">
                              <IconButton size="small" color="error" onClick={() => handleDeleteMaterial(m)} disabled={deletingMaterialId === m.id}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tabValue === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Bài nộp của sinh viên
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    size="small"
                    label="MSSV"
                    placeholder="VD: 221234"
                    value={submissionsFilterStudentId}
                    onChange={(e) => setSubmissionsFilterStudentId(e.target.value)}
                  />
                  <Button size="small" variant="outlined" onClick={() => fetchSubmissions()}>
                    Lọc
                  </Button>
                  <Button size="small" onClick={() => { setSubmissionsFilterStudentId(''); fetchSubmissions({ student_id: '' }) }}>
                    Xóa lọc
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={() => {
                      try {
                        const rows = (submissions || []).map((s, idx) => {
                          const src = s?.file || s?.file_url || ''
                          let ext = ''
                          try {
                            const clean = String(src).split('?')[0].split('#')[0]
                            const base = clean.split('/').pop()
                            const parts = base.split('.')
                            ext = (parts.length > 1 ? parts.pop() : '')
                          } catch {}
                          const sizeText = s.file_size ? formatBytes(s.file_size) : ''
                          return {
                            STT: idx + 1,
                            MSSV: s.student_info?.student_id || '',
                            'Họ tên': s.student_info?.full_name || '',
                            Email: s.student_info?.email || '',
                            'Tiêu đề': s.title || '',
                            'Ngày nộp': new Date(s.created_at).toLocaleString(),
                            'Định dạng': (ext || '').toUpperCase(),
                            'Kích thước': sizeText,
                          }
                        })
                        const ws = XLSX.utils.json_to_sheet(rows)
                        const wb = XLSX.utils.book_new()
                        XLSX.utils.book_append_sheet(wb, ws, 'Bài nộp')
                        const date = new Date().toISOString().split('T')[0]
                        const className = (classData?.class_name || 'Lop').replace(/[^a-zA-Z0-9-_]/g, '_')
                        XLSX.writeFile(wb, `BaiNop_${className}_${date}.xlsx`)
                      } catch (err) {
                        alert('Xuất Excel thất bại: ' + (err?.message || err))
                      }
                    }}
                  >
                    Xuất Excel
                  </Button>
                </Box>
              </Box>

              {submissionsLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}>
                  <CircularProgress />
                </Box>
              ) : submissionsError ? (
                <Alert severity="error">{submissionsError}</Alert>
              ) : submissions.length === 0 ? (
                <Alert severity="info">Chưa có bài nộp nào.</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>STT</TableCell>
                        <TableCell>Sinh viên</TableCell>
                        <TableCell>MSSV</TableCell>
                        <TableCell>Tiêu đề</TableCell>
                        <TableCell>Ngày nộp</TableCell>
                        <TableCell>Định dạng</TableCell>
                        <TableCell>Kích thước</TableCell>
                        <TableCell align="right">Tải về</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.map((s, idx) => (
                        <TableRow key={s.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{s.student_info?.full_name || s.student_info?.email || '—'}</TableCell>
                          <TableCell>{s.student_info?.student_id || '—'}</TableCell>
                          <TableCell>{s.title || s.file?.split('/').pop() || s.file_url?.split('/').pop() || '—'}</TableCell>
                          <TableCell>{new Date(s.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            {(() => {
                              try {
                                const src = s?.file || s?.file_url || ''
                                const clean = String(src).split('?')[0].split('#')[0]
                                const base = clean.split('/').pop()
                                const parts = base.split('.')
                                const ext = (parts.length > 1 ? parts.pop() : '')
                                const up = String(ext).toUpperCase() || '—'
                                const icon = (() => {
                                  const low = String(ext).toLowerCase()
                                  if (low === 'pdf') return <PdfIcon sx={{ color: 'error.main' }} />
                                  if (low === 'doc' || low === 'docx') return <DocIcon sx={{ color: 'info.main' }} />
                                  if (low === 'ppt' || low === 'pptx') return <PptIcon sx={{ color: 'warning.main' }} />
                                  if (low === 'xls' || low === 'xlsx') return <XlsIcon sx={{ color: 'success.main' }} />
                                  if (low === 'zip') return <ZipIcon sx={{ color: 'text.secondary' }} />
                                  return <FileIcon sx={{ color: 'text.disabled' }} />
                                })()
                                return <Box display="flex" alignItems="center" gap={1}>{icon}{up}</Box>
                              } catch {
                                return '—'
                              }
                            })()}
                          </TableCell>
                          <TableCell>{s.file_size ? formatBytes(s.file_size) : '—'}</TableCell>
                          <TableCell align="right">
                            {s.file_url ? (
                              <Button size="small" variant="outlined" href={s.file_url} target="_blank" rel="noopener">Tải xuống</Button>
                            ) : '—'}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              disabled={deletingSubmissionId === s.id}
                              onClick={async () => {
                                if (!window.confirm('Xóa bài nộp này?')) return
                                try {
                                  setDeletingSubmissionId(s.id)
                                  await submissionService.deleteSubmission(s.id)
                                  setSubmissions(prev => prev.filter(x => x.id !== s.id))
                                } catch (e) {
                                  alert(e?.response?.data?.error || e?.message || 'Xóa thất bại')
                                } finally {
                                  setDeletingSubmissionId(null)
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Groups */}
      {tabValue === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={600}>Chia nhóm ngẫu nhiên</Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    type="number"
                    size="small"
                    label="Sĩ số nhóm"
                    value={groupSizeInput}
                    onChange={(e) => setGroupSizeInput(Number(e.target.value) || 2)}
                    inputProps={{ min: 2 }}
                    sx={{ width: 140 }}
                  />
                  <TextField
                    size="small"
                    label="Seed (tùy chọn)"
                    value={groupSeedInput}
                    onChange={(e) => setGroupSeedInput(e.target.value)}
                    sx={{ width: 180 }}
                  />
                  <Button
                    variant="contained"
                    onClick={async () => {
                      try {
                        setGroupingLoading(true)
                        const res = await groupingService.generateGroups({ class_id: classId, group_size: Number(groupSizeInput) || 2, seed: groupSeedInput })
                        const gs = res.data?.groupset
                        if (gs?.id) {
                          setSelectedGroupSetId(gs.id)
                        }
                        setGroups(res.data?.groups || [])
                        // refresh list of groupsets
                        const listAll = await groupingService.listGroupSets({ class_id: classId })
                        setGroupSets(listAll.data?.results || listAll.data || [])
                      } catch (e) {
                        alert(e?.response?.data?.error || e?.message || 'Chia nhóm thất bại')
                      } finally {
                        setGroupingLoading(false)
                      }
                      // refresh available students
                      try {
                        if (selectedGroupSetId) {
                          const as = await groupingService.listAvailableStudents({ groupset_id: selectedGroupSetId })
                          setAvailableStudents(as.data?.results || as.data || [])
                        }
                      } catch {}
                    }}
                  >
                    Chia nhóm
                  </Button>
                  <TextField
                    select
                    size="small"
                    label="Đợt chia nhóm"
                    value={selectedGroupSetId || ''}
                    onChange={async (e) => {
                      const id = e.target.value || null
                      setSelectedGroupSetId(id)
                      if (!id) { setGroups([]); setAvailableStudents([]); return }
                      try {
                        setGroupingLoading(true)
                        const detail = await groupingService.getGroups({ groupset_id: id })
                        setGroups(detail.data?.groups || [])
                        const as = await groupingService.listAvailableStudents({ groupset_id: id })
                        setAvailableStudents(as.data?.results || as.data || [])
                      } catch (er) {
                        setGroupingError(er?.response?.data?.error || er?.message || 'Không thể tải nhóm')
                      } finally {
                        setGroupingLoading(false)
                      }
                    }}
                    sx={{ minWidth: 220 }}
                  >
                    <MenuItem value="">—</MenuItem>
                    {(groupSets || []).map(gs => (
                      <MenuItem key={gs.id} value={gs.id}>{new Date(gs.created_at).toLocaleString()} • size={gs.group_size}</MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="outlined"
                    disabled={!selectedGroupSetId}
                    onClick={async () => {
                      if (!selectedGroupSetId) return
                      try {
                        const blob = await groupingService.exportGroups(selectedGroupSetId)
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `Groups_${classData?.class_name || classId}.xlsx`
                        a.click()
                        window.URL.revokeObjectURL(url)
                      } catch (e) {
                        alert(e?.response?.data?.error || e?.message || 'Xuất Excel thất bại')
                      }
                    }}
                  >
                    Xuất Excel
                  </Button>
                </Box>
              </Box>

              {groupingLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}><CircularProgress /></Box>
              ) : groupingError ? (
                <Alert severity="error">{groupingError}</Alert>
              ) : groups.length === 0 ? (
                <Alert severity="info">Chưa có đợt chia nhóm. Hãy chọn sĩ số và nhấn "Chia nhóm".</Alert>
              ) : (
                <Grid container spacing={2}>
                  {groups.map((g) => (
                    <Grid item xs={12} md={6} lg={4} key={g.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight={700}>{g.name}</Typography>
                              <IconButton size="small" onClick={async () => {
                                const val = window.prompt('Đổi tên nhóm', g.name)
                                if (!val) return
                                try {
                                  await groupingService.renameGroup(g.id, val)
                                  if (selectedGroupSetId) {
                                    const detail = await groupingService.getGroups({ groupset_id: selectedGroupSetId })
                                    setGroups(detail.data?.groups || [])
                                  }
                                } catch (e) {
                                  alert(e?.response?.data?.error || e?.message || 'Đổi tên thất bại')
                                }
                              }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <IconButton size="small" color="error" onClick={async () => {
                              if (!window.confirm(`Xóa ${g.name}?`)) return
                              try {
                                setGroupingLoading(true)
                                await groupingService.deleteGroup(g.id)
                                // reload current groupset
                                if (selectedGroupSetId) {
                                  const detail = await groupingService.getGroups({ groupset_id: selectedGroupSetId })
                                  setGroups(detail.data?.groups || [])
                                }
                              } catch (e) {
                                alert(e?.response?.data?.error || e?.message || 'Xóa nhóm thất bại')
                              } finally {
                                setGroupingLoading(false)
                              }
                            }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Table
                            size="small"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={async (e) => {
                              try {
                                const data = JSON.parse(e.dataTransfer.getData('text/plain') || '{}')
                                if (!data.student_id) return
                                await groupingService.addMember(g.id, { student_id: data.student_id })
                                if (selectedGroupSetId) {
                                  const detail = await groupingService.getGroups({ groupset_id: selectedGroupSetId })
                                  setGroups(detail.data?.groups || [])
                                }
                                // refresh available
                                if (selectedGroupSetId) {
                                  const as = await groupingService.listAvailableStudents({ groupset_id: selectedGroupSetId })
                                  setAvailableStudents(as.data?.results || as.data || [])
                                }
                              } catch {}
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell>STT</TableCell>
                                <TableCell>MSSV</TableCell>
                                <TableCell>Họ tên</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {g.members.map((m, idx) => (
                                <TableRow key={m.id} draggable onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', JSON.stringify({ student_id: m.student_id }))
                                }}>
                                  <TableCell>{idx + 1}</TableCell>
                                  <TableCell>{m.student_id}</TableCell>
                                  <TableCell>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                      <span>{m.full_name}</span>
                                      <IconButton size="small" color="error" onClick={async () => {
                                        try {
                                          await groupingService.removeMember(g.id, { student_id: m.student_id })
                                          if (selectedGroupSetId) {
                                            const detail = await groupingService.getGroups({ groupset_id: selectedGroupSetId })
                                            setGroups(detail.data?.groups || [])
                                          }
                                        } catch (e) {
                                          alert(e?.response?.data?.error || e?.message || 'Xóa khỏi nhóm thất bại')
                                        }
                                      }}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <Autocomplete
                              size="small"
                              options={availableStudents}
                              getOptionLabel={(o) => `${o.student_id} - ${o.full_name}`}
                              renderInput={(params) => <TextField {...params} label="Thêm SV" placeholder="Nhập MSSV hoặc tên" />}
                              sx={{ minWidth: 260 }}
                              onChange={async (_e, value) => {
                                if (!value) return
                                try {
                                  await groupingService.addMember(g.id, { student_id: value.student_id })
                                  if (selectedGroupSetId) {
                                    const detail = await groupingService.getGroups({ groupset_id: selectedGroupSetId })
                                    setGroups(detail.data?.groups || [])
                                    const as = await groupingService.listAvailableStudents({ groupset_id: selectedGroupSetId })
                                    setAvailableStudents(as.data?.results || as.data || [])
                                  }
                                } catch (e) {
                                  alert(e?.response?.data?.error || e?.message || 'Thêm vào nhóm thất bại')
                                }
                              }}
                            />
                            <Button size="small" variant="outlined" onClick={async () => {
                              const input = document.getElementById(`add-st-${g.id}`)
                              const code = (input?.value || '').trim()
                              if (!code) return
                              try {
                                await groupingService.addMember(g.id, { student_id: code })
                                input.value = ''
                                if (selectedGroupSetId) {
                                  const detail = await groupingService.getGroups({ groupset_id: selectedGroupSetId })
                                  setGroups(detail.data?.groups || [])
                                }
                              } catch (e) {
                                alert(e?.response?.data?.error || e?.message || 'Thêm vào nhóm thất bại')
                              }
                            }}>Thêm</Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); setQuickCreateSessionOpen(true); }}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Tạo nhanh buổi học" secondary="Sử dụng template & preset" />
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setBulkCreateSessionsOpen(true); }}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Tạo nhiều buổi học" secondary="Tạo cả kỳ học" />
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); setCreateSessionOpen(true); }}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Tạo buổi học cơ bản" secondary="Form truyền thống" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); setSessionManagementOpen(true); }}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary="Quản lý buổi học" secondary="Xóa, sửa, nhân đôi" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setQrInitialSessionId(null); setQrDialogOpen(true) }}>
          <ListItemIcon>
            <QrCodeIcon />
          </ListItemIcon>
          <ListItemText>Tạo QR điểm danh</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setManualAttendanceOpen(true)}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText>Điểm danh thủ công</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText>Gửi email thông báo</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText>Cài đặt lớp học</ListItemText>
        </MenuItem>
      </Menu>

      {/* QR Dialog */}
      <AttendanceQRGenerator
        open={qrDialogOpen}
        onClose={() => { setQrDialogOpen(false); setQrInitialSessionId(null) }}
        classData={classData}
        availableSessions={attendanceSessions}
        initialSessionId={qrInitialSessionId}
        title="QR Code Điểm Danh"
        onSessionUpdate={(updatedSession) => {
          console.log('Session updated:', updatedSession)
        }}
      />

{/* Grade Edit Dialog */}
      <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa điểm - {selectedStudent?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Điểm thường xuyên (10%)"
              type="number"
              fullWidth
              value={regularScore}
              onChange={(e) => setRegularScore(e.target.value)}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
            />
            <TextField
              label="Điểm giữa kỳ (30%)"
              type="number"
              fullWidth
              value={midtermScore}
              onChange={(e) => setMidtermScore(e.target.value)}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
            />
            {!isTeacher && (
              <TextField
                label="Điểm cuối kỳ (60%)"
                type="number"
                fullWidth
                value={finalScore}
                onChange={(e) => setFinalScore(e.target.value)}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={async () => {
            try {
              const studentId = selectedStudent?.student_id
              if (!studentId) {
                alert('Thiếu mã sinh viên (student_id)');
                return
              }
              // Upsert regular and midterm for teacher; admin can also update final
              if (regularScore !== '' && regularScore !== null) {
                await gradeService.upsertGrade({ student_id: studentId, class_id: Number(classId), grade_type: 'regular', score: Number(regularScore) })
              }
              if (midtermScore !== '' && midtermScore !== null) {
                await gradeService.upsertGrade({ student_id: studentId, class_id: Number(classId), grade_type: 'midterm', score: Number(midtermScore) })
              }
              if (!isTeacher && finalScore !== '' && finalScore !== null) {
                await gradeService.upsertGrade({ student_id: studentId, class_id: Number(classId), grade_type: 'final', score: Number(finalScore) })
              }

              // Update UI state quickly
              setStudents(prev => prev.map(s => s.id === selectedStudent.id ? {
                ...s,
                grades: {
                  ...s.grades,
                  regular: regularScore === '' ? s.grades.regular : Number(regularScore),
                  midterm: midtermScore === '' ? s.grades.midterm : Number(midtermScore),
                  final: isTeacher ? s.grades.final : (finalScore === '' ? s.grades.final : Number(finalScore)),
                }
              } : s))

              alert('Điểm đã được cập nhật!')
              setGradeDialogOpen(false)
            } catch (e) {
              console.error('Failed to update grades', e)
              const msg = e?.response?.data?.error || e?.message || 'Cập nhật điểm thất bại'
              alert(msg)
            }
          }}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Attendance Dialog */}
      {manualAttendanceOpen && (
        <ManualAttendance
          classData={classData}
          availableSessions={attendanceSessions}
          students={students}
          existingAttendance={{}}
          onSave={handleSaveManualAttendance}
          onClose={() => setManualAttendanceOpen(false)}
        />
      )}

      {/* Create Session Dialog - Original */}
      <CreateSession
        open={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        classData={classData}
        onCreateSession={handleCreateSession}
      />
      
      {/* Quick Create Session Dialog - NEW */}
      <QuickCreateSession
        open={quickCreateSessionOpen}
        onClose={() => setQuickCreateSessionOpen(false)}
        classId={classId}
        lastSession={attendanceSessions[attendanceSessions.length - 1]}
        onSuccess={() => {
          loadClassData()
          setQuickCreateSessionOpen(false)
        }}
      />
      
      {/* Bulk Create Sessions Dialog - NEW */}
      <BulkCreateSessions
        open={bulkCreateSessionsOpen}
        onClose={() => setBulkCreateSessionsOpen(false)}
        classId={classId}
        onSuccess={() => {
          loadClassData()
          setBulkCreateSessionsOpen(false)
        }}
      />
      
      {/* Edit Session Dialog - NEW */}
      <EditSessionDialog
        open={editSessionOpen}
        onClose={() => setEditSessionOpen(false)}
        session={sessionBeingEdited}
        onSaved={loadClassData}
      />

      {/* Session Management Dialog - NEW */}
      <SessionManagementDialog
        open={sessionManagementOpen}
        onClose={() => setSessionManagementOpen(false)}
        sessions={attendanceSessions}
        onSessionsChange={loadClassData}
        classId={classId}
      />

      {/* Student Form Dialog */}
      <StudentForm
        open={studentFormOpen}
        onClose={() => setStudentFormOpen(false)}
        onSuccess={async () => {
          setStudentFormOpen(false)
          await loadClassData()
        }}
        student={editingStudentDetail}
      />

      {/* Upload Material Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tải tài liệu lớp</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder={uploadFile?.name || 'Ví dụ: Bài giảng buổi 1'}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              minRows={3}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
            />
            <Box>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}> 
                Chọn file (pdf, doc, docx, ppt, pptx, xls, xlsx, zip)
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </Button>
              {uploadFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Đã chọn: {uploadFile.name} ({uploadFile.size ? (Math.round(uploadFile.size/1024/1024*10)/10) : 0} MB)
                </Typography>
              )}
            </Box>
            <TextField
              label="Hoặc nhập link"
              fullWidth
              value={uploadLink}
              onChange={(e) => setUploadLink(e.target.value)}
              placeholder="https://..."
            />
            {uploadError && <Alert severity="error">{uploadError}</Alert>}
            {uploadSaving && <LinearProgress />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleUploadMaterial} disabled={uploadSaving}>Tải lên</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <SpeedDial
        ariaLabel="Class Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Tạo nhanh buổi học"
          onClick={() => setQuickCreateSessionOpen(true)}
          sx={{ bgcolor: 'success.main', color: 'white' }}
        />
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipTitle="Tạo nhiều buổi học"
          onClick={() => setBulkCreateSessionsOpen(true)}
          sx={{ bgcolor: 'info.main', color: 'white' }}
        />
        <SpeedDialAction
          icon={<QrCodeIcon />}
          tooltipTitle="QR Điểm danh"
          onClick={() => setQrDialogOpen(true)}
        />
        <SpeedDialAction
          icon={<PeopleIcon />}
          tooltipTitle="Điểm danh thủ công"
          onClick={() => setManualAttendanceOpen(true)}
        />
      </SpeedDial>
    </Container>
  )
}

export default ClassDetailPage
