import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import { Add, CloudUpload, Publish, Refresh, UploadFile, DeleteOutline, DeleteForever, RestoreFromTrash } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMaterials, createMaterial, publishMaterial, uploadVersion, unpublishMaterial, fetchTrash, deleteMaterial, restoreMaterial, purgeMaterial } from '../../store/slices/materialsSlice'
import materialLibraryService from '../../services/materialLibraryService'
import classService from '../../services/classService'

const TYPE_OPTIONS = [
  { value: 'lecture', label: 'Bài giảng' },
  { value: 'syllabus', label: 'Đề cương' },
  { value: 'exam', label: 'Đề thi' },
  { value: 'assignment', label: 'Bài tập' },
  { value: 'reference', label: 'Tài liệu tham khảo' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Đã công bố' },
  { value: 'archived', label: 'Lưu trữ' },
]

const Materials = () => {
  const dispatch = useDispatch()
  const { items, loading, trash } = useSelector((s) => s.materials)

  const [q, setQ] = useState('')
  const [showTrash, setShowTrash] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTargetIds, setDeleteTargetIds] = useState([])
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')

  const [openUpload, setOpenUpload] = useState(false)
  const [openPublish, setOpenPublish] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    dispatch(fetchMaterials({ q, type, status }))
  }, [dispatch, q, type, status])

  const refresh = () => dispatch(fetchMaterials({ q, type, status }))
  const refreshTrash = () => dispatch(fetchTrash())

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Kho tài liệu của tôi</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant={showTrash ? 'outlined' : 'contained'} onClick={() => { setShowTrash(false); setSelectedIds([]); refresh() }}>Kho</Button>
          <Button variant={showTrash ? 'contained' : 'outlined'} onClick={() => { setShowTrash(true); setSelectedIds([]); refreshTrash() }}>Thùng rác</Button>
          <TextField size="small" placeholder="Tìm kiếm..." value={q} onChange={(e) => setQ(e.target.value)} disabled={showTrash} />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Loại</InputLabel>
            <Select label="Loại" value={type} onChange={(e) => setType(e.target.value)}>
              <MenuItem value=""><em>Tất cả</em></MenuItem>
              {TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value=""><em>Tất cả</em></MenuItem>
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Làm mới">
            <IconButton onClick={refresh}><Refresh /></IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenUpload(true)}>Tải lên</Button>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 6 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <Box>
              <Stack spacing={1}>
                {(showTrash ? trash : items)?.length === 0 && (
                  <Typography color="text.secondary">{showTrash ? 'Thùng rác trống.' : 'Chưa có tài liệu nào. Nhấn "Tải lên" để bắt đầu.'}</Typography>
                )}
                {(showTrash ? trash : items)?.map((m) => (
                  <Box key={m.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{m.title}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                          <Chip size="small" label={TYPE_OPTIONS.find(t=>t.value===m.type)?.label || m.type} />
                          {(() => { const effective = Number(m.publications_count || 0) === 0 ? 'draft' : (m.status || 'draft'); const label = STATUS_OPTIONS.find(s=>s.value===effective)?.label || effective; const color = effective==='published'?'success':effective==='draft'?'default':'warning'; return (<Chip size="small" color={color} label={label} />) })()}
                          {m.tags && m.tags.split(',').filter(Boolean).slice(0,3).map((t)=> (
                            <Chip key={t} size="small" variant="outlined" label={`#${t.trim()}`} />
                          ))}
                          {Number(m.publications_count || 0) > 0 && (
                            <Chip size="small" color="primary" variant="outlined" label={`${m.publications_count} lớp`} />
                          )}
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">Cập nhật: {new Date(m.updated_at).toLocaleString()}</Typography>
                          {Number(m.publications_count || 0) > 0 && (
                            <PublishedListButton materialId={m.id} />
                          )}
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {!showTrash && (
                          <Checkbox
                            checked={selectedIds.includes(m.id)}
                            onChange={(e)=>{
                              const checked = e.target.checked
                              setSelectedIds((prev)=>{
                                const set = new Set(prev)
                                if (checked) set.add(m.id); else set.delete(m.id)
                                return Array.from(set)
                              })
                            }}
                          />
                        )}
                        {showTrash ? (
                          <>
                            <RestoreButton materialId={m.id} onDone={refreshTrash} />
                            <PurgeButton materialId={m.id} onDone={refreshTrash} />
                          </>
                        ) : (
                          <>
                            <Button size="small" variant="outlined" startIcon={<Publish />} onClick={() => { setSelected(m); setOpenPublish(true) }}>Công bố</Button>
                            {Number(m.publications_count || 0) > 0 && (
                              <UnpublishButton materialId={m.id} onDone={refresh} />
                            )}
                            <UploadVersionButton material={m} onUploaded={refresh} />
                            <IconButton color="error" onClick={() => { setDeleteTargetIds([m.id]); setDeleteDialogOpen(true) }} title="Xóa">
                              <DeleteOutline />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      <UploadDialog open={openUpload} onClose={() => setOpenUpload(false)} onCreated={() => { setOpenUpload(false); refresh() }} />
      <PublishDialog open={openPublish} material={selected} onClose={() => setOpenPublish(false)} onPublished={() => { setOpenPublish(false); refresh() }} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={()=> setDeleteDialogOpen(false)}
        ids={deleteTargetIds.length ? deleteTargetIds : selectedIds}
        onSoftDelete={async (ids)=>{
          for (const id of ids) {
            try { await dispatch(deleteMaterial(id)).unwrap() } catch (e) { console.error(e) }
          }
          setDeleteDialogOpen(false)
          setSelectedIds([])
          refresh(); refreshTrash()
        }}
        onPurge={async (ids)=>{
          for (const id of ids) {
            try {
              // Purge requires item in trash; attempt delete first then purge
              try { await dispatch(deleteMaterial(id)).unwrap() } catch(e) { /* ignore if already in trash */ }
              await dispatch(purgeMaterial(id)).unwrap()
            } catch (e) { console.error(e) }
          }
          setDeleteDialogOpen(false)
          setSelectedIds([])
          refresh(); refreshTrash()
        }}
      />
      {!showTrash && selectedIds.length > 0 && (
        <Box sx={{ position:'sticky', bottom: 0, py:1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Đã chọn {selectedIds.length} tài liệu</Typography>
            <Button variant="outlined" startIcon={<DeleteOutline />} color="error" onClick={()=>{ setDeleteTargetIds(selectedIds); setDeleteDialogOpen(true) }}>Xóa</Button>
            <Button variant="outlined" onClick={()=> setSelectedIds([])}>Bỏ chọn</Button>
          </Stack>
        </Box>
      )}
    </Box>
  )
}

const UploadDialog = ({ open, onClose, onCreated }) => {
  const dispatch = useDispatch()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('lecture')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [allowDownload, setAllowDownload] = useState(true)
  const [file, setFile] = useState(null)
  const [note, setNote] = useState('Initial version')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('type', type)
      if (description) fd.append('description', description)
      if (tags) fd.append('tags', tags)
      fd.append('allow_download', String(allowDownload))
      if (file) fd.append('file', file)
      if (note) fd.append('change_note', note)
      await dispatch(createMaterial(fd)).unwrap()
      onCreated?.()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Tải lên tài liệu</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Loại</InputLabel>
            <Select label="Loại" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} />
          <TextField label="Tags (phân tách bởi dấu phẩy)" value={tags} onChange={(e) => setTags(e.target.value)} fullWidth />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
              Chọn file
              <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
            <Typography variant="body2" color="text.secondary">{file ? file.name : 'Chưa chọn file'}</Typography>
          </Stack>
          <TextField label="Ghi chú phiên bản" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" disabled={!title || submitting} onClick={handleSubmit} startIcon={submitting ? <CircularProgress size={18} /> : <UploadFile />}>Tải lên</Button>
      </DialogActions>
    </Dialog>
  )
}

const PublishDialog = ({ open, onClose, material, onPublished }) => {
  const dispatch = useDispatch()
  const [classes, setClasses] = useState([])
  const [selected, setSelected] = useState([])
  const [alreadyPublishedIds, setAlreadyPublishedIds] = useState([])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [allowDownload, setAllowDownload] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open && material?.id) {
      Promise.all([
        classService.getClasses(),
        materialLibraryService.get(material.id),
      ]).then(([classesRes, matRes]) => {
        const data = classesRes.data || []
        const items = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : []
        setClasses(items)
        const pubs = Array.isArray(matRes.data?.publications) ? matRes.data.publications : []
        const pubIds = pubs.map((p) => p.class_obj)
        setAlreadyPublishedIds(pubIds)
        // Preselect những lớp đã công bố sẵn
        const preselected = items.filter((c) => pubIds.includes(c.id))
        setSelected(preselected)
      })
    } else if (!open) {
      setClasses([])
      setSelected([])
      setAlreadyPublishedIds([])
    }
  }, [open, material?.id])

  useEffect(() => {
    if (!open) {
      setSelected([])
      setStart('')
      setEnd('')
      setAllowDownload(true)
    }
  }, [open])

  const handlePublish = async () => {
    setSubmitting(true)
    try {
      const payload = {
        class_ids: selected.map((c) => c.id || c),
        allow_download: allowDownload,
      }
      if (start) payload.publish_start_at = new Date(start).toISOString()
      if (end) payload.publish_end_at = new Date(end).toISOString()
      await dispatch(publishMaterial({ id: material.id, payload })).unwrap()
      onPublished?.()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Công bố tài liệu: {material?.title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Lớp</InputLabel>
            <Select
              multiple
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              input={<OutlinedInput label="Lớp" />}
              renderValue={(selected) => selected.map((s) => (s.class_id || s)).join(', ')}
            >
              {Array.isArray(classes) && classes.map((c) => (
                <MenuItem key={c.id} value={c}>
                  <Checkbox checked={selected.findIndex((s)=> (s.id||s)===c.id) > -1} />
                  <ListItemText primary={`${c.class_id} - ${c.class_name}`} secondary={alreadyPublishedIds.includes(c.id) ? 'Đã công bố' : undefined} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField type="datetime-local" label="Thời gian mở" InputLabelProps={{ shrink: true }} value={start} onChange={(e)=>setStart(e.target.value)} />
          <TextField type="datetime-local" label="Thời gian đóng" InputLabelProps={{ shrink: true }} value={end} onChange={(e)=>setEnd(e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>Cho phép tải về</InputLabel>
            <Select label="Cho phép tải về" value={allowDownload ? 'true' : 'false'} onChange={(e)=> setAllowDownload(e.target.value==='true')}>
              <MenuItem value="true">Có</MenuItem>
              <MenuItem value="false">Không</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handlePublish} disabled={selected.length===0 || submitting} startIcon={submitting ? <CircularProgress size={18} /> : <Publish />}>Công bố</Button>
      </DialogActions>
    </Dialog>
  )
}

const UploadVersionButton = ({ material, onUploaded }) => {
  const dispatch = useDispatch()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await dispatch(uploadVersion({ id: material.id, formData: fd })).unwrap()
      setFile(null)
      onUploaded?.()
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button size="small" variant="outlined" component="label" startIcon={<CloudUpload />}>
        Tải phiên bản
        <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </Button>
      <Button size="small" variant="contained" disabled={!file || uploading} onClick={handleUpload} startIcon={uploading ? <CircularProgress size={16} /> : <UploadFile />}>Gửi</Button>
    </Stack>
  )
}

const DeleteConfirmDialog = ({ open, onClose, ids = [], onSoftDelete, onPurge }) => {
  const [processing, setProcessing] = useState(false)
  const handleSoft = async () => { setProcessing(true); await onSoftDelete?.(ids); setProcessing(false) }
  const handlePurge = async () => { setProcessing(true); await onPurge?.(ids); setProcessing(false) }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Xóa tài liệu</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">Bạn muốn xóa tạm vào Thùng rác hay xóa vĩnh viễn?</Typography>
        <Typography variant="caption" color="text.secondary">Đã chọn {ids.length} mục.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button startIcon={<DeleteOutline />} onClick={handleSoft} disabled={processing}>Xóa tạm</Button>
        <Button startIcon={<DeleteForever />} color="error" onClick={handlePurge} disabled={processing}>Xóa vĩnh viễn</Button>
      </DialogActions>
    </Dialog>
  )
}

const RestoreButton = ({ materialId, onDone }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const handleRestore = async () => {
    try {
      setLoading(true)
      await dispatch(restoreMaterial(materialId)).unwrap()
      onDone?.()
    } catch (e) {
      alert(typeof e === 'string' ? e : (e?.error || 'Khôi phục thất bại'))
    } finally {
      setLoading(false)
    }
  }
  return <Button size="small" variant="outlined" onClick={handleRestore} disabled={loading}>Khôi phục</Button>
}

const PurgeButton = ({ materialId, onDone }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const handlePurge = async () => {
    if (!confirm('Xóa vĩnh viễn tài liệu này? Thao tác không thể hoàn tác.')) return
    try {
      setLoading(true)
      await dispatch(purgeMaterial(materialId)).unwrap()
      onDone?.()
    } catch (e) {
      alert(typeof e === 'string' ? e : (e?.error || 'Xóa vĩnh viễn thất bại. Đảm bảo tài liệu đã hủy công bố.'))
    } finally {
      setLoading(false)
    }
  }
  return <Button size="small" color="error" variant="contained" onClick={handlePurge} disabled={loading}>Xóa vĩnh viễn</Button>
}

const UnpublishButton = ({ materialId, onDone }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="small" color="error" variant="outlined" onClick={() => setOpen(true)}>Hủy công bố</Button>
      <UnpublishDialog open={open} onClose={() => setOpen(false)} materialId={materialId} onUnpublished={() => { setOpen(false); onDone?.() }} />
    </>
  )
}

const UnpublishDialog = ({ open, onClose, materialId, onUnpublished }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [publishedClassIds, setPublishedClassIds] = useState([])
  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([
      materialLibraryService.get(materialId),
      classService.getClasses(),
    ])
      .then(([matRes, classesRes]) => {
        const m = matRes.data || {}
        const pubs = Array.isArray(m.publications) ? m.publications : []
        setPublishedClassIds(pubs.map((p) => p.class_obj))
        const clsData = classesRes.data || []
        const items = Array.isArray(clsData?.results)
          ? clsData.results
          : Array.isArray(clsData)
          ? clsData
          : Array.isArray(clsData?.data)
          ? clsData.data
          : []
        // Only show classes currently published
        setClasses(items.filter((c) => pubs.findIndex((p) => p.class_obj === c.id) > -1))
      })
      .catch(() => {
        setClasses([])
        setPublishedClassIds([])
      })
      .finally(() => setLoading(false))
  }, [open, materialId])

  const handleUnpublish = async () => {
    if (selected.length === 0) return
    try {
      await dispatch(
        unpublishMaterial({ id: materialId, payload: { class_ids: selected.map((c) => c.id || c) } })
      ).unwrap()
      onUnpublished?.()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Hủy công bố tài liệu khỏi lớp</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress /></Stack>
        ) : (
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Lớp đã công bố</InputLabel>
              <Select
                multiple
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                input={<OutlinedInput label="Lớp đã công bố" />}
                renderValue={(selected) => selected.map((s) => (s.class_id || s)).join(', ')}
              >
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c}>
                    <Checkbox checked={selected.findIndex((s)=> (s.id||s)===c.id) > -1} />
                    <ListItemText primary={`${c.class_id} - ${c.class_name}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {classes.length === 0 && (
              <Typography variant="body2" color="text.secondary">Không có lớp nào đang được công bố.</Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" color="error" disabled={selected.length===0} onClick={handleUnpublish}>Hủy công bố</Button>
      </DialogActions>
    </Dialog>
  )
}

const PublishedListButton = ({ materialId }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="small" onClick={() => setOpen(true)} sx={{ textTransform: 'none' }}>Xem lớp</Button>
      <PublishedListDialog open={open} onClose={() => setOpen(false)} materialId={materialId} />
    </>
  )
}

const PublishedListDialog = ({ open, onClose, materialId }) => {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([
      materialLibraryService.get(materialId),
      classService.getClasses(),
    ])
      .then(([matRes, classesRes]) => {
        const pubs = Array.isArray(matRes.data?.publications) ? matRes.data.publications : []
        const clsData = classesRes.data || []
        const items = Array.isArray(clsData?.results) ? clsData.results : Array.isArray(clsData) ? clsData : Array.isArray(clsData?.data) ? clsData.data : []
        const list = pubs.map((p) => {
          const cls = items.find((c) => c.id === p.class_obj)
          return {
            id: p.class_obj,
            class_id: cls?.class_id || p.class_obj,
            class_name: cls?.class_name || '',
            start: p.publish_start_at,
            end: p.publish_end_at,
            allow_download: p.allow_download,
          }
        })
        setRows(list)
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [open, materialId])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Đã công bố tới lớp</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress /></Stack>
        ) : rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Chưa công bố tới lớp nào.</Typography>
        ) : (
          <Stack spacing={1}>
            {rows.map((r) => (
              <Box key={r.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600}>{r.class_id} - {r.class_name}</Typography>
                <Typography variant="caption" color="text.secondary">Mở: {r.start || '—'} • Đóng: {r.end || '—'} • {r.allow_download ? 'Cho tải về' : 'Chỉ xem'}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default Materials
