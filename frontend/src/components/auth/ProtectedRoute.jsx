import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import AuthUtils from '../../utils/authUtils';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requireAdmin = false, 
  requireTeacher = false,
  redirectTo = '/login' 
}) => {  
  const { user, isLoading, isAuthenticated } = useSelector((state) => state.auth);
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Đang kiểm tra quyền truy cập...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check admin access
  if (requireAdmin) {
    const userRole = user?.role || 'student'
    if (userRole !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check teacher access (admin can also access teacher routes)
  if (requireTeacher) {
    const userRole = user?.role || 'student'
    if (!['admin', 'teacher'].includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check specific role requirement
  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      // Check if user has any of the required roles
      // If user doesn't have role, assume student (default)
      const userRole = user?.role || 'student'
      if (!requiredRole.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      // Check single role
      // If user doesn't have role, assume student (default)
      const userRole = user?.role || 'student'
      if (userRole !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // Check account status
  const userStatus = user?.account_status || 'active'
  
  if (userStatus === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (userStatus === 'suspended') {
    return <Navigate to="/unauthorized" replace />;
  }

  if (userStatus === 'rejected') {
    return <Navigate to="/account-rejected" replace />;
  }

  // All checks passed, render the protected content
  return children;
};

export default ProtectedRoute;
