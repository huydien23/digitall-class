import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Stack,
  alpha,
  Avatar,
} from '@mui/material'
import {
  School,
  Login,
  PersonAdd,
  Menu as MenuIcon,
  Close,
  Logout,
  Dashboard,
} from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { NAV_ITEMS } from '../../constants/homePageData'

const Navigation = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const getDashboardRoute = (userRole) => {
    // Always use the unified dashboard route
    return '/dashboard'
  }

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <School sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            EduAttend
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} size="small">
          <Close />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ px: 2 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              component={Link} 
              to={item.path}
              sx={{ 
                borderRadius: 2,
                '&:hover': { bgcolor: 'primary.light', color: 'primary.main' }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <School />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        {isAuthenticated ? (
          <>
            {/* User info */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <Box sx={{ p: 2, width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {(user?.last_name || '') + (user?.first_name ? ' ' + user.first_name : '')}
                  </Typography>
                  <Chip 
                    label={user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </ListItem>
            
            {/* Dashboard button */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                component={Link} 
                to={getDashboardRoute(user?.role)}
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'white' }}><Dashboard /></ListItemIcon>
                <ListItemText primary="Vào Dashboard" />
              </ListItemButton>
            </ListItem>
            
            {/* Logout button */}
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleLogout}
                sx={{ 
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': { bgcolor: 'error.light' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}><Logout /></ListItemIcon>
                <ListItemText primary="Đăng xuất" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                component={Link} 
                to="/login"
                sx={{ 
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'white' }}><Login /></ListItemIcon>
                <ListItemText primary="Đăng nhập" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                to="/register"
                sx={{ 
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'primary.light' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}><PersonAdd /></ListItemIcon>
                <ListItemText primary="Đăng ký" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
      {/* Professional AppBar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: `1px solid ${alpha('#6366f1', 0.1)}`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 0 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)', 
                mr: 1.5, 
                width: 42, 
                height: 42,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}>
                <School />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.01em'
              }}>
                EduAttend
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                {NAV_ITEMS.map((item) => {
                  const handleClick = () => {
                    if (item.path === '#features') {
                      const element = document.getElementById('features-section')
                      if (element) element.scrollIntoView({ behavior: 'smooth' })
                    } else if (item.path === '#about') {
                      const element = document.getElementById('about-section')
                      if (element) element.scrollIntoView({ behavior: 'smooth' })
                    } else if (item.path === '#contact') {
                      const element = document.getElementById('contact-section')
                      if (element) element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }
                  
                  return (
                    <Button
                      key={item.text}
                      component={item.path.startsWith('#') ? 'button' : Link}
                      to={item.path.startsWith('#') ? undefined : item.path}
                      onClick={item.path.startsWith('#') ? handleClick : undefined}
                      aria-label={`Navigate to ${item.text}`}
                      sx={{
                        mx: 1,
                        color: 'text.primary',
                        fontWeight: 500,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: alpha('#6366f1', 0.1),
                          color: '#6366f1',
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  )
                })}
              </Box>
            )}

            {/* Auth Buttons */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isAuthenticated ? (
                  <>
                    {/* User greeting */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mr: 2,
                        fontWeight: 500,
                        color: 'text.secondary'
                      }}
                    >
                      Xin chào, {user?.first_name}
                    </Typography>
                    
                    {/* Dashboard button */}
                    <Button
                      component={Link}
                      to={getDashboardRoute(user?.role)}
                      variant="contained"
                      startIcon={<Dashboard />}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                        fontWeight: 600,
                        px: 3,
                        py: 1.2,
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Vào Dashboard
                    </Button>
                    
                    {/* Logout button */}
                    <Button
                      onClick={handleLogout}
                      variant="outlined"
                      startIcon={<Logout />}
                      sx={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#ef4444',
                          color: 'white',
                          borderColor: '#ef4444',
                        },
                      }}
                    >
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      startIcon={<Login />}
                      aria-label="Đăng nhập vào hệ thống"
                      sx={{
                        borderColor: '#6366f1',
                        color: '#6366f1',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#6366f1',
                          color: 'white',
                          borderColor: '#6366f1',
                        },
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      component={Link}
                      to="/register"
                      variant="contained"
                      startIcon={<PersonAdd />}
                      aria-label="Đăng ký tài khoản miễn phí"
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
                        fontWeight: 600,
                        px: 3,
                        py: 1.2,
                        borderRadius: 3,
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      Đăng ký
                    </Button>
                  </>
                )}
              </Box>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                color: '#6366f1'
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Navigation
