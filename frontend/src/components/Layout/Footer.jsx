import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  School,
  Email,
  Phone,
} from '@mui/icons-material'

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)', 
                  mr: 1.5 
                }}>
                  <School />
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  EduAttend
                </Typography>
              </Box>
              <Typography variant="body2" color="grey.400" sx={{ lineHeight: 1.6 }}>
                Hệ thống điểm danh thông minh cho các trường đại học. 
                Giải pháp hiện đại, đáng tin cậy và dễ sử dụng.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Liên hệ
            </Typography>
            <List dense sx={{ color: 'grey.400' }}>
              <ListItem disablePadding>
                <ListItemIcon><Email /></ListItemIcon>
                <ListItemText primary="support@eduattend.edu.vn" />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon><Phone /></ListItemIcon>
                <ListItemText primary="(024) 1234-5678" />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Hỗ trợ
            </Typography>
            <List dense sx={{ color: 'grey.400' }}>
              <ListItem disablePadding><ListItemText primary="Hướng dẫn sử dụng" /></ListItem>
              <ListItem disablePadding><ListItemText primary="Tài liệu kỹ thuật" /></ListItem>
              <ListItem disablePadding><ListItemText primary="Liên hệ hỗ trợ" /></ListItem>
            </List>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="grey.400">
            © 2024 EduAttend - Hệ thống Điểm danh Thông minh. Tất cả quyền được bảo lưu.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
