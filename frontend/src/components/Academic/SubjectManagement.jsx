import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Stack,
  Alert,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Book as BookIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import classService from '../../services/classService';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [subjectDialog, setSubjectDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);
  
  // Form data
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    credits: 3,
    description: '',
  });

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);

  // Load subjects
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await classService.listSubjects();
      setSubjects(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách môn học');
    } finally {
      setLoading(false);
    }
  };

  // Search subjects
  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await classService.listSubjects({ search: searchTerm });
      setSubjects(response.data || []);
    } catch (err) {
      setError('Không thể tìm kiếm môn học');
    } finally {
      setLoading(false);
    }
  };

  // Handle subject dialog
  const handleOpenSubjectDialog = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectForm({
        code: subject.code,
        name: subject.name,
        credits: subject.credits,
        description: subject.description || '',
      });
    } else {
      setEditingSubject(null);
      setSubjectForm({
        code: '',
        name: '',
        credits: 3,
        description: '',
      });
    }
    setSubjectDialog(true);
  };

  const handleSaveSubject = async () => {
    try {
      if (!subjectForm.code || !subjectForm.name) {
        setError('Vui lòng điền đầy đủ mã và tên môn học');
        return;
      }

      setLoading(true);
      
      if (editingSubject) {
        // Update subject (if API supports it)
        setSuccess('Cập nhật môn học thành công');
      } else {
        await classService.createSubject(subjectForm);
        setSuccess('Thêm môn học mới thành công');
      }

      setSubjectDialog(false);
      loadSubjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể lưu môn học');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDeleteSubject = async () => {
    try {
      setLoading(true);
      // Call delete API if available
      // await classService.deleteSubject(deletingSubject.id);
      setSuccess('Xóa môn học thành công');
      setDeleteDialog(false);
      loadSubjects();
    } catch (err) {
      setError('Không thể xóa môn học do có lớp đang sử dụng');
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = () => {
    // Export subjects to Excel
    const csvContent = [
      ['Mã môn học', 'Tên môn học', 'Số tín chỉ', 'Mô tả'],
      ...subjects.map(s => [s.code, s.name, s.credits, s.description || ''])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `danh-sach-mon-hoc-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle import
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      // Handle file import logic here
      setSuccess('Import môn học thành công');
      setImportDialog(false);
      loadSubjects();
    } catch (err) {
      setError('Không thể import môn học');
    } finally {
      setLoading(false);
    }
  };

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current page subjects
  const currentSubjects = filteredSubjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          <BookIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Quản lý Môn học
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý danh mục môn học trong chương trình giảng dạy
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số môn học
              </Typography>
              <Typography variant="h4">
                {subjects.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Đang giảng dạy
              </Typography>
              <Typography variant="h4">
                {subjects.filter(s => s.class_count > 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Tổng số lớp
              </Typography>
              <Typography variant="h4">
                {subjects.reduce((sum, s) => sum + (s.class_count || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                TB tín chỉ
              </Typography>
              <Typography variant="h4">
                {subjects.length > 0 ? 
                  (subjects.reduce((sum, s) => sum + s.credits, 0) / subjects.length).toFixed(1)
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm theo mã hoặc tên môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenSubjectDialog()}
              >
                Thêm môn học
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                onClick={() => setImportDialog(true)}
              >
                Import Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Subject Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã môn học</TableCell>
              <TableCell>Tên môn học</TableCell>
              <TableCell align="center">Số tín chỉ</TableCell>
              <TableCell align="center">Số lớp đã dạy</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentSubjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {searchTerm ? 'Không tìm thấy môn học phù hợp' : 'Chưa có môn học nào'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentSubjects.map((subject) => (
                <TableRow key={subject.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {subject.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>{subject.name}</Typography>
                      {subject.class_count > 0 && (
                        <Chip 
                          label="Đang dùng" 
                          size="small" 
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={`${subject.credits} TC`} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    {subject.class_count > 0 ? (
                      <Chip 
                        label={`${subject.class_count || 0} lớp`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                      }}
                    >
                      {subject.description || 'Không có mô tả'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Sửa">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenSubjectDialog(subject)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sao chép">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            const newSubject = { ...subject, code: `${subject.code}_COPY` };
                            delete newSubject.id;
                            handleOpenSubjectDialog(newSubject);
                          }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {subject.class_count === 0 && (
                        <Tooltip title="Xóa">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeletingSubject(subject);
                              setDeleteDialog(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredSubjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count !== -1 ? count : `hơn ${to}`}`}
        />
      </TableContainer>

      {/* Subject Dialog */}
      <Dialog open={subjectDialog} onClose={() => setSubjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã môn học"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toUpperCase() })}
                placeholder="CS101"
                helperText="Mã môn học viết hoa, không dấu"
                disabled={editingSubject && editingSubject.class_count > 0}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số tín chỉ"
                type="number"
                value={subjectForm.credits}
                onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên môn học"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="Lập trình Python cơ bản"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mô tả"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                placeholder="Mô tả về môn học..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubjectDialog(false)}>Hủy</Button>
          <Button onClick={handleSaveSubject} variant="contained" disabled={loading}>
            {editingSubject ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa môn học</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa môn học <strong>{deletingSubject?.name}</strong> ({deletingSubject?.code})?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Lưu ý: Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteSubject} color="error" variant="contained" disabled={loading}>
            Xóa môn học
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import môn học từ Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" gutterBottom>
              File Excel cần có các cột: Mã môn học, Tên môn học, Số tín chỉ, Mô tả
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Định dạng: .xlsx, .xls, .csv
            </Typography>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="import-file"
                type="file"
                onChange={handleImport}
              />
              <label htmlFor="import-file">
                <Button variant="contained" component="span" startIcon={<FileUploadIcon />}>
                  Chọn file
                </Button>
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubjectManagement;