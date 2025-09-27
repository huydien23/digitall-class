import apiService from './apiService'

// Helper to clean response data from any proxy objects
const cleanResponse = (response) => {
  try {
    // Deep clone to remove any proxy objects
    if (response?.data) {
      response.data = JSON.parse(JSON.stringify(response.data))
    }
  } catch (e) {
    console.warn('Failed to clean response:', e)
  }
  return response
}

const attendanceService = {
  // Attendance sessions
  getSessions: (params) => apiService.axiosInstance.get('/attendance/sessions/', { params }),
  getSession: (id) => apiService.axiosInstance.get(`/attendance/sessions/${id}/`),
  createSession: (sessionData) => apiService.axiosInstance.post('/attendance/sessions/', sessionData),
  updateSession: (id, sessionData) => apiService.axiosInstance.put(`/attendance/sessions/${id}/`, sessionData),
  deleteSession: (id) => apiService.axiosInstance.delete(`/attendance/sessions/${id}/`),
  
  // QR Code functionality
  generateQRCode: (sessionId) => apiService.axiosInstance.post(`/attendance/sessions/${sessionId}/generate-qr/`),
  checkInWithQR: (qrData) => apiService.axiosInstance.post('/attendance/check-in-qr/', qrData),
  getAttendanceAnalytics: (sessionId) => apiService.axiosInstance.get(`/attendance/sessions/${sessionId}/analytics/`),
  
  // Attendance records
  getAttendances: (params) => apiService.axiosInstance.get('/attendance/', { params }).then(cleanResponse),
  getAttendance: (id) => apiService.axiosInstance.get(`/attendance/${id}/`).then(cleanResponse),
  createAttendance: (attendanceData) => apiService.axiosInstance.post('/attendance/', attendanceData),
  updateAttendance: (id, attendanceData) => apiService.axiosInstance.put(`/attendance/${id}/`, attendanceData),
  deleteAttendance: (id) => apiService.axiosInstance.delete(`/attendance/${id}/`),
  
  // Statistics and export
  getAttendanceStatistics: () => apiService.axiosInstance.get('/attendance/statistics/'),
  exportAttendance: (params) => apiService.axiosInstance.get('/attendance/export/', { 
    params,
    responseType: 'blob' 
  }),
}

export default attendanceService
