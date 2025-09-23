import * as yup from 'yup'

// Common validation messages in Vietnamese
const messages = {
  required: (field) => `${field} là bắt buộc`,
  email: 'Email không hợp lệ',
  min: (field, min) => `${field} phải có ít nhất ${min} ký tự`,
  max: (field, max) => `${field} không được vượt quá ${max} ký tự`,
  minNumber: (field, min) => `${field} phải lớn hơn hoặc bằng ${min}`,
  maxNumber: (field, max) => `${field} phải nhỏ hơn hoặc bằng ${max}`,
  phone: 'Số điện thoại không hợp lệ',
  date: 'Ngày không hợp lệ',
  url: 'URL không hợp lệ',
}

// Student validation schema
export const studentSchema = yup.object({
  student_id: yup
    .string()
    .required(messages.required('Mã sinh viên'))
    .matches(/^[A-Z0-9]+$/, 'Mã sinh viên chỉ chứa chữ hoa và số')
    .min(3, messages.min('Mã sinh viên', 3))
    .max(20, messages.max('Mã sinh viên', 20)),
  
  first_name: yup
    .string()
    .required(messages.required('Họ và tên đệm'))
    .min(2, messages.min('Họ và tên đệm', 2))
    .max(50, messages.max('Họ và tên đệm', 50))
    .matches(/^[\p{L}\s]+$/u, 'Họ chỉ được chứa chữ cái và khoảng trắng'),
  
  last_name: yup
    .string()
    .required(messages.required('Tên'))
    .min(1, messages.min('Tên', 1))
    .max(30, messages.max('Tên', 30))
    .matches(/^[\p{L}]+$/u, 'Tên chỉ được chứa chữ cái'),
  
  email: yup
    .string()
    .required(messages.required('Email'))
    .email(messages.email)
    .max(100, messages.max('Email', 100)),
  
  phone: yup
    .string()
    .nullable()
    .matches(/^[0-9+\-\s()]*$/, messages.phone)
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được vượt quá 15 số'),
  
  date_of_birth: yup
    .date()
    .required(messages.required('Ngày sinh'))
    .max(new Date(), 'Ngày sinh không thể trong tương lai')
    .min(new Date('1900-01-01'), 'Ngày sinh không hợp lệ'),
  
  gender: yup
    .string()
    .required(messages.required('Giới tính'))
    .oneOf(['male', 'female', 'other'], 'Giới tính không hợp lệ'),
  
  address: yup
    .string()
    .nullable()
    .max(200, messages.max('Địa chỉ', 200)),
  
  is_active: yup.boolean().default(true),
})

// Class validation schema
export const classSchema = yup.object({
  class_id: yup
    .string()
    .required(messages.required('Mã lớp'))
    .matches(/^[A-Z0-9]+$/, 'Mã lớp chỉ chứa chữ hoa và số')
    .min(2, messages.min('Mã lớp', 2))
    .max(20, messages.max('Mã lớp', 20)),
  
  class_name: yup
    .string()
    .required(messages.required('Tên lớp'))
    .min(3, messages.min('Tên lớp', 3))
    .max(100, messages.max('Tên lớp', 100)),
  
  description: yup
    .string()
    .nullable()
    .max(500, messages.max('Mô tả', 500)),
  
  max_students: yup
    .number()
    .required(messages.required('Số sinh viên tối đa'))
    .min(1, messages.minNumber('Số sinh viên tối đa', 1))
    .max(200, messages.maxNumber('Số sinh viên tối đa', 200))
    .integer('Số sinh viên phải là số nguyên'),
  
  teacher: yup
    .number()
    .required(messages.required('Giảng viên'))
    .positive('Vui lòng chọn giảng viên'),
  
  semester: yup
    .string()
    .required(messages.required('Học kỳ'))
    .min(1, messages.min('Học kỳ', 1))
    .max(20, messages.max('Học kỳ', 20)),
  
  school_year: yup
    .string()
    .required(messages.required('Năm học'))
    .matches(/^20\d{2}-20\d{2}$/, 'Năm học phải có định dạng 20XX-20XX'),
  
  start_date: yup
    .date()
    .required(messages.required('Ngày bắt đầu'))
    .min(new Date('2020-01-01'), 'Ngày bắt đầu không hợp lệ'),
  
  end_date: yup
    .date()
    .required(messages.required('Ngày kết thúc'))
    .min(yup.ref('start_date'), 'Ngày kết thúc phải sau ngày bắt đầu'),
  
  is_active: yup.boolean().default(true),
})

