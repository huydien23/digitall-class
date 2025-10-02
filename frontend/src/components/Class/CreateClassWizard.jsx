import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  InputAdornment,
  Checkbox,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Book as BookIcon,
  Class as ClassIcon,
  Group as GroupIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon,
  ChevronRight as NextIcon,
  ChevronLeft as BackIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import classService from '../../services/classService';

const CreateClassWizard = ({ onClose }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Master data
  const [years, setYears] = useState([]);
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sourceClasses, setSourceClasses] = useState([]);

  // Form state
  const [createMode, setCreateMode] = useState('new'); // 'new' or 'copy'
  const [formData, setFormData] = useState({
    // Step 1 - Năm học & Học kỳ
    year_id: '',
    term_id: '',
    
    // Step 2 - Môn học
    subject_id: '',
    
    // Step 3 - Thông tin lớp
    class_name: '',
    max_students: 50,
    description: '',
    
    // Copy mode
    source_class_id: '',
    copy_students: true,
    copy_materials: true,
  });

  // Subject creation modal state
  const [showCreateSubjectModal, setShowCreateSubjectModal] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    description: '',
  });
  const [autoGenerateCode, setAutoGenerateCode] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [yearsRes, subjectsRes] = await Promise.all([
        classService.listYears(),
        classService.listSubjects(),
      ]);
      
      setYears(yearsRes.data || []);
      setSubjects(subjectsRes.data || []);
      
      // Auto-select current year
      const currentYear = yearsRes.data.find(y => 
        y.code.includes(new Date().getFullYear())
      );
      if (currentYear) {
        setFormData(prev => ({ ...prev, year_id: currentYear.id }));
        loadTermsForYear(currentYear.id);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const loadTermsForYear = async (yearId) => {
    try {
      const res = await classService.listTerms({ year_id: yearId });
      setTerms(res.data || []);
      
      // Auto-select current term if exists
      const currentTerm = res.data.find(t => t.is_current);
      if (currentTerm) {
        setFormData(prev => ({ ...prev, term_id: currentTerm.id }));
      }
    } catch (err) {
      console.error('Error loading terms:', err);
    }
  };

  const loadSourceClasses = async () => {
    if (createMode !== 'copy') return;
    
    try {
      setLoading(true);
      // Load classes from previous years/terms
      const res = await classService.getClasses({});
      const classes = res.data?.results || res.data || [];
      
      // Group by year and term
      const grouped = classes.reduce((acc, cls) => {
        const key = `${cls.term?.year?.code || 'Unknown'} - ${cls.term?.name || 'Unknown'}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(cls);
        return acc;
      }, {});
      
      setSourceClasses(grouped);
    } catch (err) {
      setError('Không thể tải danh sách lớp cũ');
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (yearId) => {
    setFormData(prev => ({ ...prev, year_id: yearId, term_id: '' }));
    loadTermsForYear(yearId);
  };

  const handleNext = () => {
    if (activeStep === 0 && createMode === 'copy') {
      loadSourceClasses();
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return formData.year_id && formData.term_id;
      case 1:
        if (createMode === 'new') {
          return formData.subject_id;
        } else {
          return formData.source_class_id;
        }
      case 2:
        return formData.class_name.trim() !== '';
      default:
        return false;
    }
  };

  const handleCreateClass = async () => {
    try {
      setLoading(true);
      setError('');

      if (createMode === 'new') {
        // Create new class
        const payload = {
          term_id: formData.term_id,
          subject_id: formData.subject_id,
          class_name: formData.class_name,
          max_students: formData.max_students,
          description: formData.description,
        };
        
        console.log('Create class payload:', payload);
        const res = await classService.createClass(payload);
        console.log('Create class response:', res.data);
        const newClassId = res.data.id;
        
        // Navigate to class detail
        navigate(`/classes/${newClassId}`);
      } else {
        // Copy from existing class
        const res = await classService.copyClass({
          source_class_id: formData.source_class_id,
          target_term_id: formData.term_id,
          new_class_name: formData.class_name,
          options: {
            copy_materials: formData.copy_materials,
          }
        });
        
        const newClassId = res.data.id;
        
        // Copy students if selected
        if (formData.copy_students) {
          await classService.importRoster({
            source_class_id: formData.source_class_id,
            target_class_id: newClassId,
          });
        }
        
        navigate(`/classes/${newClassId}`);
      }
    } catch (err) {
      let errorMsg = 'Không thể tạo lớp học';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.error === 'string') {
          errorMsg = data.error;
        } else if (data.details && typeof data.details === 'object') {
          errorMsg = Object.values(data.details).flat().join(', ');
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    try {
      setLoading(true);
      const payload = {
        code: autoGenerateCode ? '' : subjectFormData.code.trim().toUpperCase(),
        name: subjectFormData.name.trim(),
        credits: subjectFormData.credits,
        description: subjectFormData.description.trim(),
      };
      
      const response = await classService.createSubject(payload);
      console.log('Create subject response:', response.data);
      const newSubject = response.data;
      
      // Refresh subjects list
      const subjectsRes = await classService.listSubjects();
      console.log('List subjects response:', subjectsRes.data);
      setSubjects(subjectsRes.data || []);
      
      // Auto-select the new subject
      setFormData(prev => ({ ...prev, subject_id: newSubject.id }));
      
      // Close modal and reset form
      setShowCreateSubjectModal(false);
      setSubjectFormData({ code: '', name: '', credits: 3, description: '' });
      setAutoGenerateCode(true);
      
      setError(''); // Clear any previous errors
    } catch (err) {
      let errorMsg = 'Không thể tạo môn học';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data.error === 'string') {
          errorMsg = data.error;
        } else if (typeof data.details === 'string') {
          errorMsg = data.details;
        } else if (data.details && typeof data.details === 'object') {
          // Handle validation errors (object with field names)
          errorMsg = Object.values(data.details).flat().join(', ');
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedYear = () => years.find(y => y.id === formData.year_id);
  const getSelectedTerm = () => terms.find(t => t.id === formData.term_id);
  const getSelectedSubject = () => subjects.find(s => s.id === formData.subject_id);

  const steps = createMode === 'new' 
    ? ['Chọn học kỳ', 'Chọn môn học', 'Thông tin lớp', 'Xác nhận']
    : ['Chọn học kỳ', 'Chọn lớp gốc', 'Thông tin lớp mới', 'Xác nhận'];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Tạo lớp học mới
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Create Mode Selection */}
        {activeStep === 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Chọn cách tạo lớp
            </Typography>
            <RadioGroup
              value={createMode}
              onChange={(e) => setCreateMode(e.target.value)}
              row
            >
              <FormControlLabel
                value="new"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Tạo mới hoàn toàn</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tạo lớp mới từ đầu
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="copy"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Sao chép từ lớp cũ</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sao chép thông tin, sinh viên, tài liệu
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Box>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Chọn năm học & học kỳ */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Chọn học kỳ</Typography>
            </StepLabel>
            <StepContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Năm học</InputLabel>
                    <Select
                      value={formData.year_id}
                      onChange={(e) => handleYearChange(e.target.value)}
                      label="Năm học"
                    >
                      {years.map(year => (
                        <MenuItem key={year.id} value={year.id}>
                          {year.name || `Năm học ${year.code}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={!formData.year_id}>
                    <InputLabel>Học kỳ</InputLabel>
                    <Select
                      value={formData.term_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, term_id: e.target.value }))}
                      label="Học kỳ"
                    >
                      {terms.map(term => (
                        <MenuItem key={term.id} value={term.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {term.name}
                            {term.is_current && (
                              <Chip label="Hiện tại" size="small" color="primary" />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  endIcon={<NextIcon />}
                >
                  Tiếp theo
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Chọn môn học hoặc lớp gốc */}
          <Step>
            <StepLabel>
              <Typography variant="h6">
                {createMode === 'new' ? 'Chọn môn học' : 'Chọn lớp gốc'}
              </Typography>
            </StepLabel>
            <StepContent>
              {createMode === 'new' ? (
                <Box>
                  <TextField
                    fullWidth
                    label="Tìm kiếm môn học"
                    variant="outlined"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BookIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Môn học</InputLabel>
                      <Select
                        value={formData.subject_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject_id: e.target.value }))}
                        label="Môn học"
                      >
                        {subjects.map(subject => (
                          <MenuItem key={subject.id} value={subject.id}>
                            <Box>
                              <Typography variant="body1">
                                {subject.code} - {subject.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {subject.credits} tín chỉ
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setShowCreateSubjectModal(true)}
                      sx={{ minWidth: 200, height: 56 }}
                    >
                      Tạo môn học mới
                    </Button>
                  </Box>
                  
                  {subjects.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Chưa có môn học nào. Hãy tạo môn học mới!
                    </Alert>
                  )}
                </Box>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Chọn lớp học cũ để sao chép thông tin
                  </Alert>
                  
                  {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {Object.entries(sourceClasses).map(([termName, classes]) => (
                        <Box key={termName} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            {termName}
                          </Typography>
                          <List dense>
                            {classes.map(cls => (
                              <ListItem
                                key={cls.id}
                                button
                                selected={formData.source_class_id === cls.id}
                                onClick={() => setFormData(prev => ({ 
                                  ...prev, 
                                  source_class_id: cls.id,
                                  subject_id: cls.subject?.id || '',
                                }))}
                              >
                                <ListItemText
                                  primary={`${cls.class_id} - ${cls.class_name}`}
                                  secondary={`${cls.subject?.name || 'N/A'} • ${cls.current_students_count || 0} sinh viên`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {createMode === 'copy' && formData.source_class_id && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Tùy chọn sao chép:
                      </Typography>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.copy_students}
                            onChange={(e) => setFormData(prev => ({ ...prev, copy_students: e.target.checked }))}
                          />
                        }
                        label="Sao chép danh sách sinh viên"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.copy_materials}
                            onChange={(e) => setFormData(prev => ({ ...prev, copy_materials: e.target.checked }))}
                          />
                        }
                        label="Sao chép tài liệu giảng dạy"
                      />
                    </Box>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack} startIcon={<BackIcon />}>
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  endIcon={<NextIcon />}
                >
                  Tiếp theo
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Thông tin lớp */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Thông tin lớp học</Typography>
            </StepLabel>
            <StepContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên lớp"
                    value={formData.class_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
                    placeholder="Ví dụ: DH22TIN01"
                    helperText="Tên lớp sẽ được kết hợp với môn học"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Sĩ số tối đa"
                    value={formData.max_students}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_students: parseInt(e.target.value) || 50 }))}
                    InputProps={{ inputProps: { min: 1, max: 200 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Mô tả (tùy chọn)"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Thêm mô tả về lớp học..."
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack} startIcon={<BackIcon />}>
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  endIcon={<NextIcon />}
                >
                  Tiếp theo
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Xác nhận */}
          <Step>
            <StepLabel>
              <Typography variant="h6">Xác nhận thông tin</Typography>
            </StepLabel>
            <StepContent>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Thông tin lớp học mới
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Năm học</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getSelectedYear()?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Học kỳ</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getSelectedTerm()?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Môn học</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {getSelectedSubject()?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Tên lớp</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formData.class_name}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Sĩ số tối đa</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formData.max_students} sinh viên
                      </Typography>
                    </Grid>

                    {createMode === 'copy' && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Sao chép từ lớp cũ:
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                          {formData.copy_students && (
                            <Chip
                              icon={<CheckIcon />}
                              label="Danh sách sinh viên"
                              size="small"
                              color="success"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          )}
                          {formData.copy_materials && (
                            <Chip
                              icon={<CheckIcon />}
                              label="Tài liệu giảng dạy"
                              size="small"
                              color="success"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          )}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <Button onClick={handleBack} startIcon={<BackIcon />}>
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateClass}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                >
                  {loading ? 'Đang tạo...' : 'Tạo lớp học'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
        </Box>
      </Paper>

      {/* Create Subject Modal */}
      <Dialog
        open={showCreateSubjectModal}
        onClose={() => !loading && setShowCreateSubjectModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookIcon color="primary" />
            Tạo môn học mới
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoGenerateCode}
                  onChange={(e) => {
                    setAutoGenerateCode(e.target.checked);
                    if (e.target.checked) {
                      setSubjectFormData(prev => ({ ...prev, code: '' }));
                    }
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Tự động tạo mã môn học</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {autoGenerateCode 
                      ? 'Mã sẽ được tạo tự động từ tên môn (VD: "Lập trình Python" → "PRPY100")' 
                      : 'Nhập mã môn thủ công'}
                  </Typography>
                </Box>
              }
            />
            
            {!autoGenerateCode && (
              <TextField
                fullWidth
                label="Mã môn học"
                value={subjectFormData.code}
                onChange={(e) => setSubjectFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Ví dụ: CS101, MATH201"
                helperText="Mã môn sẽ được chuyển thành chữ hoa"
                InputProps={{
                  inputProps: { maxLength: 32 }
                }}
              />
            )}
            
            <TextField
              fullWidth
              label="Tên môn học"
              value={subjectFormData.name}
              onChange={(e) => setSubjectFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ví dụ: Lập trình Python nâng cao"
              InputProps={{
                inputProps: { maxLength: 128 }
              }}
            />
            
            <TextField
              fullWidth
              type="number"
              label="Số tín chỉ"
              value={subjectFormData.credits}
              onChange={(e) => setSubjectFormData(prev => ({ ...prev, credits: Math.max(1, Math.min(6, parseInt(e.target.value) || 3)) }))}
              InputProps={{
                inputProps: { min: 1, max: 6 }
              }}
              helperText="Từ 1 đến 6 tín chỉ"
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Mô tả (tùy chọn)"
              value={subjectFormData.description}
              onChange={(e) => setSubjectFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về nội dung môn học..."
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => {
              setShowCreateSubjectModal(false);
              setSubjectFormData({ code: '', name: '', credits: 3, description: '' });
              setAutoGenerateCode(true);
            }} 
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSubject}
            disabled={
              loading || 
              !subjectFormData.name.trim() || 
              (!autoGenerateCode && !subjectFormData.code.trim())
            }
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Đang tạo...' : 'Tạo môn học'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateClassWizard;