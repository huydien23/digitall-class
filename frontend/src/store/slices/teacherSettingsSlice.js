import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiService from '../../services/apiService'

// Default settings structure
const defaultSettings = {
  // Account & Security
  account: {
    twoFactorAuth: {
      enabled: false,
      method: 'email' // email/sms/app
    },
    sessionTimeout: 30, // minutes
    notifyNewLogin: true
  },
  
  // QR & Attendance Policy
  qrAttendance: {
    qrCode: {
      autoRefreshInterval: 5, // minutes
      validityDuration: 15, // minutes
      securityLevel: 'medium', // low/medium/high
      displayFormat: 'dialog', // dialog/fullscreen
      allowManualCode: true
    },
    rules: {
      lateThreshold: 15, // minutes
      absentThreshold: 30, // minutes
      graceTime: 10, // minutes
      autoCloseSession: true,
      requireLocation: false,
      locationRadius: 50, // meters
      maxDevicesPerStudent: 2,
      preventDuplicateCheckIn: true
    },
    defaultSession: {
      duration: 120, // minutes
      location: '',
      template: 'standard' // standard/lab/seminar
    }
  },
  
  // Notifications
  notifications: {
    channels: {
      inApp: true,
      email: true,
      sms: false
    },
    events: {
      sessionStart: true,
      studentCheckIn: false,
      lowAttendance: true,
      suspiciousActivity: true,
      reminderBeforeClass: 15, // minutes
      reminderDuringClass: true,
      absenceNotification: true
    },
    digest: {
      daily: false,
      weekly: true,
      time: '08:00'
    }
  },
  
  // UI & Dashboard
  ui: {
    theme: {
      mode: 'light', // light/dark/auto
      primaryColor: '#1976d2',
      fontSize: 'medium', // small/medium/large
      density: 'comfortable' // comfortable/compact
    },
    language: 'vi', // vi/en/fr/de/es/ja/ko/zh-CN/th/id
    dashboard: {
      widgets: {
        todaySessions: true,
        myClasses: true,
        attendanceStats: true,
        recentActivities: true,
        quickActions: true
      },
      layout: 'default', // default/custom
      defaultTimeRange: 'week' // today/week/month
    },
    sidebar: {
      collapsed: false,
      showLabels: true
    }
  },
  
  // Data & Reports
  dataReports: {
    export: {
      defaultFormat: 'excel', // csv/excel/pdf
      includePhotos: false,
      columns: ['mssv', 'name', 'attendance', 'grade'],
      language: 'vi' // vi/en
    },
    reports: {
      autoGenerate: false,
      frequency: 'weekly', // daily/weekly/monthly
      recipients: [], // additional emails
      includeCharts: true,
      template: 'standard'
    },
    privacy: {
      shareWithAdmin: true,
      anonymizeExports: false,
      retentionDays: 90
    }
  }
}

// Async thunks
export const loadSettings = createAsyncThunk(
  'teacherSettings/load',
  async (_, { rejectWithValue }) => {
    try {
      // Try to load from localStorage first (offline support)
      const localSettings = localStorage.getItem('teacherSettings')
      if (localSettings) {
        return JSON.parse(localSettings)
      }
      
      // TODO: In future, load from backend API
      // const response = await apiService.getTeacherSettings()
      // return response.data
      
      // For now, return defaults
      return defaultSettings
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const saveSettings = createAsyncThunk(
  'teacherSettings/save',
  async (settings, { rejectWithValue }) => {
    try {
      // Save to localStorage for offline support
      localStorage.setItem('teacherSettings', JSON.stringify(settings))
      
      // TODO: In future, save to backend API
      // const response = await apiService.updateTeacherSettings(settings)
      // return response.data
      
      return settings
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const resetSettings = createAsyncThunk(
  'teacherSettings/reset',
  async (section, { rejectWithValue }) => {
    try {
      // Reset specific section or all settings
      const resetData = section 
        ? { [section]: defaultSettings[section] }
        : defaultSettings
      
      // Save reset data
      const currentSettings = JSON.parse(localStorage.getItem('teacherSettings') || '{}')
      const updatedSettings = { ...currentSettings, ...resetData }
      localStorage.setItem('teacherSettings', JSON.stringify(updatedSettings))
      
      return updatedSettings
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const teacherSettingsSlice = createSlice({
  name: 'teacherSettings',
  initialState: {
    settings: defaultSettings,
    hasChanges: false,
    isLoading: false,
    error: null,
    lastSaved: null,
    activeTab: 0
  },
  reducers: {
    updateSetting: (state, action) => {
      const { section, field, value } = action.payload
      
      // Deep update nested object
      const updateNestedObject = (obj, path, value) => {
        const keys = path.split('.')
        const lastKey = keys.pop()
        const target = keys.reduce((o, k) => o[k], obj)
        target[lastKey] = value
      }
      
      if (field.includes('.')) {
        updateNestedObject(state.settings[section], field, value)
      } else {
        state.settings[section][field] = value
      }
      
      state.hasChanges = true
    },
    
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    
    clearChanges: (state) => {
      state.hasChanges = false
    },
    
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Load settings
      .addCase(loadSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.settings = { ...defaultSettings, ...action.payload }
        state.hasChanges = false
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.settings = defaultSettings
      })
      
      // Save settings
      .addCase(saveSettings.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.isLoading = false
        state.settings = action.payload
        state.hasChanges = false
        state.lastSaved = new Date().toISOString()
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reset settings
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.settings = action.payload
        state.hasChanges = true
      })
  }
})

// Selectors
export const selectSettings = (state) => state.teacherSettings?.settings || defaultSettings
export const selectQRSettings = (state) => state.teacherSettings?.settings?.qrAttendance?.qrCode || defaultSettings.qrAttendance.qrCode
export const selectAttendanceRules = (state) => state.teacherSettings?.settings?.qrAttendance?.rules || defaultSettings.qrAttendance.rules
export const selectNotificationSettings = (state) => state.teacherSettings?.settings?.notifications || defaultSettings.notifications
export const selectUISettings = (state) => state.teacherSettings?.settings?.ui || defaultSettings.ui
export const selectDataSettings = (state) => state.teacherSettings?.settings?.dataReports || defaultSettings.dataReports

export const { updateSetting, setActiveTab, clearChanges, clearError } = teacherSettingsSlice.actions
export default teacherSettingsSlice.reducer