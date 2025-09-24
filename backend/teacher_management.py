import os
import django
import sys
from datetime import datetime
from tabulate import tabulate

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.accounts.models import User
from apps.classes.models import Class, ClassStudent
from apps.students.models import Student
from apps.grades.models import Grade
from apps.attendance.models import AttendanceSession, Attendance


class TeacherManagement:
    def __init__(self):
        self.teacher = None
        
    def login(self):
        """Đăng nhập giảng viên"""
        print("\n" + "="*60)
        print("ĐĂNG NHẬP GIẢNG VIÊN")
        print("="*60)
        
        email = input("Email giảng viên: ")
        try:
            self.teacher = User.objects.get(email=email, role='teacher')
            if self.teacher.account_status != 'active':
                print(f"⚠️ Tài khoản đang ở trạng thái: {self.teacher.account_status}")
                activate = input("Kích hoạt tài khoản? (y/n): ")
                if activate.lower() == 'y':
                    self.teacher.account_status = 'active'
                    self.teacher.save()
                    print("✅ Đã kích hoạt tài khoản")
            
            print(f"\n✅ Xin chào, {self.teacher.get_full_name()}!")
            return True
        except User.DoesNotExist:
            print("❌ Không tìm thấy giảng viên với email này")
            return False
    
    def show_menu(self):
        """Hiển thị menu chính"""
        while True:
            print("\n" + "="*60)
            print(f"QUẢN LÝ GIẢNG VIÊN - {self.teacher.get_full_name()}")
            print("="*60)
            print("1. Quản lý lớp học")
            print("2. Quản lý sinh viên")
            print("3. Quản lý điểm")
            print("4. Quản lý điểm danh")
            print("5. Báo cáo thống kê")
            print("6. Import dữ liệu từ Excel")
            print("0. Thoát")
            
            choice = input("\nChọn chức năng: ")
            
            if choice == '1':
                self.manage_classes()
            elif choice == '2':
                self.manage_students()
            elif choice == '3':
                self.manage_grades()
            elif choice == '4':
                self.manage_attendance()
            elif choice == '5':
                self.show_statistics()
            elif choice == '6':
                self.import_data()
            elif choice == '0':
                print("Tạm biệt!")
                break
            else:
                print("❌ Lựa chọn không hợp lệ")
    
    def manage_classes(self):
        """Quản lý lớp học"""
        print("\n" + "-"*40)
        print("QUẢN LÝ LỚP HỌC")
        print("-"*40)
        
        classes = Class.objects.filter(teacher=self.teacher)
        if not classes.exists():
            print("Bạn chưa được phân công lớp nào")
            return
        
        print(f"\nDanh sách lớp ({classes.count()} lớp):")
        data = []
        for i, cls in enumerate(classes, 1):
            data.append([
                i, cls.class_id, cls.class_name,
                cls.current_students_count, cls.max_students,
                "✓" if cls.is_active else "✗"
            ])
        
        print(tabulate(data, headers=['#', 'Mã lớp', 'Tên lớp', 'SV hiện tại', 'Tối đa', 'Active']))
        
        print("\nChức năng:")
        print("1. Xem chi tiết lớp")
        print("2. Xem danh sách sinh viên")
        print("3. Thêm sinh viên vào lớp")
        print("4. Xóa sinh viên khỏi lớp")
        print("0. Quay lại")
        
        sub_choice = input("\nChọn: ")
        if sub_choice == '1':
            self.view_class_detail(classes)
        elif sub_choice == '2':
            self.view_class_students(classes)
        elif sub_choice == '3':
            self.add_student_to_class(classes)
        elif sub_choice == '4':
            self.remove_student_from_class(classes)
    
    def view_class_detail(self, classes):
        """Xem chi tiết lớp"""
        idx = input("\nNhập số thứ tự lớp: ")
        if idx.isdigit() and 1 <= int(idx) <= classes.count():
            cls = classes[int(idx)-1]
            print(f"\nChi tiết lớp: {cls.class_name}")
            print(f"  - Mã lớp: {cls.class_id}")
            print(f"  - Mô tả: {cls.description}")
            print(f"  - Sinh viên: {cls.current_students_count}/{cls.max_students}")
            print(f"  - Trạng thái: {'Hoạt động' if cls.is_active else 'Không hoạt động'}")
            print(f"  - Ngày tạo: {cls.created_at.strftime('%d/%m/%Y')}")
    
    def view_class_students(self, classes):
        """Xem danh sách sinh viên trong lớp"""
        idx = input("\nNhập số thứ tự lớp: ")
        if idx.isdigit() and 1 <= int(idx) <= classes.count():
            cls = classes[int(idx)-1]
            students = ClassStudent.objects.filter(class_obj=cls, is_active=True)
            
            print(f"\nDanh sách sinh viên lớp {cls.class_name} ({students.count()} SV):")
            data = []
            for i, cs in enumerate(students, 1):
                student = cs.student
                data.append([
                    i, student.student_id, student.full_name,
                    student.email, student.phone or '-',
                    cs.enrolled_at.strftime('%d/%m/%Y')
                ])
            
            print(tabulate(data, headers=['#', 'MSSV', 'Họ tên', 'Email', 'SĐT', 'Ngày tham gia']))
    
    def add_student_to_class(self, classes):
        """Thêm sinh viên vào lớp"""
        idx = input("\nNhập số thứ tự lớp: ")
        if idx.isdigit() and 1 <= int(idx) <= classes.count():
            cls = classes[int(idx)-1]
            
            if cls.is_full:
                print(f"❌ Lớp {cls.class_name} đã đầy!")
                return
            
            student_id = input("Nhập MSSV: ")
            try:
                student = Student.objects.get(student_id=student_id)
                
                # Kiểm tra xem sinh viên đã trong lớp chưa
                if ClassStudent.objects.filter(class_obj=cls, student=student).exists():
                    print(f"⚠️ Sinh viên {student.full_name} đã có trong lớp")
                else:
                    ClassStudent.objects.create(
                        class_obj=cls,
                        student=student,
                        is_active=True
                    )
                    print(f"✅ Đã thêm sinh viên {student.full_name} vào lớp")
            except Student.DoesNotExist:
                print(f"❌ Không tìm thấy sinh viên với MSSV: {student_id}")
    
    def remove_student_from_class(self, classes):
        """Xóa sinh viên khỏi lớp"""
        idx = input("\nNhập số thứ tự lớp: ")
        if idx.isdigit() and 1 <= int(idx) <= classes.count():
            cls = classes[int(idx)-1]
            student_id = input("Nhập MSSV cần xóa: ")
            
            try:
                cs = ClassStudent.objects.get(
                    class_obj=cls,
                    student__student_id=student_id
                )
                cs.is_active = False
                cs.save()
                print(f"✅ Đã xóa sinh viên {cs.student.full_name} khỏi lớp")
            except ClassStudent.DoesNotExist:
                print(f"❌ Sinh viên không có trong lớp này")
    
    def manage_students(self):
        """Quản lý sinh viên"""
        print("\n" + "-"*40)
        print("QUẢN LÝ SINH VIÊN")
        print("-"*40)
        
        # Lấy tất cả sinh viên trong các lớp của giảng viên
        classes = Class.objects.filter(teacher=self.teacher)
        student_ids = ClassStudent.objects.filter(
            class_obj__in=classes,
            is_active=True
        ).values_list('student_id', flat=True)
        
        students = Student.objects.filter(id__in=student_ids)
        
        print(f"Tổng số sinh viên: {students.count()}")
        
        print("\n1. Tìm kiếm sinh viên")
        print("2. Xem thông tin sinh viên")
        print("3. Thêm sinh viên mới")
        print("0. Quay lại")
        
        choice = input("\nChọn: ")
        if choice == '1':
            self.search_student(students)
        elif choice == '2':
            self.view_student_info(students)
        elif choice == '3':
            self.add_new_student()
    
    def search_student(self, students):
        """Tìm kiếm sinh viên"""
        keyword = input("\nNhập MSSV hoặc tên: ")
        results = students.filter(
            models.Q(student_id__icontains=keyword) |
            models.Q(first_name__icontains=keyword) |
            models.Q(last_name__icontains=keyword)
        )
        
        if results.exists():
            print(f"\nTìm thấy {results.count()} kết quả:")
            data = []
            for s in results[:10]:
                data.append([s.student_id, s.full_name, s.email])
            print(tabulate(data, headers=['MSSV', 'Họ tên', 'Email']))
        else:
            print("Không tìm thấy sinh viên nào")
    
    def view_student_info(self, students):
        """Xem thông tin sinh viên"""
        student_id = input("\nNhập MSSV: ")
        try:
            student = students.get(student_id=student_id)
            print(f"\nThông tin sinh viên:")
            print(f"  - MSSV: {student.student_id}")
            print(f"  - Họ tên: {student.full_name}")
            print(f"  - Email: {student.email}")
            print(f"  - SĐT: {student.phone or 'Chưa có'}")
            print(f"  - Giới tính: {student.get_gender_display()}")
            print(f"  - Ngày sinh: {student.date_of_birth}")
            print(f"  - Địa chỉ: {student.address or 'Chưa có'}")
            
            # Hiển thị các lớp đang học
            class_list = ClassStudent.objects.filter(
                student=student,
                class_obj__teacher=self.teacher,
                is_active=True
            )
            if class_list.exists():
                print(f"\n  Các lớp đang học:")
                for cs in class_list:
                    print(f"    - {cs.class_obj.class_name}")
        except Student.DoesNotExist:
            print("Không tìm thấy sinh viên")
    
    def add_new_student(self):
        """Thêm sinh viên mới"""
        print("\nThêm sinh viên mới:")
        student_data = {
            'student_id': input("MSSV: "),
            'first_name': input("Họ: "),
            'last_name': input("Tên: "),
            'email': input("Email: "),
            'phone': input("SĐT (Enter để bỏ qua): ") or None,
            'gender': input("Giới tính (male/female/other): "),
            'date_of_birth': input("Ngày sinh (YYYY-MM-DD): "),
            'address': input("Địa chỉ (Enter để bỏ qua): ") or None,
        }
        
        try:
            student = Student.objects.create(**student_data)
            print(f"✅ Đã tạo sinh viên {student.full_name}")
            
            # Hỏi có muốn thêm vào lớp không
            add_to_class = input("\nThêm vào lớp? (y/n): ")
            if add_to_class.lower() == 'y':
                classes = Class.objects.filter(teacher=self.teacher)
                for i, cls in enumerate(classes, 1):
                    print(f"{i}. {cls.class_name}")
                
                idx = input("Chọn lớp: ")
                if idx.isdigit() and 1 <= int(idx) <= classes.count():
                    cls = classes[int(idx)-1]
                    ClassStudent.objects.create(
                        class_obj=cls,
                        student=student
                    )
                    print(f"✅ Đã thêm vào lớp {cls.class_name}")
        except Exception as e:
            print(f"❌ Lỗi: {e}")
    
    def manage_grades(self):
        """Quản lý điểm"""
        print("\n" + "-"*40)
        print("QUẢN LÝ ĐIỂM")
        print("-"*40)
        
        classes = Class.objects.filter(teacher=self.teacher)
        if not classes.exists():
            print("Bạn chưa được phân công lớp nào")
            return
        
        print("Chọn lớp:")
        for i, cls in enumerate(classes, 1):
            print(f"{i}. {cls.class_name}")
        
        idx = input("\nChọn: ")
        if idx.isdigit() and 1 <= int(idx) <= classes.count():
            cls = classes[int(idx)-1]
            
            print(f"\nQuản lý điểm lớp {cls.class_name}:")
            print("1. Nhập điểm")
            print("2. Xem bảng điểm")
            print("3. Sửa điểm")
            print("4. Thống kê điểm")
            
            sub_choice = input("\nChọn: ")
            if sub_choice == '1':
                self.input_grade(cls)
            elif sub_choice == '2':
                self.view_grades(cls)
            elif sub_choice == '3':
                self.edit_grade(cls)
            elif sub_choice == '4':
                self.grade_statistics(cls)
    
    def input_grade(self, cls):
        """Nhập điểm cho sinh viên"""
        student_id = input("\nMSSV: ")
        try:
            cs = ClassStudent.objects.get(
                class_obj=cls,
                student__student_id=student_id,
                is_active=True
            )
            
            grade_data = {
                'student': cs.student,
                'class_obj': cls,
                'subject': cls.class_name,  # Sử dụng tên lớp làm môn học
                'score': float(input("Điểm (0-10): ")),
                'max_score': 10,
                'grade_type': input("Loại (midterm/final/assignment/quiz): "),
                'semester': input("Học kỳ (1/2/3): "),
                'academic_year': input("Năm học (VD: 2024-2025): ")
            }
            
            grade = Grade.objects.create(**grade_data)
            print(f"✅ Đã nhập điểm cho {cs.student.full_name}")
            print(f"   Điểm: {grade.score}/10 ({grade.letter_grade})")
            
        except ClassStudent.DoesNotExist:
            print("❌ Sinh viên không có trong lớp này")
        except Exception as e:
            print(f"❌ Lỗi: {e}")
    
    def view_grades(self, cls):
        """Xem bảng điểm của lớp"""
        grades = Grade.objects.filter(class_obj=cls).order_by('student__student_id')
        
        if grades.exists():
            print(f"\nBảng điểm lớp {cls.class_name}:")
            data = []
            for g in grades:
                data.append([
                    g.student.student_id,
                    g.student.full_name,
                    g.get_grade_type_display(),
                    f"{g.score:.1f}",
                    g.letter_grade,
                    g.created_at.strftime('%d/%m/%Y')
                ])
            
            print(tabulate(data, headers=['MSSV', 'Họ tên', 'Loại', 'Điểm', 'Xếp loại', 'Ngày nhập']))
        else:
            print("Chưa có điểm nào được nhập")
    
    def edit_grade(self, cls):
        """Sửa điểm"""
        student_id = input("\nMSSV: ")
        grades = Grade.objects.filter(
            class_obj=cls,
            student__student_id=student_id
        )
        
        if grades.exists():
            print("\nDanh sách điểm:")
            for i, g in enumerate(grades, 1):
                print(f"{i}. {g.get_grade_type_display()}: {g.score}/10")
            
            idx = input("\nChọn điểm cần sửa: ")
            if idx.isdigit() and 1 <= int(idx) <= grades.count():
                grade = grades[int(idx)-1]
                new_score = float(input(f"Điểm mới (hiện tại: {grade.score}): "))
                grade.score = new_score
                grade.save()
                print(f"✅ Đã cập nhật điểm thành {new_score}")
        else:
            print("Không tìm thấy điểm của sinh viên này")
    
    def grade_statistics(self, cls):
        """Thống kê điểm lớp"""
        from django.db.models import Avg, Count, Max, Min
        
        stats = Grade.objects.filter(class_obj=cls).aggregate(
            avg_score=Avg('score'),
            max_score=Max('score'),
            min_score=Min('score'),
            total=Count('id')
        )
        
        print(f"\nThống kê điểm lớp {cls.class_name}:")
        print(f"  - Tổng số điểm: {stats['total']}")
        print(f"  - Điểm trung bình: {stats['avg_score']:.2f}" if stats['avg_score'] else "  - Chưa có điểm")
        print(f"  - Điểm cao nhất: {stats['max_score']}")
        print(f"  - Điểm thấp nhất: {stats['min_score']}")
        
        # Phân loại
        grade_dist = {
            'Xuất sắc (≥9)': Grade.objects.filter(class_obj=cls, score__gte=9).count(),
            'Giỏi (8-8.9)': Grade.objects.filter(class_obj=cls, score__gte=8, score__lt=9).count(),
            'Khá (7-7.9)': Grade.objects.filter(class_obj=cls, score__gte=7, score__lt=8).count(),
            'TB (5-6.9)': Grade.objects.filter(class_obj=cls, score__gte=5, score__lt=7).count(),
            'Yếu (<5)': Grade.objects.filter(class_obj=cls, score__lt=5).count(),
        }
        
        print("\n  Phân loại:")
        for level, count in grade_dist.items():
            print(f"    - {level}: {count} sinh viên")
    
    def manage_attendance(self):
        """Quản lý điểm danh"""
        print("\n" + "-"*40)
        print("QUẢN LÝ ĐIỂM DANH")
        print("-"*40)
        
        classes = Class.objects.filter(teacher=self.teacher)
        if not classes.exists():
            print("Bạn chưa được phân công lớp nào")
            return
        
        print("Chọn lớp:")
        for i, cls in enumerate(classes, 1):
            print(f"{i}. {cls.class_name}")
        
        idx = input("\nChọn: ")
        if idx.isdigit() and 1 <= int(idx) <= classes.count():
            cls = classes[int(idx)-1]
            
            print(f"\nQuản lý điểm danh lớp {cls.class_name}:")
            print("1. Tạo buổi điểm danh")
            print("2. Điểm danh thủ công")
            print("3. Xem lịch sử điểm danh")
            print("4. Thống kê điểm danh")
            
            sub_choice = input("\nChọn: ")
            if sub_choice == '1':
                self.create_attendance_session(cls)
            elif sub_choice == '2':
                self.manual_attendance(cls)
            elif sub_choice == '3':
                self.view_attendance_history(cls)
            elif sub_choice == '4':
                self.attendance_statistics(cls)
    
    def create_attendance_session(self, cls):
        """Tạo buổi điểm danh"""
        session_data = {
            'class_obj': cls,
            'session_name': input("\nTên buổi học: "),
            'session_date': datetime.now().date(),
            'start_time': input("Giờ bắt đầu (HH:MM): ") + ":00",
            'end_time': input("Giờ kết thúc (HH:MM): ") + ":00",
            'is_active': True
        }
        
        try:
            session = AttendanceSession.objects.create(**session_data)
            print(f"✅ Đã tạo buổi điểm danh: {session.session_name}")
            
            # Hỏi có muốn điểm danh ngay không
            if input("\nĐiểm danh ngay? (y/n): ").lower() == 'y':
                self.take_attendance(session)
                
        except Exception as e:
            print(f"❌ Lỗi: {e}")
    
    def take_attendance(self, session):
        """Điểm danh cho buổi học"""
        students = ClassStudent.objects.filter(
            class_obj=session.class_obj,
            is_active=True
        )
        
        print(f"\nĐiểm danh ({students.count()} sinh viên):")
        print("Nhập: p (present), a (absent), l (late), e (excused)")
        
        for cs in students:
            status_map = {'p': 'present', 'a': 'absent', 'l': 'late', 'e': 'excused'}
            status = input(f"{cs.student.student_id} - {cs.student.full_name}: ")
            
            if status.lower() in status_map:
                Attendance.objects.update_or_create(
                    session=session,
                    student=cs.student,
                    defaults={'status': status_map[status.lower()]}
                )
        
        print("✅ Hoàn tất điểm danh")
    
    def manual_attendance(self, cls):
        """Điểm danh thủ công"""
        sessions = AttendanceSession.objects.filter(
            class_obj=cls,
            is_active=True
        ).order_by('-session_date')
        
        if not sessions.exists():
            print("Chưa có buổi điểm danh nào")
            return
        
        print("\nChọn buổi điểm danh:")
        for i, s in enumerate(sessions[:5], 1):
            print(f"{i}. {s.session_name} - {s.session_date}")
        
        idx = input("\nChọn: ")
        if idx.isdigit() and 1 <= int(idx) <= min(5, sessions.count()):
            session = sessions[int(idx)-1]
            self.take_attendance(session)
    
    def view_attendance_history(self, cls):
        """Xem lịch sử điểm danh"""
        sessions = AttendanceSession.objects.filter(class_obj=cls).order_by('-session_date')
        
        if sessions.exists():
            print(f"\nLịch sử điểm danh lớp {cls.class_name}:")
            data = []
            for s in sessions[:10]:
                present = Attendance.objects.filter(session=s, status='present').count()
                total = cls.current_students_count
                rate = (present/total*100) if total > 0 else 0
                
                data.append([
                    s.session_date.strftime('%d/%m/%Y'),
                    s.session_name,
                    f"{s.start_time.strftime('%H:%M')}-{s.end_time.strftime('%H:%M')}",
                    f"{present}/{total}",
                    f"{rate:.1f}%"
                ])
            
            print(tabulate(data, headers=['Ngày', 'Buổi', 'Thời gian', 'Có mặt', 'Tỷ lệ']))
        else:
            print("Chưa có buổi điểm danh nào")
    
    def attendance_statistics(self, cls):
        """Thống kê điểm danh"""
        sessions = AttendanceSession.objects.filter(class_obj=cls)
        if not sessions.exists():
            print("Chưa có dữ liệu điểm danh")
            return
        
        print(f"\nThống kê điểm danh lớp {cls.class_name}:")
        
        # Thống kê theo sinh viên
        students = ClassStudent.objects.filter(class_obj=cls, is_active=True)
        
        data = []
        for cs in students:
            student = cs.student
            attendances = Attendance.objects.filter(
                session__class_obj=cls,
                student=student
            )
            
            present = attendances.filter(status='present').count()
            late = attendances.filter(status='late').count()
            absent = attendances.filter(status='absent').count()
            total = sessions.count()
            rate = (present/total*100) if total > 0 else 0
            
            data.append([
                student.student_id,
                student.full_name,
                present,
                late,
                absent,
                f"{rate:.1f}%"
            ])
        
        print(tabulate(data, headers=['MSSV', 'Họ tên', 'Có mặt', 'Muộn', 'Vắng', 'Tỷ lệ']))
    
    def show_statistics(self):
        """Báo cáo thống kê tổng hợp"""
        print("\n" + "-"*40)
        print("BÁO CÁO THỐNG KÊ")
        print("-"*40)
        
        classes = Class.objects.filter(teacher=self.teacher)
        total_students = ClassStudent.objects.filter(
            class_obj__in=classes,
            is_active=True
        ).values('student').distinct().count()
        
        print(f"\nTổng quan:")
        print(f"  - Số lớp đang dạy: {classes.count()}")
        print(f"  - Tổng số sinh viên: {total_students}")
        
        for cls in classes:
            print(f"\n📚 Lớp {cls.class_name}:")
            print(f"  - Sinh viên: {cls.current_students_count}/{cls.max_students}")
            
            # Thống kê điểm
            grades = Grade.objects.filter(class_obj=cls)
            if grades.exists():
                avg_score = grades.aggregate(avg=models.Avg('score'))['avg']
                print(f"  - Điểm TB: {avg_score:.2f}")
            
            # Thống kê điểm danh
            sessions = AttendanceSession.objects.filter(class_obj=cls)
            if sessions.exists():
                total_attendance = Attendance.objects.filter(
                    session__in=sessions
                ).count()
                present_count = Attendance.objects.filter(
                    session__in=sessions,
                    status='present'
                ).count()
                rate = (present_count/total_attendance*100) if total_attendance > 0 else 0
                print(f"  - Tỷ lệ điểm danh: {rate:.1f}%")
    
    def import_data(self):
        """Import dữ liệu từ Excel"""
        print("\n" + "-"*40)
        print("IMPORT DỮ LIỆU TỪ EXCEL")
        print("-"*40)
        
        print("\n1. Import danh sách sinh viên")
        print("2. Import bảng điểm")
        print("3. Import điểm danh")
        print("4. Tạo file Excel mẫu")
        print("0. Quay lại")
        
        choice = input("\nChọn: ")
        if choice == '1':
            file_path = input("Đường dẫn file Excel sinh viên: ")
            self.import_students_from_excel(file_path)
        elif choice == '2':
            file_path = input("Đường dẫn file Excel điểm: ")
            self.import_grades_from_excel(file_path)
        elif choice == '3':
            file_path = input("Đường dẫn file Excel điểm danh: ")
            self.import_attendance_from_excel(file_path)
        elif choice == '4':
            print("\n✅ Chạy lệnh: python create_excel_templates.py")
            print("   để tạo các file Excel mẫu")
    
    def import_students_from_excel(self, file_path):
        """Import sinh viên từ Excel"""
        # TODO: Implement Excel import logic
        print("Chức năng đang được phát triển...")
    
    def import_grades_from_excel(self, file_path):
        """Import điểm từ Excel"""
        # TODO: Implement Excel import logic
        print("Chức năng đang được phát triển...")
    
    def import_attendance_from_excel(self, file_path):
        """Import điểm danh từ Excel"""
        # TODO: Implement Excel import logic
        print("Chức năng đang được phát triển...")


def main():
    manager = TeacherManagement()
    
    print("="*60)
    print("HỆ THỐNG QUẢN LÝ GIẢNG VIÊN")
    print("="*60)
    
    if manager.login():
        manager.show_menu()
    else:
        print("\nKết thúc chương trình")


if __name__ == "__main__":
    # Import models để sử dụng Q
    from django.db import models
    main()