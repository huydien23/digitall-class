import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Checkbox,
  FormGroup,
  Button,
  TextField,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  Stack,
  CircularProgress
} from '@mui/material'
import {
  Download,
  Schedule,
  FileDownload,
  PictureAsPdf,
  Description,
  TableChart,
  Share,
  Lock,
  Info,
  Delete,
  CloudUpload,
  Storage
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { updateSetting } from '../../../store/slices/teacherSettingsSlice'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const DataReportsSettings = () => {
  const dispatch = useDispatch()
  const { settings } = useSelector(state => state.teacherSettings)
  const dataSettings = settings?.dataReports || {}
  const { t } = useTranslation()
  
  // Local states
  const [testExportLoading, setTestExportLoading] = useState(false)
  const [selectedColumns, setSelectedColumns] = useState(
    dataSettings.export?.columns || ['mssv', 'name', 'attendance', 'grade']
  )
  
  const handleExportChange = (field, value) => {
    dispatch(updateSetting({
      section: 'dataReports',
      field: `export.${field}`,
      value
    }))
  }
  
  const handleReportChange = (field, value) => {
    dispatch(updateSetting({
      section: 'dataReports',
      field: `reports.${field}`,
      value
    }))
  }
  
  const handlePrivacyChange = (field, value) => {
    dispatch(updateSetting({
      section: 'dataReports',
      field: `privacy.${field}`,
      value
    }))
  }
  
  const handleColumnToggle = (column) => {
    const updated = selectedColumns.includes(column)
      ? selectedColumns.filter(c => c !== column)
      : [...selectedColumns, column]
    setSelectedColumns(updated)
    handleExportChange('columns', updated)
  }
  
  const handleTestExport = () => {
    setTestExportLoading(true)
    
    // Generate sample data
    const sampleData = availableColumns
      .filter(col => selectedColumns.includes(col.id))
      .reduce((acc, col) => {
        acc[col.label] = col.id === 'mssv' ? 'SV001' : 
                         col.id === 'name' ? 'Nguyễn Văn A' :
                         col.id === 'email' ? 'student@edu.vn' :
                         col.id === 'phone' ? '0901234567' :
                         col.id === 'attendance' ? 'Có mặt' :
                         col.id === 'attendance_rate' ? '95%' :
                         col.id === 'grade' ? '8.5' :
                         col.id === 'notes' ? 'Sinh viên tốt' :
                         col.id === 'last_checkin' ? '08:15 28/09/2025' : ''
        return acc
      }, {})
    
    // Create CSV download
    const csvContent = [
      Object.keys(sampleData).join(','),
      Object.values(sampleData).join(',')
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sample_export_${new Date().getTime()}.csv`
    
    setTimeout(() => {
      link.click()
      setTestExportLoading(false)
      // Show success notification
      dispatch(updateSetting({
        section: 'dataReports',
        field: 'lastExport',
        value: new Date().toISOString()
      }))
    }, 1500)
  }
  
  // Available columns for export
  const availableColumns = [
    { id: 'mssv', label: t('settings:data.columns.mssv'), required: true },
    { id: 'name', label: t('settings:data.columns.name'), required: true },
    { id: 'email', label: t('settings:data.columns.email') },
    { id: 'phone', label: t('settings:data.columns.phone') },
    { id: 'attendance', label: t('settings:data.columns.attendance') },
    { id: 'attendance_rate', label: t('settings:data.columns.attendance_rate') },
    { id: 'grade', label: t('settings:data.columns.grade') },
    { id: 'notes', label: t('settings:data.columns.notes') },
    { id: 'last_checkin', label: t('settings:data.columns.last_checkin') }
  ]
  
  // Export formats
  const exportFormats = [
    { value: 'excel', label: t('settings:data.formats.excel'), icon: <TableChart />, color: 'success' },
    { value: 'csv', label: t('settings:data.formats.csv'), icon: <Description />, color: 'primary' },
    { value: 'pdf', label: t('settings:data.formats.pdf'), icon: <PictureAsPdf />, color: 'error' }
  ]
  
  // Report templates
  const reportTemplates = [
    { id: 'standard', name: 'Tiêu chuẩn', description: 'Báo cáo cơ bản với thông tin chính' },
    { id: 'detailed', name: 'Chi tiết', description: 'Bao gồm tất cả thông tin và biểu đồ' },
    { id: 'summary', name: 'Tóm tắt', description: 'Chỉ hiển thị thống kê chính' }
  ]

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Column: Export + Privacy */}
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            {/* Export Settings */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  <FileDownload sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('settings:data.export_title')}
                </Typography>
                
                {/* Default Format */}
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('settings:data.default_format')}
                  </Typography>
                  <Grid container spacing={1}>
                    {exportFormats.map((format) => (
                      <Grid item xs={4} key={format.value}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Paper
                            variant={dataSettings.export?.defaultFormat === format.value ? 'elevation' : 'outlined'}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              textAlign: 'center',
                              bgcolor: dataSettings.export?.defaultFormat === format.value ? 'action.selected' : 'transparent',
                              border: dataSettings.export?.defaultFormat === format.value ? '2px solid' : '1px solid',
                              borderColor: dataSettings.export?.defaultFormat === format.value ? `${format.color}.main` : 'divider'
                            }}
                            onClick={() => handleExportChange('defaultFormat', format.value)}
                          >
                            <Box color={`${format.color}.main`}>
                              {format.icon}
                            </Box>
                            <Typography variant="caption">
                              {format.label}
                            </Typography>
                          </Paper>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Export Columns */}
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('settings:data.columns_title')}
                  </Typography>
                  <FormGroup>
                    {availableColumns.map((col) => (
                      <FormControlLabel
                        key={col.id}
                        control={
                          <Checkbox
                            checked={selectedColumns.includes(col.id)}
                            onChange={() => handleColumnToggle(col.id)}
                            disabled={col.required}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <span>{col.label}</span>
                            {col.required && (
                              <Chip label={t('settings:data.column_required')} size="small" color="primary" />
                            )}
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Additional Options */}
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dataSettings.export?.includePhotos || false}
                        onChange={(e) => handleExportChange('includePhotos', e.target.checked)}
                      />
                    }
                    label={t('settings:data.include_photos')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dataSettings.reports?.includeCharts !== false}
                        onChange={(e) => handleReportChange('includeCharts', e.target.checked)}
                      />
                    }
                    label={t('settings:data.include_charts')}
                  />
                </Box>
                
                {/* Test Export */}
                <Box mt={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={testExportLoading ? <CircularProgress size={16} /> : <Download />}
                    onClick={handleTestExport}
                    disabled={testExportLoading}
                  >
                    {testExportLoading ? t('settings:data.test_export.exporting') : t('settings:data.test_export.export_sample')}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Data Privacy */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  <Lock sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('settings:data.privacy_title')}
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Share />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('settings:data.share_with_admin.title')}
                      secondary={t('settings:data.share_with_admin.desc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={dataSettings.privacy?.shareWithAdmin !== false}
                        onChange={(e) => handlePrivacyChange('shareWithAdmin', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Lock />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('settings:data.anonymize_exports.title')}
                      secondary={t('settings:data.anonymize_exports.desc')}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={dataSettings.privacy?.anonymizeExports || false}
                        onChange={(e) => handlePrivacyChange('anonymizeExports', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Storage />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('settings:data.retention.title')}
                      secondary={t('settings:data.retention.desc', { days: dataSettings.privacy?.retentionDays || 90 })}
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <Select
                          value={dataSettings.privacy?.retentionDays || 90}
                          onChange={(e) => handlePrivacyChange('retentionDays', e.target.value)}
                        >
                          <MenuItem value={30}>{t('settings:data.retention.option_30')}</MenuItem>
                          <MenuItem value={90}>{t('settings:data.retention.option_90')}</MenuItem>
                          <MenuItem value={180}>{t('settings:data.retention.option_180')}</MenuItem>
                          <MenuItem value={365}>{t('settings:data.retention.option_365')}</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Auto Reports + Storage */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* Auto Reports */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  <Schedule sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('settings:data.auto_reports_title')}
                </Typography>
                
                {/* Auto Generate */}
                <Box mb={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dataSettings.reports?.autoGenerate || false}
                        onChange={(e) => handleReportChange('autoGenerate', e.target.checked)}
                      />
                    }
                    label={t('settings:data.auto_generate_label')}
                  />
                </Box>
                
                {dataSettings.reports?.autoGenerate && (
                  <>
                    {/* Frequency */}
                    <Box mb={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('settings:data.frequency_label')}</InputLabel>
                        <Select
                          value={dataSettings.reports?.frequency || 'weekly'}
                          onChange={(e) => handleReportChange('frequency', e.target.value)}
                          label={t('settings:data.frequency_label')}
                        >
                          <MenuItem value="daily">{t('settings:data.frequency.daily')}</MenuItem>
                          <MenuItem value="weekly">{t('settings:data.frequency.weekly')}</MenuItem>
                          <MenuItem value="monthly">{t('settings:data.frequency.monthly')}</MenuItem>
                          <MenuItem value="quarterly">{t('settings:data.frequency.quarterly')}</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    
                    {/* Report Template */}
                    <Box mb={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('settings:data.report_template')}
                      </Typography>
                      <Stack spacing={1}>
                        {reportTemplates.map((template) => (
                          <Paper
                            key={template.id}
                            variant={dataSettings.reports?.template === template.id ? 'elevation' : 'outlined'}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              bgcolor: dataSettings.reports?.template === template.id ? 'action.selected' : 'transparent'
                            }}
                            onClick={() => handleReportChange('template', template.id)}
                          >
                            <Typography variant="subtitle2">{t(`settings:data.report_templates.${template.id}.name`)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t(`settings:data.report_templates.${template.id}.desc`)}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                    
                    {/* Recipients */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('settings:data.recipients_label')}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t('settings:data.recipients_placeholder')}
                        helperText={t('settings:data.recipients_helper')}
                        value={(dataSettings.reports?.recipients || []).join(', ')}
                        onChange={(e) => {
                          const list = e.target.value
                            .split(',')
                            .map(s => s.trim())
                            .filter(Boolean)
                          handleReportChange('recipients', list)
                        }}
                      />
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Storage Usage */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  <Storage sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {t('settings:data.storage_title')}
                </Typography>
                
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{t('settings:data.storage_used')}</Typography>
                    <Typography variant="body2" fontWeight={600}>1.2 GB / 5 GB</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={24} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
                
                <List dense>
                  <ListItem>
                    <ListItemText primary={t('settings:data.storage.categories.reports')} secondary="450 MB" />
                    <ListItemSecondaryAction>
                      <IconButton size="small">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('settings:data.storage.categories.exports')} secondary="320 MB" />
                    <ListItemSecondaryAction>
                      <IconButton size="small">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary={t('settings:data.storage.categories.images')} secondary="430 MB" />
                    <ListItemSecondaryAction>
                      <IconButton size="small">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Delete />}
                  color="error"
                  sx={{ mt: 2 }}
                >
                  {t('settings:data.storage_delete_old')}
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Cloud Backup */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                <CloudUpload sx={{ verticalAlign: 'middle', mr: 1 }} />
                {t('settings:data.cloud_backup_title')}
              </Typography>
              
              <Alert severity="info" icon={<Info />}>
                <Typography variant="body2">
                  {t('settings:data.cloud_backup_coming')}
                </Typography>
              </Alert>
              
              <Box display="flex" gap={2} mt={2}>
                <Button variant="outlined" disabled>
                  {t('settings:data.connect_google_drive')}
                </Button>
                <Button variant="outlined" disabled>
                  {t('settings:data.connect_onedrive')}
                </Button>
                <Button variant="outlined" disabled>
                  {t('settings:data.connect_dropbox')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DataReportsSettings
