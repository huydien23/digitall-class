import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material'
import { People as PeopleIcon, QrCode as QrCodeIcon, Visibility as VisibilityIcon, Add as AddIcon, CloudUpload as CloudUploadIcon, ViewModule as ViewModuleIcon, ViewList as ViewListIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import classService from '../../services/classService'
import ClassJoinQRCode from './ClassJoinQRCode'
import StudentImportDialog from './StudentImportDialog'

// Helper: get preferred year id
function pickPreferredYearId(years) {
  if (!Array.isArray(years) || years.length === 0) return ''
  const nowYearStr = String(new Date().getFullYear())
  const hit = years.find(y => String(y.code).includes(nowYearStr))
  return String((hit || years[0]).id)
}

const TeacherMyClasses = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [years, setYears] = useState([])
  const [filters, setFilters] = useState({ year_id: '', search: '' })
  const [classes, setClasses] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  // Dialog states
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [joinDialogClass, setJoinDialogClass] = useState(null)

  // Import Excel dialog (per class)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importDialogClass, setImportDialogClass] = useState(null)

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteDialogClass, setDeleteDialogClass] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load initial
  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const resYears = await classService.listYears()
        const ys = resYears.data || []
        setYears(ys)
        const preferred = pickPreferredYearId(ys)
        setFilters(prev => ({ ...prev, year_id: preferred }))
      } catch (e) {
        setError(e?.message || 'Không tải được năm học')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Load classes whenever filter changes
  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError('')
        const params = {}
        if (filters.year_id) {
          const y = years.find(y => String(y.id) === String(filters.year_id))
          if (y?.code) params.year_code = y.code
        }
        if (filters.search?.trim()) params.search = filters.search.trim()
        const res = await classService.getClasses(params)
        const items = res.data?.results || res.data || []
        setClasses(items)
      } catch (e) {
        setError(e?.message || 'Không tải được lớp học')
      } finally {
        setLoading(false)
      }
    })()
  }, [filters.year_id, filters.search])

  const filtered = useMemo(() => classes, [classes])

  // Pagination (client-side)
  const [page, setPage] = useState(1)
  const pageSize = viewMode === 'list' ? 15 : 9 // list shows more per page
  useEffect(() => { setPage(1) }, [filters.year_id, filters.search, viewMode])
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const header = (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h4" fontWeight={700}>Lớp của tôi</Typography>
        <ToggleButtonGroup value={viewMode} exclusive size="small" onChange={(e, v) => v && setViewMode(v)}>
          <ToggleButton value="grid" aria-label="grid view"><ViewModuleIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="list" aria-label="list view"><ViewListIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/teaching-management')}>Tạo lớp mới</Button>
      </Stack>
    </Box>
  )

  const filtersBar = (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent sx={{ py: 1.5 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Năm học</InputLabel>
              <Select
                label="Năm học"
                value={filters.year_id}
                onChange={(e) => setFilters(prev => ({ ...prev, year_id: e.target.value }))}
              >
                {years.map(y => (
                  <MenuItem key={y.id} value={String(y.id)}>{y.name || `Năm học ${y.code}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              label="Tìm kiếm lớp học"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setFilters(prev => ({ ...prev, search: '' }))}>Xóa tìm kiếm</Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  const handleOpenJoin = (c) => { setJoinDialogClass(c); setJoinDialogOpen(true) }
  const handleOpenImport = (c) => { setImportDialogClass(c); setImportDialogOpen(true) }
  const handleOpenDelete = (c) => { setDeleteDialogClass(c); setDeleteDialogOpen(true) }

  const handleDeleteClass = async () => {
    if (!deleteDialogClass) return
    try {
      setDeleting(true)
      setError('')
      await classService.deleteClass(deleteDialogClass.id)
      // Remove from local state
      setClasses(prev => prev.filter(c => c.id !== deleteDialogClass.id))
      setDeleteDialogOpen(false)
      setDeleteDialogClass(null)
      // Show success message by setting error as success (we could use a success state)
      setError('')
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Không thể xóa lớp học')
    } finally {
      setDeleting(false)
    }
  }

  const classCard = (c) => (
    <Grid item xs={12} sm={6} lg={4} key={c.id}>
      <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
        <CardContent sx={{ py: 1.5, px: 2 }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                {c.class_name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary" >Mã lớp: {c.class_id}</Typography>
                {c.subject?.name && <Chip size="small" color="primary" label={c.subject.name} />}
                {c.term && <Chip size="small" color="secondary" label={`${c.term?.year?.code} - ${String(c.term?.season || '').toUpperCase()}`} />}
                <Chip size="small" label={c.is_active ? 'Active' : 'Inactive'} color={c.is_active ? 'success' : 'default'} />
              </Stack>
              {c.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }} noWrap>{c.description}</Typography>
              )}
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Box textAlign="center">
                  <PeopleIcon color="primary" fontSize="small" />
                  <Typography variant="body1" fontWeight={700}>{c.current_students_count || 0}/{c.max_students}</Typography>
                  <Typography variant="caption" color="text.secondary">Sinh viên</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="body1" fontWeight={700}>0%</Typography>
                  <Typography variant="caption" color="text.secondary">Điểm danh</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
            <Button size="small" variant="contained" startIcon={<VisibilityIcon />} onClick={() => navigate(`/classes/${c.id}`)}>
              Xem chi tiết
            </Button>
            <Button size="small" variant="outlined" startIcon={<QrCodeIcon />} onClick={() => handleOpenJoin(c)}>
              QR tham gia
            </Button>
            <Button size="small" variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => handleOpenImport(c)}>
              Import Excel
            </Button>
            <Tooltip title="Xóa lớp học">
              <IconButton size="small" color="error" onClick={() => handleOpenDelete(c)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {header}
      {filtersBar}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Typography>Đang tải...</Typography>
      ) : filtered.length === 0 ? (
        <Alert severity="info">Không có lớp nào cho năm đã chọn. Hãy tạo lớp ở mục Quản lý giảng dạy.</Alert>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container rowSpacing={4} columnSpacing={2}>
              {paged.map(classCard)}
            </Grid>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Lớp</TableCell>
                    <TableCell>Mã lớp</TableCell>
                    <TableCell>Môn</TableCell>
                    <TableCell>Năm-HK</TableCell>
                    <TableCell align="center">Sĩ số</TableCell>
                    <TableCell>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{c.class_name}</TableCell>
                      <TableCell>{c.class_id}</TableCell>
                      <TableCell>{c.subject?.name || '—'}</TableCell>
                      <TableCell>{c.term ? `${c.term?.year?.code} - ${String(c.term?.season || '').toUpperCase()}` : '—'}</TableCell>
                      <TableCell align="center">{(c.current_students_count || 0)}/{c.max_students}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="contained" onClick={() => navigate(`/classes/${c.id}`)}>Chi tiết</Button>
                          <Button size="small" variant="outlined" onClick={() => handleOpenJoin(c)}>QR</Button>
                          <Button size="small" variant="outlined" onClick={() => handleOpenImport(c)}>Import Excel</Button>
                          <Tooltip title="Xóa lớp học">
                            <IconButton size="small" color="error" onClick={() => handleOpenDelete(c)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {filtered.length > pageSize && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={Math.ceil(filtered.length / pageSize)} page={page} onChange={(e, v) => setPage(v)} size="small" />
            </Box>
          )}
        </>
      )}

      {/* Join QR Dialog */}
      {joinDialogClass && (
        <ClassJoinQRCode
          open={joinDialogOpen}
          onClose={() => setJoinDialogOpen(false)}
          classData={{
            id: joinDialogClass.id,
            class_id: joinDialogClass.class_id,
            class_name: joinDialogClass.class_name,
            description: joinDialogClass.description,
            teacher_name: joinDialogClass.teacher?.full_name || ''
          }}
        />
      )}

      {/* Import Excel dialog (attach roster to class) */}
      {importDialogClass && (
        <StudentImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          classData={{ id: importDialogClass.id, class_name: importDialogClass.class_name, class_id: importDialogClass.class_id }}
          onImportComplete={() => {
            // optional: refresh list after import
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa lớp học</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa lớp học <strong>{deleteDialogClass?.class_name}</strong> (Mã: {deleteDialogClass?.class_id})?
            <br /><br />
            <strong>Cảnh báo:</strong> Hành động này sẽ xóa toàn bộ dữ liệu liên quan bao gồm:
            <ul>
              <li>Danh sách sinh viên</li>
              <li>Điểm danh</li>
              <li>Điểm số</li>
              <li>Tài liệu</li>
            </ul>
            Dữ liệu không thể khôi phục sau khi xóa.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Hủy
          </Button>
          <Button onClick={handleDeleteClass} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Đang xóa...' : 'Xóa lớp học'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default TeacherMyClasses
