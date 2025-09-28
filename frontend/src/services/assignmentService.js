import apiService from './apiService'

const assignmentService = {
  // assignments
  list: (params) => apiService.axiosInstance.get('/assignments/', { params }),
  get: (id) => apiService.axiosInstance.get(`/assignments/${id}/`),
  create: (data) => apiService.axiosInstance.post('/assignments/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => apiService.axiosInstance.put(`/assignments/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => apiService.axiosInstance.delete(`/assignments/${id}/`),

  // student interactions
  start: (assignmentId) => apiService.axiosInstance.post(`/assignments/${assignmentId}/start/`),
  mySubmission: (assignmentId) => apiService.axiosInstance.get(`/assignments/${assignmentId}/my-submission/`),
  submit: (assignmentId, file) => {
    const form = new FormData()
    form.append('file', file)
    return apiService.axiosInstance.post(`/assignments/${assignmentId}/submit/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },

  // teacher
  listSubmissions: (assignmentId) => apiService.axiosInstance.get(`/assignments/${assignmentId}/submissions/`),
  gradeSubmission: (assignmentId, submissionId, data) => apiService.axiosInstance.post(`/assignments/${assignmentId}/submissions/${submissionId}/grade/`, data),
}

export default assignmentService
