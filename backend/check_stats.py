#!/usr/bin/env python
"""
Script để kiểm tra thống kê dữ liệu sau khi import
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.students.models import Student
from apps.classes.models import Class, ClassStudent
from apps.accounts.models import User
from apps.rooms.models import Building, Room

def main():
    print('📊 Thống kê dữ liệu sau khi import:')
    print(f'👨‍🎓 Sinh viên: {Student.objects.count()}')
    print(f'👨‍🏫 Giáo viên: {User.objects.filter(role="teacher").count()}')
    print(f'🏫 Lớp học: {Class.objects.count()}')
    print(f'🔗 Quan hệ lớp-sinh viên: {ClassStudent.objects.count()}')
    print(f'🏢 Tòa nhà: {Building.objects.count()}')
    print(f'🏫 Phòng học: {Room.objects.count()}')
    
    print()
    print('📋 Một số sinh viên:')
    for student in Student.objects.all()[:5]:
        print(f'  - {student.student_id}: {student.full_name}')
    
    print()
    print('📋 Một số lớp học:')
    for cls in Class.objects.all()[:3]:
        print(f'  - {cls.class_id}: {cls.class_name} ({cls.current_students_count} sinh viên)')

if __name__ == '__main__':
    main()