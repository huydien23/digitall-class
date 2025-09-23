import React from 'react'
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Skeleton,
  Paper,
  Stack
} from '@mui/material'
import { motion } from 'framer-motion'

// Full page loading
export const PageLoader = ({ message = "Đang tải..." }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      gap: 2
    }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <CircularProgress size={60} thickness={4} />
    </motion.div>
    <Typography variant="h6" color="text.secondary">
      {message}
    </Typography>
  </Box>
)

// Inline loading for components
export const InlineLoader = ({ size = 40, message }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
    <CircularProgress size={size} sx={{ mb: message ? 2 : 0 }} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
)

// Button loading state
export const ButtonLoader = ({ size = 20 }) => (
  <CircularProgress size={size} color="inherit" />
)

// Table loading skeleton
export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <Box sx={{ p: 2 }}>
    <Stack spacing={1}>
      {Array.from({ length: rows }).map((_, index) => (
        <Stack direction="row" spacing={2} key={index}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="text" 
              width={`${Math.random() * 40 + 60}%`}
              height={40} 
            />
          ))}
        </Stack>
      ))}
    </Stack>
  </Box>
)

// Card loading skeleton
export const CardSkeleton = ({ height = 200 }) => (
  <Paper sx={{ p: 2 }}>
    <Skeleton variant="rectangular" width="100%" height={height} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="60%" />
  </Paper>
)

// Stats card skeleton
export const StatCardSkeleton = () => (
  <Paper sx={{ p: 3 }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </Box>
    </Stack>
  </Paper>
)

const Loading = {
  PageLoader,
  InlineLoader,
  ButtonLoader,
  TableSkeleton,
  CardSkeleton,
  StatCardSkeleton
}

export default Loading
