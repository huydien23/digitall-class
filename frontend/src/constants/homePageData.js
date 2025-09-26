// HomePage Data Constants
export const NAV_ITEMS = [
  { text: 'Trang chủ', path: '/', icon: 'School' },
  { text: 'Tính năng', path: '#features', icon: 'QrCodeScanner' },
  { text: 'Giới thiệu', path: '#about', icon: 'Assessment' },
  { text: 'Liên hệ', path: '#contact', icon: 'Email' },
]

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'ThS. Nguyễn Văn Minh',
    role: 'Giảng viên Khoa CNTT',
    university: 'Đại học Bách Khoa Hà Nội',
    content: 'Từ khi dùng EduAttend, tôi tiết kiệm được 15 phút mỗi buổi học. Học sinh rất thích tính năng QR code.',
    rating: 5,
    avatar: 'M',
    avatarBg: '#6366f1',
    schoolLogo: '🏛️',
    metrics: 'Tiết kiệm 15 phút/buổi học'
  },
  {
    id: 2,
    name: 'SV. Trần Thị Lan',
    role: 'Sinh viên năm 3',
    university: 'Đại học Kinh tế Quốc dân',
    content: 'Giao diện đơn giản, dễ sử dụng. Tôi có thể xem lịch học và điểm danh ngay trên điện thoại.',
    rating: 5,
    avatar: 'L',
    avatarBg: '#4f46e5',
    schoolLogo: '🎓',
    metrics: 'Sử dụng 5 lần/tuần'
  },
  {
    id: 3,
    name: 'TS. Lê Hoàng Nam',
    role: 'Trưởng khoa',
    university: 'Đại học Sư phạm Hà Nội',
    content: 'Hệ thống báo cáo chi tiết giúp chúng tôi quản lý sinh viên hiệu quả hơn rất nhiều.',
    rating: 5,
    avatar: 'N',
    avatarBg: '#0ea5e9',
    schoolLogo: '📚',
    metrics: 'Quản lý 200+ sinh viên'
  }
]

export const FEATURES = [
  {
    id: 1,
    icon: 'QrCodeScanner',
    title: 'Điểm danh chỉ trong 30 giây',
    description: 'Sinh viên quét QR code, hệ thống tự động ghi nhận. Không cần gọi tên từng người.',
    highlight: 'Tiết kiệm 80% thời gian',
    color: '#6366f1',
    mockup: '📱',
    demo: 'Quét QR → Điểm danh tự động'
  },
  {
    id: 2,
    icon: 'Groups',
    title: 'Quản lý lớp học thông minh',
    description: 'Tạo lớp học, phân công giảng viên, theo dõi danh sách sinh viên một cách dễ dàng.',
    highlight: 'Tự động đồng bộ',
    color: '#4f46e5',
    mockup: '👥',
    demo: 'Tạo lớp → Thêm sinh viên → Quản lý'
  },
  {
    id: 3,
    icon: 'Analytics',
    title: 'Báo cáo chi tiết tự động',
    description: 'Thống kê điểm danh, xuất báo cáo Excel/PDF. Theo dõi tiến độ học tập của sinh viên.',
    highlight: 'Real-time analytics',
    color: '#22c55e',
    mockup: '📊',
    demo: 'Thống kê → Xuất báo cáo → Phân tích'
  },
  {
    id: 4,
    icon: 'Schedule',
    title: 'Lịch học tích hợp',
    description: 'Đồng bộ lịch học từ hệ thống quản lý đào tạo, nhắc nhở sinh viên về lịch học.',
    highlight: 'Tự động cập nhật',
    color: '#06b6d4',
    mockup: '📅',
    demo: 'Đồng bộ → Nhắc nhở → Thông báo'
  }
]

export const STATS = [
  { 
    id: 1,
    number: '50+', 
    label: 'Trường đại học', 
    description: 'Tin tưởng sử dụng EduAttend',
    icon: 'SchoolOutlined',
    color: '#6366f1',
    animation: 'pulse',
    context: 'Từ Bách Khoa đến Kinh tế Quốc dân'
  },
  { 
    id: 2,
    number: '5,000+', 
    label: 'Sinh viên', 
    description: 'Đang sử dụng hàng ngày',
    icon: 'PersonOutlined',
    color: '#4f46e5',
    animation: 'bounce',
    context: 'Tăng trưởng 200% trong 6 tháng'
  },
  { 
    id: 3,
    number: '200+', 
    label: 'Lớp học', 
    description: 'Được quản lý hiệu quả',
    icon: 'Groups',
    color: '#22c55e',
    animation: 'wiggle',
    context: 'Trung bình 25 sinh viên/lớp'
  },
  { 
    id: 4,
    number: '99.9%', 
    label: 'Uptime', 
    description: 'Độ tin cậy cao',
    icon: 'CloudDone',
    color: '#06b6d4',
    animation: 'float',
    context: 'Được đảm bảo bởi AWS'
  }
]

export const TRUST_INDICATORS = [
  {
    icon: 'Star',
    text: '4.9/5 từ 500+ giảng viên',
    color: '#fbbf24'
  },
  {
    icon: 'Security',
    text: 'Bảo mật cao, tuân thủ GDPR',
    color: '#10b981'
  },
  {
    icon: 'Timer',
    text: 'Setup chỉ trong 5 phút',
    color: '#f59e0b'
  }
]
