import React from 'react'
import { 
  Button, 
  IconButton, 
  Fab,
  CircularProgress,
  Box,
  Tooltip
} from '@mui/material'
import { motion } from 'framer-motion'

// Enhanced Button with loading states and animations
export const EnhancedButton = ({
  children,
  loading = false,
  disabled = false,
  loadingText,
  startIcon,
  endIcon,
  animate = true,
  tooltip,
  ...props
}) => {
  const ButtonComponent = motion.div

  const button = (
    <Button
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} /> : startIcon}
      endIcon={!loading ? endIcon : undefined}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  )

  const animatedButton = animate ? (
    <ButtonComponent
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {button}
    </ButtonComponent>
  ) : button

  return tooltip ? (
    <Tooltip title={tooltip}>
      <span>
        {animatedButton}
      </span>
    </Tooltip>
  ) : animatedButton
}

// Enhanced Icon Button
export const EnhancedIconButton = ({
  children,
  loading = false,
  disabled = false,
  animate = true,
  tooltip,
  size = 'medium',
  ...props
}) => {
  const ButtonComponent = motion.div

  const iconButton = (
    <IconButton
      disabled={disabled || loading}
      size={size}
      {...props}
    >
      {loading ? (
        <CircularProgress 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
        />
      ) : (
        children
      )}
    </IconButton>
  )

  const animatedButton = animate ? (
    <ButtonComponent
      whileHover={{ scale: disabled || loading ? 1 : 1.1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.9 }}
      transition={{ duration: 0.1 }}
    >
      {iconButton}
    </ButtonComponent>
  ) : iconButton

  return tooltip ? (
    <Tooltip title={tooltip}>
      <span>
        {animatedButton}
      </span>
    </Tooltip>
  ) : animatedButton
}

// Enhanced FAB (Floating Action Button)
export const EnhancedFab = ({
  children,
  loading = false,
  disabled = false,
  animate = true,
  tooltip,
  ...props
}) => {
  const ButtonComponent = motion.div

  const fab = (
    <Fab
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Fab>
  )

  const animatedFab = animate ? (
    <ButtonComponent
      whileHover={{ 
        scale: disabled || loading ? 1 : 1.05,
        rotate: disabled || loading ? 0 : 5
      }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {fab}
    </ButtonComponent>
  ) : fab

  return tooltip ? (
    <Tooltip title={tooltip}>
      <span>
        {animatedFab}
      </span>
    </Tooltip>
  ) : animatedFab
}

// Button Group with consistent styling
export const ButtonGroup = ({ 
  buttons = [], 
  orientation = 'horizontal',
  spacing = 1,
  align = 'left',
  ...props 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        gap: spacing,
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        alignItems: orientation === 'vertical' ? 'stretch' : 'center',
        flexWrap: 'wrap',
        ...props.sx
      }}
      {...props}
    >
      {buttons.map((button, index) => (
        <Box key={index}>
          {button}
        </Box>
      ))}
    </Box>
  )
}

// Quick action buttons with predefined styles
export const QuickActionButton = ({ 
  action, 
  variant = 'outlined',
  size = 'small',
  ...props 
}) => {
  const actionConfigs = {
    add: { color: 'primary', text: 'Thêm' },
    edit: { color: 'info', text: 'Sửa' },
    delete: { color: 'error', text: 'Xóa' },
    view: { color: 'success', text: 'Xem' },
    save: { color: 'primary', text: 'Lưu' },
    cancel: { color: 'inherit', text: 'Hủy' },
    export: { color: 'secondary', text: 'Xuất' },
    import: { color: 'info', text: 'Nhập' },
    refresh: { color: 'primary', text: 'Làm mới' },
    search: { color: 'primary', text: 'Tìm kiếm' }
  }

  const config = actionConfigs[action] || { color: 'primary', text: action }

  return (
    <EnhancedButton
      variant={variant}
      size={size}
      color={config.color}
      {...props}
    >
      {config.text}
    </EnhancedButton>
  )
}

// Export all components
const EnhancedButtons = {
  EnhancedButton,
  EnhancedIconButton,
  EnhancedFab,
  ButtonGroup,
  QuickActionButton
}

export default EnhancedButtons
