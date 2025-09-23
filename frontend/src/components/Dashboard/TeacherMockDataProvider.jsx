import React, { createContext, useContext, useState, useEffect } from 'react'

const TeacherMockDataContext = createContext()

export const useTeacherMockData = () => {
  const context = useContext(TeacherMockDataContext)
  if (!context) {
    throw new Error('useTeacherMockData must be used within a TeacherMockDataProvider')
  }
  return context
}

export const TeacherMockDataProvider = ({ children, user }) => {
  const [mockData, setMockData] = useState({
    statistics: {
      totalClasses: 0,
      activeStudents: 0,
      attendanceRate: 0,
      averageGrade: 0
    },
    assignedClasses: [],
    todaySessions: [],
    recentGrades: []
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      // Mock data cho thầy Đặng Mạnh Huy
      const mockTeacherData = {
        statistics: {
          totalClasses: 1, // Lớp Lập trình Python
          activeStudents: 56, // 56 sinh viên DH22TIN06
          attendanceRate: Math.floor(Math.random() * 20) + 75, // 75-95%
          averageGrade: (Math.random() * 1.5 + 7.5).toFixed(1) // 7.5-9.0
        },
        assignedClasses: [
          {
            id: 1,
            class_id: '110101101010',
            class_name: 'Lập trình Python - DH22TIN06',
            description: 'Lớp học Lập trình Python cho sinh viên năm 2, thứ 2 từ 7:00-11:00',
            max_students: 42,
            current_students: 56,
            is_active: true,
            schedule: 'Thứ 2: 07:00-11:00',
            location: 'Phòng 14-02 (Phòng máy 8)',
            subject: 'Lập trình Python',
            subject_code: 'DH22TIN06',
            semester: 'HK1 2024-2025'
          }
        ],
        todaySessions: [
          // Nếu hôm nay là thứ 2 thì có session
          ...(new Date().getDay() === 1 ? [{
            id: 1,
            session_name: 'Buổi học tuần 8 - Lập trình Python',
            class_name: 'Lập trình Python - DH22TIN06',
            session_date: new Date().toISOString().split('T')[0],
            start_time: '07:00',
            end_time: '11:00',
            location: 'Phòng 14-02 (Phòng máy 8)',
            is_active: false,
            attendance_count: 0,
            total_students: 56,
            attendance_rate: 0
          }] : [])
        ],
        recentGrades: Array.from({ length: 10 }, (_, i) => {
          const students = [
            'Nguyễn Huy Điền', 'Lê Văn Nhựt Anh', 'Trần Nguyễn Phương Anh',
            'Nguyễn Xuân Bách', 'Huỳnh Thương Bảo', 'Thạch Văn Bảo',
            'Nguyễn Tiến Chức', 'Đặng Thiên Chương', 'Nguyễn Đặng Hải Đăng',
            'Trần Tấn Đạt'
          ]
          const gradeTypes = ['Thường xuyên', 'Giữa kỳ', 'Cuối kỳ', 'Bài tập']
          
          return {
            id: i + 1,
            student_name: students[i % students.length],
            student_id: `22${Math.floor(Math.random() * 9000) + 1000}`,
            subject: 'Lập trình Python',
            grade_type: gradeTypes[Math.floor(Math.random() * gradeTypes.length)],
            score: (Math.random() * 3 + 7).toFixed(1), // 7.0-10.0
            max_score: 10,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            class_name: 'Lập trình Python - DH22TIN06'
          }
        })
      }

      setMockData(mockTeacherData)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user])

  return (
    <TeacherMockDataContext.Provider value={{ mockData, isLoading }}>
      {children}
    </TeacherMockDataContext.Provider>
  )
}