// Grade validation schema
export const gradeSchema = yup.object({
  student: yup
    .number()
    .required(messages.required('Sinh viên'))
    .positive('Vui lòng chọn sinh viên'),
  
  subject: yup
    .number()
    .required(messages.required('Môn học'))
    .positive('Vui lòng chọn môn học'),
  
  class_obj: yup
    .number()
    .required(messages.required('Lớp học'))
    .positive('Vui lòng chọn lớp học'),
  
  grade_type: yup
    .string()
    .required(messages.required('Loại điểm'))
    .oneOf(['midterm', 'final', 'assignment', 'quiz', 'lab', 'other'], 'Loại điểm không hợp lệ'),
  
  score: yup
    .number()
    .required(messages.required('Điểm số'))
    .min(0, messages.minNumber('Điểm số', 0))
    .max(yup.ref('max_score'), 'Điểm số không được vượt quá điểm tối đa'),
  
  max_score: yup
    .number()
    .required(messages.required('Điểm tối đa'))
    .min(1, messages.minNumber('Điểm tối đa', 1))
    .max(100, messages.maxNumber('Điểm tối đa', 100)),
  
  weight: yup
    .number()
    .min(0, messages.minNumber('Trọng số', 0))
    .max(1, messages.maxNumber('Trọng số', 1))
    .default(1),
  
  comment: yup
    .string()
    .nullable()
    .max(500, messages.max('Ghi chú', 500)),
  
  graded_date: yup
    .date()
    .default(() => new Date()),
})

// Subject validation schema
export const subjectSchema = yup.object({
  subject_code: yup
    .string()
    .required(messages.required('Mã môn học'))
    .matches(/^[A-Z0-9]+$/, 'Mã môn học chỉ chứa chữ hoa và số')
    .min(2, messages.min('Mã môn học', 2))
    .max(10, messages.max('Mã môn học', 10)),
  
  subject_name: yup
    .string()
    .required(messages.required('Tên môn học'))
    .min(3, messages.min('Tên môn học', 3))
    .max(100, messages.max('Tên môn học', 100)),
  
  credits: yup
    .number()
    .required(messages.required('Số tín chỉ'))
    .min(1, messages.minNumber('Số tín chỉ', 1))
    .max(10, messages.maxNumber('Số tín chỉ', 10))
    .integer('Số tín chỉ phải là số nguyên'),
  
  description: yup
    .string()
    .nullable()
    .max(1000, messages.max('Mô tả', 1000)),
  
  is_active: yup.boolean().default(true),
})

// Attendance session validation schema
export const attendanceSessionSchema = yup.object({
  session_name: yup
    .string()
    .required(messages.required('Tên buổi học'))
    .min(3, messages.min('Tên buổi học', 3))
    .max(100, messages.max('Tên buổi học', 100)),
  
  class_obj: yup
    .number()
    .required(messages.required('Lớp học'))
    .positive('Vui lòng chọn lớp học'),
  
  session_date: yup
    .date()
    .required(messages.required('Ngày học'))
    .max(new Date(), 'Ngày học không thể trong tương lai'),
  
  start_time: yup
    .string()
    .required(messages.required('Thời gian bắt đầu'))
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Thời gian không hợp lệ (HH:MM)'),
  
  end_time: yup
    .string()
    .required(messages.required('Thời gian kết thúc'))
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Thời gian không hợp lệ (HH:MM)')
    .test('is-after', 'Thời gian kết thúc phải sau thời gian bắt đầu', function(value) {
      const { start_time } = this.parent
      if (!start_time || !value) return true
      
      const [startHour, startMin] = start_time.split(':').map(Number)
      const [endHour, endMin] = value.split(':').map(Number)
      
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      
      return endMinutes > startMinutes
    }),
  
  description: yup
    .string()
    .nullable()
    .max(500, messages.max('Mô tả', 500)),
  
  is_active: yup.boolean().default(true),
})

// Login validation schema
export const loginSchema = yup.object({
  email: yup
    .string()
    .required(messages.required('Email'))
    .email(messages.email),
  
  password: yup
    .string()
    .required(messages.required('Mật khẩu'))
    .min(6, messages.min('Mật khẩu', 6)),
})

// User profile validation schema
export const profileSchema = yup.object({
  first_name: yup
    .string()
    .required(messages.required('Họ và tên đệm'))
    .min(2, messages.min('Họ và tên đệm', 2))
    .max(50, messages.max('Họ và tên đệm', 50)),
  
  last_name: yup
    .string()
    .required(messages.required('Tên'))
    .min(1, messages.min('Tên', 1))
    .max(30, messages.max('Tên', 30)),
  
  email: yup
    .string()
    .required(messages.required('Email'))
    .email(messages.email),
  
  phone: yup
    .string()
    .nullable()
    .matches(/^[0-9+\-\s()]*$/, messages.phone),
})

// Change password validation schema
export const changePasswordSchema = yup.object({
  current_password: yup
    .string()
    .required(messages.required('Mật khẩu hiện tại')),
  
  new_password: yup
    .string()
    .required(messages.required('Mật khẩu mới'))
    .min(8, messages.min('Mật khẩu mới', 8))
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
    ),
  
  confirm_password: yup
    .string()
    .required(messages.required('Xác nhận mật khẩu'))
    .oneOf([yup.ref('new_password')], 'Mật khẩu xác nhận không khớp'),
})

export default {
  studentSchema,
  classSchema,
  gradeSchema,
  subjectSchema,
  attendanceSessionSchema,
  loginSchema,
  profileSchema,
  changePasswordSchema,
  messages,
}
