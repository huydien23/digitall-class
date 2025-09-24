// Attendance Security Service - Chống gian lận điểm danh
class AttendanceSecurityService {
  constructor() {
    this.suspiciousActivities = []
    this.deviceFingerprints = new Map()
    this.rateLimits = new Map()
  }

  /**
   * Kiểm tra tổng thể trước khi cho phép điểm danh
   */
  async validateAttendanceAttempt(attendanceData) {
    const {
      studentId,
      sessionId,
      classId,
      location,
      deviceInfo,
      timestamp
    } = attendanceData

    const validationResult = {
      isValid: true,
      reasons: [],
      riskScore: 0
    }

    // 1. Kiểm tra sinh viên có trong lớp
    const isEnrolled = await this.checkStudentEnrollment(studentId, classId)
    if (!isEnrolled) {
      validationResult.isValid = false
      validationResult.reasons.push('Sinh viên không có trong danh sách lớp')
      validationResult.riskScore += 100
      return validationResult
    }

    // 2. Kiểm tra thời gian hợp lệ
    const timeValidation = this.validateTimeWindow(sessionId, timestamp)
    if (!timeValidation.isValid) {
      validationResult.isValid = false
      validationResult.reasons.push(timeValidation.reason)
      validationResult.riskScore += 50
    }

    // 3. Kiểm tra vị trí địa lý
    const locationValidation = await this.validateLocation(location, classId)
    if (!locationValidation.isValid) {
      validationResult.riskScore += 70
      validationResult.reasons.push('Vị trí không hợp lệ')
      // Không từ chối hoàn toàn vì GPS có thể không chính xác
    }

    // 4. Kiểm tra device fingerprint
    const deviceValidation = this.validateDeviceFingerprint(studentId, deviceInfo)
    if (!deviceValidation.isValid) {
      validationResult.riskScore += 30
      validationResult.reasons.push('Thiết bị đáng nghi')
    }

    // 5. Kiểm tra rate limiting
    const rateLimitValidation = this.checkRateLimit(deviceInfo.ip, sessionId)
    if (!rateLimitValidation.isValid) {
      validationResult.isValid = false
      validationResult.reasons.push('Quá nhiều lần thử từ cùng một địa chỉ IP')
      validationResult.riskScore += 80
    }

    // 6. Kiểm tra duplicate attendance
    const duplicateCheck = await this.checkDuplicateAttendance(studentId, sessionId)
    if (!duplicateCheck.isValid) {
      validationResult.isValid = false
      validationResult.reasons.push('Đã điểm danh cho buổi học này')
      validationResult.riskScore += 100
    }

    // Quyết định cuối cùng
    if (validationResult.riskScore >= 100) {
      validationResult.isValid = false
    } else if (validationResult.riskScore >= 50) {
      // Ghi lại hoạt động đáng nghi để review
      this.logSuspiciousActivity(attendanceData, validationResult)
    }

    return validationResult
  }

  /**
   * Kiểm tra sinh viên có đăng ký lớp học này không
   */
  async checkStudentEnrollment(studentId, classId) {
    try {
      // Gọi API kiểm tra enrollment
      const response = await fetch(`/api/classes/${classId}/students/${studentId}/enrollment`)
      const data = await response.json()
      return data.isEnrolled && data.status === 'active'
    } catch (error) {
      console.error('Error checking enrollment:', error)
      return false
    }
  }

  /**
   * Kiểm tra thời gian điểm danh có hợp lệ
   */
  validateTimeWindow(sessionId, timestamp) {
    // Mock session data - thực tế sẽ lấy từ database
    const sessionData = {
      startTime: '07:00',
      endTime: '11:00',
      date: '2024-09-24',
      allowEarlyMinutes: 15,
      allowLateMinutes: 30
    }

    const sessionStart = new Date(`${sessionData.date} ${sessionData.startTime}`)
    const sessionEnd = new Date(`${sessionData.date} ${sessionData.endTime}`)
    const currentTime = new Date(timestamp)

    const earliestAllowed = new Date(sessionStart.getTime() - (sessionData.allowEarlyMinutes * 60000))
    const latestAllowed = new Date(sessionEnd.getTime() + (sessionData.allowLateMinutes * 60000))

    if (currentTime < earliestAllowed || currentTime > latestAllowed) {
      return {
        isValid: false,
        reason: `Chỉ có thể điểm danh từ ${earliestAllowed.toLocaleTimeString()} đến ${latestAllowed.toLocaleTimeString()}`
      }
    }

    return { isValid: true }
  }

  /**
   * Kiểm tra vị trí địa lý
   */
  async validateLocation(currentLocation, classId) {
    if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
      return {
        isValid: false,
        reason: 'Không thể xác định vị trí'
      }
    }

