import React, { useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { HelmetProvider } from 'react-helmet-async'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import 'dayjs/locale/en'
import i18n from './i18n'

import App from './App.jsx'
import { store } from './store/store.js'

import './index.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#c51162',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.1),0px 1px 1px 0px rgba(0,0,0,0.06),0px 1px 3px 0px rgba(0,0,0,0.1)',
    '0px 3px 1px -2px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.06),0px 1px 5px 0px rgba(0,0,0,0.1)',
    '0px 3px 3px -2px rgba(0,0,0,0.1),0px 3px 4px 0px rgba(0,0,0,0.06),0px 1px 8px 0px rgba(0,0,0,0.1)',
    '0px 2px 4px -1px rgba(0,0,0,0.1),0px 4px 5px 0px rgba(0,0,0,0.06),0px 1px 10px 0px rgba(0,0,0,0.1)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 5px 8px 0px rgba(0,0,0,0.06),0px 1px 14px 0px rgba(0,0,0,0.1)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 6px 10px 0px rgba(0,0,0,0.06),0px 1px 18px 0px rgba(0,0,0,0.1)',
    '0px 4px 5px -2px rgba(0,0,0,0.1),0px 7px 10px 1px rgba(0,0,0,0.06),0px 2px 16px 1px rgba(0,0,0,0.1)',
    '0px 5px 5px -3px rgba(0,0,0,0.1),0px 8px 10px 1px rgba(0,0,0,0.06),0px 3px 14px 2px rgba(0,0,0,0.1)',
    '0px 5px 6px -3px rgba(0,0,0,0.1),0px 9px 12px 1px rgba(0,0,0,0.06),0px 3px 16px 2px rgba(0,0,0,0.1)',
    '0px 6px 6px -3px rgba(0,0,0,0.1),0px 10px 14px 1px rgba(0,0,0,0.06),0px 4px 18px 3px rgba(0,0,0,0.1)',
    '0px 6px 7px -4px rgba(0,0,0,0.1),0px 11px 15px 1px rgba(0,0,0,0.06),0px 4px 20px 3px rgba(0,0,0,0.1)',
    '0px 7px 8px -4px rgba(0,0,0,0.1),0px 12px 17px 2px rgba(0,0,0,0.06),0px 5px 22px 4px rgba(0,0,0,0.1)',
    '0px 7px 8px -4px rgba(0,0,0,0.1),0px 13px 19px 2px rgba(0,0,0,0.06),0px 5px 24px 4px rgba(0,0,0,0.1)',
    '0px 7px 9px -4px rgba(0,0,0,0.1),0px 14px 21px 2px rgba(0,0,0,0.06),0px 5px 26px 4px rgba(0,0,0,0.1)',
    '0px 8px 9px -5px rgba(0,0,0,0.1),0px 15px 22px 2px rgba(0,0,0,0.06),0px 6px 28px 5px rgba(0,0,0,0.1)',
    '0px 8px 10px -5px rgba(0,0,0,0.1),0px 16px 24px 2px rgba(0,0,0,0.06),0px 6px 30px 5px rgba(0,0,0,0.1)',
    '0px 8px 11px -5px rgba(0,0,0,0.1),0px 17px 26px 2px rgba(0,0,0,0.06),0px 6px 32px 5px rgba(0,0,0,0.1)',
    '0px 9px 11px -5px rgba(0,0,0,0.1),0px 18px 28px 2px rgba(0,0,0,0.06),0px 7px 34px 6px rgba(0,0,0,0.1)',
    '0px 9px 12px -6px rgba(0,0,0,0.1),0px 19px 29px 2px rgba(0,0,0,0.06),0px 7px 36px 6px rgba(0,0,0,0.1)',
    '0px 10px 13px -6px rgba(0,0,0,0.1),0px 20px 31px 3px rgba(0,0,0,0.06),0px 8px 38px 7px rgba(0,0,0,0.1)',
    '0px 10px 13px -6px rgba(0,0,0,0.1),0px 21px 33px 3px rgba(0,0,0,0.06),0px 8px 40px 7px rgba(0,0,0,0.1)',
    '0px 10px 14px -6px rgba(0,0,0,0.1),0px 22px 35px 3px rgba(0,0,0,0.06),0px 8px 42px 7px rgba(0,0,0,0.1)',
    '0px 11px 14px -7px rgba(0,0,0,0.1),0px 23px 36px 3px rgba(0,0,0,0.06),0px 9px 44px 8px rgba(0,0,0,0.1)',
    '0px 11px 15px -7px rgba(0,0,0,0.1),0px 24px 38px 3px rgba(0,0,0,0.06),0px 9px 46px 8px rgba(0,0,0,0.1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
})

const LangAwareApp = () => {
  const lang = useSelector((s) => s.teacherSettings?.settings?.ui?.language) || (localStorage.getItem('appLanguage') || 'vi')

  useEffect(() => {
    try { localStorage.setItem('appLanguage', lang) } catch {}
    i18n.changeLanguage(lang)
    dayjs.locale(lang === 'vi' ? 'vi' : 'en')
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
    }
  }, [lang])

  const adapterLocale = useMemo(() => (lang === 'vi' ? 'vi' : 'en'), [lang])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      <CssBaseline />
      <App />
    </LocalizationProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <LangAwareApp />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
)
