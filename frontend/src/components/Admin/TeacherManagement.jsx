import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
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
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Grid,
  Alert,
  Divider
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as DepartmentIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon
} from '@mui/icons-material'

const TeacherManagement = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [newTeacher, setNewTeacher] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    experience_years: 0
  })

  // Mock data for teachers - Based on real data
  const mockTeachers = [
    {
      id: 1,
      email: 'dangmanhhuy@nctu.edu.vn',
      first_name: 'Đặng Mạnh',
      last_name: 'Huy',
      full_name: 'Đặng Mạnh Huy',
      role: 'teacher',
      account_status: 'active',
      department: 'Khoa Công nghệ thông tin',
      phone: '0123456789',
      classes_count: 1,
      students_count: 56,
      created_at: '2024-01-15T00:00:00Z',
      last_login: '2024-12-15T08:30:00Z',
      specialization: 'Lập trình Python, Cơ sở dữ liệu',
      experience_years: 5
    },
    {
      id: 2,
      email: 'tranminhtam@nctu.edu.vn',
      first_name: 'Trần Minh',
      last_name: 'Tâm',
      full_name: 'Trần Minh Tâm',
      role: 'teacher',
      account_status: 'active',
      department: 'Khoa Công nghệ thông tin',
      phone: '0987654321',
      classes_count: 1,
      students_count: 38,
      created_at: '2024-02-01T00:00:00Z',
      last_login: '2024-12-14T14:20:00Z',
      specialization: 'Pháp luật về công nghệ thông tin',
      experience_years: 8
    },
    {
      id: 3,
      email: 'doanchitrung@nctu.edu.vn',
      first_name: 'Đoàn Chí',
      last_name: 'Trung',
      full_name: 'Đoàn Chí Trung',
      role: 'teacher',
      account_status: 'active',
      department: 'Khoa Công nghệ thông tin',
      phone: '0369852147',
      classes_count: 1,
      students_count: 45,
      created_at: '2024-03-01T00:00:00Z',
      last_login: '2024-12-15T09:15:00Z',
      specialization: 'Lập trình thiết bị di động, Android, iOS',
      experience_years: 6
    },
    {
      id: 4,
      email: 'dinhcaotin@nctu.edu.vn',
      first_name: 'Đinh Cao',
      last_name: 'Tín',
      full_name: 'Đinh Cao Tín',
      role: 'teacher',
      account_status: 'active',
      department: 'Khoa Khoa học xã hội',
      phone: '0456789123',
      classes_count: 1,
      students_count: 50,
      created_at: '2024-01-20T00:00:00Z',
      last_login: '2024-12-14T16:45:00Z',
      specialization: 'Lịch sử Đảng, Chính trị học',
      experience_years: 10
    },
    {
      id: 5,
      email: 'vothanhvinh@nctu.edu.vn',
      first_name: 'Võ Thanh',
      last_name: 'Vinh',
      full_name: 'Võ Thanh Vinh',
      role: 'teacher',
      account_status: 'active',
      department: 'Khoa Công nghệ thông tin',
      phone: '0567891234',
      classes_count: 1,
      students_count: 40,
      created_at: '2024-02-15T00:00:00Z',
      last_login: '2024-12-15T10:30:00Z',
      specialization: 'Phát triển phần mềm mã nguồn mở, Linux',
      experience_years: 7
    }
  ]

  const pendingTeachers = mockTeachers.filter(t => t.account_status === 'pending')
  const activeTeachers = mockTeachers.filter(t => t.account_status === 'active')
  const suspendedTeachers = mockTeachers.filter(t => t.account_status === 'suspended')

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'suspended': return 'error'
      default: return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động'
      case 'pending': return 'Chờ duyệt'
      case 'suspended': return 'Tạm khóa'
      default: return 'Không xác định'
    }
  }

  const handleApproveTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setApprovalDialogOpen(true)
  }

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setEditDialogOpen(true)
  }

  const handleAddTeacher = () => {
    setNewTeacher({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      specialization: '',
      experience_years: 0
    })
    setAddDialogOpen(true)
  }

  const handleSaveNewTeacher = () => {
    // Mock save new teacher
    console.log('Saving new teacher:', newTeacher)
    setAddDialogOpen(false)
    // Reset form
    setNewTeacher({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      specialization: '',
      experience_years: 0
    })
  }

  const handleSuspendTeacher = (teacherId) => {
    // Handle suspend teacher
    console.log('Suspend teacher:', teacherId)
  }

  const handleActivateTeacher = (teacherId) => {
    // Handle activate teacher
    console.log('Activate teacher:', teacherId)
  }

  const TeacherCard = ({ teacher }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 56, height: 56 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{teacher.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {teacher.email}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip 
                  label={getStatusText(teacher.account_status)} 
                  color={getStatusColor(teacher.account_status)}
                  size="small"
                />
                <Chip 
                  label={`${teacher.experience_years} năm kinh nghiệm`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            {teacher.account_status === 'pending' && (
              <Button
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApproveTeacher(teacher)}
                color="success"
              >
                Duyệt
              </Button>
            )}
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleEditTeacher(teacher)}
            >
              Sửa
            </Button>
            {teacher.account_status === 'active' ? (
              <Button
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => handleSuspendTeacher(teacher.id)}
                color="error"
              >
                Khóa
              </Button>
            ) : (
              <Button
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleActivateTeacher(teacher.id)}
                color="success"
              >
                Kích hoạt
              </Button>
            )}
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <SchoolIcon fontSize="small" color="primary" />
              <Typography variant="body2">
                {teacher.classes_count} lớp học
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon fontSize="small" color="secondary" />
              <Typography variant="body2">
                {teacher.students_count} sinh viên
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <AssignmentIcon fontSize="small" color="info" />
              <Typography variant="body2">
                Chuyên môn: {teacher.specialization}
              </Typography>
            </Box>
          </Grid>
        </Grid>
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
            Quản lý giảng viên
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => console.log('Export teachers')}
            >
              Xuất danh sách
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTeacher}
            >
              Thêm giảng viên
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Duyệt tài khoản, phân quyền và quản lý giảng viên
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab 
              label={`Tất cả (${mockTeachers.length})`} 
              icon={<PersonIcon />}
            />
            <Tab 
              label={`Chờ duyệt (${pendingTeachers.length})`} 
              icon={<CheckCircleIcon />}
            />
            <Tab 
              label={`Đang hoạt động (${activeTeachers.length})`} 
              icon={<SchoolIcon />}
            />
            <Tab 
              label={`Tạm khóa (${suspendedTeachers.length})`} 
              icon={<CancelIcon />}
            />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <Grid container spacing={2}>
            {mockTeachers.map((teacher) => (
              <Grid item xs={12} md={6} key={teacher.id}>
                <TeacherCard teacher={teacher} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {pendingTeachers.length === 0 ? (
            <Alert severity="info">
              Không có giảng viên nào chờ duyệt
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {pendingTeachers.map((teacher) => (
                <Grid item xs={12} md={6} key={teacher.id}>
                  <TeacherCard teacher={teacher} />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <Grid container spacing={2}>
            {activeTeachers.map((teacher) => (
              <Grid item xs={12} md={6} key={teacher.id}>
                <TeacherCard teacher={teacher} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <Grid container spacing={2}>
            {suspendedTeachers.map((teacher) => (
              <Grid item xs={12} md={6} key={teacher.id}>
                <TeacherCard teacher={teacher} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Duyệt tài khoản giảng viên</DialogTitle>
        <DialogContent>
          {selectedTeacher && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTeacher.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedTeacher.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Chuyên môn: {selectedTeacher.specialization}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Kinh nghiệm: {selectedTeacher.experience_years} năm
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" gutterBottom>
                Bạn có chắc chắn muốn duyệt tài khoản này?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" color="success">
            Duyệt tài khoản
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin giảng viên</DialogTitle>
        <DialogContent>
          {selectedTeacher && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ"
                  defaultValue={selectedTeacher.first_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên"
                  defaultValue={selectedTeacher.last_name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  defaultValue={selectedTeacher.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  defaultValue={selectedTeacher.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Khoa/Phòng ban</InputLabel>
                  <Select defaultValue={selectedTeacher.department}>
                    <MenuItem value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</MenuItem>
                    <MenuItem value="Khoa Kỹ thuật">Khoa Kỹ thuật</MenuItem>
                    <MenuItem value="Khoa Kinh tế">Khoa Kinh tế</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chuyên môn"
                  defaultValue={selectedTeacher.specialization}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button variant="contained">Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>

      {/* Add Teacher Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon color="primary" />
            Thêm giảng viên mới
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Nhập thông tin giảng viên mới. Tài khoản sẽ được tạo với trạng thái "Chờ duyệt".
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và tên đệm"
                value={newTeacher.first_name}
                onChange={(e) => setNewTeacher({...newTeacher, first_name: e.target.value})}
                placeholder="VD: Đặng Mạnh"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên"
                value={newTeacher.last_name}
                onChange={(e) => setNewTeacher({...newTeacher, last_name: e.target.value})}
                placeholder="VD: Huy"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                placeholder="VD: dangmanhhuy@nctu.edu.vn"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                placeholder="VD: 0123456789"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Khoa/Phòng ban</InputLabel>
                <Select
                  value={newTeacher.department}
                  onChange={(e) => setNewTeacher({...newTeacher, department: e.target.value})}
                >
                  <MenuItem value="Khoa Công nghệ thông tin">Khoa Công nghệ thông tin</MenuItem>
                  <MenuItem value="Khoa Khoa học xã hội">Khoa Khoa học xã hội</MenuItem>
                  <MenuItem value="Khoa Kỹ thuật">Khoa Kỹ thuật</MenuItem>
                  <MenuItem value="Khoa Kinh tế">Khoa Kinh tế</MenuItem>
                  <MenuItem value="Khoa Ngoại ngữ">Khoa Ngoại ngữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số năm kinh nghiệm"
                type="number"
                value={newTeacher.experience_years}
                onChange={(e) => setNewTeacher({...newTeacher, experience_years: parseInt(e.target.value) || 0})}
                inputProps={{ min: 0, max: 50 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chuyên môn"
                value={newTeacher.specialization}
                onChange={(e) => setNewTeacher({...newTeacher, specialization: e.target.value})}
                placeholder="VD: Lập trình Python, Cơ sở dữ liệu"
                multiline
                rows={2}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveNewTeacher}
            disabled={!newTeacher.first_name || !newTeacher.last_name || !newTeacher.email || !newTeacher.phone || !newTeacher.department || !newTeacher.specialization}
          >
            Tạo tài khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default TeacherManagement
