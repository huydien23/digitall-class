import apiService from './apiService'

const materialService = {
  getMaterials: (params) => apiService.axiosInstance.get('/materials/', { params }),
  getMaterial: (id) => apiService.axiosInstance.get(`/materials/${id}/`),
  createMaterial: (formData) => apiService.axiosInstance.post('/materials/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMaterial: (id) => apiService.axiosInstance.delete(`/materials/${id}/`),
}

export default materialService
