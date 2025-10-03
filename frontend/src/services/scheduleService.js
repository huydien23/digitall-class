import apiService from './apiService'

/**
 * Schedule Service
 * Handles all API calls related to schedules/timetables
 */

const scheduleService = {
  /**
   * Get all schedules with optional filters
   * @param {Object} params - Query parameters (class_id, teacher_id, day_of_week, etc.)
   * @returns {Promise}
   */
  getSchedules: (params = {}) => {
    return apiService.get('/schedules/', { params })
  },

  /**
   * Get a single schedule by ID
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise}
   */
  getScheduleById: (scheduleId) => {
    return apiService.get(`/schedules/${scheduleId}/`)
  },

  /**
   * Create a new schedule
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise}
   */
  createSchedule: (scheduleData) => {
    return apiService.post('/schedules/', scheduleData)
  },

  /**
   * Update an existing schedule
   * @param {number} scheduleId - Schedule ID
   * @param {Object} scheduleData - Updated schedule data
   * @returns {Promise}
   */
  updateSchedule: (scheduleId, scheduleData) => {
    return apiService.put(`/schedules/${scheduleId}/`, scheduleData)
  },

  /**
   * Partially update a schedule
   * @param {number} scheduleId - Schedule ID
   * @param {Object} scheduleData - Partial schedule data
   * @returns {Promise}
   */
  patchSchedule: (scheduleId, scheduleData) => {
    return apiService.patch(`/schedules/${scheduleId}/`, scheduleData)
  },

  /**
   * Delete a schedule
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise}
   */
  deleteSchedule: (scheduleId) => {
    return apiService.delete(`/schedules/${scheduleId}/`)
  },

  /**
   * Get schedules for a specific class
   * @param {number} classId - Class ID
   * @returns {Promise}
   */
  getSchedulesByClass: (classId) => {
    return apiService.get('/schedules/', { 
      params: { class_id: classId } 
    })
  },

  /**
   * Get schedules for a specific teacher
   * @param {number} teacherId - Teacher ID
   * @returns {Promise}
   */
  getSchedulesByTeacher: (teacherId) => {
    return apiService.get('/schedules/', { 
      params: { teacher_id: teacherId } 
    })
  },

  /**
   * Get schedules for current teacher (from token)
   * @returns {Promise}
   */
  getMySchedules: () => {
    return apiService.get('/schedules/my-schedules/')
  },

  /**
   * Get schedules for a specific week
   * @param {string} startDate - Start date of week (YYYY-MM-DD)
   * @param {string} endDate - End date of week (YYYY-MM-DD)
   * @returns {Promise}
   */
  getSchedulesByWeek: (startDate, endDate) => {
    return apiService.get('/schedules/', { 
      params: { 
        start_date: startDate,
        end_date: endDate
      } 
    })
  },

  /**
   * Bulk create schedules
   * @param {Array} schedulesData - Array of schedule objects
   * @returns {Promise}
   */
  bulkCreateSchedules: (schedulesData) => {
    return apiService.post('/schedules/bulk-create/', { schedules: schedulesData })
  },

  /**
   * Check for schedule conflicts
   * @param {Object} scheduleData - Schedule data to check
   * @returns {Promise}
   */
  checkConflicts: (scheduleData) => {
    return apiService.post('/schedules/check-conflicts/', scheduleData)
  },

  /**
   * Get student schedule by class enrollment
   * @returns {Promise}
   */
  getStudentSchedule: () => {
    return apiService.get('/schedules/student-schedule/')
  }
}

export default scheduleService
