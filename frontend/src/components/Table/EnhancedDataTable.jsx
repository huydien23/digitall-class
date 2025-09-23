import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Menu,
  MenuItem,
  Button,
  Fade,
  Skeleton
} from '@mui/material'
import {
  Search,
  FilterList,
  MoreVert,
  GetApp,
  Visibility,
  Edit,
  Delete,
  FileDownload
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'

// Enhanced table with sorting, filtering, pagination, and actions
const EnhancedDataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  title,
  subtitle,
  searchable = true,
  sortable = true,
  selectable = false,
  actions = [],
  rowActions = [],
  onRowClick,
  onSelectionChange,
  exportable = false,
  onExport,
  initialRowsPerPage = 10,
  sticky = true,
  dense = false,
  emptyMessage = "Không có dữ liệu",
  loadingRows = 5,
  ...props
}) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage)
  const [orderBy, setOrderBy] = useState('')
  const [order, setOrder] = useState('asc')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [filterAnchorEl, setFilterAnchorEl] = useState(null)

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filteredData = data

    // Apply search filter
    if (search && searchable) {
      filteredData = data.filter((row) =>
        columns.some((column) => {
          const value = row[column.id]
          return value && value.toString().toLowerCase().includes(search.toLowerCase())
        })
      )
    }

    // Apply sorting
    if (orderBy && sortable) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[orderBy]
        const bValue = b[orderBy]
        
        if (bValue < aValue) {
          return order === 'desc' ? -1 : 1
        }
        if (bValue > aValue) {
          return order === 'desc' ? 1 : -1
        }
        return 0
      })
    }

    return filteredData
  }, [data, search, orderBy, order, columns, searchable, sortable])

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Sorting handlers
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // Selection handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = processedData.map((row) => row.id)
      setSelected(newSelected)
      onSelectionChange?.(newSelected)
    } else {
      setSelected([])
      onSelectionChange?.([])
    }
  }

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
    onSelectionChange?.(newSelected)
  }

  const isSelected = (id) => selected.indexOf(id) !== -1

  // Get current page data
  const paginatedData = processedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // Render cell content based on column type
  const renderCellContent = (row, column) => {
    const value = row[column.id]
    
    if (column.render) {
      return column.render(value, row)
    }

    switch (column.type) {
      case 'chip':
        return (
          <Chip
            label={value}
            color={column.getColor?.(value, row) || 'default'}
            size="small"
            variant={column.variant || 'filled'}
          />
        )
      case 'date':
        return value ? new Date(value).toLocaleDateString('vi-VN') : '-'
      case 'currency':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(value || 0)
      case 'number':
        return new Intl.NumberFormat('vi-VN').format(value || 0)
      case 'boolean':
        return value ? 'Có' : 'Không'
      default:
        return value || '-'
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <Paper {...props}>
        {(title || subtitle) && (
          <Toolbar>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="30%" height={32} />
              {subtitle && <Skeleton variant="text" width="50%" height={20} />}
            </Box>
          </Toolbar>
        )}
        <TableContainer>
          <Table size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: loadingRows }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      <Skeleton variant="text" width="90%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )
  }

  return (
    <Paper {...props}>
      {/* Toolbar */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(selected.length > 0 && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          }),
        }}
      >
        {selected.length > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selected.length} mục đã chọn
          </Typography>
        ) : (
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography variant="h6" id="tableTitle" component="div">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Search */}
        {searchable && selected.length === 0 && (
          <TextField
            size="small"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 1, minWidth: 200 }}
          />
        )}

        {/* Action buttons */}
        {selected.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions.map((action, index) => (
              <Tooltip key={index} title={action.tooltip || action.label}>
                <IconButton
                  onClick={() => action.onClick(selected)}
                  disabled={action.disabled}
                  color={action.color || 'default'}
                >
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {exportable && (
              <Tooltip title="Xuất dữ liệu">
                <IconButton onClick={onExport}>
                  <FileDownload />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Bộ lọc">
              <IconButton onClick={(e) => setFilterAnchorEl(e.currentTarget)}>
                <FilterList />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      {/* Table */}
      <TableContainer sx={{ maxHeight: sticky ? 440 : undefined }}>
        <Table
          stickyHeader={sticky}
          size={dense ? 'small' : 'medium'}
          aria-labelledby="tableTitle"
        >
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < processedData.length}
                    checked={processedData.length > 0 && selected.length === processedData.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  padding={column.disablePadding ? 'none' : 'normal'}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{ minWidth: column.minWidth }}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {rowActions.length > 0 && (
                <TableCell align="center" padding="normal">
                  Thao tác
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => {
                  const isItemSelected = isSelected(row.id)
                  const labelId = `enhanced-table-checkbox-${index}`

                  return (
                    <motion.tr
                      key={row.id}
                      component={TableRow}
                      hover={!!onRowClick}
                      onClick={onRowClick ? (event) => onRowClick(event, row) : undefined}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected}
                      sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onChange={(event) => handleClick(event, row.id)}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                          padding={column.disablePadding ? 'none' : 'normal'}
                        >
                          {renderCellContent(row, column)}
                        </TableCell>
                      ))}
                      {rowActions.length > 0 && (
                        <TableCell align="center" padding="normal">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            {rowActions.map((action, actionIndex) => (
                              <Tooltip key={actionIndex} title={action.tooltip || action.label}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    action.onClick(row)
                                  }}
                                  disabled={action.disabled?.(row)}
                                  color={action.color || 'default'}
                                >
                                  {action.icon}
                                </IconButton>
                              </Tooltip>
                            ))}
                          </Box>
                        </TableCell>
                      )}
                    </motion.tr>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={processedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} của ${count !== -1 ? count : `hơn ${to}`}`}
      />
    </Paper>
  )
}

export default EnhancedDataTable
