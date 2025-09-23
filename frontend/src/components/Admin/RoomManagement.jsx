import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Badge
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Computer as ComputerIcon,
  Chair as ChairIcon,
  Wifi as WifiIcon,
  Tv as TvIcon,
  Search as SearchIcon
} from '@mui/icons-material'

const RoomManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [roomDialogOpen, setRoomDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [filterBuilding, setFilterBuilding] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    building: '',
    floor: 1,
    type: '',
    capacity: 60,
    status: 'available',
    equipment: ''
  })

  // Mock data for rooms - Based on real building structure
  const mockRooms = [
    // Khu D - 4 tầng
    // Tầng 1: D1-01 đến D1-08
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `d1-${String(i + 1).padStart(2, '0')}`,
      name: `D1-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu D',
      floor: 1,
      capacity: 60,
      type: 'Phòng lý thuyết',
      status: i < 3 ? 'occupied' : 'available',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Hệ thống âm thanh'],
      currentClass: i < 3 ? {
        subject: ['Lập trình Python', 'Pháp luật về công nghệ thông tin', 'Lập trình thiết bị di động'][i],
        teacher: ['Đặng Mạnh Huy', 'Trần Minh Tâm', 'Đoàn Chí Trung'][i],
        time: ['07:00-11:00', '13:00-17:00', '08:00-12:00'][i],
        day: ['Thứ 2', 'Thứ 3', 'Thứ 4'][i]
      } : null,
      nextClass: i < 3 ? null : {
        subject: 'Lịch sử Đảng cộng sản Việt Nam',
        teacher: 'Đinh Cao Tín',
        time: '14:00-18:00',
        day: 'Thứ 5'
      },
      weeklySchedule: i < 3 ? [
        { day: ['Thứ 2', 'Thứ 3', 'Thứ 4'][i], time: ['07:00-11:00', '13:00-17:00', '08:00-12:00'][i], subject: ['Lập trình Python', 'Pháp luật về công nghệ thông tin', 'Lập trình thiết bị di động'][i], teacher: ['Đặng Mạnh Huy', 'Trần Minh Tâm', 'Đoàn Chí Trung'][i] }
      ] : [],
      maintenance: null
    })),
    
    // Tầng 2: D2-01 đến D2-08
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `d2-${String(i + 1).padStart(2, '0')}`,
      name: `D2-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu D',
      floor: 2,
      capacity: 60,
      type: 'Phòng lý thuyết',
      status: i < 2 ? 'occupied' : 'available',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Hệ thống âm thanh'],
      currentClass: i < 2 ? {
        subject: ['Phát triển phần mềm mã nguồn mở', 'Lập trình Python'][i],
        teacher: ['Võ Thanh Vinh', 'Đặng Mạnh Huy'][i],
        time: ['08:00-12:00', '07:00-11:00'][i],
        day: ['Thứ 6', 'Thứ 2'][i]
      } : null,
      nextClass: null,
      weeklySchedule: i < 2 ? [
        { day: ['Thứ 6', 'Thứ 2'][i], time: ['08:00-12:00', '07:00-11:00'][i], subject: ['Phát triển phần mềm mã nguồn mở', 'Lập trình Python'][i], teacher: ['Võ Thanh Vinh', 'Đặng Mạnh Huy'][i] }
      ] : [],
      maintenance: null
    })),
    
    // Tầng 3: D3-01 đến D3-08
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `d3-${String(i + 1).padStart(2, '0')}`,
      name: `D3-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu D',
      floor: 3,
      capacity: 60,
      type: 'Phòng lý thuyết',
      status: 'available',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Hệ thống âm thanh'],
      currentClass: null,
      nextClass: null,
      weeklySchedule: [],
      maintenance: null
    })),
    
    // Tầng 4: Hội trường D4-01 (duy nhất)
    {
      id: 'd4-01',
      name: 'D4-01',
      building: 'Khu D',
      floor: 4,
      capacity: 400,
      type: 'Hội trường',
      status: 'available',
      equipment: ['Máy chiếu lớn', 'Hệ thống âm thanh', 'Sân khấu', 'Điều hòa'],
      currentClass: null,
      nextClass: null,
      weeklySchedule: [],
      maintenance: null
    },

    // Khu T (Thư viện) - Chỉ tầng 1 và 4
    // Tầng 1: T1-01 đến T1-06
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `t1-${String(i + 1).padStart(2, '0')}`,
      name: `T1-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu T (Thư viện)',
      floor: 1,
      capacity: 60,
      type: 'Phòng lý thuyết',
      status: i < 2 ? 'occupied' : 'available',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Hệ thống âm thanh'],
      currentClass: i < 2 ? {
        subject: ['Lịch sử Đảng cộng sản Việt Nam', 'Pháp luật về công nghệ thông tin'][i],
        teacher: ['Đinh Cao Tín', 'Trần Minh Tâm'][i],
        time: ['14:00-18:00', '13:00-17:00'][i],
        day: ['Thứ 5', 'Thứ 3'][i]
      } : null,
      nextClass: null,
      weeklySchedule: i < 2 ? [
        { day: ['Thứ 5', 'Thứ 3'][i], time: ['14:00-18:00', '13:00-17:00'][i], subject: ['Lịch sử Đảng cộng sản Việt Nam', 'Pháp luật về công nghệ thông tin'][i], teacher: ['Đinh Cao Tín', 'Trần Minh Tâm'][i] }
      ] : [],
      maintenance: null
    })),
    
    // Tầng 4: T4-01 đến T4-08
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `t4-${String(i + 1).padStart(2, '0')}`,
      name: `T4-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu T (Thư viện)',
      floor: 4,
      capacity: 60,
      type: 'Phòng lý thuyết',
      status: 'available',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Hệ thống âm thanh'],
      currentClass: null,
      nextClass: null,
      weeklySchedule: [],
      maintenance: null
    })),

    // Khu I (IT) - 7 tầng
    // Tầng 2 (M): I2-01 đến I2-06
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `i2-${String(i + 1).padStart(2, '0')}`,
      name: `I2-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu I (IT)',
      floor: 2,
      capacity: 60,
      type: 'Phòng học đường',
      status: i < 3 ? 'occupied' : 'available',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Hệ thống âm thanh', 'Máy tính'],
      currentClass: i < 3 ? {
        subject: ['Lập trình Python', 'Lập trình thiết bị di động', 'Phát triển phần mềm mã nguồn mở'][i],
        teacher: ['Đặng Mạnh Huy', 'Đoàn Chí Trung', 'Võ Thanh Vinh'][i],
        time: ['07:00-11:00', '08:00-12:00', '08:00-12:00'][i],
        day: ['Thứ 2', 'Thứ 4', 'Thứ 6'][i]
      } : null,
      nextClass: null,
      weeklySchedule: i < 3 ? [
        { day: ['Thứ 2', 'Thứ 4', 'Thứ 6'][i], time: ['07:00-11:00', '08:00-12:00', '08:00-12:00'][i], subject: ['Lập trình Python', 'Lập trình thiết bị di động', 'Phát triển phần mềm mã nguồn mở'][i], teacher: ['Đặng Mạnh Huy', 'Đoàn Chí Trung', 'Võ Thanh Vinh'][i] }
      ] : [],
      maintenance: null
    })),
    
    // Tầng 3: I3-01 đến I3-06 (Thực hành)
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `i3-${String(i + 1).padStart(2, '0')}`,
      name: `I3-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu I (IT)',
      floor: 3,
      capacity: 60,
      type: 'Phòng thực hành',
      status: i < 2 ? 'occupied' : 'available',
      equipment: ['Máy tính', 'Máy chiếu', 'Bảng trắng', 'Thiết bị mạng'],
      currentClass: i < 2 ? {
        subject: ['Lập trình Python', 'Lập trình thiết bị di động'][i],
        teacher: ['Đặng Mạnh Huy', 'Đoàn Chí Trung'][i],
        time: ['07:00-11:00', '08:00-12:00'][i],
        day: ['Thứ 2', 'Thứ 4'][i]
      } : null,
      nextClass: null,
      weeklySchedule: i < 2 ? [
        { day: ['Thứ 2', 'Thứ 4'][i], time: ['07:00-11:00', '08:00-12:00'][i], subject: ['Lập trình Python', 'Lập trình thiết bị di động'][i], teacher: ['Đặng Mạnh Huy', 'Đoàn Chí Trung'][i] }
      ] : [],
      maintenance: null
    })),
    
    // Tầng 4: I4-01 đến I4-06 (Thực hành)
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `i4-${String(i + 1).padStart(2, '0')}`,
      name: `I4-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu I (IT)',
      floor: 4,
      capacity: 60,
      type: 'Phòng thực hành',
      status: 'available',
      equipment: ['Máy tính', 'Máy chiếu', 'Bảng trắng', 'Thiết bị mạng'],
      currentClass: null,
      nextClass: null,
      weeklySchedule: [],
      maintenance: null
    })),
    
    // Tầng 5: I5-01 đến I5-06 (Thực hành)
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `i5-${String(i + 1).padStart(2, '0')}`,
      name: `I5-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu I (IT)',
      floor: 5,
      capacity: 60,
      type: 'Phòng thực hành',
      status: 'available',
      equipment: ['Máy tính', 'Máy chiếu', 'Bảng trắng', 'Thiết bị mạng'],
      currentClass: null,
      nextClass: null,
      weeklySchedule: [],
      maintenance: null
    })),
    
    // Tầng 6: I6-01 đến I6-06 (Học đường)
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `i6-${String(i + 1).padStart(2, '0')}`,
      name: `I6-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu I (IT)',
      floor: 6,
      capacity: 60,
      type: 'Phòng học đường',
      status: 'available',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Hệ thống âm thanh', 'Máy tính'],
      currentClass: null,
      nextClass: null,
      weeklySchedule: [],
      maintenance: null
    })),
    
    // Tầng 7: I7-01, I7-02 (Học đường)
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `i7-${String(i + 1).padStart(2, '0')}`,
      name: `I7-${String(i + 1).padStart(2, '0')}`,
      building: 'Khu I (IT)',
      floor: 7,
      capacity: 60,
      type: 'Phòng học đường',
      status: 'available',
      equipment: ['Máy chiếu', 'Bảng trắng', 'Hệ thống âm thanh', 'Máy tính'],
      currentClass: null,
      nextClass: null,
      weeklySchedule: [],
      maintenance: null
    }))
  ]

  const availableRooms = mockRooms.filter(r => r.status === 'available')
  const occupiedRooms = mockRooms.filter(r => r.status === 'occupied')
  const maintenanceRooms = mockRooms.filter(r => r.status === 'maintenance')

  // Group rooms by building and floor
  const groupedRooms = mockRooms.reduce((acc, room) => {
    const key = `${room.building}-${room.floor}`
    if (!acc[key]) {
      acc[key] = {
        building: room.building,
        floor: room.floor,
        rooms: []
      }
    }
    acc[key].rooms.push(room)
    return acc
  }, {})

  // Filter and sort rooms
  const filteredRooms = mockRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBuilding = filterBuilding === 'all' || room.building === filterBuilding
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus
    const matchesType = filterType === 'all' || room.type === filterType
    
    return matchesSearch && matchesBuilding && matchesStatus && matchesType
  })

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'building':
        return a.building.localeCompare(b.building)
      case 'floor':
        return a.floor - b.floor
      case 'capacity':
        return b.capacity - a.capacity
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  const buildingGroups = Object.values(
    sortedRooms.reduce((acc, room) => {
      const key = `${room.building}-${room.floor}`
      if (!acc[key]) {
        acc[key] = {
          building: room.building,
          floor: room.floor,
          rooms: []
        }
      }
      acc[key].rooms.push(room)
      return acc
    }, {})
  ).sort((a, b) => {
    // Sort by building first, then by floor
    if (a.building !== b.building) {
      const buildingOrder = { 'Khu D': 1, 'Khu T (Thư viện)': 2, 'Khu I (IT)': 3 }
      return (buildingOrder[a.building] || 999) - (buildingOrder[b.building] || 999)
    }
    return a.floor - b.floor
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success'
      case 'occupied': return 'warning'
      case 'maintenance': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Trống'
      case 'occupied': return 'Đang sử dụng'
      case 'maintenance': return 'Bảo trì'
      default: return 'Không xác định'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Phòng máy tính': return <ComputerIcon />
      case 'Phòng lý thuyết': return <SchoolIcon />
      case 'Phòng thực hành': return <AssignmentIcon />
      case 'Phòng hội thảo': return <TvIcon />
      default: return <RoomIcon />
    }
  }

  const handleCreateRoom = () => {
    setSelectedRoom(null)
    setRoomFormData({
      name: '',
      building: '',
      floor: 1,
      type: '',
      capacity: 60,
      status: 'available',
      equipment: ''
    })
    setRoomDialogOpen(true)
  }

  const handleEditRoom = (room) => {
    setSelectedRoom(room)
    setRoomFormData({
      name: room.name,
      building: room.building,
      floor: room.floor,
      type: room.type,
      capacity: room.capacity,
      status: room.status,
      equipment: room.equipment.join(', ')
    })
    setRoomDialogOpen(true)
  }

  const handleSaveRoom = () => {
    // Mock save room
    console.log('Saving room:', roomFormData)
    setRoomDialogOpen(false)
  }

  const handleScheduleRoom = (room) => {
    setSelectedRoom(room)
    setScheduleDialogOpen(true)
  }

  const handleDeleteRoom = (roomId) => {
    // Handle delete room
    console.log('Delete room:', roomId)
  }

  const RoomCard = ({ room }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: getStatusColor(room.status) }}>
              {getTypeIcon(room.type)}
            </Avatar>
            <Box>
              <Typography variant="h6">{room.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {room.building} - {room.type}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip 
                  label={getStatusText(room.status)} 
                  color={getStatusColor(room.status)}
                  size="small"
                />
                <Chip 
                  label={`${room.capacity} chỗ`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              onClick={() => handleScheduleRoom(room)}
              disabled={room.status === 'maintenance'}
            >
              <ScheduleIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleEditRoom(room)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteRoom(room.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        
        {/* Equipment */}
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Thiết bị:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {room.equipment.map((item, index) => (
              <Chip key={index} label={item} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>

        {/* Current Status */}
        {room.currentClass && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Đang sử dụng:</strong> {room.currentClass.subject} - {room.currentClass.teacher}
              <br />
              <strong>Thời gian:</strong> {room.currentClass.time} ({room.currentClass.day})
            </Typography>
          </Alert>
        )}

        {room.nextClass && !room.currentClass && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Lịch tiếp theo:</strong> {room.nextClass.subject} - {room.nextClass.teacher}
              <br />
              <strong>Thời gian:</strong> {room.nextClass.time} ({room.nextClass.day})
            </Typography>
          </Alert>
        )}

        {room.maintenance && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Bảo trì:</strong> {room.maintenance.reason}
              <br />
              <strong>Thời gian:</strong> {room.maintenance.startDate} - {room.maintenance.endDate}
              <br />
              <strong>Kỹ thuật viên:</strong> {room.maintenance.technician}
            </Typography>
          </Alert>
        )}

        {/* Weekly Schedule */}
        {room.weeklySchedule.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Lịch tuần:
            </Typography>
            <List dense>
              {room.weeklySchedule.map((schedule, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={`${schedule.day}: ${schedule.time}`}
                    secondary={`${schedule.subject} - ${schedule.teacher}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={700}>
            Quản lý phòng học
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRoom}
          >
            Thêm phòng học mới
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Xem lịch trống, sắp lớp và quản lý phòng học
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm phòng học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Khu</InputLabel>
                <Select
                  value={filterBuilding}
                  onChange={(e) => setFilterBuilding(e.target.value)}
                >
                  <MenuItem value="all">Tất cả khu</MenuItem>
                  <MenuItem value="Khu D">Khu D</MenuItem>
                  <MenuItem value="Khu T (Thư viện)">Khu T (Thư viện)</MenuItem>
                  <MenuItem value="Khu I (IT)">Khu I (IT)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Tất cả trạng thái</MenuItem>
                  <MenuItem value="available">Trống</MenuItem>
                  <MenuItem value="occupied">Đang sử dụng</MenuItem>
                  <MenuItem value="maintenance">Bảo trì</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Loại phòng</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">Tất cả loại</MenuItem>
                  <MenuItem value="Phòng lý thuyết">Phòng lý thuyết</MenuItem>
                  <MenuItem value="Phòng thực hành">Phòng thực hành</MenuItem>
                  <MenuItem value="Phòng học đường">Phòng học đường</MenuItem>
                  <MenuItem value="Hội trường">Hội trường</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="name">Tên phòng</MenuItem>
                  <MenuItem value="building">Khu</MenuItem>
                  <MenuItem value="floor">Tầng</MenuItem>
                  <MenuItem value="capacity">Sức chứa</MenuItem>
                  <MenuItem value="status">Trạng thái</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Results Summary */}
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Hiển thị {sortedRooms.length} phòng học
              {searchTerm && ` cho "${searchTerm}"`}
              {filterBuilding !== 'all' && ` trong ${filterBuilding}`}
              {filterStatus !== 'all' && ` - ${filterStatus === 'available' ? 'Trống' : filterStatus === 'occupied' ? 'Đang sử dụng' : 'Bảo trì'}`}
              {filterType !== 'all' && ` - ${filterType}`}
            </Typography>
            <Box display="flex" gap={1}>
              <Chip 
                label={`Trống: ${availableRooms.length}`} 
                color="success" 
                variant="outlined" 
                size="small"
              />
              <Chip 
                label={`Đang sử dụng: ${occupiedRooms.length}`} 
                color="warning" 
                variant="outlined" 
                size="small"
              />
              <Chip 
                label={`Bảo trì: ${maintenanceRooms.length}`} 
                color="error" 
                variant="outlined" 
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab 
              label={`Tất cả (${sortedRooms.length})`} 
              icon={<RoomIcon />}
            />
            <Tab 
              label={`Trống (${availableRooms.length})`} 
              icon={<CheckCircleIcon />}
            />
            <Tab 
              label={`Đang sử dụng (${occupiedRooms.length})`} 
              icon={<WarningIcon />}
            />
            <Tab 
              label={`Bảo trì (${maintenanceRooms.length})`} 
              icon={<InfoIcon />}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRoom}
          >
            Thêm phòng học mới
          </Button>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          {buildingGroups.map((group, groupIndex) => (
            <Box key={`${group.building}-${group.floor}`} mb={4}>
              <Typography variant="h6" gutterBottom sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1,
                mb: 2
              }}>
                {group.building} - Tầng {group.floor}
                <Chip 
                  label={`${group.rooms.length} phòng`} 
                  size="small" 
                  sx={{ ml: 2 }}
                  color="primary"
                  variant="outlined"
                />
              </Typography>
              <Grid container spacing={2}>
                {group.rooms.map((room) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                    <RoomCard room={room} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <Grid container spacing={2}>
            {availableRooms.map((room) => (
              <Grid item xs={12} md={6} key={room.id}>
                <RoomCard room={room} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={2}>
            {occupiedRooms.map((room) => (
              <Grid item xs={12} md={6} key={room.id}>
                <RoomCard room={room} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Grid container spacing={2}>
            {maintenanceRooms.map((room) => (
              <Grid item xs={12} md={6} key={room.id}>
                <RoomCard room={room} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>

      {/* Room Dialog */}
      <Dialog open={roomDialogOpen} onClose={() => setRoomDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRoom ? 'Chỉnh sửa phòng học' : 'Thêm phòng học mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên phòng"
                value={roomFormData.name}
                onChange={(e) => setRoomFormData({...roomFormData, name: e.target.value})}
                placeholder="VD: D1-01"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Khu</InputLabel>
                <Select
                  value={roomFormData.building}
                  onChange={(e) => setRoomFormData({...roomFormData, building: e.target.value})}
                >
                  <MenuItem value="Khu D">Khu D</MenuItem>
                  <MenuItem value="Khu T (Thư viện)">Khu T (Thư viện)</MenuItem>
                  <MenuItem value="Khu I (IT)">Khu I (IT)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tầng"
                type="number"
                value={roomFormData.floor}
                onChange={(e) => setRoomFormData({...roomFormData, floor: parseInt(e.target.value) || 1})}
                inputProps={{ min: 1, max: 7 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Loại phòng</InputLabel>
                <Select
                  value={roomFormData.type}
                  onChange={(e) => setRoomFormData({...roomFormData, type: e.target.value})}
                >
                  <MenuItem value="Phòng lý thuyết">Phòng lý thuyết</MenuItem>
                  <MenuItem value="Phòng thực hành">Phòng thực hành</MenuItem>
                  <MenuItem value="Phòng học đường">Phòng học đường</MenuItem>
                  <MenuItem value="Hội trường">Hội trường</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sức chứa"
                type="number"
                value={roomFormData.capacity}
                onChange={(e) => setRoomFormData({...roomFormData, capacity: parseInt(e.target.value) || 60})}
                placeholder="VD: 60"
                inputProps={{ min: 1, max: 400 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái phòng</InputLabel>
                <Select
                  value={roomFormData.status}
                  onChange={(e) => setRoomFormData({...roomFormData, status: e.target.value})}
                >
                  <MenuItem value="available">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box width={8} height={8} borderRadius="50%" bgcolor="success.main" />
                      Trống
                    </Box>
                  </MenuItem>
                  <MenuItem value="occupied">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box width={8} height={8} borderRadius="50%" bgcolor="warning.main" />
                      Đang sử dụng
                    </Box>
                  </MenuItem>
                  <MenuItem value="maintenance">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box width={8} height={8} borderRadius="50%" bgcolor="error.main" />
                      Đang sửa chữa
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thiết bị (cách nhau bởi dấu phẩy)"
                value={roomFormData.equipment}
                onChange={(e) => setRoomFormData({...roomFormData, equipment: e.target.value})}
                placeholder="VD: Máy tính, Máy chiếu, Wifi"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveRoom}
            disabled={!roomFormData.name || !roomFormData.building || !roomFormData.type}
          >
            {selectedRoom ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Room Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Sắp lịch cho {selectedRoom?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Chọn thời gian và lớp học để sắp lịch sử dụng phòng
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lớp học</InputLabel>
                <Select>
                  <MenuItem value="python">Lập trình Python - DH22TIN06</MenuItem>
                  <MenuItem value="law">Pháp luật về công nghệ thông tin - DH22TIN07</MenuItem>
                  <MenuItem value="mobile">Lập trình thiết bị di động - DH22TIN08</MenuItem>
                  <MenuItem value="history">Lịch sử Đảng cộng sản Việt Nam - DH22TIN09</MenuItem>
                  <MenuItem value="opensource">Phát triển phần mềm mã nguồn mở - DH22TIN10</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Giảng viên</InputLabel>
                <Select>
                  <MenuItem value="huy">Đặng Mạnh Huy</MenuItem>
                  <MenuItem value="tam">Trần Minh Tâm</MenuItem>
                  <MenuItem value="trung">Đoàn Chí Trung</MenuItem>
                  <MenuItem value="tin">Đinh Cao Tín</MenuItem>
                  <MenuItem value="vinh">Võ Thanh Vinh</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Thứ trong tuần</InputLabel>
                <Select>
                  <MenuItem value={2}>Thứ 2</MenuItem>
                  <MenuItem value={3}>Thứ 3</MenuItem>
                  <MenuItem value={4}>Thứ 4</MenuItem>
                  <MenuItem value={5}>Thứ 5</MenuItem>
                  <MenuItem value={6}>Thứ 6</MenuItem>
                  <MenuItem value={7}>Thứ 7</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Giờ bắt đầu"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Giờ kết thúc"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Hủy</Button>
          <Button variant="contained">Sắp lịch</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default RoomManagement
