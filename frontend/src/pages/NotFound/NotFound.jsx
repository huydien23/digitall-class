import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { motion } from 'framer-motion'
import {
  Home,
  ArrowBack,
  SearchOff
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()

  const goHome = () => navigate('/dashboard')
  const goBack = () => navigate(-1)

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 6 },
          textAlign: 'center',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant={isMobile ? 'h1' : 'h1'}
                component="h1"
                sx={{
                  fontSize: { xs: '6rem', md: '8rem' },
                  fontWeight: 'bold',
                  color: 'primary.main',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  mb: 2
                }}
              >
                404
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography variant="h4" component="h2" gutterBottom color="text.primary">
                Trang không tồn tại
              </Typography>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Home />}
                  onClick={goHome}
                  sx={{ px: 4 }}
                >
                  Về trang chủ
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArrowBack />}
                  onClick={goBack}
                  sx={{ px: 4 }}
                >
                  Quay lại
                </Button>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 300,
                  bgcolor: 'rgba(0,0,0,0.05)',
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'primary.main',
                }}
              >
                <SearchOff 
                  sx={{ 
                    fontSize: 120, 
                    color: 'primary.main',
                    opacity: 0.7 
                  }} 
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Additional help section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box
            sx={{
              mt: 6,
              p: 3,
              bgcolor: 'rgba(0,0,0,0.03)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Có thể bạn đang tìm kiếm:
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="text"
                onClick={() => navigate('/students')}
                sx={{ textTransform: 'none' }}
              >
                Quản lý sinh viên
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/classes')}
                sx={{ textTransform: 'none' }}
              >
                Quản lý lớp học
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/grades')}
                sx={{ textTransform: 'none' }}
              >
                Quản lý điểm số
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/attendance')}
                sx={{ textTransform: 'none' }}
              >
                Điểm danh
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Paper>
    </Container>
  )
}

export default NotFound
