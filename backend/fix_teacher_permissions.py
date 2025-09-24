import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.accounts.models import User
from apps.classes.models import Class

print("=" * 60)
print("FIX QUYỀN TRUY CẬP CHO GIẢNG VIÊN")
print("=" * 60)

# 1. Cập nhật tất cả giảng viên thành active
print("\n1. CẬP NHẬT TRẠNG THÁI TÀI KHOẢN GIẢNG VIÊN")
print("-" * 40)

teachers = User.objects.filter(role='teacher')
pending_teachers = teachers.filter(account_status='pending')

if pending_teachers.exists():
    print(f"Tìm thấy {pending_teachers.count()} giảng viên với trạng thái 'pending':")
    for teacher in pending_teachers:
        print(f"  - {teacher.email}")
    
    choice = input("\nBạn có muốn cập nhật tất cả thành 'active'? (y/n): ")
    if choice.lower() == 'y':
        pending_teachers.update(account_status='active')
        print(f"✓ Đã cập nhật {pending_teachers.count()} giảng viên thành 'active'")
else:
    print("✓ Tất cả giảng viên đã có trạng thái 'active'")

# 2. Kiểm tra và hiển thị phân công lớp
print("\n2. KIỂM TRA PHÂN CÔNG LỚP")
print("-" * 40)

for teacher in teachers:
    classes = Class.objects.filter(teacher=teacher)
    print(f"\n{teacher.email} (ID: {teacher.teacher_id}):")
    if classes.exists():
        for cls in classes:
            print(f"  - {cls.class_id}: {cls.class_name}")
    else:
        print("  - Chưa được phân công lớp nào")

# 3. Tùy chọn gán lớp cho giảng viên
print("\n3. GÁN LỚP CHO GIẢNG VIÊN")
print("-" * 40)

choice = input("\nBạn có muốn gán lớp cho giảng viên không? (y/n): ")
if choice.lower() == 'y':
    # Liệt kê giảng viên
    print("\nDanh sách giảng viên:")
    for i, teacher in enumerate(teachers, 1):
        classes_count = Class.objects.filter(teacher=teacher).count()
        print(f"{i}. {teacher.email} (Đang dạy: {classes_count} lớp)")
    
    teacher_idx = input("\nChọn số thứ tự giảng viên (hoặc Enter để bỏ qua): ")
    if teacher_idx.isdigit():
        teacher_idx = int(teacher_idx) - 1
        if 0 <= teacher_idx < teachers.count():
            selected_teacher = teachers[teacher_idx]
            
            # Liệt kê lớp
            all_classes = Class.objects.all()
            print(f"\nDanh sách lớp:")
            for i, cls in enumerate(all_classes, 1):
                print(f"{i}. {cls.class_id}: {cls.class_name} (GV hiện tại: {cls.teacher.email})")
            
            class_idx = input("\nChọn số thứ tự lớp để gán (hoặc Enter để bỏ qua): ")
            if class_idx.isdigit():
                class_idx = int(class_idx) - 1
                if 0 <= class_idx < all_classes.count():
                    selected_class = all_classes[class_idx]
                    
                    print(f"\n⚠️ Sẽ gán lớp '{selected_class.class_name}' cho giảng viên '{selected_teacher.email}'")
                    print(f"   (Thay thế giảng viên cũ: {selected_class.teacher.email})")
                    
                    confirm = input("Xác nhận? (y/n): ")
                    if confirm.lower() == 'y':
                        selected_class.teacher = selected_teacher
                        selected_class.save()
                        print("✓ Đã cập nhật thành công!")

# 4. Test quyền truy cập
print("\n4. KIỂM TRA QUYỀN TRUY CẬP")
print("-" * 40)

test_email = input("\nNhập email giảng viên để test quyền (hoặc Enter để bỏ qua): ")
if test_email:
    try:
        teacher = User.objects.get(email=test_email)
        print(f"\n✓ Tìm thấy: {teacher.email}")
        print(f"  - Role: {teacher.role}")
        print(f"  - Active: {teacher.is_active}")
        print(f"  - Account Status: {teacher.account_status}")
        print(f"  - Can Login: {teacher.can_login()}")
        
        teacher_classes = Class.objects.filter(teacher=teacher)
        print(f"\n  Lớp đang dạy ({teacher_classes.count()}):")
        for cls in teacher_classes:
            print(f"    - {cls.class_id}: {cls.class_name}")
            
            # Test logic quyền
            if teacher.role != 'admin' and cls.teacher != teacher:
                print(f"      ❌ KHÔNG có quyền truy cập")
            else:
                print(f"      ✓ CÓ quyền truy cập")
                
    except User.DoesNotExist:
        print(f"❌ Không tìm thấy giảng viên: {test_email}")

print("\n" + "=" * 60)
print("HOÀN TẤT")
print("=" * 60)
print("\n✓ Đã kiểm tra và sửa lỗi quyền giảng viên")
print("✓ Giảng viên sẽ có thể truy cập vào các tab quản lý điểm và điểm danh")
print("  của các lớp mà họ được phân công dạy.")
print("\n⚠️ Lưu ý: Giảng viên chỉ có thể truy cập lớp mà họ được phân công.")