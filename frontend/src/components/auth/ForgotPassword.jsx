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
  InputAdornment,
  Slide,
  Fade,
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send,
  CheckCircle,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.auth);
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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
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
      // Call API to send reset password email
      const response = await fetch('/api/auth/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.');
      } else {
        setMessage(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

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
                  <Email sx={{ fontSize: 32, color: 'white' }} />
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
                {!isSuccess ? 'Quên mật khẩu?' : 'Email đã được gửi'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {!isSuccess 
                  ? 'Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu'
                  : 'Vui lòng kiểm tra hộp thư và làm theo hướng dẫn để đặt lại mật khẩu'
                }
              </Typography>

              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={handleBackToLogin}
                sx={{
                  color: '#6366f1',
                  textTransform: 'none',
                  fontWeight: 600,
                  mb: 2,
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.04)',
                  },
                }}
              >
                Quay lại đăng nhập
              </Button>
            </Box>

            {!isSuccess && (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
                  autoFocus
                  placeholder="example@email.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#6366f1' }} />
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
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                >
                  {loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
                </Button>
              </Box>
            )}

            {isSuccess && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Không nhận được email?{' '}
                  <Button
                    variant="text"
                    onClick={() => {
                      setIsSuccess(false);
                      setMessage('');
                      setFormData({ email: '' });
                    }}
                    sx={{
                      color: '#6366f1',
                      textTransform: 'none',
                      fontWeight: 600,
                      p: 0,
                      minWidth: 'auto',
                    }}
                  >
                    Gửi lại
                  </Button>
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
                  Quay lại đăng nhập
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

export default ForgotPassword;
