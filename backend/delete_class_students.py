#!/usr/bin/env python
"""
Script để xóa tất cả sinh viên khỏi một lớp học (HARD DELETE)
Sử dụng cho môi trường dev/test
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import ClassStudent, Class


def delete_all_students_from_class(class_id):
    """Xóa tất cả sinh viên khỏi lớp"""
    try:
        # Lấy thông tin lớp
        class_obj = Class.objects.get(id=class_id)
        print(f"📚 Lớp: {class_obj.class_name} (ID: {class_obj.id})")
        print(f"📝 Mã lớp: {class_obj.class_id}")
        
        # Đếm số sinh viên hiện tại
        students = ClassStudent.objects.filter(class_obj=class_obj)
        total = students.count()
        
        if total == 0:
            print("✅ Lớp không có sinh viên nào!")
            return
        
        print(f"\n⚠️  Tìm thấy {total} sinh viên trong lớp")
        
        # Xác nhận xóa
        confirm = input(f"\n🗑️  Bạn có chắc chắn muốn XÓA VĨnh VIỄN {total} sinh viên khỏi database? (yes/no): ")
        
        if confirm.lower() not in ['yes', 'y']:
            print("❌ Đã hủy thao tác xóa")
            return
        
        # Xóa tất cả
        print("\n🔄 Đang xóa sinh viên...")
        deleted_count, _ = students.delete()
        
        print(f"✅ Đã xóa thành công {deleted_count} sinh viên khỏi database!")
        
        # Kiểm tra lại
        remaining = ClassStudent.objects.filter(class_obj=class_obj).count()
        print(f"📊 Sinh viên còn lại trong lớp: {remaining}")
        
    except Class.DoesNotExist:
        print(f"❌ Không tìm thấy lớp với ID: {class_id}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")


def delete_student_by_id(class_id, student_id):
    """Xóa một sinh viên cụ thể khỏi lớp"""
    try:
        class_obj = Class.objects.get(id=class_id)
        class_student = ClassStudent.objects.get(
            class_obj=class_obj,
            student__student_id=student_id
        )
        
        student_name = class_student.student.full_name
        print(f"🗑️  Đang xóa sinh viên: {student_name} (MSSV: {student_id})")
        
        class_student.delete()
        print(f"✅ Đã xóa thành công!")
        
    except Class.DoesNotExist:
        print(f"❌ Không tìm thấy lớp với ID: {class_id}")
    except ClassStudent.DoesNotExist:
        print(f"❌ Không tìm thấy sinh viên {student_id} trong lớp")
    except Exception as e:
        print(f"❌ Lỗi: {e}")


def list_classes():
    """Liệt kê tất cả các lớp"""
    print("\n📋 DANH SÁCH CÁC LỚP HỌC:")
    print("-" * 80)
    classes = Class.objects.all().order_by('-id')[:10]
    
    for cls in classes:
        student_count = ClassStudent.objects.filter(class_obj=cls).count()
        print(f"ID: {cls.id:3d} | Mã: {cls.class_id} | Tên: {cls.class_name:40s} | SV: {student_count:3d}")
    
    print("-" * 80)


if __name__ == "__main__":
    print("=" * 80)
    print("🗑️  SCRIPT XÓA SINH VIÊN KHỎI LỚP HỌC (HARD DELETE)")
    print("=" * 80)
    
    # Hiển thị menu
    print("\nChọn thao tác:")
    print("1. Xóa TẤT CẢ sinh viên trong một lớp")
    print("2. Xóa MỘT sinh viên cụ thể")
    print("3. Liệt kê các lớp học")
    print("0. Thoát")
    
    choice = input("\nNhập lựa chọn (0-3): ").strip()
    
    if choice == "1":
        list_classes()
        class_id = input("\nNhập ID lớp học: ").strip()
        if class_id.isdigit():
            delete_all_students_from_class(int(class_id))
        else:
            print("❌ ID không hợp lệ")
            
    elif choice == "2":
        list_classes()
        class_id = input("\nNhập ID lớp học: ").strip()
        student_id = input("Nhập MSSV sinh viên: ").strip()
        if class_id.isdigit():
            delete_student_by_id(int(class_id), student_id)
        else:
            print("❌ ID không hợp lệ")
            
    elif choice == "3":
        list_classes()
        
    elif choice == "0":
        print("👋 Tạm biệt!")
        
    else:
        print("❌ Lựa chọn không hợp lệ")
    
    print("\n" + "=" * 80)
