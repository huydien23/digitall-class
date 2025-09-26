import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Rating,
  alpha,
} from '@mui/material'
import { Fade } from '@mui/material'
import { TESTIMONIALS } from '../../constants/homePageData'

const TestimonialsSection = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 12 }}>
      <Box sx={{ textAlign: 'center', mb: 10 }}>
        <Chip
          label="Phản hồi từ người dùng"
          sx={{ 
            mb: 3, 
            px: 3, 
            py: 1, 
            fontSize: '1rem', 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #0ea5e9 100%)',
            color: 'white',
          }}
        />
        <Typography id="testimonials-heading" variant="h3" component="h2" fontWeight="bold" gutterBottom>
          Những gì giảng viên và sinh viên nói về EduAttend
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Hơn 500+ giảng viên đã tin tưởng và sử dụng EduAttend
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {TESTIMONIALS.map((testimonial, index) => (
          <Grid item xs={12} md={4} key={testimonial.id}>
            <Fade in timeout={1000 + index * 300}>
              <Card
                sx={{
                  height: '100%',
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    transform: 'translateY(-8px)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${testimonial.avatarBg} 0%, ${alpha(testimonial.avatarBg, 0.5)} 100%)`,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: testimonial.avatarBg, 
                      mr: 2,
                      width: 50,
                      height: 50,
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.university}
                        </Typography>
                        <Typography variant="h6">{testimonial.schoolLogo}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6, mb: 2 }}>
                    "{testimonial.content}"
                  </Typography>
                  <Chip
                    label={testimonial.metrics}
                    size="small"
                    sx={{
                      bgcolor: alpha(testimonial.avatarBg, 0.1),
                      color: testimonial.avatarBg,
                      fontWeight: 600,
                    }}
                  />
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default TestimonialsSection
