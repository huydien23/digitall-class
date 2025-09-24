import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.accounts.models import User
from apps.classes.models import Class, ClassStudent
from apps.students.models import Student
from apps.grades.models import Grade
from apps.attendance.models import AttendanceSession, Attendance

print("=" * 70)
print("TẠO DỮ LIỆU MẪU THỰC TẾ CHO HỆ THỐNG")
print("=" * 70)

# 1. TẠO GIẢNG VIÊN
print("\n1. TẠO GIẢNG VIÊN")
print("-" * 40)

teacher_data = [
    {
        'email': 'nguyenthanhlong@nctu.edu.vn',
        'first_name': 'Nguyễn Thanh',
        'last_name': 'Long',
        'teacher_id': 'GV2024001',
        'department': 'Khoa Công nghệ thông tin'
    },
    {
        'email': 'tranvananh@nctu.edu.vn',
        'first_name': 'Trần Văn',
        'last_name': 'Anh',
        'teacher_id': 'GV2024002',
        'department': 'Khoa Công nghệ thông tin'
    },
    {
        'email': 'leminhhai@nctu.edu.vn',
        'first_name': 'Lê Minh',
        'last_name': 'Hải',
        'teacher_id': 'GV2024003',
        'department': 'Khoa Công nghệ thông tin'
    }
]

teachers = []
for data in teacher_data:
    teacher, created = User.objects.get_or_create(
        email=data['email'],
        defaults={
            'username': data['email'].split('@')[0],
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'teacher_id': data['teacher_id'],
            'department': data['department'],
            'role': 'teacher',
            'account_status': 'active',
            'is_active': True
        }
    )
    if created:
        teacher.set_password('Teacher@123')
        teacher.save()
        print(f"✓ Tạo giảng viên: {teacher.get_full_name()}")
    else:
        print(f"• Giảng viên đã tồn tại: {teacher.get_full_name()}")
    teachers.append(teacher)

# 2. TẠO LỚP HỌC
print("\n2. TẠO LỚP HỌC")
print("-" * 40)

class_data = [
    {
        'class_id': 'DH22TIN01',
        'class_name': 'Lập trình Web - DH22TIN01',
        'description': 'Học phần lập trình web với ReactJS và Django cho sinh viên năm 3',
        'teacher': teachers[0],
        'max_students': 45,
        'schedule': 'Thứ 2: 07:00-11:00',
        'room': 'Phòng A3-201'
    },
    {
        'class_id': 'DH22TIN02',
        'class_name': 'Cấu trúc dữ liệu và Giải thuật - DH22TIN02',
        'description': 'Học phần cấu trúc dữ liệu và giải thuật nâng cao',
        'teacher': teachers[1],
        'max_students': 50,
        'schedule': 'Thứ 3: 13:00-17:00',
        'room': 'Phòng B2-301'
    },
    {
        'class_id': 'DH22TIN03',
        'class_name': 'Cơ sở dữ liệu - DH22TIN03',
        'description': 'Thiết kế và quản trị cơ sở dữ liệu với SQL Server và MongoDB',
        'teacher': teachers[2],
        'max_students': 40,
        'schedule': 'Thứ 4: 07:00-11:00',
        'room': 'Phòng C1-101'
    },
    {
        'class_id': 'DH22TIN04',
        'class_name': 'Mạng máy tính - DH22TIN04',
        'description': 'Nguyên lý và thực hành mạng máy tính',
        'teacher': teachers[0],
        'max_students': 35,
        'schedule': 'Thứ 5: 13:00-17:00',
        'room': 'Phòng LAB-NET'
    },
    {
        'class_id': 'DH22TIN05',
        'class_name': 'Trí tuệ nhân tạo - DH22TIN05',
        'description': 'Nhập môn AI và Machine Learning',
        'teacher': teachers[1],
        'max_students': 40,
        'schedule': 'Thứ 6: 07:00-11:00',
        'room': 'Phòng A2-202'
    },
    {
        'class_id': 'DH22TIN06',
        'class_name': 'Phát triển ứng dụng di động - DH22TIN06',
        'description': 'Lập trình ứng dụng di động với React Native',
        'teacher': teachers[2],
        'max_students': 35,
        'schedule': 'Thứ 7: 07:00-11:00',
        'room': 'Phòng LAB-MOBILE'
    }
]

classes = []
for data in class_data:
    cls, created = Class.objects.get_or_create(
        class_id=data['class_id'],
        defaults={
            'class_name': data['class_name'],
            'description': data['description'],
            'teacher': data['teacher'],
            'max_students': data['max_students'],
            'is_active': True
        }
    )
    if created:
        print(f"✓ Tạo lớp: {cls.class_name}")
    else:
        print(f"• Lớp đã tồn tại: {cls.class_name}")
    classes.append(cls)

# 3. TẠO SINH VIÊN
print("\n3. TẠO SINH VIÊN")
print("-" * 40)

# Danh sách họ và tên Việt Nam thực tế
ho_viet = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Võ', 'Đặng', 'Bùi', 
           'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Trương', 'Lâm', 'Đinh', 'Mai', 'Cao']

ten_dem_nam = ['Văn', 'Hữu', 'Đức', 'Minh', 'Quang', 'Hoàng', 'Thanh', 'Ngọc', 'Thành', 'Xuân']
ten_nam = ['Anh', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Hải', 'Hùng', 'Khôi', 'Long', 'Nam', 
           'Phúc', 'Quân', 'Sơn', 'Tài', 'Thắng', 'Thiện', 'Toàn', 'Trung', 'Tuấn', 'Việt']

ten_dem_nu = ['Thị', 'Ngọc', 'Hoàng', 'Minh', 'Thanh', 'Kim', 'Thúy', 'Bảo', 'Diễm', 'Hồng']
ten_nu = ['Anh', 'Chi', 'Dung', 'Giang', 'Hà', 'Hương', 'Lan', 'Linh', 'Loan', 'Mai', 
          'Nga', 'Nhung', 'Oanh', 'Phương', 'Quỳnh', 'Thảo', 'Trang', 'Trinh', 'Vân', 'Yến']

students = []
student_id_counter = 2200001

for i in range(150):  # Tạo 150 sinh viên
    gender = random.choice(['male', 'female'])
    
    if gender == 'male':
        ho = random.choice(ho_viet)
        ten_dem = random.choice(ten_dem_nam)
        ten = random.choice(ten_nam)
    else:
        ho = random.choice(ho_viet)
        ten_dem = random.choice(ten_dem_nu)
        ten = random.choice(ten_nu)
    
    full_name = f"{ho} {ten_dem} {ten}"
    first_name = f"{ho} {ten_dem}"
    last_name = ten
    
    # Tạo email từ tên
    email_name = f"{ho.lower()}{ten_dem.lower()}{ten.lower()}".replace(' ', '')
    # Loại bỏ dấu tiếng Việt
    email_name = email_name.replace('đ', 'd').replace('Đ', 'd')
    email = f"{email_name}{student_id_counter}@student.nctu.edu.vn"
    
    # Tạo ngày sinh ngẫu nhiên (sinh viên năm 3 - sinh năm 2002-2003)
    birth_year = random.choice([2002, 2003])
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)
    date_of_birth = f"{birth_year}-{birth_month:02d}-{birth_day:02d}"
    
    # Số điện thoại ngẫu nhiên
    phone = f"0{random.choice(['3', '5', '7', '8', '9'])}{random.randint(10000000, 99999999)}"
    
    # Địa chỉ ngẫu nhiên
    addresses = [
        'Quận 1, TP.HCM', 'Quận 2, TP.HCM', 'Quận 3, TP.HCM', 'Quận 4, TP.HCM', 'Quận 5, TP.HCM',
        'Quận 6, TP.HCM', 'Quận 7, TP.HCM', 'Quận 8, TP.HCM', 'Quận 9, TP.HCM', 'Quận 10, TP.HCM',
        'Quận 11, TP.HCM', 'Quận 12, TP.HCM', 'Quận Bình Thạnh, TP.HCM', 'Quận Gò Vấp, TP.HCM',
        'Quận Phú Nhuận, TP.HCM', 'Quận Tân Bình, TP.HCM', 'Quận Tân Phú, TP.HCM', 
        'Quận Bình Tân, TP.HCM', 'Quận Thủ Đức, TP.HCM', 'Huyện Bình Chánh, TP.HCM'
    ]
    
    student, created = Student.objects.get_or_create(
        student_id=f"DH22{student_id_counter}",
        defaults={
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'phone': phone,
            'gender': gender,
            'date_of_birth': date_of_birth,
            'address': random.choice(addresses),
            'is_active': True
        }
    )
    
    if created:
        students.append(student)
    student_id_counter += 1

print(f"✓ Đã tạo {len(students)} sinh viên mới")

# 4. PHÂN SINH VIÊN VÀO LỚP
print("\n4. PHÂN SINH VIÊN VÀO LỚP")
print("-" * 40)

# Chia sinh viên vào các lớp
students_per_class = len(students) // len(classes)
student_index = 0

for cls in classes:
    class_students = students[student_index:student_index + min(students_per_class, cls.max_students)]
    
    for student in class_students:
        cs, created = ClassStudent.objects.get_or_create(
            class_obj=cls,
            student=student,
            defaults={'is_active': True}
        )
    
    print(f"✓ Đã thêm {len(class_students)} sinh viên vào lớp {cls.class_name}")
    student_index += len(class_students)

# 5. TẠO BUỔI ĐIỂM DANH
print("\n5. TẠO BUỔI ĐIỂM DANH")
print("-" * 40)

for cls in classes:
    # Tạo 10 buổi điểm danh cho mỗi lớp
    for week in range(1, 11):
        session_date = datetime.now().date() - timedelta(weeks=(10-week))
        
        session, created = AttendanceSession.objects.get_or_create(
            class_obj=cls,
            session_name=f"Tuần {week}",
            session_date=session_date,
            defaults={
                'start_time': '07:00:00',
                'end_time': '11:00:00',
                'is_active': True
            }
        )
        
        if created:
            # Tạo điểm danh cho sinh viên
            class_students = ClassStudent.objects.filter(class_obj=cls, is_active=True)
            for cs in class_students:
                # 85% có mặt, 10% vắng, 5% muộn
                rand = random.random()
                if rand < 0.85:
                    status = 'present'
                elif rand < 0.95:
                    status = 'absent'
                else:
                    status = 'late'
                
                Attendance.objects.create(
                    session=session,
                    student=cs.student,
                    status=status
                )
    
    print(f"✓ Đã tạo 10 buổi điểm danh cho lớp {cls.class_name}")

# 6. TẠO ĐIỂM
print("\n6. TẠO ĐIỂM")
print("-" * 40)

grade_types = ['midterm', 'final', 'assignment', 'quiz']
subjects = {
    'DH22TIN01': 'Lập trình Web',
    'DH22TIN02': 'Cấu trúc dữ liệu và Giải thuật',
    'DH22TIN03': 'Cơ sở dữ liệu',
    'DH22TIN04': 'Mạng máy tính',
    'DH22TIN05': 'Trí tuệ nhân tạo',
    'DH22TIN06': 'Phát triển ứng dụng di động'
}

for cls in classes:
    class_students = ClassStudent.objects.filter(class_obj=cls, is_active=True)
    subject_name = subjects.get(cls.class_id, cls.class_name)
    
    for cs in class_students:
        # Tạo điểm giữa kỳ
        midterm_score = random.uniform(5.0, 10.0)
        Grade.objects.get_or_create(
            student=cs.student,
            class_obj=cls,
            subject=subject_name,
            grade_type='midterm',
            defaults={
                'score': round(midterm_score, 1),
                'max_score': 10.0,
                'semester': '1',
                'academic_year': '2024-2025'
            }
        )
        
        # Tạo điểm cuối kỳ
        final_score = random.uniform(5.5, 10.0)
        Grade.objects.get_or_create(
            student=cs.student,
            class_obj=cls,
            subject=subject_name,
            grade_type='final',
            defaults={
                'score': round(final_score, 1),
                'max_score': 10.0,
                'semester': '1',
                'academic_year': '2024-2025'
            }
        )
        
        # Tạo điểm bài tập (50% sinh viên)
        if random.random() < 0.5:
            assignment_score = random.uniform(6.0, 10.0)
            Grade.objects.get_or_create(
                student=cs.student,
                class_obj=cls,
                subject=subject_name,
                grade_type='assignment',
                defaults={
                    'score': round(assignment_score, 1),
                    'max_score': 10.0,
                    'semester': '1',
                    'academic_year': '2024-2025'
                }
            )
    
    print(f"✓ Đã tạo điểm cho sinh viên lớp {cls.class_name}")

# 7. TẠO TÀI KHOẢN ADMIN
print("\n7. TẠO TÀI KHOẢN ADMIN")
print("-" * 40)

admin, created = User.objects.get_or_create(
    email='admin@nctu.edu.vn',
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'System',
        'role': 'admin',
        'account_status': 'active',
        'is_active': True,
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin.set_password('Admin@123')
    admin.save()
    print(f"✓ Tạo tài khoản admin: admin@nctu.edu.vn")
else:
    print(f"• Tài khoản admin đã tồn tại")

# 8. THỐNG KÊ
print("\n" + "=" * 70)
print("THỐNG KÊ DỮ LIỆU")
print("=" * 70)

print(f"""
📊 Tổng quan hệ thống:
  • Giảng viên: {User.objects.filter(role='teacher').count()}
  • Lớp học: {Class.objects.count()}
  • Sinh viên: {Student.objects.count()}
  • Phân công lớp: {ClassStudent.objects.filter(is_active=True).count()}
  • Buổi điểm danh: {AttendanceSession.objects.count()}
  • Bản ghi điểm danh: {Attendance.objects.count()}
  • Bản ghi điểm: {Grade.objects.count()}

🔑 Tài khoản đăng nhập:
  • Admin: admin@nctu.edu.vn / Admin@123
  • Giảng viên 1: nguyenthanhlong@nctu.edu.vn / Teacher@123
  • Giảng viên 2: tranvananh@nctu.edu.vn / Teacher@123
  • Giảng viên 3: leminhhai@nctu.edu.vn / Teacher@123

📝 Lưu ý:
  • Dữ liệu đã được tạo với thông tin thực tế
  • Mỗi lớp có khoảng 25 sinh viên
  • Mỗi lớp có 10 buổi điểm danh
  • Mỗi sinh viên có điểm giữa kỳ và cuối kỳ
""")

print("\n✅ Hoàn tất tạo dữ liệu mẫu!")