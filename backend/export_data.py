#!/usr/bin/env python
"""
Script để export dữ liệu sinh viên và phòng học
Sử dụng: python export_data.py
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
from apps.rooms.models import Building, Room, RoomSchedule
from django.core import serializers


def export_students():
    """Export tất cả sinh viên"""
    students = Student.objects.all()
    data = []
    
    for student in students:
        student_data = {
            'student_id': student.student_id,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'email': student.email,
            'phone': student.phone,
            'gender': student.gender,
            'date_of_birth': student.date_of_birth.isoformat() if student.date_of_birth else None,
            'address': student.address,
            'is_active': student.is_active,
            'created_at': student.created_at.isoformat(),
            'updated_at': student.updated_at.isoformat(),
        }
        data.append(student_data)
    
    return data


def export_classes():
    """Export tất cả lớp học"""
    classes = Class.objects.all()
    data = []
    
    for class_obj in classes:
        class_data = {
            'class_id': class_obj.class_id,
            'class_name': class_obj.class_name,
            'description': class_obj.description,
            'teacher_id': class_obj.teacher.id if class_obj.teacher else None,
            'teacher_email': class_obj.teacher.email if class_obj.teacher else None,
            'max_students': class_obj.max_students,
            'is_active': class_obj.is_active,
            'created_at': class_obj.created_at.isoformat(),
            'updated_at': class_obj.updated_at.isoformat(),
        }
        data.append(class_data)
    
    return data


def export_class_students():
    """Export mối quan hệ giữa lớp và sinh viên"""
    class_students = ClassStudent.objects.all()
    data = []
    
    for cs in class_students:
        cs_data = {
            'class_id': cs.class_obj.class_id,
            'student_id': cs.student.student_id,
            'enrolled_at': cs.enrolled_at.isoformat(),
            'is_active': cs.is_active,
        }
        data.append(cs_data)
    
    return data


def export_teachers():
    """Export thông tin giáo viên"""
    teachers = User.objects.filter(role='teacher')
    data = []
    
    for teacher in teachers:
        teacher_data = {
            'id': teacher.id,
            'email': teacher.email,
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'phone': teacher.phone,
            'teacher_id': teacher.teacher_id,
            'is_active': teacher.is_active,
            'created_at': teacher.created_at.isoformat(),
        }
        data.append(teacher_data)
    
    return data


def export_buildings():
    """Export thông tin các khu"""
    buildings = Building.objects.all()
    data = []
    
    for building in buildings:
        building_data = {
            'building_id': building.building_id,
            'building_name': building.building_name,
            'building_type': building.building_type,
            'description': building.description,
            'address': building.address,
            'floors': building.floors,
            'is_active': building.is_active,
            'created_at': building.created_at.isoformat(),
            'updated_at': building.updated_at.isoformat(),
        }
        data.append(building_data)
    
    return data


def export_rooms():
    """Export thông tin các phòng học"""
    rooms = Room.objects.all()
    data = []
    
    for room in rooms:
        room_data = {
            'room_id': room.room_id,
            'room_name': room.room_name,
            'building_id': room.building.building_id,
            'building_name': room.building.building_name,
            'floor': room.floor,
            'room_type': room.room_type,
            'capacity': room.capacity,
            'area': float(room.area) if room.area else None,
            'equipment': room.equipment,
            'description': room.description,
            'status': room.status,
            'is_active': room.is_active,
            'created_at': room.created_at.isoformat(),
            'updated_at': room.updated_at.isoformat(),
        }
        data.append(room_data)
    
    return data


def export_room_schedules():
    """Export lịch sử dụng phòng"""
    schedules = RoomSchedule.objects.all()
    data = []
    
    for schedule in schedules:
        schedule_data = {
            'room_id': schedule.room.room_id,
            'room_name': schedule.room.room_name,
            'title': schedule.title,
            'description': schedule.description,
            'start_date': schedule.start_date.isoformat(),
            'end_date': schedule.end_date.isoformat(),
            'start_time': schedule.start_time.isoformat(),
            'end_time': schedule.end_time.isoformat(),
            'is_recurring': schedule.is_recurring,
            'recurring_days': schedule.recurring_days,
            'created_by_id': schedule.created_by.id,
            'created_by_email': schedule.created_by.email,
            'created_at': schedule.created_at.isoformat(),
            'updated_at': schedule.updated_at.isoformat(),
        }
        data.append(schedule_data)
    
    return data


def main():
    """Export tất cả dữ liệu"""
    print("🔄 Đang export dữ liệu...")
    
    # Tạo thư mục export nếu chưa có
    export_dir = Path(__file__).parent / 'exports'
    export_dir.mkdir(exist_ok=True)
    
    # Tạo timestamp cho tên file
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    # Export dữ liệu
    export_data = {
        'export_info': {
            'timestamp': timestamp,
            'exported_at': datetime.now().isoformat(),
            'version': '1.0'
        },
        'students': export_students(),
        'classes': export_classes(),
        'class_students': export_class_students(),
        'teachers': export_teachers(),
        'buildings': export_buildings(),
        'rooms': export_rooms(),
        'room_schedules': export_room_schedules(),
    }
    
    # Lưu vào file JSON
    filename = f'student_data_export_{timestamp}.json'
    filepath = export_dir / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Export thành công!")
    print(f"📁 File: {filepath}")
    print(f"📊 Số lượng sinh viên: {len(export_data['students'])}")
    print(f"📊 Số lượng lớp học: {len(export_data['classes'])}")
    print(f"📊 Số lượng giáo viên: {len(export_data['teachers'])}")
    print(f"📊 Số lượng quan hệ lớp-sinh viên: {len(export_data['class_students'])}")
    print(f"📊 Số lượng khu: {len(export_data['buildings'])}")
    print(f"📊 Số lượng phòng học: {len(export_data['rooms'])}")
    print(f"📊 Số lượng lịch phòng: {len(export_data['room_schedules'])}")
    
    return filepath


if __name__ == '__main__':
    main()
