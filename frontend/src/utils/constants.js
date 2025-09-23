// Các hằng số cho hệ thống
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
}

export const ACCOUNT_STATUS = {
  PENDING: 'pending',        // Chờ duyệt
  ACTIVE: 'active',          // Đã kích hoạt
  SUSPENDED: 'suspended',    // Bị tạm khóa
  REJECTED: 'rejected'       // Bị từ chối
}

export const ALLOWED_DOMAINS = {
  STUDENT: ['student.ntcu.edu.vn', 'ntcu.edu.vn'],
  TEACHER: ['teacher.ntcu.edu.vn', 'ntcu.edu.vn', 'staff.ntcu.edu.vn'],
  DEMO: ['demo.com']
}

export const ERROR_MESSAGES = {
  INVALID_EMAIL_DOMAIN: 'Email không thuộc domain được phép của trường',
  TEACHER_NEEDS_APPROVAL: 'Tài khoản giáo viên cần được admin phê duyệt trước khi sử dụng',
  ACCOUNT_SUSPENDED: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ admin',
  ACCOUNT_PENDING: 'Tài khoản của bạn đang chờ phê duyệt. Vui lòng kiên nhẫn chờ đợi'
}

export const ACCOUNT_STATUS_LABELS = {
  [ACCOUNT_STATUS.ACTIVE]: 'Hoạt động',
  [ACCOUNT_STATUS.PENDING]: 'Chờ phê duyệt',
  [ACCOUNT_STATUS.SUSPENDED]: 'Tạm khóa',
  [ACCOUNT_STATUS.REJECTED]: 'Từ chối'
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Quản trị viên',
  [USER_ROLES.TEACHER]: 'Giảng viên',
  [USER_ROLES.STUDENT]: 'Sinh viên'
};

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences'
};

export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_DIGIT: true,
    REQUIRE_SPECIAL_CHAR: false
  },
  STUDENT_ID: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 10,
    PATTERN: /^\d{8,10}$/
  },
  PHONE: {
    PATTERN: /^(\+84|84|0)?[3|5|7|8|9][0-9]{8}$/
  }
};

export const DEPARTMENTS = [
  'Công nghệ thông tin',
  'Kế toán',
  'Quản trị kinh doanh', 
  'Marketing',
  'Tài chính ngân hàng',
  'Logistics và Chuỗi cung ứng',
  'Thiết kế đồ họa',
  'Kiến trúc',
  'Khác'
];
