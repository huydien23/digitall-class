import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  School,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
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
    setMessage('');

    try {
      const result = await dispatch(login({
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      setMessage('Đăng nhập thành công!');
      
      // Redirect based on user role and approval status
      if (result.user?.account_status === 'pending') {
        navigate('/pending-approval');
      } else {
        const from = location.state?.from?.pathname || getDashboardPath(result.user.role);
        navigate(from, { replace: true });
      }
    } catch (error) {
      setMessage(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = (role) => {
    // Always redirect to unified dashboard
    return '/dashboard'
  }

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
                <School sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  letterSpacing: '-0.02em'
                }}
              >
                EduAttend
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Hệ thống quản lý sinh viên
              </Typography>

              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  letterSpacing: '-0.01em'
                }}
              >
                Đăng nhập
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#6366f1',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Đăng ký tại đây
                </Link>
              </Typography>
            </Box>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
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
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={loading}
                    autoComplete="email"
                    placeholder="example@email.com"
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
                    error={!!errors.password}
                    helperText={errors.password}
                    disabled={loading}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu của bạn"
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
                </Grid>                {message && (
                  <Grid item xs={12}>
                    <Fade in={!!message}>
                      <Alert 
                        severity={message.includes('thành công') ? 'success' : 'error'}
                        sx={{ mt: 2 }}
                      >
                        {message}
                      </Alert>
                    </Fade>
                  </Grid>
                )}<Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
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
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                  >
                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        color: '#6366f1',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                      }}
                    >
                      Quên mật khẩu?
                    </Link>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default Login;
