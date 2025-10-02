#!/usr/bin/env python
"""
Script để xóa hoàn toàn Student records khỏi database
Sử dụng cho môi trường dev/test
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.students.models import Student
from apps.classes.models import ClassStudent


def delete_all_students():
    """Xóa TẤT CẢ sinh viên khỏi database"""
    total = Student.objects.count()
    
    if total == 0:
        print("✅ Không có sinh viên nào trong database!")
        return
    
    print(f"\n⚠️  ⚠️  ⚠️  CẢNH BÁO ⚠️  ⚠️  ⚠️")
    print(f"Bạn sắp XÓA VĨnh VIỄN {total} sinh viên khỏi database!")
    print("Điều này sẽ xóa:")
    print("  - Tất cả Student records")
    print("  - Tất cả ClassStudent relationships")
    print("  - Dữ liệu điểm danh, điểm số liên quan")
    
    confirm = input(f"\n🗑️  Gõ 'DELETE ALL' để xác nhận: ")
    
    if confirm != 'DELETE ALL':
        print("❌ Đã hủy thao tác xóa")
        return
    
    print("\n🔄 Đang xóa...")
    
    # Xóa ClassStudent trước (foreign key constraint)
    cs_count = ClassStudent.objects.count()
    ClassStudent.objects.all().delete()
    print(f"  ✅ Đã xóa {cs_count} ClassStudent records")
    
    # Xóa Student
    deleted_count, details = Student.objects.all().delete()
    print(f"  ✅ Đã xóa {deleted_count} records từ database")
    
    print(f"\n✅ Hoàn tất! Database đã được làm sạch.")


def delete_students_in_class(class_id):
    """Xóa tất cả sinh viên trong một lớp cụ thể"""
    from apps.classes.models import Class
    
    try:
        class_obj = Class.objects.get(id=class_id)
        print(f"📚 Lớp: {class_obj.class_name} (ID: {class_obj.id})")
        
        # Lấy danh sách sinh viên
        class_students = ClassStudent.objects.filter(class_obj=class_obj).select_related('student')
        student_ids = [cs.student.id for cs in class_students]
        total = len(student_ids)
        
        if total == 0:
            print("✅ Lớp không có sinh viên nào!")
            return
        
        print(f"\n⚠️  Tìm thấy {total} sinh viên")
        print("Sẽ xóa:")
        print("  - Student records khỏi bảng students")
        print("  - ClassStudent relationships")
        
        confirm = input(f"\n🗑️  Xác nhận xóa {total} sinh viên? (yes/no): ")
        
        if confirm.lower() not in ['yes', 'y']:
            print("❌ Đã hủy thao tác xóa")
            return
        
        print("\n🔄 Đang xóa...")
        
        # Xóa ClassStudent relationships
        deleted_cs = class_students.delete()
        print(f"  ✅ Đã xóa {deleted_cs[0]} ClassStudent records")
        
        # Xóa Student records
        deleted_students, _ = Student.objects.filter(id__in=student_ids).delete()
        print(f"  ✅ Đã xóa {deleted_students} Student records")
        
        print(f"\n✅ Hoàn tất!")
        
    except Class.DoesNotExist:
        print(f"❌ Không tìm thấy lớp với ID: {class_id}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")


def delete_students_by_ids(student_ids_list):
    """Xóa sinh viên theo danh sách MSSV"""
    print(f"\n🔍 Đang tìm {len(student_ids_list)} sinh viên...")
    
    students = Student.objects.filter(student_id__in=student_ids_list)
    found = students.count()
    
    if found == 0:
        print("❌ Không tìm thấy sinh viên nào!")
        return
    
    print(f"✅ Tìm thấy {found}/{len(student_ids_list)} sinh viên")
    
    for s in students:
        print(f"  - {s.student_id}: {s.full_name}")
    
    confirm = input(f"\n🗑️  Xác nhận xóa {found} sinh viên? (yes/no): ")
    
    if confirm.lower() not in ['yes', 'y']:
        print("❌ Đã hủy thao tác xóa")
        return
    
    print("\n🔄 Đang xóa...")
    deleted, _ = students.delete()
    print(f"✅ Đã xóa {deleted} sinh viên khỏi database!")


def list_students():
    """Liệt kê sinh viên"""
    total = Student.objects.count()
    print(f"\n📊 Tổng số sinh viên trong database: {total}")
    
    if total > 0:
        print("\n📋 10 sinh viên gần nhất:")
        print("-" * 80)
        students = Student.objects.order_by('-created_at')[:10]
        for s in students:
            class_count = ClassStudent.objects.filter(student=s).count()
            print(f"MSSV: {s.student_id:10s} | Tên: {s.full_name:30s} | Lớp: {class_count}")
        print("-" * 80)


if __name__ == "__main__":
    print("=" * 80)
    print("🗑️  SCRIPT XÓA STUDENT RECORDS KHỎI DATABASE (HARD DELETE)")
    print("=" * 80)
    
    # Hiển thị menu
    print("\nChọn thao tác:")
    print("1. Xóa TẤT CẢ sinh viên trong database")
    print("2. Xóa sinh viên trong một lớp cụ thể")
    print("3. Xóa sinh viên theo MSSV")
    print("4. Xem thống kê sinh viên")
    print("0. Thoát")
    
    choice = input("\nNhập lựa chọn (0-4): ").strip()
    
    if choice == "1":
        delete_all_students()
        
    elif choice == "2":
        from apps.classes.models import Class
        print("\n📋 DANH SÁCH CÁC LỚP HỌC:")
        print("-" * 80)
        classes = Class.objects.all().order_by('-id')[:10]
        for cls in classes:
            student_count = ClassStudent.objects.filter(class_obj=cls).count()
            print(f"ID: {cls.id:3d} | Mã: {cls.class_id} | Tên: {cls.class_name:40s} | SV: {student_count:3d}")
        print("-" * 80)
        
        class_id = input("\nNhập ID lớp học: ").strip()
        if class_id.isdigit():
            delete_students_in_class(int(class_id))
        else:
            print("❌ ID không hợp lệ")
            
    elif choice == "3":
        mssv_input = input("\nNhập MSSV (cách nhau bởi dấu phẩy): ").strip()
        student_ids = [x.strip() for x in mssv_input.split(',') if x.strip()]
        if student_ids:
            delete_students_by_ids(student_ids)
        else:
            print("❌ MSSV không hợp lệ")
            
    elif choice == "4":
        list_students()
        
    elif choice == "0":
        print("👋 Tạm biệt!")
        
    else:
        print("❌ Lựa chọn không hợp lệ")
    
    print("\n" + "=" * 80)
