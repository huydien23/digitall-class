/**
 * API Service for Backend Authentication
 * Clean implementation using Django REST Framework + JWT
 */

import axios from 'axios'

// API Configuration
// Prefer env var VITE_API_BASE; otherwise use relative '/api' to leverage Vite proxy in dev and same-origin in prod
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE) || '/api'
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  LOGOUT: '/auth/logout/',
  PROFILE: '/auth/profile/',
  REFRESH: '/auth/token/refresh/',
  CHANGE_PASSWORD: '/auth/change-password/',
  HEALTH: '/auth/health/'
}

// Token management
const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken'
}

class APIService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Increased from 10s to 30s
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshed = await this.refreshToken()
            if (refreshed) {
              originalRequest.headers.Authorization = `Bearer ${this.getAccessToken()}`
              return this.axiosInstance(originalRequest)
            }
          } catch (refreshError) {
            this.clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Token Management
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEYS.ACCESS)
  }

  getRefreshToken() {
    return localStorage.getItem(TOKEN_KEYS.REFRESH)
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken)
    localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken)
  }

  clearTokens() {
    localStorage.removeItem(TOKEN_KEYS.ACCESS)
    localStorage.removeItem(TOKEN_KEYS.REFRESH)
  }

  isAuthenticated() {
    return !!this.getAccessToken()
  }

  // Generic helpers
  async get(url, params = {}) {
    try {
      const response = await this.axiosInstance.get(url, { params })
      return { success: true, data: response.data?.data ?? response.data }
    } catch (error) {
      return { success: false, error: error.response?.data || { message: 'Request failed' } }
    }
  }

  async post(url, data = {}) {
    try {
      const response = await this.axiosInstance.post(url, data)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data || { message: 'Request failed' } }
    }
  }

  // Authentication Methods
  async register(userData) {
    try {
      const response = await this.axiosInstance.post(AUTH_ENDPOINTS.REGISTER, userData)
      
      if (response.data.tokens) {
        this.setTokens(response.data.tokens.access, response.data.tokens.refresh)
      }

      return {
        success: true,
        data: response.data,
        user: response.data.user,
        message: response.data.message,
        requireApproval: response.data.require_approval
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Đăng ký thất bại' }
      }
    }
  }

  async login(email, password) {
    try {
      const response = await this.axiosInstance.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password
      })

      if (response.data.tokens) {
        this.setTokens(response.data.tokens.access, response.data.tokens.refresh)
      }

      return {
        success: true,
        data: response.data,
        user: response.data.user,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Đăng nhập thất bại' }
      }
    }
  }

  async logout() {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (refreshToken) {
        await this.axiosInstance.post(AUTH_ENDPOINTS.LOGOUT, {
          refresh: refreshToken
        })
      }

      this.clearTokens()

      return {
        success: true,
        message: 'Đăng xuất thành công'
      }
    } catch (error) {
      // Clear tokens anyway
      this.clearTokens()
      return {
        success: true,
        message: 'Đăng xuất thành công'
      }
    }
  }
  async getUserProfile() {
    try {
      const response = await this.axiosInstance.get(AUTH_ENDPOINTS.PROFILE)
      return response.data.user || response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng')
    }
  }

  async getProfile() {
    try {
      const response = await this.axiosInstance.get(AUTH_ENDPOINTS.PROFILE)
      return {
        success: true,
        user: response.data.user || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Không thể lấy thông tin người dùng' }
      }
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.axiosInstance.put(AUTH_ENDPOINTS.PROFILE, profileData)
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Cập nhật thông tin thất bại' }
      }
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await this.axiosInstance.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData)
      return {
        success: true,
        message: response.data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'Đổi mật khẩu thất bại' }
      }
    }
  }

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return false

      const response = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`, {
        refresh: refreshToken
      })

      if (response.data.access) {
        localStorage.setItem(TOKEN_KEYS.ACCESS, response.data.access)
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}${AUTH_ENDPOINTS.HEALTH}`)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || { message: 'API không khả dụng' }
      }
    }
  }

  // Debug method to check API status
  getApiInfo() {
    return {
      baseURL: API_BASE_URL,
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      endpoints: AUTH_ENDPOINTS
    }
  }
}

// Export singleton instance
export default new APIService()
