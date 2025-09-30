#!/usr/bin/env python
"""
Script to test my-classes API
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

def test_my_classes_api():
    """Test my-classes API data structure"""
    try:
        # Get a teacher user
        teacher = User.objects.filter(role='teacher').first()
        if not teacher:
            print("No teacher found")
            return
            
        print(f"Testing with teacher: {teacher.first_name} {teacher.last_name}")
        
        # Get teacher's classes
        classes = Class.objects.filter(teacher=teacher)
        print(f"Found {classes.count()} classes for teacher")
        
        for cls in classes:
            print(f"\nClass: {cls}")
            print(f"  - ID: {cls.id}")
            print(f"  - name: {getattr(cls, 'name', 'NOT SET')}")
            print(f"  - class_name: {getattr(cls, 'class_name', 'NOT SET')}")
            print(f"  - class_id: {getattr(cls, 'class_id', 'NOT SET')}")
            print(f"  - subject: {cls.subject}")
            print(f"  - term: {cls.term}")
            print(f"  - teacher: {cls.teacher}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_my_classes_api()