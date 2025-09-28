import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useSelector } from 'react-redux'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const uiSettings = useSelector(state => state.teacherSettings?.settings?.ui)
  const [mode, setMode] = useState('light')
  const [primaryColor, setPrimaryColor] = useState('#1976d2')
  const [fontSize, setFontSize] = useState('medium')
  const [density, setDensity] = useState('comfortable')

  // Initialize from localStorage or settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode')
    const savedColor = localStorage.getItem('themePrimaryColor')
    const savedFontSize = localStorage.getItem('themeFontSize')
    const savedDensity = localStorage.getItem('themeDensity')
    
    if (savedTheme) setMode(savedTheme)
    else if (uiSettings?.theme?.mode) setMode(uiSettings.theme.mode)
    
    if (savedColor) setPrimaryColor(savedColor)
    else if (uiSettings?.theme?.primaryColor) setPrimaryColor(uiSettings.theme.primaryColor)
    
    if (savedFontSize) setFontSize(savedFontSize)
    else if (uiSettings?.theme?.fontSize) setFontSize(uiSettings.theme.fontSize)
    
    if (savedDensity) setDensity(savedDensity)
    else if (uiSettings?.theme?.density) setDensity(uiSettings.theme.density)
    
    // Handle auto mode
    if (uiSettings?.theme?.mode === 'auto' || savedTheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setMode(mediaQuery.matches ? 'dark' : 'light')
      
      const handleChange = (e) => setMode(e.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Update when settings change
  useEffect(() => {
    if (uiSettings?.theme?.mode && uiSettings.theme.mode !== 'auto') {
      setMode(uiSettings.theme.mode)
      localStorage.setItem('themeMode', uiSettings.theme.mode)
    }
    if (uiSettings?.theme?.primaryColor) {
      setPrimaryColor(uiSettings.theme.primaryColor)
      localStorage.setItem('themePrimaryColor', uiSettings.theme.primaryColor)
    }
    if (uiSettings?.theme?.fontSize) {
      setFontSize(uiSettings.theme.fontSize)
      localStorage.setItem('themeFontSize', uiSettings.theme.fontSize)
    }
    if (uiSettings?.theme?.density) {
      setDensity(uiSettings.theme.density)
      localStorage.setItem('themeDensity', uiSettings.theme.density)
    }
  }, [uiSettings?.theme])

  // Create MUI theme
  const theme = useMemo(() => {
    const getFontSize = () => {
      switch(fontSize) {
        case 'small': return 13
        case 'large': return 16
        default: return 14
      }
    }
    
    const getSpacing = () => {
      switch(density) {
        case 'compact': return 6
        default: return 8
      }
    }
    
    return createTheme({
      palette: {
        mode: mode,
        primary: {
          main: primaryColor
        },
        background: {
          default: mode === 'dark' ? '#121212' : '#fafafa',
          paper: mode === 'dark' ? '#1e1e1e' : '#ffffff'
        }
      },
      typography: {
        fontSize: getFontSize(),
        button: {
          textTransform: 'none'
        }
      },
      spacing: getSpacing(),
      shape: {
        borderRadius: density === 'compact' ? 4 : 8
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              padding: density === 'compact' ? '4px 12px' : '6px 16px'
            }
          }
        },
        MuiTextField: {
          defaultProps: {
            size: density === 'compact' ? 'small' : 'medium'
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'dark' 
                ? '0 1px 3px rgba(255,255,255,0.05)' 
                : '0 1px 3px rgba(0,0,0,0.12)'
            }
          }
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              paddingTop: density === 'compact' ? 4 : 8,
              paddingBottom: density === 'compact' ? 4 : 8
            }
          }
        }
      }
    })
  }, [mode, primaryColor, fontSize, density])

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setMode(newMode)
    localStorage.setItem('themeMode', newMode)
  }

  const updateTheme = (updates) => {
    if (updates.mode !== undefined) {
      setMode(updates.mode)
      localStorage.setItem('themeMode', updates.mode)
    }
    if (updates.primaryColor !== undefined) {
      setPrimaryColor(updates.primaryColor)
      localStorage.setItem('themePrimaryColor', updates.primaryColor)
    }
    if (updates.fontSize !== undefined) {
      setFontSize(updates.fontSize)
      localStorage.setItem('themeFontSize', updates.fontSize)
    }
    if (updates.density !== undefined) {
      setDensity(updates.density)
      localStorage.setItem('themeDensity', updates.density)
    }
  }

  const value = {
    mode,
    primaryColor,
    fontSize,
    density,
    toggleTheme,
    updateTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider