import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.accounts.models import User
from apps.classes.models import Class
from apps.grades.models import Grade
from apps.attendance.models import AttendanceSession

# Kiểm tra giảng viên
print("=" * 50)
print("KIỂM TRA GIẢNG VIÊN")
print("=" * 50)
teachers = User.objects.filter(role='teacher')
print(f"Tổng số giảng viên: {teachers.count()}")
for teacher in teachers:
    print(f"\n- Email: {teacher.email}")
    print(f"  Teacher ID: {teacher.teacher_id}")
    print(f"  Tên: {teacher.get_full_name()}")
    print(f"  Active: {teacher.is_active}")
    print(f"  Account Status: {teacher.account_status}")
    print(f"  Role: {teacher.role}")

# Kiểm tra lớp học
print("\n" + "=" * 50)
print("KIỂM TRA LỚP HỌC")
print("=" * 50)
classes = Class.objects.all()[:5]
print(f"Tổng số lớp: {Class.objects.count()}")
for cls in classes:
    print(f"\n- Class ID: {cls.class_id}")
    print(f"  Class Name: {cls.class_name}")
    print(f"  Teacher: {cls.teacher.email if cls.teacher else 'None'}")
    print(f"  Teacher Role: {cls.teacher.role if cls.teacher else 'None'}")

# Kiểm tra xem giảng viên có thể truy cập lớp của mình không
print("\n" + "=" * 50)
print("KIỂM TRA QUYỀN TRUY CẬP")
print("=" * 50)

# Lấy giảng viên đầu tiên
if teachers.exists():
    teacher = teachers.first()
    print(f"\nKiểm tra với giảng viên: {teacher.email}")
    
    # Lấy lớp của giảng viên này
    teacher_classes = Class.objects.filter(teacher=teacher)
    print(f"Số lớp của giảng viên này: {teacher_classes.count()}")
    
    for cls in teacher_classes[:3]:
        print(f"\n  - Lớp: {cls.class_id} - {cls.class_name}")
        
        # Kiểm tra điều kiện trong views
        is_admin = teacher.role == 'admin'
        is_teacher_of_class = cls.teacher == teacher
        
        print(f"    Is admin: {is_admin}")
        print(f"    Is teacher of class: {is_teacher_of_class}")
        print(f"    cls.teacher.id: {cls.teacher.id if cls.teacher else None}")
        print(f"    teacher.id: {teacher.id}")
        print(f"    Can access (should be True): {is_admin or is_teacher_of_class}")
        
        # Test logic từ views
        if teacher.role != 'admin' and cls.teacher != teacher:
            print(f"    ERROR: Giảng viên sẽ bị chặn truy cập!")
        else:
            print(f"    OK: Giảng viên có thể truy cập")

# Kiểm tra với một giảng viên khác không phải chủ lớp
print("\n" + "=" * 50)
print("KIỂM TRA GIẢNG VIÊN KHÔNG PHỔ LỚPHD")
print("=" * 50)

if teachers.count() > 1:
    teacher1 = teachers[0]
    teacher2 = teachers[1]
    
    # Lấy lớp của teacher1
    teacher1_classes = Class.objects.filter(teacher=teacher1)
    if teacher1_classes.exists():
        cls = teacher1_classes.first()
        print(f"Lớp: {cls.class_id} - Giảng viên: {cls.teacher.email}")
        print(f"Kiểm tra với giảng viên khác: {teacher2.email}")
        
        if teacher2.role != 'admin' and cls.teacher != teacher2:
            print(f"Kết quả: Giảng viên {teacher2.email} KHÔNG thể truy cập (Đúng)")
        else:
            print(f"Kết quả: Giảng viên {teacher2.email} CÓ thể truy cập")