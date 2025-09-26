import React from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import theme from './theme'

/**
 * Enhanced Theme Provider với CssBaseline và custom theme
 * Cung cấp theme thống nhất cho toàn bộ ứng dụng
 */
const ThemeProvider = ({ children }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}

export default ThemeProvider