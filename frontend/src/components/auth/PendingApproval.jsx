import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Avatar,
  Stack,
} from '@mui/material';
import {
  HourglassEmpty,
  Email,
  ExitToApp,
  CheckCircleOutline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import AuthUtils from '../../utils/authUtils';

const PendingApproval = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 8,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={8}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 3,
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'warning.main',
                mx: 'auto',
                mb: 3,
              }}
            >
              <HourglassEmpty sx={{ fontSize: 40 }} />
            </Avatar>

            {/* Title */}
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Tài khoản đang chờ duyệt
            </Typography>

            {/* Warning Alert */}
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>Thông tin quan trọng</AlertTitle>
              Tài khoản của bạn đã được tạo thành công nhưng cần được quản trị viên phê duyệt trước khi có thể sử dụng.
            </Alert>

            {/* User Info */}
            {user && (
              <Paper
                variant="outlined"
                sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}
              >
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Thông tin tài khoản:
                </Typography>
                <Stack spacing={1} sx={{ textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>Tên:</strong> {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {user.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Vai trò:</strong> {user.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Khoa:</strong> {user.department || 'Chưa cập nhật'}
                  </Typography>
                  {user.student_id && (
                    <Typography variant="body2">
                      <strong>Mã sinh viên:</strong> {user.student_id}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Instructions */}
            <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>Các bước tiếp theo</AlertTitle>
              <Stack component="ol" spacing={0.5} sx={{ pl: 2, listStyleType: 'decimal' }}>
                <Typography component="li" variant="body2">
                  Quản trị viên sẽ xem xét và phê duyệt tài khoản của bạn
                </Typography>
                <Typography component="li" variant="body2">
                  Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt
                </Typography>
                <Typography component="li" variant="body2">
                  Sau khi được phê duyệt, bạn có thể đăng nhập bình thường
                </Typography>
              </Stack>
            </Alert>

            {/* Contact Info */}
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}
            >
              <Stack spacing={1} alignItems="center">
                <CheckCircleOutline color="success" />
                <Typography variant="body2" color="text.secondary">
                  Thời gian xử lý thường từ 1-2 ngày làm việc.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nếu có thắc mắc, vui lòng liên hệ:{' '}
                  <Typography
                    component="a"
                    href="mailto:admin@school.edu.vn"
                    color="primary"
                    sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    admin@school.edu.vn
                  </Typography>
                </Typography>
              </Stack>
            </Paper>

            {/* Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                sx={{ py: 1.5 }}
              >
                Đăng xuất
              </Button>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/"
                startIcon={<Email />}
                sx={{ py: 1.5 }}
              >
                Về trang chủ
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PendingApproval;
