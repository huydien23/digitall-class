import apiService from './apiService'

const studentService = {
  // CRUD operations
  getStudents: (params) => apiService.axiosInstance.get('/students/', { params }),
  getStudent: (id) => apiService.axiosInstance.get(`/students/${id}/`),
  createStudent: (studentData) => {
    // Handle FormData for file uploads
    if (studentData instanceof FormData) {
      return apiService.axiosInstance.post('/students/', studentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }
    return apiService.axiosInstance.post('/students/', studentData)
  },
  updateStudent: (id, studentData) => {
    // Handle FormData for file uploads
    if (studentData instanceof FormData) {
      return apiService.axiosInstance.put(`/students/${id}/`, studentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }
    return apiService.axiosInstance.put(`/students/${id}/`, studentData)
  },
  deleteStudent: (id) => apiService.axiosInstance.delete(`/students/${id}/`),
  
  // Import/Export operations
  importStudents: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiService.axiosInstance.post('/students/import-excel/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  exportStudents: (params) => apiService.axiosInstance.get('/students/export-excel/', { 
    params,
    responseType: 'blob'
  }),
  
  // Bulk operations
  bulkCreateStudents: (studentsData) => apiService.axiosInstance.post('/students/bulk-create/', {
    students: studentsData
  }),
  
  // Statistics and analytics
  getStudentStatistics: () => apiService.axiosInstance.get('/students/statistics/'),
  
  // Search and filtering
  searchStudents: (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    }
    return apiService.axiosInstance.get('/students/', { params })
  },

  // Admin/teacher tools
  resetPassword: (studentId, new_password) =>
    apiService.axiosInstance.post(`/students/${studentId}/reset-password/`, { new_password }),

  // Optional batch endpoints (will be used if backend supports)
  resetPasswordBatch: (student_ids, new_password) =>
    apiService.axiosInstance.post('/students/reset-password/batch/', { student_ids, new_password }),
  deleteStudents: (student_ids) =>
    apiService.axiosInstance.post('/students/delete/batch/', { student_ids }),

  // Optional email notification
  sendPasswordEmail: (student_ids, payload = {}) =>
    apiService.axiosInstance.post('/students/password-email/', { student_ids, ...payload }),
}

export default studentService
