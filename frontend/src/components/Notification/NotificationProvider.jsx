import React from 'react'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { 
  IconButton, 
  Box,
  Slide
} from '@mui/material'
import { 
  Close, 
  CheckCircle, 
  Error, 
  Warning, 
  Info 
} from '@mui/icons-material'

// Custom close action
const CloseAction = ({ snackbarKey }) => {
  const { closeSnackbar } = useSnackbar()
  
  return (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={() => closeSnackbar(snackbarKey)}
    >
      <Close fontSize="small" />
    </IconButton>
  )
}

// Slide transition
const SlideTransition = React.forwardRef((props, ref) => {
  return <Slide {...props} ref={ref} direction="left" />
})

// Custom icons for different variants
const iconVariant = {
  success: CheckCircle,
  error: Error,
  warning: Warning,
  info: Info,
}

// Notification Provider wrapper
const NotificationProvider = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      TransitionComponent={SlideTransition}
      autoHideDuration={5000}
      dense={false}
      preventDuplicate
      action={(snackbarKey) => <CloseAction snackbarKey={snackbarKey} />}
      iconVariant={{
        success: <CheckCircle sx={{ mr: 1 }} />,
        error: <Error sx={{ mr: 1 }} />,
        warning: <Warning sx={{ mr: 1 }} />,
        info: <Info sx={{ mr: 1 }} />,
      }}
      sx={{
        '& .SnackbarContent-root': {
          borderRadius: 2,
          fontWeight: 500,
        },
        '& .SnackbarItem-variantSuccess': {
          backgroundColor: 'success.main',
        },
        '& .SnackbarItem-variantError': {
          backgroundColor: 'error.main',
        },
        '& .SnackbarItem-variantWarning': {
          backgroundColor: 'warning.main',
        },
        '& .SnackbarItem-variantInfo': {
          backgroundColor: 'info.main',
        },
      }}
    >
      {children}
    </SnackbarProvider>
  )
}

// Hook for using notifications
export const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const showSuccess = (message, options = {}) => {
    return enqueueSnackbar(message, { 
      variant: 'success',
      ...options 
    })
  }

  const showError = (message, options = {}) => {
    return enqueueSnackbar(message, { 
      variant: 'error',
      persist: true, // Error messages should be persistent
      ...options 
    })
  }

  const showWarning = (message, options = {}) => {
    return enqueueSnackbar(message, { 
      variant: 'warning',
      ...options 
    })
  }

  const showInfo = (message, options = {}) => {
    return enqueueSnackbar(message, { 
      variant: 'info',
      ...options 
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeSnackbar,
    enqueueSnackbar
  }
}

export { NotificationProvider }
export default NotificationProvider
