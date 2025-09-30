import apiService from './apiService'

const materialLibraryService = {
  // List materials with filters: { q, type, status }
  list: (params = {}) => apiService.axiosInstance.get('/materials/library/', { params }),

  // Get detail
  get: (id) => apiService.axiosInstance.get(`/materials/library/${id}/`),

  // Create material (multipart). Fields: title, type, description, tags, allow_download, file (optional), change_note
  create: (formData) => apiService.axiosInstance.post('/materials/library/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Update metadata (JSON)
  update: (id, data) => apiService.axiosInstance.put(`/materials/library/${id}/`, data),

  // Delete material
  remove: (id) => apiService.axiosInstance.delete(`/materials/library/${id}/`),

  // Trash
  listTrash: () => apiService.axiosInstance.get('/materials/library/trash/'),
  restore: (id) => apiService.axiosInstance.post(`/materials/library/${id}/restore/`),
  purge: (id) => apiService.axiosInstance.delete(`/materials/library/${id}/purge/`),

  // Publish to classes
  publish: (id, payload) => apiService.axiosInstance.post(`/materials/library/${id}/publish/`, payload),
  // Unpublish from classes
  unpublish: (id, payload) => apiService.axiosInstance.post(`/materials/library/${id}/unpublish/`, payload),

  // Versions
  listVersions: (id) => apiService.axiosInstance.get(`/materials/library/${id}/versions/`),
  uploadVersion: (id, formData) =>
    apiService.axiosInstance.post(`/materials/library/${id}/versions/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Class published materials (student/teacher view)
  listPublishedForClass: (classId) => apiService.axiosInstance.get(`/materials/library/class/${classId}/published/`),
}

export default materialLibraryService
