import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  Paper,
} from '@mui/material'
import {
  PersonAdd,
  Login,
  Verified,
  Star,
  Security,
  Timer,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useTheme, useMediaQuery } from '@mui/material'
import InteractiveQRDemo from '../QRCode/InteractiveQRDemo'

const HeroSection = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '80vh', md: '70vh' },
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        py: { xs: 4, md: 6 }
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          opacity: 0.6,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Box sx={{ color: 'white' }}>
              {/* Hero Content */}
              <Chip
                label="Được tin dùng bởi 50+ trường đại học"
                icon={<Verified />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  mb: 4,
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                }}
              />
              
              <Typography 
                id="hero-heading"
                variant={isMobile ? "h3" : "h1"} 
                component="h1" 
                fontWeight="bold" 
                gutterBottom
                sx={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                Không còn mất thời gian gọi tên từng học sinh
              </Typography>

              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                sx={{ 
                  mb: 6, 
                  opacity: 0.95,
                  fontWeight: 300,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  lineHeight: 1.6
                }}
              >
                EduAttend giúp giảng viên điểm danh chỉ trong 30 giây với QR code, sinh viên theo dõi lịch học dễ dàng
              </Typography>

              {/* CTA Buttons */}
              <Stack 
                direction={isMobile ? "column" : "row"} 
                spacing={3} 
                sx={{ mb: 6 }}
              >
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  aria-label="Đăng ký tài khoản miễn phí để dùng thử EduAttend"
                  sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#6366f1',
                    px: 6,
                    py: 3,
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    borderRadius: 4,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 16px 50px rgba(0,0,0,0.3)',
                    },
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: 250,
                  }}
                >
                  Dùng thử miễn phí
                </Button>

                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="large"
                  startIcon={<Login />}
                  aria-label="Đăng nhập vào hệ thống EduAttend"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 6,
                    py: 3,
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    borderRadius: 4,
                    borderWidth: 3,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: 250,
                  }}
                >
                  Đăng nhập
                </Button>
              </Stack>

              {/* Trust Indicators */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: '#fbbf24' }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    4.9/5 từ 500+ giảng viên
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security sx={{ color: '#10b981' }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Bảo mật cao, tuân thủ GDPR
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timer sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Setup chỉ trong 5 phút
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              minHeight: { xs: 300, md: 400 }
            }}>
              {/* Interactive QR Code Demo */}
              <InteractiveQRDemo />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default HeroSection
