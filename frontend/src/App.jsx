import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SnackbarProvider } from "notistack";

// Layout
import Layout from "./components/Layout/Layout";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import PendingApproval from "./components/auth/PendingApproval";
import Unauthorized from "./components/auth/Unauthorized";

// Dashboard Components
import Dashboard from "./pages/Dashboard/Dashboard";

// Page Components
import HomePage from "./pages/Home/HomePage";
import Students from "./pages/Students/Students";
import Classes from "./pages/Classes/Classes";
import ClassDetailPage from "./components/Class/ClassDetailPage";
import RoleAwareClassDetail from "./components/Class/RoleAwareClassDetail";
import RoleAwareClasses from "./components/Class/RoleAwareClasses";
import TeachingManagementPage from "./pages/Classes/TeachingManagement";
import Grades from "./pages/Grades/Grades";
import Attendance from "./pages/Attendance/Attendance";
import StudentCheckInPage from "./pages/Attendance/StudentCheckInPage";
import JoinClassPage from "./pages/Classes/JoinClassPage";
import Schedule from "./pages/Schedule/Schedule";
import ClassAssignmentsPage from "./pages/Assignments/ClassAssignmentsPage";
import AssignmentSubmissionsPage from "./pages/Assignments/AssignmentSubmissionsPage";
import Teachers from "./pages/Teachers/Teachers";
import ScheduleManagement from "./pages/ScheduleManagement/ScheduleManagement";
import Rooms from "./pages/Rooms/Rooms";
import SystemReports from "./pages/Reports/SystemReports";
import AttendanceManagement from "./pages/Attendance/AttendanceManagement";
import GradeManagement from "./pages/Grades/GradeManagement";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import Materials from "./pages/Materials/Materials";
import NotFound from "./pages/NotFound/NotFound";

// Debug Components - Removed

// Protected Route Component
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Error Boundary
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import EnhancedErrorBoundary from "./components/ErrorBoundary/EnhancedErrorBoundary";

// Redux actions
import { getProfile } from "./store/slices/authSlice";

const App = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  // Initialize user profile on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]); // Removed isAuthenticated to prevent infinite loop

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = (userRole) => {
    // Always use unified dashboard route
    return "/dashboard";
  };

  return (
    <EnhancedErrorBoundary>
      <SnackbarProvider maxSnack={3}>
        <Routes>
          {/* Public Routes - Only accessible when NOT authenticated */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to={getDashboardRoute(user?.role)} replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to={getDashboardRoute(user?.role)} replace />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? (
                <Navigate to={getDashboardRoute(user?.role)} replace />
              ) : (
                <ForgotPassword />
              )
            }
          />
          <Route
            path="/reset-password"
            element={
              isAuthenticated ? (
                <Navigate to={getDashboardRoute(user?.role)} replace />
              ) : (
                <ResetPassword />
              )
            }
          />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root Route - Public homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Authenticated Routes - Only accessible when authenticated */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Dashboard Routes - Role-based */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Management Routes - Role-based */}
          <Route
            path="/students"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teaching-management"
            element={
              <ProtectedRoute requiredRole={["teacher"]}>
                <Layout>
                  <TeachingManagementPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes"
            element={
              <ProtectedRoute requiredRole={["admin", "teacher", "student"]}>
                <Layout>
                  <RoleAwareClasses />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes/:classId"
            element={
              <ProtectedRoute requiredRole={["admin", "teacher", "student"]}>
                <Layout>
                  <RoleAwareClassDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes/:classId/assignments"
            element={
              <ProtectedRoute requiredRole={["admin", "teacher", "student"]}>
                <Layout>
                  <ClassAssignmentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes/:classId/assignments/:assignmentId/submissions"
            element={
              <ProtectedRoute requiredRole={["admin", "teacher"]}>
                <Layout>
                  <AssignmentSubmissionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                <Layout>
                  <Grades />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <Attendance />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkin"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentCheckInPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/join-class"
            element={
              <ProtectedRoute>
                <Layout>
                  <JoinClassPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule"
            element={
              <ProtectedRoute requiredRole={["admin", "teacher", "student"]}>
                <Layout>
                  <Schedule />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <Layout>
                  <Teachers />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule-management"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <Layout>
                  <ScheduleManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <Layout>
                  <Rooms />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Materials Library for Teacher/Admin */}
          <Route
            path="/materials"
            element={
              <ProtectedRoute requiredRole={["admin", "teacher"]}>
                <Layout>
                  <Materials />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole={["admin"]}>
                <Layout>
                  <SystemReports />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Settings Route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Debug Routes - Removed */}

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SnackbarProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;
