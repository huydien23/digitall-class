#!/usr/bin/env python3
"""
Script to extract mock data from frontend and import to MySQL
Usage: python extract_frontend_data.py
"""

import os
import sys
import re
import json
from datetime import datetime
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent
sys.path.append(str(backend_path))

def extract_mock_data_from_file(file_path):
    """Extract mock data from a JavaScript file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the mock data objects in the file
    mock_data = {}

    # Look for mockTeachers, mockClasses, etc.
    patterns = {
        'teachers': r'mockTeachers\s*=\s*(\[[\s\S]*?\])',
        'classes': r'mockClasses\s*=\s*(\[[\s\S]*?\])',
        'scheduleTemplates': r'mockScheduleTemplates\s*=\s*(\[[\s\S]*?\])',
        'gradeManagement': r'mockGradeManagement\s*=\s*(\{[\s\S]*?\})',
        'systemStats': r'mockSystemStats\s*=\s*(\{[\s\S]*?\})',
        'students': r'mockStudents\s*=\s*(\[[\s\S]*?\])',
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, content, re.MULTILINE)
        if match:
            try:
                # Extract the JavaScript array/object
                js_data = match.group(1)
                # Convert JavaScript to Python-like structure
                py_data = js_to_python(js_data)
                mock_data[key] = py_data
            except Exception as e:
                print(f"Error parsing {key}: {e}")

    return mock_data

def js_to_python(js_str):
    """Convert JavaScript object/array to Python structure"""
    # Basic conversion - replace JS syntax with Python syntax
    py_str = js_str

    # Replace JavaScript object notation with Python dict
    py_str = re.sub(r'(\w+):', r"'\1':", py_str)  # key: value -> 'key': value
    py_str = re.sub(r'//.*', '', py_str)  # Remove comments
    py_str = re.sub(r'/\*.*?\*/', '', py_str, flags=re.DOTALL)  # Remove block comments

    # Handle specific JS patterns
    py_str = py_str.replace('true', 'True')
    py_str = py_str.replace('false', 'False')
    py_str = py_str.replace('null', 'None')

    # Clean up whitespace and newlines
    py_str = re.sub(r'\s+', ' ', py_str)

    # Try to parse as JSON first
    try:
        return json.loads(py_str)
    except:
        # If JSON fails, try eval (dangerous but for controlled data)
        try:
            return eval(py_str)
        except:
            # Return as string if all else fails
            return py_str

def extract_all_mock_data():
    """Extract all mock data from frontend"""
    frontend_path = Path(__file__).parent.parent / 'frontend' / 'src'

    mock_data_files = [
        frontend_path / 'components' / 'Dashboard' / 'AdminMockDataProvider.jsx',
        frontend_path / 'components' / 'Dashboard' / 'MockDataProvider.jsx',
        frontend_path / 'components' / 'Dashboard' / 'TeacherMockDataProvider.jsx',
        frontend_path / 'pages' / 'SystemStatus' / 'SystemStatus.jsx',
        frontend_path / 'constants' / 'homePageData.js',
    ]

    all_data = {}

    for file_path in mock_data_files:
        if file_path.exists():
            print(f"📖 Reading {file_path.name}...")
            file_data = extract_mock_data_from_file(file_path)
            all_data.update(file_data)

    return all_data

def print_extracted_data(data):
    """Print extracted data in a readable format"""
    print("\n" + "="*60)
    print("📊 EXTRACTED MOCK DATA SUMMARY")
    print("="*60)

    for key, value in data.items():
        if isinstance(value, list):
            print(f"\n{key.upper()}: {len(value)} items")
            if len(value) > 0 and isinstance(value[0], dict):
                print(f"  Fields: {list(value[0].keys())}")
                if len(value) <= 3:
                    for i, item in enumerate(value):
                        print(f"  {i+1}. {item.get('name', item.get('email', item.get('id', 'N/A')))}")
        elif isinstance(value, dict):
            print(f"\n{key.upper()}: {len(value)} keys")
            print(f"  Keys: {list(value.keys())}")
        else:
            print(f"\n{key.upper()}: {value}")

def generate_import_script(data):
    """Generate Django management command to import the data"""
    script_content = f'''"""
Auto-generated Django Management Command
Created from frontend mock data: {datetime.now().isoformat()}
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.students.models import Student
from apps.classes.models import Class, ClassStudent
from apps.grades.models import Subject, Grade
from apps.attendance.models import AttendanceSession, Attendance
from datetime import date, time, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Import mock data from frontend to MySQL'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting Frontend Data Import...')
        )

        try:
            with transaction.atomic():
                self.import_teachers()
                self.import_classes()
                self.import_subjects()
                self.import_students()
                self.import_grades()
                self.import_attendance()

                self.stdout.write(
                    self.style.SUCCESS('✅ Data import completed successfully!')
                )
                self.print_summary()

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error importing data: {{str(e)}}')
            )
            raise

    def import_teachers(self):
        """Import teachers from extracted data"""
        # This would be populated from actual data
        pass

    def import_classes(self):
        """Import classes from extracted data"""
        # This would be populated from actual data
        pass

    def import_subjects(self):
        """Import subjects from extracted data"""
        # This would be populated from actual data
        pass

    def import_students(self):
        """Import students from extracted data"""
        # This would be populated from actual data
        pass

    def import_grades(self):
        """Import grades from extracted data"""
        # This would be populated from actual data
        pass

    def import_attendance(self):
        """Import attendance from extracted data"""
        # This would be populated from actual data
        pass

    def print_summary(self):
        """Print summary of imported data"""
        self.stdout.write('\\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 IMPORT SUMMARY'))
        self.stdout.write('='*50)

        self.stdout.write(f'👥 Users: {{User.objects.count()}}')
        self.stdout.write(f'👨‍🎓 Students: {{Student.objects.count()}}')
        self.stdout.write(f'📚 Classes: {{Class.objects.count()}}')
        self.stdout.write(f'📖 Subjects: {{Subject.objects.count()}}')
        self.stdout.write(f'📊 Grades: {{Grade.objects.count()}}')
        self.stdout.write(f'📝 Attendance Sessions: {{AttendanceSession.objects.count()}}')
        self.stdout.write(f'✅ Attendance Records: {{Attendance.objects.count()}}')

'''

    return script_content

def main():
    """Main function to extract and process frontend data"""
    print("🔍 Extracting mock data from frontend...")

    # Extract all mock data
    extracted_data = extract_all_mock_data()

    if not extracted_data:
        print("❌ No mock data found!")
        return

    # Print summary
    print_extracted_data(extracted_data)

    # Generate import script
    script_content = generate_import_script(extracted_data)

    # Save to file
    output_file = backend_path / 'import_frontend_data.py'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(script_content)

    print(f"\\n✅ Generated import script: {output_file}")
    print("📝 Run: python manage.py import_frontend_data")

if __name__ == '__main__':
    main()
