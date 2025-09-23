import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Stack, IconButton, Avatar, Menu, MenuItem, useMediaQuery, useTheme, Link as MuiLink } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const LOGO_PLACEHOLDER = (
  <Box
    sx={{
      width: 40,
      height: 40,
      bgcolor: 'primary.main',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mr: 2,
      boxShadow: 2,
      fontWeight: 700,
      color: 'white',
      fontSize: 24,
      letterSpacing: 1.5,
      userSelect: 'none',
    }}
  >
    E
  </Box>
);

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const menuItems = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Tính năng', to: '#features' },
    { label: 'Hướng dẫn', to: '#guide' },
    { label: 'Liên hệ', to: '#contact' },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'primary.main', borderBottom: '1px solid', borderColor: 'divider', zIndex: 1201 }}>
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <MuiLink component={Link} to="/" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
            {LOGO_PLACEHOLDER}
            <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', letterSpacing: 1.5 }}>
              HungDoan_EDU
            </Typography>
          </MuiLink>
        </Box>
        {isMobile ? (
          <>
            <IconButton edge="end" color="inherit" onClick={handleMobileMenu}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={null}
              open={mobileMenuOpen}
              onClose={handleMobileMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
            >
              {menuItems.map((item) => (
                <MenuItem key={item.label} onClick={() => { setMobileMenuOpen(false); navigate(item.to); }}>
                  {item.label}
                </MenuItem>
              ))}              {isAuthenticated ? (
                <>
                  <MenuItem onClick={() => { 
                    setMobileMenuOpen(false); 
                    const dashboardPath = user?.role === 'teacher' ? '/dashboard/teacher' : 
                                         user?.role === 'student' ? '/dashboard/student' : '/dashboard'
                    navigate(dashboardPath); 
                  }}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
                    {user?.fullName || 'Tài khoản'}
                  </MenuItem>
                </>
              ) : (
                <MenuItem onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                  Đăng nhập
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                component={MuiLink}
                to={item.to}
                sx={{ color: 'primary.main', fontWeight: 500, textTransform: 'none', fontSize: 16 }}
                underline="none"
              >
                {item.label}
              </Button>
            ))}            {isAuthenticated ? (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ fontWeight: 500, textTransform: 'none', borderRadius: 2 }}
                  onClick={() => {
                    const dashboardPath = user?.role === 'teacher' ? '/dashboard/teacher' : 
                                         user?.role === 'student' ? '/dashboard/student' : '/dashboard'
                    navigate(dashboardPath)
                  }}
                >
                  Dashboard
                </Button>
                
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <Box sx={{ mr: 2, textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight={600}>
                      {user?.fullName || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.role === 'teacher' ? 'Giảng viên' : 
                       user?.role === 'student' ? 'Sinh viên' : 'Người dùng'}
                    </Typography>
                  </Box>
                  <IconButton onClick={handleAvatarClick}>
                    <Avatar sx={{ width: 36, height: 36 }} src={user?.avatar}>
                      {user?.fullName?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                </Box>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
                >
                  <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                    Trang cá nhân
                  </MenuItem>                  <MenuItem onClick={() => { 
                    handleMenuClose(); 
                    dispatch(logout());
                    navigate('/login');
                  }}>
                    Đăng xuất
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2, px: 3, fontWeight: 600, borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </Button>
            )}
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
