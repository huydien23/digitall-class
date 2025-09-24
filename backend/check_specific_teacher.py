import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.accounts.models import User
from apps.classes.models import Class

# Nhập email giảng viên cần kiểm tra
email = input("Nhập email giảng viên bạn đang dùng để đăng nhập: ")

try:
    teacher = User.objects.get(email=email)
    
    print(f"\nThông tin giảng viên:")
    print(f"- Email: {teacher.email}")
    print(f"- Teacher ID: {teacher.teacher_id}")
    print(f"- Tên: {teacher.get_full_name()}")
    print(f"- Role: {teacher.role}")
    print(f"- Is Active: {teacher.is_active}")
    print(f"- Account Status: {teacher.account_status}")
    print(f"- Can Login: {teacher.can_login()}")
    
    # Lấy lớp của giảng viên
    teacher_classes = Class.objects.filter(teacher=teacher)
    print(f"\nSố lớp đang dạy: {teacher_classes.count()}")
    for cls in teacher_classes:
        print(f"  - {cls.class_id}: {cls.class_name}")
    
    # Kiểm tra quyền
    if teacher_classes.exists():
        cls = teacher_classes.first()
        print(f"\nKiểm tra quyền với lớp: {cls.class_id}")
        
        # Logic từ views
        is_admin = teacher.role == 'admin'
        is_teacher_of_class = cls.teacher == teacher
        
        print(f"- teacher.role = '{teacher.role}'")
        print(f"- is_admin = {is_admin}")
        print(f"- cls.teacher.id = {cls.teacher.id}")
        print(f"- teacher.id = {teacher.id}")
        print(f"- is_teacher_of_class = {is_teacher_of_class}")
        
        # Test điều kiện
        if teacher.role != 'admin' and cls.teacher != teacher:
            print(f"\n❌ Giảng viên sẽ bị chặn truy cập!")
        else:
            print(f"\n✓ Giảng viên có thể truy cập lớp")
            
        # Kiểm tra với lớp không phải của giảng viên này
        other_class = Class.objects.exclude(teacher=teacher).first()
        if other_class:
            print(f"\nKiểm tra với lớp khác: {other_class.class_id} (GV: {other_class.teacher.email})")
            if teacher.role != 'admin' and other_class.teacher != teacher:
                print(f"❌ Đúng - Không thể truy cập lớp không phải của mình")
            else:
                print(f"✓ Có thể truy cập")
    
    # Gợi ý sửa lỗi nếu cần
    if teacher.account_status != 'active':
        print(f"\n⚠️ Tài khoản giảng viên đang ở trạng thái: {teacher.account_status}")
        print("Điều này có thể ảnh hưởng đến quyền truy cập.")
        
        fix = input("\nBạn có muốn cập nhật trạng thái tài khoản thành 'active'? (y/n): ")
        if fix.lower() == 'y':
            teacher.account_status = 'active'
            teacher.save()
            print(f"✓ Đã cập nhật trạng thái tài khoản thành 'active'")
            
except User.DoesNotExist:
    print(f"Không tìm thấy giảng viên với email: {email}")
    
    # Liệt kê các giảng viên hiện có
    teachers = User.objects.filter(role='teacher')
    if teachers.exists():
        print("\nDanh sách giảng viên hiện có:")
        for t in teachers:
            print(f"  - {t.email} (Status: {t.account_status})")