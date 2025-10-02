import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Paper,
} from '@mui/material'
import { Add as AddIcon, ContentCopy as CopyIcon, CalendarMonth as CalendarIcon, Book as BookIcon, Class as ClassIcon } from '@mui/icons-material'
import classService from '../../services/classService'
import AcademicYearManagement from '../Academic/AcademicYearManagement'
import SubjectManagement from '../Academic/SubjectManagement'
import CreateClassWizard from '../Class/CreateClassWizard'

const seasons = [
  { value: 'hk1', label: 'HK1' },
  { value: 'hk2', label: 'HK2' },
  { value: 'hk3', label: 'HK3' },
]

const TeachingManagement = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0)
  // UI state
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  // Years / Terms / Subjects / Classes
  const [years, setYears] = useState([])
  const [terms, setTerms] = useState([])
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])

  // Selections
  const [selectedYearId, setSelectedYearId] = useState('')
  const [selectedTermId, setSelectedTermId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')

  // Forms
  const [yearForm, setYearForm] = useState({ code: '', name: '' })
  const [termForm, setTermForm] = useState({ season: 'hk1', name: '' })
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', credits: 3 })
  const [classForm, setClassForm] = useState({ class_name: '', description: '', max_students: 50 })

  // Copy roster dialog
  const [copyOpen, setCopyOpen] = useState(false)
  const [copySourceClassId, setCopySourceClassId] = useState('')
  const [copyTargetClassId, setCopyTargetClassId] = useState('')

  const loadYears = async () => {
    const res = await classService.listYears()
    setYears(res.data)
  }

  const loadTerms = async (yearId) => {
    const res = await classService.listTerms({ year_id: yearId })
    setTerms(res.data)
  }

  const loadSubjects = async () => {
    const res = await classService.listSubjects({})
    setSubjects(res.data)
  }

  const loadClasses = async (filters = {}) => {
    const res = await classService.getClasses(filters)
    // Backend may or may not paginate; normalize
    const items = res.data?.results || res.data || []
    setClasses(items)
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        await Promise.all([loadYears(), loadSubjects(), loadClasses({})])
      } catch (e) {
        setSnackbar({ open: true, message: 'Không thể tải dữ liệu ban đầu', severity: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (selectedYearId) {
      loadTerms(selectedYearId)
    } else {
      setTerms([])
    }
  }, [selectedYearId])

  useEffect(() => {
    const filters = {}
    if (selectedYearId) filters.year_code = years.find(y => y.id === selectedYearId)?.code
    if (selectedTermId) filters.term_id = selectedTermId
    loadClasses(filters)
  }, [selectedYearId, selectedTermId, years])

  const currentYearCode = useMemo(() => years.find(y => y.id === selectedYearId)?.code || '', [years, selectedYearId])

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity })

  const handleCreateYear = async () => {
    if (!yearForm.code) return notify('Vui lòng nhập mã năm học (vd: 2024-2025)', 'error')
    try {
      setLoading(true)
      await classService.createYear({ code: yearForm.code, name: yearForm.name || `Năm học ${yearForm.code}` })
      await loadYears()
      setYearForm({ code: '', name: '' })
      notify('Đã tạo năm học')
    } catch (e) {
      notify(e.response?.data?.error || 'Tạo năm học thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTerm = async () => {
    if (!selectedYearId) return notify('Chọn năm học trước', 'error')
    try {
      setLoading(true)
      await classService.createTerm({ year_id: selectedYearId, season: termForm.season, name: termForm.name || undefined })
      await loadTerms(selectedYearId)
      setTermForm({ season: 'hk1', name: '' })
      notify('Đã tạo học kỳ')
    } catch (e) {
      notify(e.response?.data?.error || 'Tạo học kỳ thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async () => {
    if (!subjectForm.code || !subjectForm.name) return notify('Nhập mã và tên môn học', 'error')
    try {
      setLoading(true)
      await classService.createSubject(subjectForm)
      await loadSubjects()
      setSubjectForm({ code: '', name: '', credits: 3 })
      notify('Đã tạo môn học')
    } catch (e) {
      notify(e.response?.data?.error || 'Tạo môn học thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async () => {
    if (!selectedTermId) return notify('Chọn học kỳ', 'error')
    if (!selectedSubjectId) return notify('Chọn môn học', 'error')
    if (!classForm.class_name) return notify('Nhập tên lớp', 'error')
    try {
      setLoading(true)
      const payload = {
        ...classForm,
        subject_id: selectedSubjectId,
        term_id: selectedTermId,
      }
      await classService.createClass(payload)
      await loadClasses({ term_id: selectedTermId })
      setClassForm({ class_name: '', description: '', max_students: 50 })
      notify('Đã tạo lớp học')
    } catch (e) {
      notify(e.response?.data?.error || 'Tạo lớp học thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openCopyDialog = () => {
    setCopySourceClassId('')
    setCopyTargetClassId('')
    setCopyOpen(true)
  }

  const handleCopyRoster = async () => {
    if (!copySourceClassId || !copyTargetClassId) return notify('Chọn lớp nguồn và lớp đích', 'error')
    if (copySourceClassId === copyTargetClassId) return notify('Lớp nguồn và lớp đích phải khác nhau', 'error')
    try {
      setLoading(true)
      await classService.importRoster({ source_class_id: copySourceClassId, target_class_id: copyTargetClassId })
      notify('Đã sao chép danh sách sinh viên')
      setCopyOpen(false)
      await loadClasses({ term_id: selectedTermId || undefined })
    } catch (e) {
      notify(e.response?.data?.error || 'Sao chép danh sách thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  // If showing other tabs, render them directly
  if (activeTab === 0) {
    return <CreateClassWizard onClose={() => window.history.back()} />
  }
  if (activeTab === 1) {
    return <AcademicYearManagement />
  }
  if (activeTab === 2) {
    return <SubjectManagement />
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<ClassIcon />} label="Tạo lớp học" />
          <Tab icon={<CalendarIcon />} label="Năm học & Học kỳ" />
          <Tab icon={<BookIcon />} label="Môn học" />
        </Tabs>
      </Paper>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Quản lý giảng dạy
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tạo Năm học → Học kỳ (HK1/HK2/HK3) → Lớp → Môn học. Sao chép danh sách sinh viên giữa các lớp bạn đã dạy.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Year Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Năm học
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Mã năm (vd: 2024-2025)" fullWidth value={yearForm.code}
                    onChange={(e) => setYearForm({ ...yearForm, code: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Tên hiển thị" fullWidth value={yearForm.name}
                    onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateYear} disabled={loading}>
                    Tạo năm học
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Năm học</InputLabel>
                    <Select value={selectedYearId} label="Năm học" onChange={(e) => setSelectedYearId(e.target.value)}>
                      {years.map((y) => (
                        <MenuItem key={y.id} value={y.id}>{y.name || y.code}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Term Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Học kỳ ({currentYearCode || 'Chọn năm'})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={async () => {
                    if (!selectedYearId) { setSnackbar({ open: true, message: 'Chọn năm học trước', severity: 'warning' }); return; }
                    try {
                      setLoading(true)
                      const tasks = [
                        classService.createTerm({ year_id: selectedYearId, season: 'hk1' }),
                        classService.createTerm({ year_id: selectedYearId, season: 'hk2' }),
                        classService.createTerm({ year_id: selectedYearId, season: 'hk3' }),
                      ]
                      await Promise.all(tasks)
                      await loadTerms(selectedYearId)
                      setSnackbar({ open: true, message: 'Đã tạo 3 học kỳ (HK1/HK2/HK3)', severity: 'success' })
                    } catch (e) {
                      setSnackbar({ open: true, message: 'Không thể tạo đủ 3 học kỳ (có thể đã tồn tại)', severity: 'warning' })
                    } finally {
                      setLoading(false)
                    }
                  }}>Tạo nhanh 3 học kỳ (HK1/HK2/HK3)</Button>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Học kỳ</InputLabel>
                    <Select value={termForm.season} label="Học kỳ"
                      onChange={(e) => setTermForm({ ...termForm, season: e.target.value })}>
                      {seasons.map((s) => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Tên hiển thị (tuỳ chọn)" fullWidth value={termForm.name}
                    onChange={(e) => setTermForm({ ...termForm, name: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateTerm} disabled={loading || !selectedYearId}>
                    Tạo học kỳ
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Chọn học kỳ</InputLabel>
                    <Select value={selectedTermId} label="Chọn học kỳ" onChange={(e) => setSelectedTermId(e.target.value)}>
                      {terms.map((t) => (
                        <MenuItem key={t.id} value={t.id}>{t.name} ({t.season.toUpperCase()})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Subject Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Môn học
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}><TextField label="Mã môn" fullWidth value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} /></Grid>
                <Grid item xs={8}><TextField label="Tên môn" fullWidth value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} /></Grid>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateSubject} disabled={loading}>
                    Tạo môn học
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Chọn môn học</InputLabel>
                    <Select value={selectedSubjectId} label="Chọn môn học" onChange={(e) => setSelectedSubjectId(e.target.value)}>
                      {subjects.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.code} - {s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Class Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Lớp học (theo học kỳ)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField label="Tên lớp" fullWidth value={classForm.class_name}
                  onChange={(e) => setClassForm({ ...classForm, class_name: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField label="Mô tả" fullWidth value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField label="Sĩ số tối đa" type="number" fullWidth value={classForm.max_students}
                  onChange={(e) => setClassForm({ ...classForm, max_students: Number(e.target.value || 0) })} /></Grid>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClass}
                    disabled={loading || !selectedTermId || !selectedSubjectId}>
                    Tạo lớp
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Classes list & Copy roster */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={600}>Lớp của tôi</Typography>
                <Button variant="outlined" startIcon={<CopyIcon />} onClick={openCopyDialog} disabled={classes.length < 2}>
                  Sao chép danh sách sinh viên
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {classes.map((c) => (
                  <Grid item xs={12} md={6} lg={4} key={c.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography fontWeight={600}>{c.class_name}</Typography>
                        <Typography variant="body2" color="text.secondary">Mã lớp: {c.class_id}</Typography>
                        {c.term && (
                          <Chip label={`${c.term?.year?.code} - ${String(c.term?.season || '').toUpperCase()}`} size="small" sx={{ mt: 1 }} />
                        )}
                        <Typography variant="body2" sx={{ mt: 1 }}>{c.description}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Copy roster dialog */}
      <Dialog open={copyOpen} onClose={() => setCopyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sao chép danh sách sinh viên</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Lớp nguồn</InputLabel>
                <Select value={copySourceClassId} label="Lớp nguồn" onChange={(e) => setCopySourceClassId(e.target.value)}>
                  {classes.map((c) => (<MenuItem key={c.id} value={c.id}>{c.class_name} ({c.class_id})</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Lớp đích</InputLabel>
                <Select value={copyTargetClassId} label="Lớp đích" onChange={(e) => setCopyTargetClassId(e.target.value)}>
                  {classes.map((c) => (<MenuItem key={c.id} value={c.id}>{c.class_name} ({c.class_id})</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={async () => {
                if (!copySourceClassId || !copyTargetClassId) { setSnackbar({ open: true, message: 'Chọn lớp nguồn và lớp đích', severity: 'warning' }); return; }
                try {
                  setLoading(true)
                  const res = await classService.importRoster({ source_class_id: copySourceClassId, target_class_id: copyTargetClassId, dry_run: true })
                  const { created, reactivated, skipped } = res.data
                  setSnackbar({ open: true, message: `Sẽ thêm ${created}, kích hoạt lại ${reactivated}, bỏ qua ${skipped}`, severity: 'info' })
                } catch (e) {
                  setSnackbar({ open: true, message: 'Không thể xem trước danh sách sao chép', severity: 'error' })
                } finally {
                  setLoading(false)
                }
              }}>Xem trước thay đổi</Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyOpen(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleCopyRoster} disabled={loading || !copySourceClassId || !copyTargetClassId}>Xác nhận sao chép</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {loading && (
        <Box position="fixed" top={0} left={0} right={0} bottom={0} display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: 'rgba(255,255,255,0.4)', zIndex: 9999 }}>
          <CircularProgress />
        </Box>
      )}
    </Container>
  )
}

export default TeachingManagement
