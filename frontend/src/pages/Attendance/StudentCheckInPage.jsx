import React, { useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Paper, Button, Alert, Stack } from '@mui/material'
import { useSelector } from 'react-redux'
import StudentCheckInDialog from '../../components/Attendance/StudentCheckInDialog'

const StudentCheckInPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [open, setOpen] = useState(true)

  const initialCode = useMemo(() => {
    return (
      searchParams.get('qr_code') ||
      searchParams.get('qr') ||
      searchParams.get('token') ||
      ''
    )
  }, [searchParams])

  const studentCode = useMemo(() => {
    return (
      user?.student?.student_id ||
      user?.student_id ||
      user?.code ||
      ''
    )
  }, [user])

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Điểm danh bằng QR/Code
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Trang này cho phép bạn điểm danh nhanh bằng cách dán link/mã được giảng viên cung cấp.
        </Typography>
        {!studentCode && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Không tìm thấy MSSV trong hồ sơ. Nếu hệ thống yêu cầu, bạn hãy nhập MSSV trong màn hình điểm danh.
          </Alert>
        )}
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate(-1)}>Quay lại</Button>
        </Stack>
      </Paper>

      <StudentCheckInDialog
        open={open}
        onClose={() => setOpen(false)}
        studentCode={studentCode}
        initialCode={initialCode}
        autoSubmit={!!initialCode}
        onSuccess={() => setOpen(false)}
      />
    </Container>
  )
}

export default StudentCheckInPage
