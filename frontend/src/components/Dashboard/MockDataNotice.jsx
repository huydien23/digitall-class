import React from 'react'
import { Alert, AlertTitle, Box, Typography, Button } from '@mui/material'
import { Info as InfoIcon, Refresh as RefreshIcon } from '@mui/icons-material'

const MockDataNotice = ({ onRefresh, onDismiss }) => {
  return (
    <Alert 
      severity="info" 
      icon={<InfoIcon />}
      sx={{ mb: 3 }}
      action={
        <Box display="flex" gap={1}>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
          >
            Làm mới
          </Button>
          <Button
            size="small"
            onClick={onDismiss}
          >
            Đóng
          </Button>
        </Box>
      }
    >
      <AlertTitle>Dữ liệu mẫu</AlertTitle>
      <Typography variant="body2">
        Hiện tại đang hiển thị dữ liệu mẫu để demo. Dữ liệu thực sẽ được tải khi có kết nối với server.
      </Typography>
    </Alert>
  )
}

export default MockDataNotice
