import apiService from './apiService'

const submissionService = {
  getSubmissions: (params) => apiService.axiosInstance.get('/submissions/', { params }),
  getSubmission: (id) => apiService.axiosInstance.get(`/submissions/${id}/`),
  uploadSubmission: (formData) => apiService.axiosInstance.post('/submissions/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSubmission: (id) => apiService.axiosInstance.delete(`/submissions/${id}/`),
}

export default submissionService
