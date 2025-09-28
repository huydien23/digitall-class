import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Typography, Card, CardContent, Grid, Chip,
  Avatar, List, ListItem, ListItemIcon, ListItemText, Divider,
  Alert, CircularProgress, Button, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, Tabs, Tab, TextField
} from '@mui/material'
import {
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  HourglassEmpty as PendingIcon,
  Grade as GradeIcon,
  Description as DescriptionIcon
} from '@mui/icons-material'
import { PictureAsPdf as PdfIcon, Slideshow as PptIcon, TableChart as XlsIcon, Archive as ZipIcon, Link as LinkIcon, InsertDriveFile as FileIcon } from '@mui/icons-material'
import { CloudUpload as UploadIcon } from '@mui/icons-material'

import classService from '../../services/classService'
import attendanceService from '../../services/attendanceService'
import gradeService from '../../services/gradeService'
import materialService from '../../services/materialService'
import submissionService from '../../services/submissionService'
import StudentCheckInDialog from '../Attendance/StudentCheckInDialog'
import { QrCode as QrIcon } from '@mui/icons-material'
import AssignmentsInline from '../Assignments/AssignmentsInline'

const StudentClassDetailPage = () => {
  const { classId } = useParams()
  const { user } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [classInfo, setClassInfo] = useState(null)

  const [sessions, setSessions] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({}) // key: session.id => 'present'|'absent'|'none'

  const [myGrades, setMyGrades] = useState({ regular: null, midterm: null, final: null, total: null })

  const [tab, setTab] = useState(0) // 0 Overview, 1 Materials
  const [materials, setMaterials] = useState([])
  const [materialsLoading, setMaterialsLoading] = useState(true)

  // Submissions
  const [submissions, setSubmissions] = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  // Check-in dialog
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [scanMessage, setScanMessage] = useState('')

  const studentCode = user?.student_id || ''

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        // 1) Lấy thông tin lớp từ my-classes (sinh viên không gọi được /classes/:id)
        const my = await classService.getMyClasses()
        const list = my.data?.results || my.data || []
        const found = list.find((c) => String(c.id) === String(classId))
        if (!found) {
          setError('Bạn không thuộc lớp này hoặc lớp không tồn tại')
          setLoading(false)
          return
        }
        setClassInfo(found)

        // 2) Tải danh sách buổi học
        const sesRes = await attendanceService.getSessions({ class_id: classId, page_size: 200 })
        const ses = sesRes.data?.results || sesRes.data || []
        setSessions(ses)

        // 3) Tải điểm của chính mình trong lớp
        try {
          const gRes = await gradeService.getGrades({ student_id: studentCode, class_id: classId, page_size: 50 })
          const gList = gRes.data?.results || gRes.data || []
          const gradesInClass = gList.filter((g) => String(g.class_id || g.class?.id || g.class?.class_id) === String(classId) || String(g.class?.class_id) === String(found.class_id))
          const g = { regular: null, midterm: null, final: null, total: null }
          gradesInClass.forEach((it) => {
            if (it.grade_type === 'regular') g.regular = Number(it.score)
            if (it.grade_type === 'midterm') g.midterm = Number(it.score)
            if (it.grade_type === 'final') g.final = Number(it.score)
          })
          const total = (Number(g.regular || 0) * 0.1) + (Number(g.midterm || 0) * 0.3) + (Number(g.final || 0) * 0.6)
          g.total = Number.isFinite(total) ? Number(total.toFixed(1)) : null
          setMyGrades(g)
        } catch (e) {
          // bỏ qua nếu API chưa hỗ trợ lọc class_id
        }

        // 4) Map điểm danh của riêng SV theo từng buổi: gọi /attendance/?session_id=..&student_id=..
        const map = {}
        await Promise.all(
          ses.map(async (s) => {
            try {
              const params = { session_id: s.id }
              if (studentCode) params.student_id = studentCode
              const aRes = await attendanceService.getAttendances(params)
              const arr = aRes.data?.results || aRes.data || []
              if (arr.length > 0) {
                map[s.id] = arr[0].status // 'present'|...
              } else {
                map[s.id] = 'none'
              }
            } catch {
              map[s.id] = 'none'
            }
          })
        )
        setAttendanceMap(map)

        // 5) Tài liệu lớp
        try {
          const mRes = await materialService.getMaterials({ class_id: classId, page_size: 200 })
          setMaterials(mRes.data?.results || mRes.data || [])
        } finally {
          setMaterialsLoading(false)
        }

      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Không thể tải dữ liệu lớp')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [classId, studentCode])

  const handleTabChange = async (v) => {
    setTab(v)
    if (v === 3) {
      // Load submissions when switching to "Bài nộp"
      try {
        setSubmissionsLoading(true)
        const res = await submissionService.getSubmissions({ class_id: classId, page_size: 200 })
        setSubmissions(res.data?.results || res.data || [])
      } catch (e) {
        // ignore
      } finally {
        setSubmissionsLoading(false)
      }
    }
  }

  const handleSubmitUpload = async (e) => {
    e.preventDefault()
    setUploadError('')
    setUploadSuccess('')
    if (!uploadFile) {
      setUploadError('Vui lòng chọn file để nộp')
      return
    }
    const fd = new FormData()
    fd.append('class_obj', classId)
    fd.append('file', uploadFile)
    if (uploadTitle) fd.append('title', uploadTitle)
    try {
      setUploading(true)
      await submissionService.uploadSubmission(fd)
      setUploadSuccess('Nộp bài thành công!')
      setUploadFile(null)
      setUploadTitle('')
      // Refresh list
      try {
        setSubmissionsLoading(true)
        const res = await submissionService.getSubmissions({ class_id: classId, page_size: 200 })
        setSubmissions(res.data?.results || res.data || [])
      } finally {
        setSubmissionsLoading(false)
      }
    } catch (err) {
      const apiErr = err?.response?.data
      setUploadError(apiErr?.file || apiErr?.error || 'Nộp bài thất bại')
    } finally {
      setUploading(false)
    }
  }

  const attendanceRate = useMemo(() => {
    if (sessions.length === 0) return 0
    const presentCount = sessions.filter((s) => attendanceMap[s.id] === 'present' || attendanceMap[s.id] === 'excused').length
    return Math.round((presentCount / sessions.length) * 100)
  }, [sessions, attendanceMap])

  const fmtDate = (d) => (d ? String(d).slice(0, 10) : '')
  const fmtTime = (t) => (t ? String(t).slice(0, 5) : '--:--')

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <SchoolIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>{classInfo?.class_name}</Typography>
            <Typography variant="body1" color="text.secondary">Mã lớp: {classInfo?.class_id} • Giảng viên: {classInfo?.teacher?.full_name || classInfo?.teacher || ''}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Tỷ lệ điểm danh</Typography>
            <Typography variant="h4" fontWeight={700}>{attendanceRate}%</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary">Điểm tổng kết</Typography>
            <Typography variant="h4" fontWeight={700}>{myGrades.total ?? '—'}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Điểm danh</Typography>
                <Button variant="contained" startIcon={<QrIcon />} onClick={() => setCheckInOpen(true)}>Quét QR / Nhập mã</Button>
              </Box>
              {scanMessage && (
                <Alert severity="info" sx={{ mt: 1 }}>{scanMessage}</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => handleTabChange(v)} variant="fullWidth">
          <Tab label="Tổng quan" />
          <Tab label="Bài tập/Thi" />
          <Tab label="Tài liệu" />
          <Tab label="Bài nộp" />
        </Tabs>
      </Paper>

      {/* Overview */}
      {tab === 0 && (
        <Grid container spacing={3}>
          {/* Attendance list */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Điểm danh theo buổi</Typography>
                {sessions.length === 0 ? (
                  <Alert severity="info">Chưa có buổi học nào được tạo</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Buổi</TableCell>
                          <TableCell>Ngày</TableCell>
                          <TableCell>Giờ</TableCell>
                          <TableCell>Phòng</TableCell>
                          <TableCell align="center">Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sessions.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.session_name}</TableCell>
                            <TableCell>{fmtDate(s.session_date)}</TableCell>
                            <TableCell>{fmtTime(s.start_time)} - {fmtTime(s.end_time)}</TableCell>
                            <TableCell>{s.location || '-'}</TableCell>
                            <TableCell align="center">
                              {attendanceMap[s.id] === 'present' ? (
                                <Chip color="success" label="Có mặt" icon={<PresentIcon />} size="small" />
                              ) : attendanceMap[s.id] === 'absent' ? (
                                <Chip color="error" label="Vắng" icon={<AbsentIcon />} size="small" />
                              ) : attendanceMap[s.id] === 'excused' ? (
                                <Chip color="info" label="Có phép" size="small" />
                              ) : (
                                <Chip label="Chưa điểm danh" icon={<PendingIcon />} size="small" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* My Grades */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <GradeIcon />
                  <Typography variant="h6">Điểm của tôi</Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Thường xuyên (10%)" />
                    <Typography fontWeight={600}>{myGrades.regular ?? '—'}</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Giữa kỳ (30%)" />
                    <Typography fontWeight={600}>{myGrades.midterm ?? '—'}</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Cuối kỳ (60%)" />
                    <Typography fontWeight={600}>{myGrades.final ?? '—'}</Typography>
                  </ListItem>
                </List>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={600}>Tổng kết</Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">{myGrades.total ?? '—'}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Assignments */}
      {tab === 1 && (
        <Box mb={3}>
          <AssignmentsInline classId={classId} isTeacher={false} />
        </Box>
      )}

      {/* Materials */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <DescriptionIcon />
              <Typography variant="h6">Tài liệu lớp học</Typography>
            </Box>
            {materialsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}><CircularProgress /></Box>
            ) : materials.length === 0 ? (
              <Alert severity="info">Chưa có tài liệu nào.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell>Ngày</TableCell>
                      <TableCell>Định dạng</TableCell>
                      <TableCell>Kích thước</TableCell>
                      <TableCell align="right">Tải về</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materials.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.title}</TableCell>
                        <TableCell>{m.description || '-'}</TableCell>
                        <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {(() => { 
                            try { 
                              const src = m?.file || m?.file_url || m?.link || m?.title || ''; 
                              const clean = String(src).split('?')[0].split('#')[0]; 
                              const base = clean.split('/').pop(); 
                              const parts = base.split('.'); 
                              const ext = (parts.length > 1 ? parts.pop() : (m?.link ? 'link' : ''))
                              const up = String(ext).toUpperCase() || '—'
                              const icon = (() => {
                                const low = String(ext).toLowerCase()
                                if (low === 'pdf') return <PdfIcon sx={{ color: 'error.main' }} />
                                if (low === 'doc' || low === 'docx') return <DescriptionIcon sx={{ color: 'info.main' }} />
                                if (low === 'ppt' || low === 'pptx') return <PptIcon sx={{ color: 'warning.main' }} />
                                if (low === 'xls' || low === 'xlsx') return <XlsIcon sx={{ color: 'success.main' }} />
                                if (low === 'zip') return <ZipIcon sx={{ color: 'text.secondary' }} />
                                if (low === 'link') return <LinkIcon sx={{ color: 'primary.main' }} />
                                return <FileIcon sx={{ color: 'text.disabled' }} />
                              })()
                              return <Box display="flex" alignItems="center" gap={1}>{icon}{up}</Box>
                            } catch { 
                              return '—' 
                            } 
                          })()}
                        </TableCell>
                        <TableCell>{m.file_size ? (() => { const n = Number(m.file_size); if (!n || n <= 0) return '—'; const units=['B','KB','MB','GB','TB']; const i=Math.floor(Math.log(n)/Math.log(1024)); const v=n/Math.pow(1024,i); return `${v.toFixed(v>=100?0:v>=10?1:2)} ${units[i]}` })() : '—'}</TableCell>
                        <TableCell align="right">
                          {m.file_url ? (
                            <Button size="small" variant="outlined" href={m.file_url} target="_blank" rel="noopener">Tải xuống</Button>
                          ) : m.link ? (
                            <Button size="small" variant="outlined" href={m.link} target="_blank" rel="noopener">Mở liên kết</Button>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submissions */}
      {tab === 3 && (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <UploadIcon />
              <Typography variant="h6">Bài nộp của tôi</Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmitUpload} sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Tiêu đề (tuỳ chọn)"
                    fullWidth
                    size="small"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                  >
                    Chọn file
                    <input type="file" hidden onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                  </Button>
                  {uploadFile && (
                    <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>{uploadFile.name}</Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button type="submit" variant="contained" disabled={uploading}>
                    {uploading ? 'Đang nộp...' : 'Nộp bài'}
                  </Button>
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Định dạng cho phép: PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, ZIP • Tối đa 20MB
              </Typography>
              {uploadError && <Alert severity="error" sx={{ mt: 1 }}>{uploadError}</Alert>}
              {uploadSuccess && <Alert severity="success" sx={{ mt: 1 }}>{uploadSuccess}</Alert>}
            </Box>

            {submissionsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}><CircularProgress /></Box>
            ) : submissions.length === 0 ? (
              <Alert severity="info">Bạn chưa nộp bài nào.</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Ngày nộp</TableCell>
                      <TableCell>Định dạng</TableCell>
                      <TableCell>Kích thước</TableCell>
                      <TableCell align="right">Tải về</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s.id}>
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
                                if (low === 'doc' || low === 'docx') return <DescriptionIcon sx={{ color: 'info.main' }} />
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
                        <TableCell>{s.file_size ? (() => { const n = Number(s.file_size); if (!n || n <= 0) return '—'; const units=['B','KB','MB','GB','TB']; const i=Math.floor(Math.log(n)/Math.log(1024)); const v=n/Math.pow(1024,i); return `${v.toFixed(v>=100?0:v>=10?1:2)} ${units[i]}` })() : '—'}</TableCell>
                        <TableCell align="right">
                          {s.file_url ? (
                            <Button size="small" variant="outlined" href={s.file_url} target="_blank" rel="noopener">Tải xuống</Button>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Check-in Dialog */}
      <StudentCheckInDialog
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        studentCode={studentCode}
        onSuccess={async (data) => {
          try {
            // Show immediate feedback
            setScanMessage('Điểm danh thành công!')
            
            // Also update state immediately for quick UI feedback
            const att = data?.attendance || data
            const sessId = att?.session?.id
            if (sessId) {
              setAttendanceMap((prev) => ({ ...prev, [sessId]: 'present' }))
            }
            
            // Force reload attendance data from server to ensure sync
            // This prevents data loss on page reload
            if (sessions.length > 0) {
              console.log('Refreshing attendance data after successful checkin...')
              const updatedMap = {}
              await Promise.all(
                sessions.map(async (s) => {
                  try {
                    const params = { session_id: s.id }
                    if (studentCode) params.student_id = studentCode
                    const aRes = await attendanceService.getAttendances(params)
                    const arr = aRes.data?.results || aRes.data || []
                    if (arr.length > 0) {
                      updatedMap[s.id] = arr[0].status
                    } else {
                      updatedMap[s.id] = 'none'
                    }
                  } catch {
                    updatedMap[s.id] = 'none'
                  }
                })
              )
              setAttendanceMap(updatedMap)
              console.log('Attendance data refreshed successfully')
            }
            
            setTimeout(() => setScanMessage(''), 4000)
          } catch (error) {
            console.error('Error refreshing attendance data:', error)
            // Keep the manual update as fallback
            const att = data?.attendance || data
            const sessId = att?.session?.id
            if (sessId) {
              setAttendanceMap((prev) => ({ ...prev, [sessId]: 'present' }))
            }
          }
        }}
      />
    </Container>
  )
}

export default StudentClassDetailPage
