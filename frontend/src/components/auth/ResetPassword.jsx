import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Slide,
  Fade,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Validate token on component mount
  useEffect(() => {
    if (!uid || !token) {
      setIsValidToken(false);
      setMessage('Link đặt lại mật khẩu không hợp lệ.');
      return;
    }
    
    // Token exists, assume valid for now
    // In a real app, you might want to validate token with server first
    setIsValidToken(true);
  }, [uid, token]);

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

    if (!formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      const response = await fetch('/api/auth/reset-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          token: token,
          new_password: formData.newPassword,
          new_password_confirm: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Mật khẩu đã được đặt lại thành công!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập với mật khẩu mới.' 
            }
          });
        }, 3000);
      } else {
        setMessage(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        if (response.status === 400) {
          setIsValidToken(false);
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isValidToken === false) {
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
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  mb: 2,
                }}
              >
                <Error sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              
              <Typography variant="h4" gutterBottom color="error">
                Link không hợp lệ
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </Typography>

              <Button
                variant="contained"
                onClick={handleBackToLogin}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  },
                }}
              >
                Quay lại đăng nhập
              </Button>
            </Paper>
          </Slide>
        </Container>
      </Box>
    );
  }

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
              {!isSuccess ? (
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    mb: 2,
                  }}
                >
                  <Lock sx={{ fontSize: 32, color: 'white' }} />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    mb: 2,
                  }}
                >
                  <CheckCircle sx={{ fontSize: 32, color: 'white' }} />
                </Box>
              )}
              
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
                {!isSuccess ? 'Đặt lại mật khẩu' : 'Thành công!'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {!isSuccess 
                  ? 'Nhập mật khẩu mới để hoàn tất việc đặt lại'
                  : 'Mật khẩu đã được đặt lại thành công'
                }
              </Typography>
            </Box>

            {!isSuccess && (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                  required
                  fullWidth
                  id="newPassword"
                  name="newPassword"
                  label="Mật khẩu mới"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Ít nhất 8 ký tự"
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
                    mb: 2,
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

                <TextField
                  required
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu mới"
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
                    mb: 3,
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
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
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </Button>
              </Box>
            )}

            {isSuccess && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleBackToLogin}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#4f46e5',
                      background: 'rgba(99, 102, 241, 0.04)',
                    },
                  }}
                >
                  Đăng nhập ngay
                </Button>
              </Box>
            )}

            {/* Message Alert */}
            {message && (
              <Fade in={!!message}>
                <Alert 
                  severity={isSuccess ? 'success' : 'error'}
                  sx={{ mt: 3 }}
                >
                  {message}
                </Alert>
              </Fade>
            )}
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
};

export default ResetPassword;
