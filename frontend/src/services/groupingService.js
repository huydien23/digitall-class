import apiService from './apiService'

const groupingService = {
  generateGroups: (payload) => apiService.axiosInstance.post('/grouping/generate/', payload),
  listGroupSets: (params) => apiService.axiosInstance.get('/grouping/groupsets/', { params }),
  getGroups: (params) => apiService.axiosInstance.get('/grouping/groups/', { params }),
  deleteGroup: (groupId) => apiService.axiosInstance.delete(`/grouping/groups/${groupId}/`),
  renameGroup: (groupId, name) => apiService.axiosInstance.patch(`/grouping/groups/${groupId}/`, { name }),
  addMember: (groupId, payload) => apiService.axiosInstance.post(`/grouping/groups/${groupId}/members/`, payload),
  removeMember: (groupId, params) => apiService.axiosInstance.delete(`/grouping/groups/${groupId}/members/`, { params }),
  listAvailableStudents: (params) => apiService.axiosInstance.get('/grouping/available-students/', { params }),
  async exportGroups(groupset_id) {
    const res = await apiService.axiosInstance.get(`/grouping/export/${groupset_id}/`, { responseType: 'blob' })
    return res.data // Blob
  }
}

export default groupingService
