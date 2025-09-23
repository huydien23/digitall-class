import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '../../services/apiService'

// Async thunks
export const fetchGrades = createAsyncThunk(
  'grades/fetchGrades',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.axiosInstance.get('/grades/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách điểm số')
    }
  }
)

const initialState = {
  grades: [],
  isLoading: false,
  error: null,
}

const gradeSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch grades
      .addCase(fetchGrades.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGrades.fulfilled, (state, action) => {
        state.isLoading = false
        // Ensure grades is always an array
        state.grades = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchGrades.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = gradeSlice.actions
export default gradeSlice.reducer