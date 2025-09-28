#!/usr/bin/env python
import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.attendance.models import Attendance
from apps.students.models import Student

def debug_attendance():
    print("=== DEBUG ATTENDANCE FILTERING ===\n")
    
    # Check students
    print("=== STUDENTS ===")
    students = Student.objects.all()[:5]
    for s in students:
        print(f'Student(pk={s.pk}, student_id="{s.student_id}", name="{s.full_name}")')
    
    print(f"\nTotal students: {Student.objects.count()}")
    
    # Check attendance records  
    print("\n=== RECENT ATTENDANCE ===")
    attendances = Attendance.objects.select_related('student', 'session').order_by('-created_at')[:5]
    for a in attendances:
        print(f'Attendance(pk={a.pk}, session={a.session.id}, student_pk={a.student.pk}, student_id="{a.student.student_id}", status="{a.status}")')
    
    print(f"\nTotal attendance records: {Attendance.objects.count()}")
    
    # Test filtering
    if students.exists():
        test_student = students.first()
        print(f"\n=== TEST FILTERING ===")
        print(f'Testing with student: {test_student.student_id} (pk={test_student.pk})')
        
        # Test different filter methods
        filter1 = Attendance.objects.filter(student__student_id=test_student.student_id)
        print(f'Filter by student__student_id="{test_student.student_id}": {filter1.count()} records')
        
        filter2 = Attendance.objects.filter(student_id=test_student.pk)
        print(f'Filter by student_id={test_student.pk}: {filter2.count()} records')
        
        # Show actual records for this student
        if filter1.exists() or filter2.exists():
            student_attendances = Attendance.objects.filter(student=test_student).select_related('session')
            print(f'\nAll attendance for student {test_student.student_id}:')
            for att in student_attendances[:3]:
                print(f'  - Session {att.session.id}: {att.status} at {att.check_in_time}')
    
    print("\n=== END DEBUG ===")

if __name__ == '__main__':
    debug_attendance()