#!/usr/bin/env python
"""
Script để import dữ liệu sinh viên và phòng học
Sử dụng: python import_data.py <path_to_export_file>
"""

import os
import sys
import django
import json
from datetime import datetime
from pathlib import Path

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.students.models import Student
from apps.classes.models import Class, ClassStudent
from apps.accounts.models import User
from apps.rooms.models import Building, Room
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist


def import_teachers(teachers_data):
    """Import thông tin giáo viên"""
    print("👨‍🏫 Đang import giáo viên...")
    imported_count = 0
    
    for teacher_data in teachers_data:
        try:
            # Kiểm tra xem giáo viên đã tồn tại chưa
            teacher, created = User.objects.get_or_create(
                email=teacher_data['email'],
                defaults={
                    'first_name': teacher_data.get('first_name', ''),
                    'last_name': teacher_data.get('last_name', ''),
                    'phone': teacher_data.get('phone', ''),
                    'teacher_id': teacher_data.get('teacher_id', ''),
                    'role': 'teacher',
                    'is_active': teacher_data.get('is_active', True),
                }
            )
            
            if created:
                imported_count += 1
                print(f"  ✅ Tạo mới giáo viên: {teacher.email}")
            else:
                print(f"  ⚠️  Giáo viên đã tồn tại: {teacher.email}")
                
        except Exception as e:
            print(f"  ❌ Lỗi import giáo viên {teacher_data.get('email', 'Unknown')}: {e}")
    
    print(f"📊 Imported {imported_count} giáo viên mới")
    return imported_count


def import_students(students_data):
    """Import thông tin sinh viên"""
    print("👨‍🎓 Đang import sinh viên...")
    imported_count = 0
    
    for student_data in students_data:
        try:
            # Kiểm tra xem sinh viên đã tồn tại chưa
            student, created = Student.objects.get_or_create(
                student_id=student_data['student_id'],
                defaults={
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                    'email': student_data['email'],
                    'phone': student_data.get('phone', ''),
                    'gender': student_data['gender'],
                    'date_of_birth': datetime.fromisoformat(student_data['date_of_birth']) if student_data.get('date_of_birth') else None,
                    'address': student_data.get('address', ''),
                    'is_active': student_data.get('is_active', True),
                }
            )
            
            if created:
                imported_count += 1
                print(f"  ✅ Tạo mới sinh viên: {student.student_id}")
            else:
                print(f"  ⚠️  Sinh viên đã tồn tại: {student.student_id}")
                
        except Exception as e:
            print(f"  ❌ Lỗi import sinh viên {student_data.get('student_id', 'Unknown')}: {e}")
    
    print(f"📊 Imported {imported_count} sinh viên mới")
    return imported_count


def import_classes(classes_data):
    """Import thông tin lớp học"""
    print("🏫 Đang import lớp học...")
    imported_count = 0
    
    for class_data in classes_data:
        try:
            # Tìm giáo viên
            teacher = None
            if class_data.get('teacher_email'):
                try:
                    teacher = User.objects.get(email=class_data['teacher_email'])
                except User.DoesNotExist:
                    print(f"  ⚠️  Không tìm thấy giáo viên: {class_data['teacher_email']}")
            
            # Kiểm tra xem lớp đã tồn tại chưa
            class_obj, created = Class.objects.get_or_create(
                class_id=class_data['class_id'],
                defaults={
                    'class_name': class_data['class_name'],
                    'description': class_data.get('description', ''),
                    'teacher': teacher,
                    'max_students': class_data.get('max_students', 50),
                    'is_active': class_data.get('is_active', True),
                }
            )
            
            if created:
                imported_count += 1
                print(f"  ✅ Tạo mới lớp: {class_obj.class_id}")
            else:
                print(f"  ⚠️  Lớp đã tồn tại: {class_obj.class_id}")
                
        except Exception as e:
            print(f"  ❌ Lỗi import lớp {class_data.get('class_id', 'Unknown')}: {e}")
    
    print(f"📊 Imported {imported_count} lớp học mới")
    return imported_count


def import_class_students(class_students_data):
    """Import mối quan hệ giữa lớp và sinh viên"""
    print("🔗 Đang import quan hệ lớp-sinh viên...")
    imported_count = 0
    
    for cs_data in class_students_data:
        try:
            # Tìm lớp và sinh viên
            try:
                class_obj = Class.objects.get(class_id=cs_data['class_id'])
                student = Student.objects.get(student_id=cs_data['student_id'])
            except (Class.DoesNotExist, Student.DoesNotExist) as e:
                print(f"  ⚠️  Không tìm thấy lớp hoặc sinh viên: {cs_data}")
                continue
            
            # Kiểm tra xem quan hệ đã tồn tại chưa
            cs, created = ClassStudent.objects.get_or_create(
                class_obj=class_obj,
                student=student,
                defaults={
                    'enrolled_at': datetime.fromisoformat(cs_data['enrolled_at']),
                    'is_active': cs_data.get('is_active', True),
                }
            )
            
            if created:
                imported_count += 1
                print(f"  ✅ Tạo mới quan hệ: {class_obj.class_id} - {student.student_id}")
            else:
                print(f"  ⚠️  Quan hệ đã tồn tại: {class_obj.class_id} - {student.student_id}")
                
        except Exception as e:
            print(f"  ❌ Lỗi import quan hệ {cs_data}: {e}")
    
    print(f"📊 Imported {imported_count} quan hệ lớp-sinh viên mới")
    return imported_count


