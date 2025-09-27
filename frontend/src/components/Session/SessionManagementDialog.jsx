import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  IndeterminateCheckBox as IndeterminateCheckBoxIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material'
import attendanceService from '../../services/attendanceService'
import EditSessionDialog from './EditSessionDialog'

const SessionManagementDialog = ({ 
  open, 
  onClose, 
  sessions = [], 
  onSessionsChange,
  classId 
}) => {
  const [selectedSessions, setSelectedSessions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [anchorEl, setAnchorEl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)

  // Filter sessions based on search and type
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.session_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || session.session_type === filterType
    
    return matchesSearch && matchesType
  })

  const handleSelectAll = () => {
    if (selectedSessions.length === filteredSessions.length) {
      setSelectedSessions([])
    } else {
      setSelectedSessions(filteredSessions.map(s => s.id))
    }
  }

  const handleSelectSession = (sessionId) => {
    setSelectedSessions(prev => {
      if (prev.includes(sessionId)) {
        return prev.filter(id => id !== sessionId)
      } else {
        return [...prev, sessionId]
      }
    })
  }

  const handleBatchDelete = async () => {
    if (selectedSessions.length === 0) {
      alert('Vui lòng chọn ít nhất một buổi học')
      return
    }

    const sessionNames = sessions
      .filter(s => selectedSessions.includes(s.id))
      .map(s => s.session_name)
      .join(', ')

    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedSessions.length} buổi học?\n\nCác buổi: ${sessionNames}`)) {
      return
    }

    setLoading(true)
    let successCount = 0
    let failCount = 0

    for (const sessionId of selectedSessions) {
      try {
        await attendanceService.deleteSession(sessionId)
        successCount++
      } catch (error) {
        console.error(`Failed to delete session ${sessionId}:`, error)
        failCount++
      }
    }

    setLoading(false)
    
    if (successCount > 0) {
      onSessionsChange()
      setSelectedSessions([])
    }

    if (failCount > 0) {
      alert(`Đã xóa ${successCount} buổi học. ${failCount} buổi gặp lỗi.`)
    } else {
      alert(`Đã xóa thành công ${successCount} buổi học!`)
    }
  }

  const handleDuplicateSessions = async () => {
    if (selectedSessions.length === 0) {
      alert('Vui lòng chọn ít nhất một buổi học để nhân đôi')
      return
    }

    setLoading(true)
    let successCount = 0

    for (const sessionId of selectedSessions) {
      try {
        await attendanceService.duplicateSession(sessionId, {
          count: 1,
          date_increment: 7,
          name_pattern: '{original} (Copy)'
        })
        successCount++
      } catch (error) {
        console.error(`Failed to duplicate session ${sessionId}:`, error)
      }
    }

    setLoading(false)
    
    if (successCount > 0) {
      onSessionsChange()
      setSelectedSessions([])
      alert(`Đã nhân đôi thành công ${successCount} buổi học!`)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN')
  }

  const formatTime = (timeStr) => {
    return timeStr ? timeStr.slice(0, 5) : '-'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Quản lý buổi học</Typography>
          <Box display="flex" gap={1}>
            {selectedSessions.length > 0 && (
              <>
                <Chip
                  label={`Đã chọn ${selectedSessions.length}`}
                  color="primary"
                  onDelete={() => setSelectedSessions([])}
                />
                <Button
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={handleDuplicateSessions}
                  disabled={loading}
                >
                  Nhân đôi
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBatchDelete}
                  disabled={loading}
                >
                  Xóa
                </Button>
              </>
            )}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Search and Filter */}
        <Box display="flex" gap={2} mb={2}>
          <TextField
            placeholder="Tìm kiếm buổi học..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="lecture">Lý thuyết</MenuItem>
            <MenuItem value="practice">Thực hành</MenuItem>
            <MenuItem value="exam">Kiểm tra</MenuItem>
          </TextField>
        </Box>

        {/* Sessions Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedSessions.length > 0 && selectedSessions.length < filteredSessions.length}
                    checked={filteredSessions.length > 0 && selectedSessions.length === filteredSessions.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Buổi học</TableCell>
                <TableCell>Ngày</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      Không tìm thấy buổi học nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedSessions.includes(session.id)}
                        onChange={() => handleSelectSession(session.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {session.session_name}
                        </Typography>
                        {session.description && (
                          <Typography variant="caption" color="text.secondary">
                            {session.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(session.session_date)}</TableCell>
                    <TableCell>
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </TableCell>
                    <TableCell>{session.location || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          session.session_type === 'practice' ? 'Thực hành' :
                          session.session_type === 'exam' ? 'Kiểm tra' : 'Lý thuyết'
                        }
                        size="small"
                        color={
                          session.session_type === 'practice' ? 'info' :
                          session.session_type === 'exam' ? 'warning' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        <Tooltip title="Tạo QR điểm danh">
                          <IconButton size="small" color="primary">
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" onClick={() => { setEditingSession(session); setEditOpen(true) }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={async () => {
                              if (window.confirm(`Xóa buổi học "${session.session_name}"?`)) {
                                try {
                                  await attendanceService.deleteSession(session.id)
                                  onSessionsChange()
                                  alert('Đã xóa buổi học thành công!')
                                } catch (error) {
                                  alert('Không thể xóa buổi học: ' + error.message)
                                }
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary */}
        <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            Tổng cộng: {filteredSessions.length} buổi học
            {selectedSessions.length > 0 && ` • Đã chọn: ${selectedSessions.length}`}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>

      {/* Edit dialog */}
      <EditSessionDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        session={editingSession}
        onSaved={() => { setEditOpen(false); onSessionsChange?.() }}
      />
    </Dialog>
  )
}

export default SessionManagementDialog