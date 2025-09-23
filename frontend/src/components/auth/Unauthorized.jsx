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
  Block,
  Home,
  ArrowBack,
} from '@mui/icons-material';

const Unauthorized = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderTop: '4px solid',
          borderColor: 'error.main',
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'error.main',
            mx: 'auto',
            mb: 3,
          }}
        >
          <Block sx={{ fontSize: 40 }} />
        </Avatar>

        <Typography variant="h4" component="h1" gutterBottom color="error">
          Không có quyền truy cập
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Xin lỗi, bạn không có quyền truy cập vào trang này. 
          Vui lòng liên hệ với quản trị viên nếu bạn cho rằng đây là lỗi.
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Cảnh báo</AlertTitle>
          Bạn đã cố gắng truy cập vào một khu vực bị hạn chế.
        </Alert>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<Home />}
            size="large"
          >
            Về trang chủ
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            size="large"
            onClick={() => window.history.back()}
          >
            Quay lại
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Unauthorized;