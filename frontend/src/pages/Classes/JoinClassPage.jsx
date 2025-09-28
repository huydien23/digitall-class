import React, { useMemo, useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Paper, Button, Alert, Stack, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import classService from '../../services/classService'

const JoinClassPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [classInfo, setClassInfo] = useState(null)

  const token = useMemo(() => {
    return (
      searchParams.get('token') ||
      searchParams.get('t') ||
      ''
    )
  }, [searchParams])

  useEffect(() => {
    if (!token) {
      setError('Thiếu token tham gia lớp')
      setLoading(false)
      return
    }

    // Auto-join when page loads
    const autoJoin = async () => {
      try {
        setLoading(true)
        const res = await classService.joinClassByToken(token)
        const data = res?.data || res
        setSuccess(`Tham gia lớp thành công! ${data?.message || ''}`)
        
        // Try to get class info for better UX
        if (data?.class_id) {
          setTimeout(() => navigate(`/classes/${data.class_id}`), 2000)
        } else {
          setTimeout(() => navigate('/classes'), 2000)
        }
      } catch (err) {
        const msg = err?.response?.data?.error || err.message || 'Token không hợp lệ hoặc đã hết hạn'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    autoJoin()
  }, [token, navigate])

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom align="center">
          Tham gia lớp học
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph align="center">
          Đang xử lý yêu cầu tham gia lớp học...
        </Typography>

        {loading && (
          <Box textAlign="center" py={4}>
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Đang kết nối với hệ thống...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {!loading && (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
            <Button variant="contained" onClick={() => navigate('/classes')}>
              Xem lớp học
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  )
}

export default JoinClassPage