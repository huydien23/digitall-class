import apiService from './apiService'

const classService = {
  // Classes CRUD
  getClasses: (params) => apiService.axiosInstance.get('/classes/', { params }),
  getClass: (id) => apiService.axiosInstance.get(`/classes/${id}/`),
  createClass: (classData) => apiService.axiosInstance.post('/classes/', classData),
  updateClass: (id, classData) => apiService.axiosInstance.put(`/classes/${id}/`, classData),
  deleteClass: (id) => apiService.axiosInstance.delete(`/classes/${id}/`),
  
  // Student management
  getClassStudents: (classId) => apiService.axiosInstance.get(`/classes/${classId}/students/`),
  addStudentToClass: (classId, studentId) => apiService.axiosInstance.post(`/classes/${classId}/students/`, { student_id: studentId }),
  removeStudentFromClass: (classId, studentId) => apiService.axiosInstance.delete(`/classes/${classId}/students/${studentId}/remove/`),
  getAvailableStudents: (classId) => apiService.axiosInstance.get(`/classes/${classId}/available-students/`),
  
  // Statistics and analytics
  getClassStatistics: () => apiService.axiosInstance.get('/classes/statistics/'),
  
  // Class detail with students, attendance, and grades
  getClassDetail: (classId) => apiService.axiosInstance.get(`/classes/${classId}/detail/`),

  // Join tokens & join class
  getMyClasses: () => apiService.axiosInstance.get('/classes/my-classes/'),
  createJoinToken: (classId, { expires_in_minutes = 60, max_uses = 0 } = {}) =>
    apiService.axiosInstance.post(`/classes/${classId}/join-tokens/`, { expires_in_minutes, max_uses }),
  joinClassByToken: (token) => apiService.axiosInstance.post('/classes/join/', { token }),
  joinClassByCode: (class_id) => apiService.axiosInstance.post('/classes/join/', { class_id }),
}

export default classService
