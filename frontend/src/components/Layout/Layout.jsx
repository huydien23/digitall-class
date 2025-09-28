import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  alpha,
  Chip,
  Tooltip,
} from "@mui/material";
import { getAvatarSrc, getUserInitials } from "../../utils/avatarUtils";
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  Notifications,
  Dashboard,
  People,
  School,
  Assignment,
  Assessment,
  Home,
  ChevronLeft,
  Schedule,
  BarChart,
  Person as PersonIcon,
  Room as RoomIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

const drawerWidth = 280;

// Navigation items based on user role
const getNavigationItems = (userRole) => {
  const baseItems = [
    {
      text: "Trang chủ",
      icon: <Home />,
      path: "/home",
    },
    {
      text: "Tổng quan",
      icon: <Dashboard />,
      path: "/dashboard",
    },
  ];

  // Role-specific items
  if (userRole === "admin") {
    return [
      ...baseItems,
      {
        text: "Quản lý sinh viên",
        icon: <People />,
        path: "/students",
      },
      {
        text: "Quản lý giảng viên",
        icon: <PersonIcon />,
        path: "/teachers",
      },
      {
        text: "Quản lý lớp học",
        icon: <School />,
        path: "/classes",
      },
      {
        text: "Quản lý điểm số",
        icon: <Assessment />,
        path: "/grades",
      },
      {
        text: "Quản lý điểm danh",
        icon: <Assignment />,
        path: "/attendance",
      },
      {
        text: "Quản lý thời khóa biểu",
        icon: <Schedule />,
        path: "/schedule-management",
      },
      {
        text: "Quản lý phòng học",
        icon: <RoomIcon />,
        path: "/rooms",
      },
      {
        text: "Báo cáo hệ thống",
        icon: <BarChart />,
        path: "/reports",
      },
    ];
  }

  if (userRole === "teacher") {
    // Teacher-first mode: tập trung vào quản lý lớp; ẩn các trang quản trị tổng hợp
    return [
      ...baseItems,
      {
        text: "Lớp của tôi",
        icon: <School />,
        path: "/classes",
      },
      {
        text: "Cài đặt",
        icon: <Settings />,
        path: "/settings",
      },
      // Điểm và điểm danh sẽ thao tác trong trang lớp/phiên học
    ];
  }

  // Default to student
  return [
    ...baseItems,
    {
      text: "Lớp học",
      icon: <School />,
      path: "/classes",
    },
    {
      text: "Điểm số",
      icon: <Assessment />,
      path: "/grades",
    },
    {
      text: "Thời khóa biểu",
      icon: <Schedule />,
      path: "/schedule",
    },
    {
      text: "Điểm danh",
      icon: <Assignment />,
      path: "/attendance",
    },
    {
      text: "Cài đặt",
      icon: <Settings />,
      path: "/settings",
    },
  ];
};

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications] = useState(3); // Mock notifications

  const navigationItems = getNavigationItems(user?.role);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleProfileMenuClose();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <School />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              EduAttend
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Quản lý sinh viên
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info Section */}
      <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40 }} src={getAvatarSrc(user)}>
            {getUserInitials(user)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap fontWeight={600}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Chip
              label={
                user?.role === "admin"
                  ? "Admin"
                  : user?.role === "teacher"
                  ? "Giảng viên"
                  : "Sinh viên"
              }
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ px: 1, py: 2 }}>
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "white",
          color: "text.primary",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            {navigationItems.find((item) => item.path === location.pathname)
              ?.text || "Dashboard"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Notifications */}
            <Tooltip title="Thông báo">
              <IconButton color="inherit">
                <Badge badgeContent={notifications} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Settings */}
            <Tooltip title="Cài đặt">
              <IconButton
                color="inherit"
                onClick={() => handleNavigation("/settings")}
              >
                <Settings />
              </IconButton>
            </Tooltip>

            {/* User greeting - hidden on mobile */}
            <Typography
              variant="body2"
              sx={{
                mr: 2,
                display: { xs: "none", sm: "block" },
                fontWeight: 500,
              }}
            >
              Xin chào, {user?.first_name}
            </Typography>

            {/* Profile menu */}
            <Tooltip title="Tài khoản">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-search-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{
                  border: "2px solid transparent",
                  "&:hover": {
                    border: "2px solid rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <Avatar sx={{ width: 36, height: 36 }} src={getAvatarSrc(user)}>
                  {getUserInitials(user)}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              id="primary-search-account-menu"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  "& .MuiMenuItem-root": {
                    px: 2,
                    py: 1.5,
                  },
                },
              }}
            >
              {/* User info header */}
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.first_name} {user?.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>

              <MenuItem
                onClick={() => {
                  handleNavigation("/profile");
                  handleProfileMenuClose();
                }}
              >
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Hồ sơ cá nhân</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleNavigation("/settings");
                  handleProfileMenuClose();
                }}
              >
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cài đặt</ListItemText>
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                <ListItemIcon>
                  <Logout fontSize="small" sx={{ color: "error.main" }} />
                </ListItemIcon>
                <ListItemText>Đăng xuất</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
