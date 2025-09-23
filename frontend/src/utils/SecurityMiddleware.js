import { ACCOUNT_STATUS } from '../utils/constants'
import APIService from '../services/apiService'

class SecurityMiddleware {
  /**
   * Kiểm tra tính hợp lệ của session và trạng thái tài khoản
   */
  static async validateSession() {
    try {
      // Kiểm tra access token
      const accessToken = localStorage.getItem('accessToken')
      if (!accessToken) {
        return { valid: false, reason: 'No access token' }
      }

      // Kiểm tra thông tin user profile
      const profileResponse = await APIService.getUserProfile()
      if (!profileResponse) {
        return { valid: false, reason: 'Profile not found' }
      }

      // Kiểm tra trạng thái tài khoản
      if (profileResponse.account_status !== ACCOUNT_STATUS.ACTIVE) {
        return { 
          valid: false, 
          reason: 'Account not active',
          status: profileResponse.account_status 
        }
      }

      return { 
        valid: true, 
        profile: profileResponse 
      }
    } catch (error) {
      console.error('Session validation error:', error)
      return { valid: false, reason: 'Validation error' }
    }
  }

  /**
   * Middleware để bảo vệ các API call quan trọng
   */
  static async secureApiCall(apiFunction, requiredRole = null) {
    const validation = await this.validateSession()
    
    if (!validation.valid) {
      throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
    }

    if (requiredRole && validation.profile.role !== requiredRole) {
      throw new Error('Bạn không có quyền thực hiện hành động này.')
    }

    return apiFunction()
  }

  /**
   * Kiểm tra và làm sạch input để tránh injection
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input
    
    // Loại bỏ các ký tự nguy hiểm
    return input
      .replace(/[<>]/g, '') // Loại bỏ HTML tags cơ bản
      .replace(/javascript:/gi, '') // Loại bỏ javascript protocol
      .replace(/on\w+\s*=/gi, '') // Loại bỏ event handlers
      .trim()
  }

  /**
   * Validate email theo domain cho phép
   */
  static validateEmailDomain(email, allowedDomains) {
    const domain = email.split('@')[1]
    return allowedDomains.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith('.' + allowedDomain)
    )
  }

  /**
   * Kiểm tra độ mạnh của mật khẩu
   */
  static validatePasswordStrength(password) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const issues = []
    
    if (password.length < minLength) {
      issues.push(`Mật khẩu phải có ít nhất ${minLength} ký tự`)
    }
    
    if (!hasUpperCase) {
      issues.push('Mật khẩu phải có ít nhất 1 chữ hoa')
    }
    
    if (!hasLowerCase) {
      issues.push('Mật khẩu phải có ít nhất 1 chữ thường')
    }
    
    if (!hasNumbers) {
      issues.push('Mật khẩu phải có ít nhất 1 số')
    }
    
    if (!hasSpecialChar) {
      issues.push('Mật khẩu nên có ít nhất 1 ký tự đặc biệt')
    }

    return {
      isValid: issues.length === 0,
      issues,
      score: [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
    }
  }

  /**
   * Rate limiting - giới hạn số lần thử
   */
  static createRateLimiter(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const attempts = new Map()

    return (identifier) => {
      const now = Date.now()
      const userAttempts = attempts.get(identifier) || { count: 0, resetTime: now + windowMs }

      if (now > userAttempts.resetTime) {
        userAttempts.count = 0
        userAttempts.resetTime = now + windowMs
      }

      userAttempts.count++
      attempts.set(identifier, userAttempts)

      if (userAttempts.count > maxAttempts) {
        const timeLeft = Math.ceil((userAttempts.resetTime - now) / 1000 / 60)
        throw new Error(`Quá nhiều lần thử. Vui lòng thử lại sau ${timeLeft} phút.`)
      }

      return userAttempts.count
    }
  }
}

// Tạo rate limiter cho login
export const loginRateLimiter = SecurityMiddleware.createRateLimiter(5, 15 * 60 * 1000)

export default SecurityMiddleware
