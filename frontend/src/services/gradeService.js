import apiService from './apiService'

const gradeService = {
  // Grades CRUD
  getGrades: (params) => apiService.axiosInstance.get('/grades/', { params }),
  getGrade: (id) => apiService.axiosInstance.get(`/grades/${id}/`),
  createGrade: (gradeData) => apiService.axiosInstance.post('/grades/', gradeData),
  updateGrade: (id, gradeData) => apiService.axiosInstance.put(`/grades/${id}/`, gradeData),
  deleteGrade: (id) => apiService.axiosInstance.delete(`/grades/${id}/`),
  
  // Grade calculations and summaries
  getGradeStatistics: () => apiService.axiosInstance.get('/grades/statistics/'),
  getStudentGradeSummary: (studentId) => apiService.axiosInstance.get(`/grades/student/${studentId}/summary/`),
  getClassGradeSummary: (classId) => apiService.axiosInstance.get(`/grades/class/${classId}/summary/`),
  
  // Export functionality
  exportGrades: (params) => apiService.axiosInstance.get('/grades/export/', { 
    params,
    responseType: 'blob' 
  }),
}

export default gradeService
