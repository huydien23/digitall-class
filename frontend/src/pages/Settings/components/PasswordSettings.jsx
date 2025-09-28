import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
} from "@mui/material";
import {
  Save,
  Visibility,
  VisibilityOff,
  Lock,
  Security,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { changePassword } from "../../../store/slices/authSlice";
import { useSnackbar } from "notistack";

const PasswordSettings = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    old_password: false,
    new_password: false,
    new_password_confirm: false,
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

  const handleTogglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.old_password) {
      newErrors.old_password = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.new_password) {
      newErrors.new_password = "Vui lòng nhập mật khẩu mới";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Mật khẩu mới phải có ít nhất 8 ký tự";
    }

    if (!formData.new_password_confirm) {
      newErrors.new_password_confirm = "Vui lòng xác nhận mật khẩu mới";
    } else if (formData.new_password !== formData.new_password_confirm) {
      newErrors.new_password_confirm = "Mật khẩu xác nhận không khớp";
    }

    if (formData.old_password === formData.new_password) {
      newErrors.new_password = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await dispatch(changePassword(formData)).unwrap();
      enqueueSnackbar("Đổi mật khẩu thành công!", { variant: "success" });

      // Reset form
      setFormData({
        old_password: "",
        new_password: "",
        new_password_confirm: "",
      });

      // Hide all passwords
      setShowPassword({
        old_password: false,
        new_password: false,
        new_password_confirm: false,
      });
    } catch (error) {
      console.error("Change password error:", error);

      if (error.errors) {
        setErrors(error.errors);
      } else {
        enqueueSnackbar(error.message || "Có lỗi xảy ra khi đổi mật khẩu", {
          variant: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "transparent" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, text: "Yếu", color: "error" };
    if (score === 3) return { score, text: "Trung bình", color: "warning" };
    if (score === 4) return { score, text: "Khá", color: "info" };
    return { score, text: "Mạnh", color: "success" };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Đổi mật khẩu
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Để bảo mật tài khoản, hãy sử dụng mật khẩu mạnh và thay đổi thường
        xuyên.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Security color="primary" />
          <Typography variant="h6">Yêu cầu mật khẩu</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          • Ít nhất 8 ký tự
          <br />
          • Bao gồm chữ hoa và chữ thường
          <br />
          • Có ít nhất 1 số
          <br />• Có ít nhất 1 ký tự đặc biệt (!@#$%^&*)
        </Typography>
      </Paper>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Current Password */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mật khẩu hiện tại"
              name="old_password"
              type={showPassword.old_password ? "text" : "password"}
              value={formData.old_password}
              onChange={handleChange}
              error={!!errors.old_password}
              helperText={errors.old_password}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        handleTogglePasswordVisibility("old_password")
                      }
                      edge="end"
                    >
                      {showPassword.old_password ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* New Password */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mật khẩu mới"
              name="new_password"
              type={showPassword.new_password ? "text" : "password"}
              value={formData.new_password}
              onChange={handleChange}
              error={!!errors.new_password}
              helperText={errors.new_password}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        handleTogglePasswordVisibility("new_password")
                      }
                      edge="end"
                    >
                      {showPassword.new_password ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Strength Indicator */}
            {formData.new_password && (
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="caption"
                  color={`${passwordStrength.color}.main`}
                >
                  Độ mạnh mật khẩu: {passwordStrength.text}
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 4,
                    bgcolor: "grey.200",
                    borderRadius: 2,
                    mt: 0.5,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      height: "100%",
                      bgcolor: `${passwordStrength.color}.main`,
                      transition: "width 0.3s ease-in-out",
                    }}
                  />
                </Box>
              </Box>
            )}
          </Grid>

          {/* Confirm New Password */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Xác nhận mật khẩu mới"
              name="new_password_confirm"
              type={showPassword.new_password_confirm ? "text" : "password"}
              value={formData.new_password_confirm}
              onChange={handleChange}
              error={!!errors.new_password_confirm}
              helperText={errors.new_password_confirm}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        handleTogglePasswordVisibility("new_password_confirm")
                      }
                      edge="end"
                    >
                      {showPassword.new_password_confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={
                  isLoading ? <CircularProgress size={20} /> : <Save />
                }
                disabled={isLoading}
                sx={{ minWidth: 150 }}
              >
                {isLoading ? "Đang lưu..." : "Đổi mật khẩu"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Security Alert */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Lưu ý bảo mật:</strong> Sau khi đổi mật khẩu, bạn sẽ cần đăng
          nhập lại trên các thiết bị khác.
        </Typography>
      </Alert>
    </Box>
  );
};

export default PasswordSettings;
