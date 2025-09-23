import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Slide,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material'
import {
  Close,
  Check,
  Warning,
  Error as ErrorIcon,
  Info,
  HelpOutline
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

// Enhanced Modal/Dialog component
const EnhancedModal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  showCloseButton = true,
  preventClose = false,
  variant = 'default', // default, confirmation, error, warning, info
  icon,
  loading = false,
  ...props
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const getVariantConfig = () => {
    switch (variant) {
      case 'confirmation':
        return {
          icon: <Check sx={{ color: 'success.main' }} />,
          titleColor: 'success.main',
          borderColor: 'success.main'
        }
      case 'warning':
        return {
          icon: <Warning sx={{ color: 'warning.main' }} />,
          titleColor: 'warning.main',
          borderColor: 'warning.main'
        }
      case 'error':
        return {
          icon: <ErrorIcon sx={{ color: 'error.main' }} />,
          titleColor: 'error.main',
          borderColor: 'error.main'
        }
      case 'info':
        return {
          icon: <Info sx={{ color: 'info.main' }} />,
          titleColor: 'info.main',
          borderColor: 'info.main'
        }
      case 'question':
        return {
          icon: <HelpOutline sx={{ color: 'primary.main' }} />,
          titleColor: 'primary.main',
          borderColor: 'primary.main'
        }
      default:
        return {
          icon: null,
          titleColor: 'text.primary',
          borderColor: 'primary.main'
        }
    }
  }

  const variantConfig = getVariantConfig()
  const displayIcon = icon || variantConfig.icon

  return (
    <Dialog
      open={open}
      onClose={preventClose ? () => {} : onClose}
      TransitionComponent={Transition}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen || isMobile}
      PaperProps={{
        sx: {
          borderRadius: fullScreen || isMobile ? 0 : 3,
          borderTop: variant !== 'default' ? `4px solid` : 'none',
          borderColor: variantConfig.borderColor,
          maxHeight: '90vh',
          ...props.PaperProps?.sx
        },
        ...props.PaperProps
      }}
      {...props}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            pb: title && subtitle ? 1 : 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {displayIcon && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {displayIcon}
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {title && (
                <Typography 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    color: variantConfig.titleColor,
                    fontWeight: 600,
                    lineHeight: 1.2
                  }}
                  noWrap
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          
          {showCloseButton && !preventClose && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: 'grey.500',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <Close />
            </IconButton>
          )}
        </Box>
        
        {(title || subtitle) && <Divider />}
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3, pt: !(title || subtitle) ? 3 : 2 }}>
        <AnimatePresence mode="wait">
          {!loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                py: 4
              }}>
                {/* Loading content can be customized */}
                <Typography>Đang tải...</Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      {/* Actions */}
      {actions && (
        <>
          <Divider />
          <DialogActions sx={{ p: 3, pt: 2 }}>
            {actions}
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

// Predefined action buttons
export const ModalActions = {
  Cancel: ({ onClick, disabled, ...props }) => (
    <Button 
      onClick={onClick} 
      disabled={disabled}
      color="inherit"
      {...props}
    >
      Hủy
    </Button>
  ),
  
  Save: ({ onClick, loading, disabled, ...props }) => (
    <Button 
      variant="contained" 
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Đang lưu...' : 'Lưu'}
    </Button>
  ),
  
  Delete: ({ onClick, loading, disabled, ...props }) => (
    <Button 
      variant="contained" 
      color="error"
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Đang xóa...' : 'Xóa'}
    </Button>
  ),
  
  Confirm: ({ onClick, loading, disabled, ...props }) => (
    <Button 
      variant="contained" 
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Đang xử lý...' : 'Xác nhận'}
    </Button>
  )
}

export default EnhancedModal
