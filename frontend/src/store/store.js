import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import studentReducer from './slices/studentSlice'
import classReducer from './slices/classSlice'
import gradeReducer from './slices/gradeSlice'
import attendanceReducer from './slices/attendanceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer, // Main authentication state
    students: studentReducer,
    classes: classReducer,
    grades: gradeReducer,
    attendance: attendanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
