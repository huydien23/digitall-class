import { useSelector } from 'react-redux'
import AuthUtils from '../utils/authUtils'

export const useAuth = () => {
  const { isAuthenticated, user, isLoading, error } = useSelector((state) => state.auth)
  
  // Treat user object as both user and profile for compatibility
  const profile = user

  const hasRole = (role) => {
    return AuthUtils.hasRole(user, role)
  }

  const hasAnyRole = (roles) => {
    return AuthUtils.hasAnyRole(user, roles)
  }

  const isAdmin = () => AuthUtils.isAdmin(user)
  const isTeacher = () => AuthUtils.isTeacher(user)
  const isStudent = () => AuthUtils.isStudent(user)

  const canAccessAdminFeatures = () => {
    return AuthUtils.canAccessAdminFeatures(user)
  }

  const canManageUsers = () => {
    return AuthUtils.canManageUsers(user)
  }

  const canApproveTeachers = () => {
    return AuthUtils.canApproveTeachers(user)
  }
  // Additional utility methods
  const getDashboardPath = () => AuthUtils.getDashboardPath(user)
  const getDisplayName = () => AuthUtils.getDisplayName(user)
  const canAccessRoute = (route, requiredRoles) => AuthUtils.canAccessRoute(user, route, requiredRoles)

  return {
    isAuthenticated,
    user,
    profile,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    isAdmin,
    isTeacher,
    isStudent,
    canAccessAdminFeatures,
    canManageUsers,
    canApproveTeachers,
    getDashboardPath,
    getDisplayName,
    canAccessRoute,
  }
}

export default useAuth
