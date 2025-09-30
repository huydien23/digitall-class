#!/usr/bin/env python
"""
Script to check users and their classes
"""
import django
import sys
import os

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import Class
from apps.accounts.models import User

def check_users_and_classes():
    """Check all users and their classes"""
    try:
        print("=== ALL TEACHERS ===")
        teachers = User.objects.filter(role='teacher')
        for teacher in teachers:
            print(f"Teacher: {teacher.username} - {teacher.first_name} {teacher.last_name}")
            classes = Class.objects.filter(teacher=teacher)
            print(f"  Classes: {classes.count()}")
            for cls in classes:
                print(f"    - {cls.class_name} (ID: {cls.id})")
        
        print("\n=== ALL CLASSES ===")
        classes = Class.objects.all()
        print(f"Total classes: {classes.count()}")
        for cls in classes:
            print(f"Class: {cls.class_name}")
            print(f"  - ID: {cls.id}")
            print(f"  - class_id: {getattr(cls, 'class_id', 'NOT SET')}")
            print(f"  - name: {getattr(cls, 'name', 'NOT SET')}")
            print(f"  - teacher: {cls.teacher}")
            print(f"  - subject: {cls.subject}")
            print(f"  - term: {cls.term}")
            print()
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_users_and_classes()