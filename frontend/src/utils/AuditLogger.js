import APIService from '../services/apiService'

class AuditLogger {
  /**
   * Ghi log các hành động quan trọng
   */
  static async logAction(action, details = {}, userId = null) {
    try {
      const logEntry = {
        action,
        details: typeof details === 'object' ? details : { message: details },
        user_id: userId,
        timestamp: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      }

      // In development, log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Security Log:', logEntry)
      }
      // TODO: Gửi log lên server backend
      // await APIService.createAuditLog(logEntry)
      
      return logEntry
    } catch (error) {
      console.error('Failed to log action:', error)
    }
  }

  /**
   * Log đăng nhập
   */
  static async logLogin(email, success = true, reason = null) {
    await this.logAction('LOGIN_ATTEMPT', {
      email,
      success,
      reason,
    })
  }

  /**
   * Log đăng ký
   */
  static async logRegistration(email, role, success = true, reason = null) {
    await this.logAction('REGISTRATION_ATTEMPT', {
      email,
      role,
      success,
      reason,
    })
  }

  /**
   * Log phê duyệt tài khoản
   */
  static async logAccountApproval(targetUserId, action, approvedBy) {
    await this.logAction('ACCOUNT_APPROVAL', {
      target_user_id: targetUserId,
      approval_action: action, // 'approve', 'reject', 'suspend'
      approved_by: approvedBy,
    })
  }

  /**
   * Log truy cập trang admin
   */
  static async logAdminAccess(page, userId) {
    await this.logAction('ADMIN_ACCESS', {
      page,
    }, userId)
  }

  /**
   * Log các hành động nghi ngờ
   */
  static async logSuspiciousActivity(activity, details, userId = null) {
    await this.logAction('SUSPICIOUS_ACTIVITY', {
      activity,
      ...details,
    }, userId)
  }

  /**
   * Lấy IP client (simplified)
   */
  static async getClientIP() {
    try {
      // Trong production, bạn có thể sử dụng service để lấy IP
      return 'unknown'
    } catch {
      return 'unknown'
    }
  }
}

export default AuditLogger
