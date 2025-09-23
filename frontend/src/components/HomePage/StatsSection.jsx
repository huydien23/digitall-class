import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  alpha,
} from '@mui/material'
import {
  SchoolOutlined,
  PersonOutlined,
  Groups,
  CloudDone,
} from '@mui/icons-material'
import { Fade } from '@mui/material'
import { STATS } from '../../constants/homePageData'

const StatsSection = () => {
  const getIcon = (iconName) => {
    const icons = {
      SchoolOutlined: <SchoolOutlined sx={{ fontSize: 32 }} />,
      PersonOutlined: <PersonOutlined sx={{ fontSize: 32 }} />,
      Groups: <Groups sx={{ fontSize: 32 }} />,
      CloudDone: <CloudDone sx={{ fontSize: 32 }} />,
    }
    return icons[iconName] || <SchoolOutlined sx={{ fontSize: 32 }} />
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography id="stats-heading" variant="h3" component="h2" fontWeight="bold" gutterBottom>
          Được tin tưởng bởi các trường đại học hàng đầu
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Hơn 15,000 sinh viên và 500+ lớp học đang sử dụng EduAttend
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {STATS.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            <Fade in timeout={1000 + index * 200}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    borderColor: stat.color,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.5)} 100%)`,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 3,
                      borderRadius: '50%',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                      mb: 3,
                      animation: `${stat.animation} 2s ease-in-out infinite`,
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' },
                      },
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0)' },
                        '50%': { transform: 'translateY(-10px)' },
                      },
                      '@keyframes wiggle': {
                        '0%, 100%': { transform: 'rotate(0deg)' },
                        '25%': { transform: 'rotate(5deg)' },
                        '75%': { transform: 'rotate(-5deg)' },
                      },
                      '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-5px)' },
                      },
                    }}
                  >
                    {getIcon(stat.icon)}
                  </Box>
                  <Typography variant="h2" fontWeight="bold" color={stat.color} gutterBottom>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {stat.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {stat.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {stat.context}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default StatsSection
