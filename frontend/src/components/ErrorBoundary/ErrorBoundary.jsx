import React from 'react'
import { Box, Typography, Button, Paper, Alert } from '@mui/material'
import { ErrorOutline, Refresh } from '@mui/icons-material'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <ErrorOutline
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2
              }}
            />
            
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The application encountered an unexpected error. This has been logged for debugging.
            </Typography>

            {process.env.NODE_ENV === 'development' && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Error Details:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo?.componentStack || 'No component stack available'}
                </Typography>
              </Alert>
            )}

            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleReload}
              size="large"
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary