import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '../../services/apiService'

// Async thunks
export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.axiosInstance.get('/classes/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách lớp học')
    }
  }
)

export const fetchClassStatistics = createAsyncThunk(
  'classes/fetchClassStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.axiosInstance.get('/classes/statistics/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thống kê lớp học')
    }
  }
)

const initialState = {
  classes: [],
  statistics: null,
  isLoading: false,
  error: null,
}

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch classes
      .addCase(fetchClasses.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.isLoading = false
        // Ensure classes is always an array
        state.classes = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch statistics
      .addCase(fetchClassStatistics.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchClassStatistics.fulfilled, (state, action) => {
        state.isLoading = false
        state.statistics = action.payload
      })
      .addCase(fetchClassStatistics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = classSlice.actions
export default classSlice.reducer