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
    fullName: '',
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

    // Full name validation
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }


    // Phone validation
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Password validation
    const passwordValidation = AuthUtils.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]; // Show first error
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Email validation (must be .edu domain)
    const emailValidation = AuthUtils.validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    // Role-specific validation
    if (formData.role === 'student') {
      const studentIdValidation = AuthUtils.validateStudentId(formData.studentId);
      if (!studentIdValidation.isValid) {
        newErrors.studentId = studentIdValidation.error;
      }
    }

    if (formData.role === 'teacher') {
      const teacherIdValidation = AuthUtils.validateTeacherId(formData.teacherId);
      if (!teacherIdValidation.isValid) {
        newErrors.teacherId = teacherIdValidation.error;
      }
    }

    if ((formData.role === 'student' || formData.role === 'teacher') && !formData.department) {
      newErrors.department = 'Khoa là bắt buộc';
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
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      // Prepare registration data
      const registrationData = {
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        role: formData.role,
      };

      // Add role-specific fields
      if (formData.role === 'student') {
        registrationData.student_id = formData.studentId;
      }

      if (formData.role === 'teacher') {
        registrationData.teacher_id = formData.teacherId;
      }

      if (formData.role === 'student' || formData.role === 'teacher') {
        registrationData.department = formData.department;
      }

      const result = await dispatch(register(registrationData)).unwrap();
      
      if (result.requireApproval) {
        setMessage('Đăng ký thành công! Vui lòng đợi admin phê duyệt.');
        // Redirect to pending approval page
        setTimeout(() => {
          navigate('/pending-approval');
        }, 2000);
      } else {
        setMessage('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        // Redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Slide direction="up" in={true} timeout={800}>
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
              },
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  mb: 2,
                }}
              >
                <PersonAdd sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
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
                <Grid item xs={12}>
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
                          '&:hover fieldset': {
                            borderColor: '#6366f1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
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

                {/* Họ và tên */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="fullName"
                    name="fullName"
                    label="Họ và tên"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    placeholder="Nguyễn Văn A"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle sx={{ color: '#6366f1' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
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
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Số điện thoại */}
                <Grid item xs={12}>
                  <TextField
                    required
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
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Mã sinh viên (chỉ hiển thị cho sinh viên) */}
                {formData.role === 'student' && (
                  <Grid item xs={12}>
                    <TextField
                      required
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
                          '&:hover fieldset': {
                            borderColor: '#6366f1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                          },
                        },
                      }}
                    />
                  </Grid>
                )}

                {/* Mã giảng viên (chỉ hiển thị cho giảng viên) */}
                {formData.role === 'teacher' && (
                  <Grid item xs={12}>
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
                          '&:hover fieldset': {
                            borderColor: '#6366f1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                          },
                        },
                      }}
                    />
                  </Grid>
                )}

                {/* Khoa (cho sinh viên và giảng viên) */}
                {(formData.role === 'student' || formData.role === 'teacher') && (
                  <Grid item xs={12}>
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
                            '&:hover fieldset': {
                              borderColor: '#6366f1',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
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
                <Grid item xs={12}>
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
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Xác nhận mật khẩu */}
                <Grid item xs={12}>
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
                        '&:hover fieldset': {
                          borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
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
                  py: 1.5,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
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
