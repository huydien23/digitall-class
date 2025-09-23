import React, { createContext, useContext, useState, useEffect } from 'react'

const AdminMockDataContext = createContext()

export const useAdminMockData = () => {
  const context = useContext(AdminMockDataContext)
  if (!context) {
    throw new Error('useAdminMockData must be used within AdminMockDataProvider')
  }
  return context
}

export const AdminMockDataProvider = ({ children, user }) => {
  const [mockData, setMockData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMockData = () => {
      setIsLoading(true)
      
      // Mock system statistics
      const mockSystemStats = {
        totalUsers: 156,
        totalStudents: 120,
        totalTeachers: 25,
        totalClasses: 8,
        activeClasses: 6,
        pendingApprovals: 3,
        systemHealth: 'healthy',
        databaseStatus: 'connected',
        apiStatus: 'online'
      }

      // Mock teachers data - Based on real data
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
          classes_count: 2,
          students_count: 80,
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

      // Mock classes data - Based on real subjects and teachers
      const mockClasses = [
        {
          id: 1,
          name: 'Lập trình Python - DH22TIN06',
          class_id: '110101101010',
          teacher: 'Đặng Mạnh Huy',
          teacher_id: 1,
          max_students: 42,
          current_students: 56,
          is_active: true,
          schedule: 'Thứ 2: 07:00-11:00',
          location: 'Phòng 14-02 (Phòng máy 8)',
          subject: 'Lập trình Python',
          semester: 'Học kỳ 1 - 2024',
          created_at: '2024-09-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Pháp luật về công nghệ thông tin - DH22TIN07',
          class_id: '110101101011',
          teacher: 'Trần Minh Tâm',
          teacher_id: 2,
          max_students: 40,
          current_students: 38,
          is_active: true,
          schedule: 'Thứ 3: 13:00-17:00',
          location: 'Phòng 15-01',
          subject: 'Pháp luật về công nghệ thông tin',
          semester: 'Học kỳ 1 - 2024',
          created_at: '2024-09-01T00:00:00Z'
        },
        {
          id: 3,
          name: 'Lập trình thiết bị di động - DH22TIN08',
          class_id: '110101101100',
          teacher: 'Đoàn Chí Trung',
          teacher_id: 3,
          max_students: 35,
          current_students: 45,
          is_active: true,
          schedule: 'Thứ 4: 08:00-12:00',
          location: 'Phòng 16-03',
          subject: 'Lập trình thiết bị di động',
          semester: 'Học kỳ 1 - 2024',
          created_at: '2024-09-01T00:00:00Z'
        },
        {
          id: 4,
          name: 'Lịch sử Đảng cộng sản Việt Nam - DH22TIN09',
          class_id: '110101101101',
          teacher: 'Đinh Cao Tín',
          teacher_id: 4,
          max_students: 50,
          current_students: 50,
          is_active: true,
          schedule: 'Thứ 5: 14:00-18:00',
          location: 'Phòng 17-01',
          subject: 'Lịch sử Đảng cộng sản Việt Nam',
          semester: 'Học kỳ 1 - 2024',
          created_at: '2024-09-01T00:00:00Z'
        },
        {
          id: 5,
          name: 'Phát triển phần mềm mã nguồn mở - DH22TIN10',
          class_id: '110101101110',
          teacher: 'Võ Thanh Vinh',
          teacher_id: 5,
          max_students: 40,
          current_students: 40,
          is_active: true,
          schedule: 'Thứ 6: 08:00-12:00',
          location: 'Phòng 18-02',
          subject: 'Phát triển phần mềm mã nguồn mở',
          semester: 'Học kỳ 1 - 2024',
          created_at: '2024-09-01T00:00:00Z'
        }
      ]

      // Mock schedule management data - Based on real subjects and teachers
      const mockScheduleTemplates = [
        {
          id: 1,
          subject: 'Lập trình Python',
          subjectCode: 'DH22TIN06',
          teacher: 'Đặng Mạnh Huy',
          room: 'Phòng 14-02',
          building: 'Phòng máy 8',
          dayOfWeek: 2, // Thứ 2
          startTime: '07:00',
          endTime: '11:00',
          duration: 240, // 4 tiết
          type: 'Thực hành',
          semester: 'Học kỳ 1 - 2024',
          isActive: true
        },
        {
          id: 2,
          subject: 'Pháp luật về công nghệ thông tin',
          subjectCode: 'DH22TIN07',
          teacher: 'Trần Minh Tâm',
          room: 'Phòng 15-01',
          building: 'Tòa nhà A',
          dayOfWeek: 3, // Thứ 3
          startTime: '13:00',
          endTime: '17:00',
          duration: 240, // 4 tiết
          type: 'Lý thuyết',
          semester: 'Học kỳ 1 - 2024',
          isActive: true
        },
        {
          id: 3,
          subject: 'Lập trình thiết bị di động',
          subjectCode: 'DH22TIN08',
          teacher: 'Đoàn Chí Trung',
          room: 'Phòng 16-03',
          building: 'Tòa nhà B',
          dayOfWeek: 4, // Thứ 4
          startTime: '08:00',
          endTime: '12:00',
          duration: 240, // 4 tiết
          type: 'Thực hành',
          semester: 'Học kỳ 1 - 2024',
          isActive: true
        },
        {
          id: 4,
          subject: 'Lịch sử Đảng cộng sản Việt Nam',
          subjectCode: 'DH22TIN09',
          teacher: 'Đinh Cao Tín',
          room: 'Phòng 17-01',
          building: 'Tòa nhà C',
          dayOfWeek: 5, // Thứ 5
          startTime: '14:00',
          endTime: '18:00',
          duration: 240, // 4 tiết
          type: 'Lý thuyết',
          semester: 'Học kỳ 1 - 2024',
          isActive: true
        },
        {
          id: 5,
          subject: 'Phát triển phần mềm mã nguồn mở',
          subjectCode: 'DH22TIN10',
          teacher: 'Võ Thanh Vinh',
          room: 'Phòng 18-02',
          building: 'Tòa nhà D',
          dayOfWeek: 6, // Thứ 6
          startTime: '08:00',
          endTime: '12:00',
          duration: 240, // 4 tiết
          type: 'Lý thuyết + Thực hành',
          semester: 'Học kỳ 1 - 2024',
          isActive: true
        }
      ]

      // Mock grade management data
      const mockGradeManagement = {
        classes: [
          {
            id: 1,
            name: 'Lập trình Python - DH22TIN06',
            teacher: 'Đặng Mạnh Huy',
            students_count: 56,
            grading_status: {
              regular_10_percent: 'completed', // Giảng viên đã nhập
              midterm_30_percent: 'completed', // Giảng viên đã nhập
              final_60_percent: 'pending' // Admin cần nhập
            },
            last_updated: '2024-12-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'Cơ sở dữ liệu - DH22TIN05',
            teacher: 'Nguyễn Văn A',
            students_count: 38,
            grading_status: {
              regular_10_percent: 'completed',
              midterm_30_percent: 'in_progress',
              final_60_percent: 'pending'
            },
            last_updated: '2024-12-14T15:20:00Z'
          }
        ],
        pendingFinalGrades: 2, // Số lớp cần nhập điểm cuối kỳ
        completedGrades: 0,
        totalClasses: 2
      }

      // Mock system reports
      const mockSystemReports = {
        attendanceReport: {
          totalSessions: 45,
          averageAttendance: 89.5,
          topPerformingClasses: ['Lập trình Python', 'Cơ sở dữ liệu'],
          attendanceTrend: 'increasing'
        },
        gradeReport: {
          averageGPA: 7.8,
          gradeDistribution: {
            'A': 15,
            'B': 25,
            'C': 30,
            'D': 20,
            'F': 10
          },
          topStudents: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C']
        },
        systemUsage: {
          dailyActiveUsers: 45,
          weeklyActiveUsers: 120,
          monthlyActiveUsers: 150,
          peakUsageTime: '08:00-12:00'
        }
      }

      // Mock notifications
      const mockNotifications = [
        {
          id: 1,
          type: 'warning',
          title: 'Cần nhập điểm cuối kỳ',
          message: '2 lớp học cần nhập điểm cuối kỳ (60%)',
          timestamp: '2024-12-15T09:00:00Z',
          isRead: false
        },
        {
          id: 2,
          type: 'info',
          title: 'Giảng viên mới chờ duyệt',
          message: 'Trần Thị B đang chờ phê duyệt tài khoản',
          timestamp: '2024-12-14T14:30:00Z',
          isRead: false
        },
        {
          id: 3,
          type: 'success',
          title: 'Hệ thống cập nhật thành công',
          message: 'Cập nhật thời khóa biểu học kỳ mới',
          timestamp: '2024-12-13T16:45:00Z',
          isRead: true
        }
      ]

      const data = {
        systemStats: mockSystemStats,
        teachers: mockTeachers,
        classes: mockClasses,
        scheduleTemplates: mockScheduleTemplates,
        gradeManagement: mockGradeManagement,
        systemReports: mockSystemReports,
        notifications: mockNotifications
      }

      setMockData(data)
      setIsLoading(false)
    }

    loadMockData()
  }, [user])

  const refreshData = () => {
    // Simulate data refresh
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const value = {
    mockData,
    isLoading,
    refreshData
  }

  return (
    <AdminMockDataContext.Provider value={value}>
      {children}
    </AdminMockDataContext.Provider>
  )
}
