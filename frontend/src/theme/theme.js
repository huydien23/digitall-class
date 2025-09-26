import { createTheme } from '@mui/material/styles'

// Design System - Color Palette dựa trên dashboard hiện tại
const colorPalette = {
  // Primary: Blue gradient nhẹ nhàng, chuyên nghiệp
  primary: {
    50: '#f0f4ff',
    100: '#e0e7ff', 
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Main - giữ nguyên màu chính của dashboard
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    contrastText: '#ffffff'
  },
  
  // Secondary: Blue-gray cho sự hài hòa
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    main: '#64748b',
    light: '#94a3b8',
    dark: '#475569',
    contrastText: '#ffffff'
  },

  // Success: Green cho trạng thái thành công
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a'
  },

  // Warning: Orange cho cảnh báo
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706'
  },

  // Error: Red cho lỗi
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626'
  },

  // Info: Blue cho thông tin
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7'
  }
}

// Background và Surface colors
const backgrounds = {
  default: '#fafafa',
  paper: '#ffffff',
  neutral: '#f8fafc',
  subtle: '#f1f5f9',
  muted: '#e2e8f0'
}

// Text colors
const textColors = {
  primary: '#0f172a',
  secondary: '#64748b',
  disabled: '#94a3b8',
  hint: '#cbd5e1'
}

// Create theme với design system hoàn chỉnh
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colorPalette.primary,
    secondary: colorPalette.secondary,
    success: colorPalette.success,
    warning: colorPalette.warning,
    error: colorPalette.error,
    info: colorPalette.info,
    background: backgrounds,
    text: textColors,
    
    // Custom gradients cho consistency
    gradients: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
      secondary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      info: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      subtle: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    }
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3
    },
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: textColors.primary
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: textColors.secondary
    }
  },

  shape: {
    borderRadius: 12
  },

  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  ],

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        contained: {
          background: colorPalette.primary.main,
          '&:hover': {
            background: colorPalette.primary.dark,
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          },
          transition: 'all 0.2s ease-in-out'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: colorPalette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: colorPalette.primary.main,
            }
          }
        }
      }
    }
  }
})

export default theme

// Export colors cho sử dụng riêng lẻ
export { colorPalette, backgrounds, textColors }