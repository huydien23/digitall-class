#!/usr/bin/env python
import os
import django
import sys
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import Class, ClassStudent
from apps.attendance.models import AttendanceSession
from apps.students.models import Student

def debug_schedule_data():
    print("=== DEBUG SCHEDULE DATA ===\n")
    
    # Get sample student
    student = Student.objects.first()
    if not student:
        print("No students found!")
        return
    
    print(f"Testing with student: {student.student_id} - {student.full_name}")
    
    # Get student's classes
    student_classes = ClassStudent.objects.filter(student=student, is_active=True).select_related('class_obj', 'class_obj__teacher')
    print(f"\nStudent enrolled in {student_classes.count()} classes:")
    
    for cs in student_classes:
        class_obj = cs.class_obj
        teacher = class_obj.teacher
        print(f"- {class_obj.class_id}: {class_obj.class_name}")
        print(f"  Teacher: {teacher.first_name} {teacher.last_name}")
        
        # Get sessions for this class
        sessions = AttendanceSession.objects.filter(class_obj=class_obj).order_by('session_date', 'start_time')
        print(f"  Sessions: {sessions.count()}")
        
        for session in sessions[:3]:  # Show first 3 sessions
            day_of_week = session.session_date.weekday() + 1  # Monday=0 -> Monday=1
            if day_of_week == 7:  # Sunday=6 -> Sunday=0
                day_of_week = 0
                
            print(f"    - {session.session_name}")
            print(f"      Date: {session.session_date} (Day: {day_of_week})")
            print(f"      Time: {session.start_time} - {session.end_time}")
            print(f"      Location: {session.location or 'N/A'}")
            print(f"      Type: {session.session_type}")
        
        if sessions.count() > 3:
            print(f"    ... and {sessions.count() - 3} more sessions")
        print()
    
    print("=== END DEBUG ===")

if __name__ == '__main__':
    debug_schedule_data()