def import_buildings(buildings_data):
    """Import thông tin tòa nhà"""
    print("🏢 Đang import tòa nhà...")
    imported_count = 0
    
    for building_data in buildings_data:
        try:
            # Kiểm tra xem tòa nhà đã tồn tại chưa
            building, created = Building.objects.get_or_create(
                building_id=building_data['building_id'],
                defaults={
                    'building_name': building_data['building_name'],
                    'building_type': building_data.get('building_type', 'academic'),
                    'description': building_data.get('description', ''),
                    'address': building_data.get('address', ''),
                    'floors': building_data.get('floors', 1),
                    'is_active': building_data.get('is_active', True),
                }
            )
            
            if created:
                imported_count += 1
                print(f"  ✅ Tạo mới tòa nhà: {building.building_id}")
            else:
                print(f"  ⚠️  Tòa nhà đã tồn tại: {building.building_id}")
                
        except Exception as e:
            print(f"  ❌ Lỗi import tòa nhà {building_data.get('building_id', 'Unknown')}: {e}")
    
    print(f"📊 Imported {imported_count} tòa nhà mới")
    return imported_count


def import_rooms(rooms_data):
    """Import thông tin phòng học"""
    print("🏫 Đang import phòng học...")
    imported_count = 0
    
    for room_data in rooms_data:
        try:
            # Tìm tòa nhà
            building = None
            if room_data.get('building_id'):
                try:
                    building = Building.objects.get(building_id=room_data['building_id'])
                except Building.DoesNotExist:
                    print(f"  ⚠️  Không tìm thấy tòa nhà: {room_data['building_id']}")
                    continue
            
            # Kiểm tra xem phòng đã tồn tại chưa
            room, created = Room.objects.get_or_create(
                room_id=room_data['room_id'],
                defaults={
                    'room_name': room_data['room_name'],
                    'building': building,
                    'floor': room_data.get('floor', 1),
                    'room_type': room_data.get('room_type', 'lecture'),
                    'capacity': room_data.get('capacity', 50),
                    'area': room_data.get('area'),
                    'equipment': room_data.get('equipment'),
                    'description': room_data.get('description', ''),
                    'status': room_data.get('status', 'available'),
                    'is_active': room_data.get('is_active', True),
                }
            )
            
            if created:
                imported_count += 1
                print(f"  ✅ Tạo mới phòng: {room.room_id}")
            else:
                print(f"  ⚠️  Phòng đã tồn tại: {room.room_id}")
                
        except Exception as e:
            print(f"  ❌ Lỗi import phòng {room_data.get('room_id', 'Unknown')}: {e}")
    
    print(f"📊 Imported {imported_count} phòng học mới")
    return imported_count


def main():
    """Import dữ liệu từ file JSON"""
    if len(sys.argv) != 2:
        print("❌ Sử dụng: python import_data.py <path_to_export_file>")
        print("📁 Ví dụ: python import_data.py exports/student_data_export_20241201_143022.json")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"❌ File không tồn tại: {file_path}")
        sys.exit(1)
    
    print(f"🔄 Đang import dữ liệu từ: {file_path}")
    
    try:
        # Đọc file JSON
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"📅 Dữ liệu được export lúc: {data.get('export_info', {}).get('exported_at', 'Unknown')}")
        
        # Import dữ liệu với transaction
        with transaction.atomic():
            buildings_count = import_buildings(data.get('buildings', []))
            rooms_count = import_rooms(data.get('rooms', []))
            teachers_count = import_teachers(data.get('teachers', []))
            students_count = import_students(data.get('students', []))
            classes_count = import_classes(data.get('classes', []))
            class_students_count = import_class_students(data.get('class_students', []))
        
        print("\n✅ Import hoàn thành!")
        print(f"📊 Tổng kết:")
        print(f"  - Tòa nhà mới: {buildings_count}")
        print(f"  - Phòng học mới: {rooms_count}")
        print(f"  - Giáo viên mới: {teachers_count}")
        print(f"  - Sinh viên mới: {students_count}")
        print(f"  - Lớp học mới: {classes_count}")
        print(f"  - Quan hệ lớp-sinh viên mới: {class_students_count}")
        
    except Exception as e:
        print(f"❌ Lỗi import dữ liệu: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
