import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  alpha,
} from '@mui/material'
import {
  QrCodeScanner,
  Groups,
  Analytics,
  Schedule,
} from '@mui/icons-material'
import { Slide } from '@mui/material'
import { FEATURES } from '../../constants/homePageData'

const FeaturesSection = () => {
  const getIcon = (iconName) => {
    const icons = {
      QrCodeScanner: <QrCodeScanner sx={{ fontSize: 48 }} />,
      Groups: <Groups sx={{ fontSize: 48 }} />,
      Analytics: <Analytics sx={{ fontSize: 48 }} />,
      Schedule: <Schedule sx={{ fontSize: 48 }} />,
    }
    return icons[iconName] || <QrCodeScanner sx={{ fontSize: 48 }} />
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', py: 12 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Chip
            label="Tính năng nổi bật"
            sx={{ 
              mb: 3, 
              px: 3, 
              py: 1, 
              fontSize: '1rem', 
              fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
              color: 'white',
            }}
          />
          <Typography id="features-heading" variant="h3" component="h2" fontWeight="bold" gutterBottom>
            Mọi thứ bạn cần để quản lý lớp học hiệu quả
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Từ điểm danh QR đến báo cáo chi tiết, tất cả trong một nền tảng
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {FEATURES.map((feature, index) => (
            <Grid item xs={12} md={6} key={feature.id}>
              <Slide direction="up" in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    p: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      borderColor: feature.color,
                      transform: 'translateY(-4px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${feature.color} 0%, ${alpha(feature.color, 0.5)} 100%)`,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          p: 2,
                          borderRadius: 3,
                          bgcolor: alpha(feature.color, 0.1),
                          color: feature.color,
                          flexShrink: 0,
                        }}
                      >
                        {getIcon(feature.icon)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {feature.description}
                        </Typography>
                        <Chip
                          label={feature.highlight}
                          size="small"
                          sx={{
                            bgcolor: alpha(feature.color, 0.1),
                            color: feature.color,
                            fontWeight: 600,
                            mb: 2,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                          {feature.demo}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: feature.color,
                            color: feature.color,
                            fontSize: '0.75rem',
                            '&:hover': {
                              bgcolor: alpha(feature.color, 0.1),
                              borderColor: feature.color,
                            },
                          }}
                        >
                          Thử ngay →
                        </Button>
                      </Box>
                      <Box sx={{ fontSize: '3rem', opacity: 0.3 }}>
                        {feature.mockup}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default FeaturesSection
