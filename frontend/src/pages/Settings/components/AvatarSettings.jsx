import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  Divider,
} from "@mui/material";
import { CloudUpload, Delete, PhotoCamera, Person } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import {
  uploadAvatar,
  deleteAvatar,
  getProfile,
} from "../../../store/slices/authSlice";
import { useSnackbar } from "notistack";
import { getAvatarSrc, getUserInitials } from "../../../utils/avatarUtils";

const AvatarSettings = ({ user }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      enqueueSnackbar("Chỉ cho phép upload file hình ảnh", {
        variant: "error",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar("Kích thước file không được vượt quá 5MB", {
        variant: "error",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await dispatch(uploadAvatar(formData)).unwrap();

      // Refresh profile to get updated avatar URL
      await dispatch(getProfile());

      enqueueSnackbar("Cập nhật ảnh đại diện thành công!", {
        variant: "success",
      });
      setPreviewUrl(null);
    } catch (error) {
      enqueueSnackbar(error.message || "Có lỗi xảy ra khi upload ảnh", {
        variant: "error",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!user?.avatar) return;

    setIsDeleting(true);

    try {
      await dispatch(deleteAvatar()).unwrap();

      // Refresh profile to get updated avatar status
      await dispatch(getProfile());

      enqueueSnackbar("Xóa ảnh đại diện thành công!", { variant: "success" });
    } catch (error) {
      console.error("Delete avatar error:", error);
      enqueueSnackbar(error.message || "Có lỗi xảy ra khi xóa ảnh", {
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getAvatarSrcWithPreview = () => {
    // For the settings page, prioritize preview URL if available
    if (previewUrl) {
      return previewUrl;
    }
    // Otherwise use the shared utility
    const avatarUrl = getAvatarSrc(user);
    return avatarUrl;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Ảnh đại diện
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cập nhật ảnh đại diện của bạn. Kích thước tối đa: 5MB. Định dạng: JPG,
        PNG, GIF.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Avatar Preview */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            minWidth: 250,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={getAvatarSrcWithPreview()}
              sx={{
                width: 120,
                height: 120,
                fontSize: "2rem",
                border: "4px solid",
                borderColor: "primary.main",
              }}
              onError={(e) => {}}
            >
              {getUserInitials(user)}
            </Avatar>

            {/* Loading overlay */}
            {(isUploading || isDeleting) && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "50%",
                }}
              >
                <CircularProgress size={40} sx={{ color: "white" }} />
              </Box>
            )}

            {/* Camera icon overlay for upload */}
            <IconButton
              sx={{
                position: "absolute",
                bottom: -8,
                right: -8,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
              onClick={handleButtonClick}
              disabled={isUploading || isDeleting}
            >
              <PhotoCamera />
            </IconButton>
          </Box>

          <Typography variant="body1" textAlign="center">
            {user?.first_name} {user?.last_name}
          </Typography>
        </Paper>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleButtonClick}
            disabled={isUploading || isDeleting}
          >
            {isUploading ? "Đang tải lên..." : "Tải ảnh lên"}
          </Button>

          {user?.avatar && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
            >
              {isDeleting ? "Đang xóa..." : "Xóa ảnh"}
            </Button>
          )}
        </Box>

        {/* Upload instructions */}
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Lưu ý:</strong> Ảnh đại diện sẽ được hiển thị công khai
            trong hệ thống. Hãy chọn ảnh phù hợp và chuyên nghiệp.
          </Typography>
        </Alert>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </Box>
    </Box>
  );
};

export default AvatarSettings;
