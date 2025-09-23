import React from 'react'
import { Box, Typography, Button, Card, CardContent, Alert, AlertTitle } from '@mui/material'
import { Error as ErrorIcon, Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material'

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleGoHome = () => {
    window.location.href = '/'
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
            p: 3,
            bgcolor: 'grey.50'
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Box sx={{ mb: 3 }}>
                <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                <Typography variant="h4" color="error" gutterBottom>
                  Oops! Có lỗi xảy ra
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Ứng dụng gặp lỗi không mong muốn. Lỗi này đã được ghi lại để debug.
                </Typography>
              </Box>

              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <AlertTitle>Chi tiết lỗi:</AlertTitle>
                <Typography variant="body2" component="pre" sx={{ 
                  fontSize: '0.75rem', 
                  overflow: 'auto', 
                  maxHeight: 200,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  color="primary"
                >
                  Thử lại
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                  color="secondary"
                >
                  Về trang chủ
                </Button>
              </Box>

              {this.state.retryCount > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Số lần thử lại: {this.state.retryCount}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )
    }

    return this.props.children
  }
}

export default EnhancedErrorBoundary
