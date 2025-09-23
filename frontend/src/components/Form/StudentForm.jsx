import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as OtherIcon,
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import studentService from '../../services/studentService'

// Validation schema
const studentSchema = yup.object({
  student_id: yup
    .string()
    .required('Mã sinh viên là bắt buộc')
    .matches(/^[A-Z0-9]+$/, 'Mã sinh viên chỉ được chứa chữ hoa và số')
    .min(3, 'Mã sinh viên phải có ít nhất 3 ký tự'),
  first_name: yup
    .string()
    .required('Tên là bắt buộc')
    .min(2, 'Tên phải có ít nhất 2 ký tự'),
  last_name: yup
    .string()
    .required('Họ là bắt buộc')
    .min(2, 'Họ phải có ít nhất 2 ký tự'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  phone: yup
    .string()
    .matches(/^(\+84|84|0)?[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  gender: yup
    .string()
    .required('Giới tính là bắt buộc')
    .oneOf(['male', 'female', 'other'], 'Giới tính không hợp lệ'),
  date_of_birth: yup
    .date()
    .required('Ngày sinh là bắt buộc')
    .max(new Date(), 'Ngày sinh không thể là ngày tương lai'),
  address: yup.string(),
})

const StudentForm = ({ open, onClose, onSuccess, student }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(studentSchema),
    defaultValues: {
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: 'male',
      date_of_birth: dayjs().subtract(20, 'year'),
      address: '',
      is_active: true,
    },
  })

  const watchedValues = watch()

  // Reset form when dialog opens/closes or student changes
  useEffect(() => {
    if (open) {
      if (student) {
        // Edit mode
        reset({
          student_id: student.student_id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          phone: student.phone || '',
          gender: student.gender,
          date_of_birth: dayjs(student.date_of_birth),
          address: student.address || '',
          is_active: student.is_active,
        })
        setAvatarPreview(student.avatar)
      } else {
        // Add mode
        reset({
          student_id: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          gender: 'male',
          date_of_birth: dayjs().subtract(20, 'year'),
          address: '',
          is_active: true,
        })
        setAvatarPreview(null)
      }
      setError(null)
      setAvatarFile(null)
    }
  }, [open, student, reset])

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      
      // Add basic fields
      Object.keys(data).forEach(key => {
        if (key === 'date_of_birth') {
          formData.append(key, data[key].format('YYYY-MM-DD'))
        } else if (key !== 'avatar') {
          formData.append(key, data[key])
        }
      })

      // Add avatar if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      if (student) {
        // Update existing student
        await studentService.updateStudent(student.id, formData)
      } else {
        // Create new student
        await studentService.createStudent(formData)
      }

      onSuccess()
    } catch (err) {
      console.error('Failed to save student:', err)
      setError(err.response?.data?.message || 'Không thể lưu thông tin sinh viên')
    } finally {
      setLoading(false)
    }
  }

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'male': return <MaleIcon color="primary" />
      case 'female': return <FemaleIcon color="secondary" />
      default: return <OtherIcon color="action" />
    }
  }

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male': return 'Nam'
      case 'female': return 'Nữ'
      default: return 'Khác'
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={isMobile ? "sm" : "md"}
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: isMobile ? 0 : 2 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {student ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={isMobile ? 2 : 3}>
              {/* Avatar Section */}
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                  <Box position="relative">
                    <Avatar
                      src={avatarPreview}
                      sx={{ 
                        width: isMobile ? 80 : 100, 
                        height: isMobile ? 80 : 100, 
                        fontSize: isMobile ? '1.5rem' : '2rem' 
                      }}
                    >
                      {watchedValues.first_name?.[0]}{watchedValues.last_name?.[0]}
                    </Avatar>
                    <IconButton
                      component="label"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: isMobile ? 24 : 28,
                        height: isMobile ? 24 : 28,
                      }}
                      size="small"
                    >
                      <UploadIcon fontSize="small" />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleAvatarChange}
                      />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Nhấn để thay đổi ảnh đại diện
                </Typography>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Thông tin cơ bản
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="student_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mã sinh viên"
                      error={!!errors.student_id}
                      helperText={errors.student_id?.message}
                      disabled={!!student} // Disable editing student_id when updating
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.gender} size={isMobile ? "small" : "medium"}>
                      <InputLabel>Giới tính</InputLabel>
                      <Select {...field} label="Giới tính">
                        <MenuItem value="male">
                          <Box display="flex" alignItems="center">
                            <MaleIcon sx={{ mr: 1 }} />
                            Nam
                          </Box>
                        </MenuItem>
                        <MenuItem value="female">
                          <Box display="flex" alignItems="center">
                            <FemaleIcon sx={{ mr: 1 }} />
                            Nữ
                          </Box>
                        </MenuItem>
                        <MenuItem value="other">
                          <Box display="flex" alignItems="center">
                            <OtherIcon sx={{ mr: 1 }} />
                            Khác
                          </Box>
                        </MenuItem>
                      </Select>
                      {errors.gender && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.gender.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tên"
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Họ"
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Số điện thoại"
                      error={!!errors.phone}
                      helperText={errors.phone?.message || 'Ví dụ: 0123456789'}
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày sinh"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.date_of_birth,
                          helperText: errors.date_of_birth?.message,
                          size: isMobile ? "small" : "medium",
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label="Trạng thái hoạt động"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Địa chỉ"
                      multiline
                      rows={isMobile ? 2 : 3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      size={isMobile ? "small" : "medium"}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang lưu...' : (student ? 'Cập nhật' : 'Thêm mới')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}

export default StudentForm