import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  AvatarGroup,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
  Shuffle as ShuffleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [groupMethod, setGroupMethod] = useState('random');
  const [selectedClass, setSelectedClass] = useState('');
  const [groupSize, setGroupSize] = useState(5);

  // Mock data
  const groupSets = [
    {
      id: 1,
      title: 'Nhóm cho Project cuối kỳ',
      class: 'CS101',
      groupCount: 6,
      studentCount: 30,
      createdAt: '2025-01-05',
      groups: [
        { id: 1, name: 'Nhóm 1', members: ['SV001', 'SV002', 'SV003', 'SV004', 'SV005'] },
        { id: 2, name: 'Nhóm 2', members: ['SV006', 'SV007', 'SV008', 'SV009', 'SV010'] },
        // ... more groups
      ],
    },
    {
      id: 2,
      title: 'Nhóm thảo luận tuần 3',
      class: 'CS201',
      groupCount: 10,
      studentCount: 30,
      createdAt: '2025-01-03',
      groups: [],
    },
  ];

  const classes = [
    { id: 1, name: 'CS101 - Lập trình Python', studentCount: 30 },
    { id: 2, name: 'CS201 - Web Development', studentCount: 30 },
  ];

  const handleCreateGroup = () => {
    // Handle create logic
    console.log('Create group:', { groupMethod, selectedClass, groupSize });
    setOpenCreateDialog(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Nhóm học tập
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý nhóm học tập và phân nhóm tự động
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setOpenCreateDialog(true)}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Tạo nhóm mới
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    {groupSets.length}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tập nhóm
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <GroupsIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    {groupSets.reduce((sum, gs) => sum + gs.groupCount, 0)}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Tổng nhóm
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <GroupsIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="white">
                    5
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    SV/nhóm (TB)
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm nhóm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="grid">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </CardContent>
      </Card>

      {/* Groups List */}
      {groupSets.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <GroupsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có nhóm nào
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tạo nhóm đầu tiên để bắt đầu
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Tạo nhóm mới
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {groupSets.map((groupSet) => (
            <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} key={groupSet.id}>
              <Card
                sx={{
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s',
                  },
                }}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {groupSet.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip label={groupSet.class} size="small" color="primary" />
                        <Typography variant="caption" color="text.secondary">
                          Tạo: {groupSet.createdAt}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xuất Excel">
                        <IconButton size="small">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Stats */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          {groupSet.groupCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Số nhóm
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="h5" fontWeight={700} color="success.main">
                          {groupSet.studentCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sinh viên
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Groups Preview */}
                  {groupSet.groups.length > 0 && (
                    <Box>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Danh sách nhóm:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {groupSet.groups.slice(0, 3).map((group) => (
                          <Chip
                            key={group.id}
                            label={`${group.name} (${group.members.length})`}
                            size="small"
                            variant="outlined"
                            avatar={<Avatar>{group.id}</Avatar>}
                          />
                        ))}
                        {groupSet.groups.length > 3 && (
                          <Chip
                            label={`+${groupSet.groups.length - 3} nhóm khác`}
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ mt: 2 }}>
                    <Button fullWidth variant="outlined" size="small">
                      Xem chi tiết
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Group Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Tạo nhóm mới
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Method Selection */}
            <FormControl fullWidth>
              <InputLabel>Phương thức tạo nhóm</InputLabel>
              <Select
                value={groupMethod}
                onChange={(e) => setGroupMethod(e.target.value)}
                label="Phương thức tạo nhóm"
              >
                <MenuItem value="random">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShuffleIcon fontSize="small" />
                    Phân nhóm tự động (Random)
                  </Box>
                </MenuItem>
                <MenuItem value="manual">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon fontSize="small" />
                    Phân nhóm thủ công
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Title */}
            <TextField
              fullWidth
              label="Tên tập nhóm"
              placeholder="VD: Nhóm cho Project cuối kỳ"
              helperText="Đặt tên để dễ nhận biết"
            />

            {/* Class Selection */}
            <FormControl fullWidth>
              <InputLabel>Chọn lớp</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Chọn lớp"
              >
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount} sinh viên)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Group Size (only for random) */}
            {groupMethod === 'random' && (
              <Box>
                <Typography gutterBottom>
                  Số sinh viên mỗi nhóm: <strong>{groupSize}</strong>
                </Typography>
                <Slider
                  value={groupSize}
                  onChange={(e, newValue) => setGroupSize(newValue)}
                  min={2}
                  max={10}
                  marks
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Sẽ tạo khoảng {Math.ceil(30 / groupSize)} nhóm (với 30 sinh viên)
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={!selectedClass}
            startIcon={groupMethod === 'random' ? <ShuffleIcon /> : <AddIcon />}
          >
            {groupMethod === 'random' ? 'Phân nhóm ngẫu nhiên' : 'Tạo nhóm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Groups;
