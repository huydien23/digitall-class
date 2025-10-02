import apiService from './apiService'

const classService = {
  // Classes CRUD
  getClasses: (params) => apiService.axiosInstance.get('/classes/', { params }),
  getClass: (id) => apiService.axiosInstance.get(`/classes/${id}/`),
  createClass: (classData) => apiService.axiosInstance.post('/classes/', classData),
  updateClass: (id, classData) => apiService.axiosInstance.put(`/classes/${id}/`, classData),
  deleteClass: (id) => apiService.axiosInstance.delete(`/classes/${id}/`),
  
  // Academic hierarchy management
  listYears: () => apiService.axiosInstance.get('/classes/years/'),
  createYear: (data) => apiService.axiosInstance.post('/classes/years/', data),
  listTerms: (params) => apiService.axiosInstance.get('/classes/terms/', { params }),
  createTerm: (data) => apiService.axiosInstance.post('/classes/terms/', data),
  getMyYears: () => apiService.axiosInstance.get('/classes/years/my/'),
  getMyTerms: (params) => apiService.axiosInstance.get('/classes/terms/my/', { params }),

  // Subjects
  listSubjects: (params) => apiService.axiosInstance.get('/classes/subjects/', { params }),
  createSubject: (data) => apiService.axiosInstance.post('/classes/subjects/', data),

  // Student management
  getClassStudents: (classId) => apiService.axiosInstance.get(`/classes/${classId}/students/`),
  addStudentToClass: (classId, studentId) => apiService.axiosInstance.post(`/classes/${classId}/students/`, { student_id: studentId }),
  removeStudentFromClass: (classId, studentId) => apiService.axiosInstance.delete(`/classes/${classId}/students/${studentId}/remove/`),
  getAvailableStudents: (classId) => apiService.axiosInstance.get(`/classes/${classId}/available-students/`),
  
  // Statistics and analytics
  getClassStatistics: () => apiService.axiosInstance.get('/classes/statistics/'),
  
  // Class detail with students, attendance, and grades
  getClassDetail: (classId) => apiService.axiosInstance.get(`/classes/${classId}/detail/`),
  // Create student accounts for a class
  createStudentAccounts: (classId, payload) => apiService.axiosInstance.post(`/classes/${classId}/create-student-accounts/`, payload),

  // Copy and roster import
  copyClass: (data) => apiService.axiosInstance.post('/classes/copy/', data),
  importRoster: (data) => apiService.axiosInstance.post('/classes/import-roster/', data),

  // Join tokens & join class
  getMyClasses: () => apiService.axiosInstance.get('/classes/my-classes/'),
  createJoinToken: (classId, { expires_in_minutes = 60, max_uses = 0 } = {}) =>
    apiService.axiosInstance.post(`/classes/${classId}/join-tokens/`, { expires_in_minutes, max_uses }),
  joinClassByToken: (token) => apiService.axiosInstance.post('/classes/join/', { token }),
  joinClassByCode: (class_id) => apiService.axiosInstance.post('/classes/join/', { class_id }),

  // Aliases for component compatibility
  getYears: () => apiService.axiosInstance.get('/classes/years/'),
  getSubjects: () => apiService.axiosInstance.get('/classes/subjects/'),
}

export default classService
