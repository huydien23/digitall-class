import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '../../services/apiService'

// Async thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.axiosInstance.get('/students/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách sinh viên')
    }
  }
)

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await apiService.axiosInstance.post('/students/', studentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo sinh viên')
    }
  }
)

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ id, studentData }, { rejectWithValue }) => {
    try {
      const response = await apiService.axiosInstance.put(`/students/${id}/`, studentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật sinh viên')
    }
  }
)

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.axiosInstance.delete(`/students/${id}/`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa sinh viên')
    }
  }
)

export const fetchStudentStatistics = createAsyncThunk(
  'students/fetchStudentStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.axiosInstance.get('/students/statistics/')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thống kê sinh viên')
    }
  }
)

const initialState = {
  students: [],
  statistics: null,
  isLoading: false,
  error: null,
}

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch students
      .addCase(fetchStudents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.isLoading = false
        // Ensure students is always an array
        state.students = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create student
      .addCase(createStudent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.isLoading = false
        state.students.push(action.payload)
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update student
      .addCase(updateStudent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.students.findIndex(student => student.id === action.payload.id)
        if (index !== -1) {
          state.students[index] = action.payload
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete student
      .addCase(deleteStudent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.isLoading = false
        state.students = state.students.filter(student => student.id !== action.payload)
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch statistics
      .addCase(fetchStudentStatistics.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchStudentStatistics.fulfilled, (state, action) => {
        state.isLoading = false
        state.statistics = action.payload
      })
      .addCase(fetchStudentStatistics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = studentSlice.actions
export default studentSlice.reducer