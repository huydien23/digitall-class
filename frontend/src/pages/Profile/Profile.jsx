import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Grid,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../store/slices/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Hồ sơ cá nhân
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  fontSize: "2rem",
                }}
              >
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.role === "admin" ? "Quản trị viên" : "Giảng viên"}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                sx={{ mt: 2 }}
                onClick={() => navigate("/settings")}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Thông tin cá nhân
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Họ và tên
                </Typography>
                <Typography variant="body1">
                  {user?.first_name} {user?.last_name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user?.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Tên đăng nhập
                </Typography>
                <Typography variant="body1">{user?.username}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Số điện thoại
                </Typography>
                <Typography variant="body1">
                  {user?.phone || "Chưa cập nhật"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Vai trò
                </Typography>
                <Typography variant="body1">
                  {user?.role === "admin" ? "Quản trị viên" : "Giảng viên"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Typography variant="body1">
                  {user?.is_active ? "Hoạt động" : "Không hoạt động"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo
                </Typography>
                <Typography variant="body1">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("vi-VN")
                    : "-"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Cập nhật lần cuối
                </Typography>
                <Typography variant="body1">
                  {user?.updated_at
                    ? new Date(user.updated_at).toLocaleDateString("vi-VN")
                    : "-"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
