import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { updateProfile } from "../../../store/slices/authSlice";
import { useSnackbar } from "notistack";

const ProfileSettings = ({ user }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    department: user?.department || "",
    teacher_id: user?.teacher_id || "",
    student_id: user?.student_id || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Prepare data based on user role
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      };

      // Add role-specific fields
      if (user?.role === "teacher") {
        updateData.teacher_id = formData.teacher_id;
        updateData.department = formData.department;
      } else if (user?.role === "student") {
        updateData.student_id = formData.student_id;
      }

      const result = await dispatch(updateProfile(updateData)).unwrap();
      enqueueSnackbar("Cập nhật thông tin thành công!", { variant: "success" });
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.errors) {
        setErrors(error.errors);
      } else {
        enqueueSnackbar(
          error.message || "Có lỗi xảy ra khi cập nhật thông tin",
          { variant: "error" }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      department: user?.department || "",
      teacher_id: user?.teacher_id || "",
      student_id: user?.student_id || "",
    });
    setErrors({});
  };

  const isFormChanged = () => {
    return (
      formData.first_name !== (user?.first_name || "") ||
      formData.last_name !== (user?.last_name || "") ||
      formData.phone !== (user?.phone || "") ||
      formData.department !== (user?.department || "") ||
      formData.teacher_id !== (user?.teacher_id || "") ||
      formData.student_id !== (user?.student_id || "")
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Thông tin cá nhân
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cập nhật thông tin cá nhân của bạn. Email không thể thay đổi.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Email - Read only */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ""}
              disabled
              helperText="Email không thể thay đổi"
            />
          </Grid>

          {/* Name fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tên"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Họ"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
              required
            />
          </Grid>

          {/* Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone || "Ví dụ: 0123456789"}
              placeholder="0123456789"
            />
          </Grid>

          {/* Role specific fields */}
          {user?.role === "teacher" && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mã giảng viên"
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleChange}
                  error={!!errors.teacher_id}
                  helperText={errors.teacher_id}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Khoa/Phòng ban"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  error={!!errors.department}
                  helperText={errors.department}
                />
              </Grid>
            </>
          )}

          {user?.role === "student" && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã sinh viên"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                error={!!errors.student_id}
                helperText={errors.student_id}
              />
            </Grid>
          )}

          {/* Role and Status - Read only */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vai trò"
              value={
                user?.role === "admin"
                  ? "Quản trị viên"
                  : user?.role === "teacher"
                  ? "Giảng viên"
                  : "Sinh viên"
              }
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Trạng thái tài khoản"
              value={
                user?.account_status === "active"
                  ? "Hoạt động"
                  : user?.account_status === "pending"
                  ? "Chờ phê duyệt"
                  : user?.account_status === "suspended"
                  ? "Tạm khóa"
                  : "Không xác định"
              }
              disabled
            />
          </Grid>

          {/* Action buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleReset}
                disabled={isLoading || !isFormChanged()}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  isLoading ? <CircularProgress size={20} /> : <Save />
                }
                disabled={isLoading || !isFormChanged()}
              >
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ProfileSettings;
