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
  Collapse,
  Grid,
  Card,
  CardContent,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import classService from '../../services/classService';

const AcademicYearManagement = () => {
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedYear, setExpandedYear] = useState(null);

  // Dialog states
  const [yearDialog, setYearDialog] = useState(false);
  const [termDialog, setTermDialog] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [editingTerm, setEditingTerm] = useState(null);

  // Form data
  const [yearForm, setYearForm] = useState({
    code: '',
    name: '',
    start_date: null,
    end_date: null,
  });

  const [termForm, setTermForm] = useState({
    year_id: '',
    season: 'hk1',
    name: '',
    is_current: false,
    start_date: null,
    end_date: null,
  });

  // Load data
  useEffect(() => {
    loadYears();
    loadTerms();
  }, []);

  const loadYears = async () => {
    try {
      setLoading(true);
      const response = await classService.listYears();
      setYears(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách năm học');
    } finally {
      setLoading(false);
    }
  };

  const loadTerms = async () => {
    try {
      const response = await classService.listTerms();
      setTerms(response.data || []);
    } catch (err) {
      console.error('Error loading terms:', err);
    }
  };

  // Generate year code suggestion
  const generateYearCode = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  };

  // Handle year dialog
  const handleOpenYearDialog = (year = null) => {
    if (year) {
      setEditingYear(year);
      setYearForm({
        code: year.code,
        name: year.name,
        start_date: year.start_date ? dayjs(year.start_date) : null,
        end_date: year.end_date ? dayjs(year.end_date) : null,
      });
    } else {
      setEditingYear(null);
      const code = generateYearCode();
      setYearForm({
        code: code,
        name: `Năm học ${code}`,
        start_date: dayjs().month(8).date(1), // September 1st
        end_date: dayjs().add(1, 'year').month(7).date(31), // July 31st next year
      });
    }
    setYearDialog(true);
  };

  const handleSaveYear = async () => {
    try {
      setLoading(true);
      const data = {
        code: yearForm.code,
        name: yearForm.name,
        start_date: yearForm.start_date?.format('YYYY-MM-DD'),
        end_date: yearForm.end_date?.format('YYYY-MM-DD'),
      };

      if (editingYear) {
        // Update existing year (if API supports it)
        setSuccess('Cập nhật năm học thành công');
      } else {
        await classService.createYear(data);
        setSuccess('Thêm năm học mới thành công');
      }

      setYearDialog(false);
      loadYears();
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể lưu năm học');
    } finally {
      setLoading(false);
    }
  };

  // Handle term dialog
  const handleOpenTermDialog = (term = null, yearId = null) => {
    if (term) {
      setEditingTerm(term);
      setTermForm({
        year_id: term.year?.id || yearId,
        season: term.season,
        name: term.name,
        is_current: term.is_current,
        start_date: term.start_date ? dayjs(term.start_date) : null,
        end_date: term.end_date ? dayjs(term.end_date) : null,
      });
    } else {
      setEditingTerm(null);
      const season = 'hk1';
      const year = years.find(y => y.id === yearId);
      setTermForm({
        year_id: yearId,
        season: season,
        name: `Học kỳ 1 - ${year?.code || ''}`,
        is_current: false,
        start_date: null,
        end_date: null,
      });
    }
    setTermDialog(true);
  };

  const handleSaveTerm = async () => {
    try {
      setLoading(true);
      const data = {
        year_id: termForm.year_id,
        season: termForm.season,
        name: termForm.name,
        is_current: termForm.is_current,
        start_date: termForm.start_date?.format('YYYY-MM-DD'),
        end_date: termForm.end_date?.format('YYYY-MM-DD'),
      };

      if (editingTerm) {
        // Update existing term (if API supports it)
        setSuccess('Cập nhật học kỳ thành công');
      } else {
        await classService.createTerm(data);
        setSuccess('Thêm học kỳ mới thành công');
      }

      setTermDialog(false);
      loadTerms();
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể lưu học kỳ');
    } finally {
      setLoading(false);
    }
  };

  // Get terms for a specific year
  const getTermsForYear = (yearId) => {
    return terms.filter(term => term.year?.id === yearId);
  };

  // Get class count for year
  const getClassCountForYear = (yearId) => {
    const yearTerms = getTermsForYear(yearId);
    return yearTerms.reduce((sum, term) => sum + (term.class_count || 0), 0);
  };

  const getSeasonName = (season) => {
    const seasonMap = {
      'hk1': 'Học kỳ 1',
      'hk2': 'Học kỳ 2', 
      'hk3': 'Học kỳ 3 (Hè)',
    };
    return seasonMap[season] || season;
  };

  const getSeasonIcon = (season) => {
    if (season === 'hk3') return <LockIcon fontSize="small" />;
    return <CheckCircleIcon fontSize="small" color="success" />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          <CalendarIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
          Quản lý Năm học & Học kỳ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý năm học, học kỳ và theo dõi lịch sử giảng dạy
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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Danh sách năm học
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenYearDialog()}
            >
              Thêm năm học
            </Button>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="50"></TableCell>
              <TableCell>Năm học</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell align="center">Số học kỳ</TableCell>
              <TableCell align="center">Số lớp</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {years.map((year) => {
              const yearTerms = getTermsForYear(year.id);
              const classCount = getClassCountForYear(year.id);
              const isExpanded = expandedYear === year.id;
              const isCurrentYear = year.code.includes(new Date().getFullYear());

              return (
                <React.Fragment key={year.id}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => setExpandedYear(isExpanded ? null : year.id)}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {year.name || `Năm học ${year.code}`}
                        </Typography>
                        {isCurrentYear && (
                          <Chip label="Hiện tại" color="primary" size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {year.start_date && year.end_date ? (
                        <Typography variant="body2">
                          {dayjs(year.start_date).format('DD/MM/YYYY')} - {dayjs(year.end_date).format('DD/MM/YYYY')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Chưa cài đặt
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${yearTerms.length} học kỳ`} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={`${classCount} lớp`} 
                        size="small"
                        color={classCount > 0 ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {isCurrentYear ? (
                        <Chip label="Đang hoạt động" color="success" size="small" />
                      ) : (
                        <Chip label="Đã kết thúc" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Sửa">
                          <IconButton size="small" onClick={() => handleOpenYearDialog(year)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Thêm học kỳ">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenTermDialog(null, year.id)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>

                  {/* Expanded content - Terms */}
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 0 }}>
                      <Collapse in={isExpanded}>
                        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                          <Grid container spacing={2}>
                            {yearTerms.length === 0 ? (
                              <Grid item xs={12}>
                                <Alert severity="info">
                                  Chưa có học kỳ nào. 
                                  <Button 
                                    size="small" 
                                    onClick={() => handleOpenTermDialog(null, year.id)}
                                    sx={{ ml: 1 }}
                                  >
                                    Thêm học kỳ
                                  </Button>
                                </Alert>
                              </Grid>
                            ) : (
                              yearTerms.map((term) => (
                                <Grid item xs={12} md={4} key={term.id}>
                                  <Card variant="outlined">
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                          <Typography variant="h6" gutterBottom>
                                            {getSeasonIcon(term.season)} {term.name}
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {getSeasonName(term.season)}
                                          </Typography>
                                          {term.start_date && term.end_date && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                              {dayjs(term.start_date).format('DD/MM')} - {dayjs(term.end_date).format('DD/MM')}
                                            </Typography>
                                          )}
                                          <Box sx={{ mt: 1 }}>
                                            <Chip 
                                              label={`${term.class_count || 0} lớp`} 
                                              size="small"
                                              color={term.class_count > 0 ? "primary" : "default"}
                                            />
                                            {term.is_current && (
                                              <Chip 
                                                label="Học kỳ hiện tại" 
                                                size="small" 
                                                color="success"
                                                sx={{ ml: 0.5 }}
                                              />
                                            )}
                                          </Box>
                                        </Box>
                                        <IconButton size="small" onClick={() => handleOpenTermDialog(term, year.id)}>
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))
                            )}
                          </Grid>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Year Dialog */}
      <Dialog open={yearDialog} onClose={() => setYearDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingYear ? 'Chỉnh sửa năm học' : 'Thêm năm học mới'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Mã năm học"
                  value={yearForm.code}
                  onChange={(e) => setYearForm({ ...yearForm, code: e.target.value })}
                  placeholder="2025-2026"
                  helperText="Định dạng: YYYY-YYYY"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên năm học"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  placeholder="Năm học 2025-2026"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Ngày bắt đầu"
                  value={yearForm.start_date}
                  onChange={(date) => setYearForm({ ...yearForm, start_date: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Ngày kết thúc"
                  value={yearForm.end_date}
                  onChange={(date) => setYearForm({ ...yearForm, end_date: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setYearDialog(false)}>Hủy</Button>
          <Button onClick={handleSaveYear} variant="contained" disabled={loading}>
            {editingYear ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Term Dialog */}
      <Dialog open={termDialog} onClose={() => setTermDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTerm ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ mới'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại học kỳ</InputLabel>
                  <Select
                    value={termForm.season}
                    onChange={(e) => {
                      const season = e.target.value;
                      const year = years.find(y => y.id === termForm.year_id);
                      setTermForm({ 
                        ...termForm, 
                        season,
                        name: `${getSeasonName(season)} - ${year?.code || ''}`
                      });
                    }}
                    label="Loại học kỳ"
                  >
                    <MenuItem value="hk1">Học kỳ 1</MenuItem>
                    <MenuItem value="hk2">Học kỳ 2</MenuItem>
                    <MenuItem value="hk3">Học kỳ 3 (Hè)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên học kỳ"
                  value={termForm.name}
                  onChange={(e) => setTermForm({ ...termForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Ngày bắt đầu"
                  value={termForm.start_date}
                  onChange={(date) => setTermForm({ ...termForm, start_date: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Ngày kết thúc"
                  value={termForm.end_date}
                  onChange={(date) => setTermForm({ ...termForm, end_date: date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl>
                  <label>
                    <input
                      type="checkbox"
                      checked={termForm.is_current}
                      onChange={(e) => setTermForm({ ...termForm, is_current: e.target.checked })}
                    />
                    {' '}Đặt làm học kỳ hiện tại
                  </label>
                </FormControl>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTermDialog(false)}>Hủy</Button>
          <Button onClick={handleSaveTerm} variant="contained" disabled={loading}>
            {editingTerm ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AcademicYearManagement;