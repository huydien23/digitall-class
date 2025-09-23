/**
 * Authentication Utilities
 * Handles authentication logic, token management, and user permissions
 */

import { USER_ROLES, ACCOUNT_STATUS, VALIDATION_RULES } from './constants';

export class AuthUtils {
  /**
   * Check if user has specific role
   */
  static hasRole(user, role) {
    // If user doesn't have role/account_status, assume student with active status
    const userRole = user?.role || 'student'
    const userStatus = user?.account_status || 'active'
    
    return userRole === role && userStatus === ACCOUNT_STATUS.ACTIVE;
  }

  /**
   * Check if user has any of the provided roles
   */
  static hasAnyRole(user, roles) {
    return roles.some(role => this.hasRole(user, role));
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user) {
    return this.hasRole(user, USER_ROLES.ADMIN);
  }

  /**
   * Check if user is teacher
   */
  static isTeacher(user) {
    return this.hasRole(user, USER_ROLES.TEACHER);
  }

  /**
   * Check if user is student
   */
  static isStudent(user) {
    return this.hasRole(user, USER_ROLES.STUDENT);
  }

  /**
   * Check if user account is active
   */
  static isAccountActive(user) {
    const userStatus = user?.account_status || 'active'
    return userStatus === ACCOUNT_STATUS.ACTIVE;
  }

  /**
   * Check if user account needs approval
   */
  static needsApproval(user) {
    const userStatus = user?.account_status || 'active'
    return userStatus === ACCOUNT_STATUS.PENDING;
  }

  /**
   * Check if user can access admin features
   */
  static canAccessAdminFeatures(user) {
    return this.isAdmin(user) && this.isAccountActive(user);
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(user) {
    return this.isAdmin(user);
  }

  /**
   * Check if user can approve teachers
   */
  static canApproveTeachers(user) {
    return this.isAdmin(user);
  }

  /**
   * Get dashboard path based on user role
   */
  static getDashboardPath(user) {
    if (!user || !this.isAccountActive(user)) {
      return '/login';
    }

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return '/admin/dashboard';
      case USER_ROLES.TEACHER:
        return '/teacher/dashboard';
      case USER_ROLES.STUDENT:
        return '/student/dashboard';
      default:
        return '/dashboard';
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password) {
    const rules = VALIDATION_RULES.PASSWORD;
    const errors = [];

    if (password.length < rules.MIN_LENGTH) {
      errors.push(`Mật khẩu phải có ít nhất ${rules.MIN_LENGTH} ký tự`);
    }

    if (rules.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ cái viết hoa');
    }

    if (rules.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ cái viết thường');
    }

    if (rules.REQUIRE_DIGIT && !/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ số');
    }

    if (rules.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate student ID (must be exactly 6 digits)
   */
  static validateStudentId(studentId) {
    if (!studentId) {
      return { isValid: false, error: 'Mã sinh viên là bắt buộc' };
    }
    if (!/^[0-9]{6}$/.test(studentId.trim())) {
      return { isValid: false, error: 'Mã sinh viên phải đúng 6 chữ số (VD: 226514)' };
    }
    return { isValid: true };
  }

  /**
   * Validate teacher ID (must be GV + 4 digits)
   */
  static validateTeacherId(teacherId) {
    if (!teacherId) {
      return { isValid: false, error: 'Mã giảng viên là bắt buộc' };
    }
    if (!/^GV[0-9]{4}$/.test(teacherId.trim())) {
      return { isValid: false, error: 'Mã giảng viên phải đúng định dạng GV + 4 số (VD: GV0921)' };
    }
    return { isValid: true };
  }

  /**
   * Validate email format (must be .edu domain for educational system)
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const eduDomainRegex = /\.edu(\.vn)?$/i;
    
    if (!email) {
      return { isValid: false, error: 'Email không được để trống' };
    }

    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email không hợp lệ' };
    }

    if (!eduDomainRegex.test(email)) {
      return { isValid: false, error: 'Email phải là domain .edu hoặc .edu.vn (VD: student@university.edu.vn)' };
    }

    return { isValid: true };
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone) {
    const rules = VALIDATION_RULES.PHONE;
    
    if (!phone) {
      return { isValid: true }; // Phone is optional
    }

    if (!rules.PATTERN.test(phone)) {
      return { 
        isValid: false, 
        error: 'Số điện thoại không hợp lệ. Ví dụ: 0123456789' 
      };
    }

    return { isValid: true };
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user, route, requiredRoles = []) {
    if (!user || !this.isAccountActive(user)) {
      return false;
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    return this.hasAnyRole(user, requiredRoles);
  }

  /**
   * Get user display name
   */
  static getDisplayName(user) {
    if (!user) return 'Unknown User';
    
    const fullName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
    
    return fullName || user.email || 'Unknown User';
  }

  /**
   * Format user info for display
   */
  static formatUserInfo(user) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      displayName: this.getDisplayName(user),
      role: user.role,
      roleLabel: this.getRoleLabel(user.role),
      status: user.account_status,
      statusLabel: this.getStatusLabel(user.account_status),
      isActive: this.isAccountActive(user),
      needsApproval: this.needsApproval(user)
    };
  }

  /**
   * Get role label
   */
  static getRoleLabel(role) {
    const labels = {
      [USER_ROLES.ADMIN]: 'Quản trị viên',
      [USER_ROLES.TEACHER]: 'Giảng viên',
      [USER_ROLES.STUDENT]: 'Sinh viên'
    };
    return labels[role] || role;
  }

  /**
   * Get status label
   */
  static getStatusLabel(status) {
    const labels = {
      [ACCOUNT_STATUS.ACTIVE]: 'Hoạt động',
      [ACCOUNT_STATUS.PENDING]: 'Chờ phê duyệt',
      [ACCOUNT_STATUS.SUSPENDED]: 'Tạm khóa',
      [ACCOUNT_STATUS.REJECTED]: 'Từ chối'
    };
    return labels[status] || status;
  }
}

export default AuthUtils;
