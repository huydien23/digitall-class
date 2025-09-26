import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  School,
  Email,
  Phone,
  AccountCircle,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import AuthUtils from '../../utils/authUtils';
import { DEPARTMENTS } from '../../utils/constants';

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    studentId: '',
    teacherId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear confirm password error when password changes
    if (name === 'password' && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };  const validateForm = () => {
    const newErrors = {};

    // First/Last name optional: only validate if provided
    if (formData.firstName?.trim() && formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Tên phải có ít nhất 2 ký tự';
    }
    if (formData.lastName?.trim() && formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Họ phải có ít nhất 2 ký tự';
    }

    // Phone optional: validate format only when provided
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (formData.phone?.trim() && !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Password validation
    const passwordValidation = AuthUtils.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Email validation
    const emailValidation = AuthUtils.validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    // Role-specific validation
    if (formData.role === 'student') {
      if (formData.studentId?.trim()) {
        const studentIdValidation = AuthUtils.validateStudentId(formData.studentId);
        if (!studentIdValidation.isValid) {
          newErrors.studentId = studentIdValidation.error;
        }
      }
    }

    if (formData.role === 'teacher') {
      const teacherIdValidation = AuthUtils.validateTeacherId(formData.teacherId);
      if (!teacherIdValidation.isValid) {
        newErrors.teacherId = teacherIdValidation.error;
      }
      if (!formData.department) {
        newErrors.department = 'Khoa là bắt buộc cho giảng viên';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');    try {
      // Prepare registration data (only include optional fields when provided)
      const registrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password_confirm: formData.confirmPassword,
        role: formData.role,
      };

      if (formData.firstName?.trim()) {
        registrationData.first_name = formData.firstName.trim();
      }
      if (formData.lastName?.trim()) {
        registrationData.last_name = formData.lastName.trim();
      }
      if (formData.phone?.trim()) {
        registrationData.phone = formData.phone.trim();
      }

      // Add role-specific fields
      if (formData.role === 'student') {
        if (formData.studentId?.trim()) {
          registrationData.student_id = formData.studentId.trim();
        }
        if (formData.department?.trim()) {
          registrationData.department = formData.department.trim();
        }
      }

      if (formData.role === 'teacher') {
        registrationData.teacher_id = formData.teacherId.trim();
        registrationData.department = formData.department.trim();
      }

      const result = await dispatch(register(registrationData)).unwrap();
      
      if (result?.requireApproval || result?.require_approval) {
        setMessage(result?.message || 'Đăng ký thành công! Vui lòng đợi admin phê duyệt.');
        // Redirect to pending approval page
        setTimeout(() => {
          navigate('/pending-approval');
        }, 2000);
      } else {
        setMessage(result?.message || 'Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        // Redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      let errText = 'Đăng ký thất bại. Vui lòng thử lại.';
      if (typeof error === 'string') errText = error;
      else if (error?.message) errText = error.message;
      else if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') errText = data;
        else if (data?.message) errText = data.message;
        else errText = Object.values(data).flat().join(', ');
      }
      setMessage(errText);
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Công nghệ thông tin',
    'Kế toán',
    'Quản trị kinh doanh',
    'Marketing',
    'Tài chính ngân hàng',
    'Logistics và Chuỗi cung ứng',
    'Thiết kế đồ họa',
    'Kiến trúc',
    'Khác'
  ];
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 25%, #4338ca 50%, #3730a3 75%, #312e81 100%)',
        p: 2,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          opacity: 0.8,
        }
      }}
    >
      <Container maxWidth="sm">
        <Slide direction="up" in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 2,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #6366f1, #4f46e5, #4338ca)',
              },
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2.5,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  mb: 3,
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                }}
              >
                <PersonAdd sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  letterSpacing: '-0.01em'
                }}
              >
                Đăng ký tài khoản
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                Tạo tài khoản mới để sử dụng hệ thống
              </Typography>
              
              <Typography variant="body2" sx={{ mt: 2 }}>
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#6366f1',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Đăng nhập tại đây
                </Link>
              </Typography>            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                {/* Vai trò */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="role-label">Vai trò</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      name="role"
                      value={formData.role}
                      label="Vai trò"
                      onChange={handleChange}
                      disabled={loading}
                      error={!!errors.role}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          '&:hover fieldset': {
                            borderColor: '#6366f1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: '2px'
                          },
                        },
                      }}
                    >
                      <MenuItem value="student">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <School fontSize="small" />
                          Sinh viên
                        </Box>
                      </MenuItem>
                      <MenuItem value="teacher">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountCircle fontSize="small" />
                          Giảng viên
                        </Box>
                      </MenuItem>
                      <MenuItem value="admin">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonAdd fontSize="small" />
                          Quản trị viên
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Họ (last name) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    label="Họ (tùy chọn)"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    placeholder="Nguyễn"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle sx={{ color: '#6366f1' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: '2px'
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Tên (first name) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="firstName"
                    name="firstName"
                    label="Tên (tùy chọn)"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    placeholder="Văn A"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle sx={{ color: '#6366f1' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: '2px'
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    label="Địa chỉ email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.email}
                    helperText={errors.email}
                    placeholder="example@email.com"
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#6366f1' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: '2px'
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Số điện thoại */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    placeholder="0123456789"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: '#6366f1' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: '2px'
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Mã sinh viên (chỉ hiển thị cho sinh viên) */}
                {formData.role === 'student' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="studentId"
                      name="studentId"
                      label="Mã sinh viên"
                      value={formData.studentId}
                      onChange={handleChange}
                      disabled={loading}
                      error={!!errors.studentId}
                      helperText={errors.studentId}
                      placeholder="6 chữ số (VD: 226514)"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          '&:hover fieldset': {
                            borderColor: '#6366f1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: '2px'
                          },
                        },
                      }}
                    />
                  </Grid>
                )}

                {/* Mã giảng viên (chỉ hiển thị cho giảng viên) */}
                {formData.role === 'teacher' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="teacherId"
                      name="teacherId"
                      label="Mã giảng viên"
                      value={formData.teacherId}
                      onChange={handleChange}
                      disabled={loading}
                      error={!!errors.teacherId}
                      helperText={errors.teacherId}
                      placeholder="GV + 4 số (VD: GV0921)"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          '&:hover fieldset': {
                            borderColor: '#6366f1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: '2px'
                          },
                        },
                      }}
                    />
                  </Grid>
                )}

                {/* Khoa (cho sinh viên và giảng viên) */}
                {(formData.role === 'student' || formData.role === 'teacher') && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.department}>
                      <InputLabel id="department-label">Khoa</InputLabel>
                      <Select
                        labelId="department-label"
                        id="department"
                        name="department"
                        value={formData.department}
                        label="Khoa"
                        onChange={handleChange}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            '&:hover fieldset': {
                              borderColor: '#6366f1',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                              borderWidth: '2px'
                            },
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>Chọn khoa</em>
                        </MenuItem>
                        {DEPARTMENTS.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.department && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.department}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                )}

                {/* Mật khẩu */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="password"
                    name="password"
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.password}
                    helperText={errors.password}
                    placeholder="Ít nhất 8 ký tự"
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#6366f1' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: '2px'
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Xác nhận mật khẩu */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#6366f1' }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: '2px'
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              {/* Message Alert */}
              {message && (
                <Fade in={!!message}>
                  <Alert 
                    severity={message.includes('thành công') ? 'success' : 'error'}
                    sx={{ mt: 3 }}
                  >
                    {message}
                  </Alert>
                </Fade>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 2,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                  },
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
              </Button>
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Register;
