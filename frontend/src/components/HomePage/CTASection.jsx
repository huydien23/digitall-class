import React from 'react'
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material'
import {
  PersonAdd,
  Login,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useTheme, useMediaQuery } from '@mui/material'

const CTASection = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Container maxWidth="lg" sx={{ py: 12 }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          color: 'white',
          borderRadius: 4,
          p: 6,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `,
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 2 }}>
          <Typography id="cta-heading" variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Sẵn sàng bắt đầu?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Đăng ký miễn phí và trải nghiệm EduAttend ngay hôm nay
          </Typography>
          
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={3} 
            justifyContent="center"
          >
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              startIcon={<PersonAdd />}
              sx={{
                bgcolor: 'white',
                color: '#6366f1',
                px: 5,
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: 3,
                minWidth: 220,
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                },
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
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 5,
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: 3,
                borderWidth: 2,
                minWidth: 220,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Đăng nhập
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}

export default CTASection