    // Mock classroom location - thực tế lấy từ database
    const classLocation = {
      latitude: 10.7769,
      longitude: 106.6951,
      radius: 100 // 100 meters
    }

    const distance = this.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      classLocation.latitude,
      classLocation.longitude
    )

    if (distance > classLocation.radius) {
      return {
        isValid: false,
        reason: `Khoảng cách ${Math.round(distance)}m vượt quá giới hạn cho phép (${classLocation.radius}m)`,
        distance: Math.round(distance)
      }
    }

    return { 
      isValid: true, 
      distance: Math.round(distance) 
    }
  }

  /**
   * Tính khoảng cách giữa 2 điểm GPS (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c // Distance in meters
  }

  /**
   * Kiểm tra device fingerprint
   */
  validateDeviceFingerprint(studentId, deviceInfo) {
    const fingerprint = this.generateFingerprint(deviceInfo)
    const stored = this.deviceFingerprints.get(studentId)

    if (stored && stored !== fingerprint) {
      // Thiết bị khác với lần trước - có thể đáng nghi
      return {
        isValid: false,
        reason: 'Thiết bị không khớp với lần điểm danh trước'
      }
    }

    // Lưu fingerprint cho lần sau
    this.deviceFingerprints.set(studentId, fingerprint)
    
    return { isValid: true }
  }

  /**
   * Tạo device fingerprint
   */
  generateFingerprint(deviceInfo) {
    const components = [
      deviceInfo.userAgent?.substring(0, 50) || '',
      deviceInfo.screen || '',
      deviceInfo.timezone || '',
      deviceInfo.language || ''
    ]
    
    return btoa(components.join('|'))
  }

  /**
   * Kiểm tra rate limiting
   */
  checkRateLimit(ip, sessionId) {
    const key = `${sessionId}_${ip}`
    const now = Date.now()
    const windowMs = 60000 // 1 minute window
    const maxAttempts = 5

    let attempts = this.rateLimits.get(key) || []
    
    // Loại bỏ attempts cũ hơn window
    attempts = attempts.filter(time => now - time < windowMs)
    
    if (attempts.length >= maxAttempts) {
      return {
        isValid: false,
        reason: 'Quá nhiều lần thử trong thời gian ngắn'
      }
    }

    // Thêm attempt hiện tại
    attempts.push(now)
    this.rateLimits.set(key, attempts)

    return { isValid: true }
  }

  /**
   * Kiểm tra duplicate attendance
   */
  async checkDuplicateAttendance(studentId, sessionId) {
    try {
      const response = await fetch(`/api/attendance/${sessionId}/${studentId}`)
      const data = await response.json()
      
      if (data.exists) {
        return {
          isValid: false,
          reason: 'Đã điểm danh cho buổi học này'
        }
      }
      
      return { isValid: true }
    } catch (error) {
      console.error('Error checking duplicate attendance:', error)
      return { isValid: true } // Allow if can't check
    }
  }

  /**
   * Ghi lại hoạt động đáng nghi
   */
  logSuspiciousActivity(attendanceData, validationResult) {
    const activity = {
      timestamp: new Date().toISOString(),
      studentId: attendanceData.studentId,
      sessionId: attendanceData.sessionId,
      riskScore: validationResult.riskScore,
      reasons: validationResult.reasons,
      deviceInfo: attendanceData.deviceInfo,
      location: attendanceData.location
    }

    this.suspiciousActivities.push(activity)
    
    // Gửi alert nếu risk score cao
    if (validationResult.riskScore >= 70) {
      this.sendSecurityAlert(activity)
    }
  }

  /**
   * Gửi cảnh báo bảo mật
   */
  async sendSecurityAlert(activity) {
    try {
      await fetch('/api/security/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SUSPICIOUS_ATTENDANCE',
          severity: activity.riskScore >= 90 ? 'HIGH' : 'MEDIUM',
          data: activity
        })
      })
    } catch (error) {
      console.error('Failed to send security alert:', error)
    }
  }

  /**
   * Lấy báo cáo hoạt động đáng nghi
   */
  getSuspiciousActivitiesReport(classId = null, timeRange = '24h') {
    let activities = this.suspiciousActivities

    // Filter theo thời gian
    const now = Date.now()
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    }
    
    const rangeMs = timeRanges[timeRange] || timeRanges['24h']
    activities = activities.filter(activity => 
      now - new Date(activity.timestamp).getTime() < rangeMs
    )

    return {
      total: activities.length,
      highRisk: activities.filter(a => a.riskScore >= 90).length,
      mediumRisk: activities.filter(a => a.riskScore >= 50 && a.riskScore < 90).length,
      activities: activities.sort((a, b) => b.riskScore - a.riskScore)
    }
  }
}

export default new AttendanceSecurityService()