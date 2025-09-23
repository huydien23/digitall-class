import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '../../services/apiService'

// Async thunks
export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.axiosInstance.get('/attendance/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách điểm danh')
    }
  }
)

const initialState = {
  attendance: [],
  isLoading: false,
  error: null,
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.isLoading = false
        // Ensure attendance is always an array
        state.attendance = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = attendanceSlice.actions
export default attendanceSlice.reducer