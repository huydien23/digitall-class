#!/usr/bin/env python3
"""
Simple script to import frontend mock data directly to MySQL
Usage: python import_frontend_mock_data.py
"""

import os
import sys
import django
from datetime import datetime, date, time

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction
from apps.students.models import Student
from apps.classes.models import Class, ClassStudent
from apps.grades.models import Subject, Grade
from apps.attendance.models import AttendanceSession, Attendance

User = get_user_model()

def import_frontend_data():
    """Import mock data from frontend to MySQL"""
    print("🚀 Starting Frontend Mock Data Import to MySQL...")
    
    try:
        with transaction.atomic():
            # Import teachers from frontend mock data
            teachers = import_teachers()
            
            # Import classes
            classes = import_classes(teachers)
            
            # Import subjects
            subjects = import_subjects()
            
            # Get existing students or create some
            students = get_or_create_students()
            
            # Assign students to classes
            assign_students_to_classes(classes, students)
            
            # Create grades
            create_grades(classes, students, subjects)
            
            # Create attendance sessions
            create_attendance_sessions(classes, students)
            
            print("✅ Frontend mock data imported successfully!")
            print_summary()
            
    except Exception as e:
        print(f"❌ Error importing data: {str(e)}")
        raise

def import_teachers():
    """Import teachers from frontend mock data"""
    print("👨‍🏫 Importing teachers...")
    
    teachers_data = [
        {
            'email': 'dangmanhhuy@nctu.edu.vn',
            'first_name': 'Đặng Mạnh',
            'last_name': 'Huy',
            'teacher_id': 'GV001',
            'department': 'Khoa Công nghệ thông tin',
            'phone': '0123456789',
        },
        {
            'email': 'tranminhtam@nctu.edu.vn',
            'first_name': 'Trần Minh',
            'last_name': 'Tâm',
            'teacher_id': 'GV002',
            'department': 'Khoa Công nghệ thông tin',
            'phone': '0987654321',
        },
        {
            'email': 'doanchitrung@nctu.edu.vn',
            'first_name': 'Đoàn Chí',
            'last_name': 'Trung',
            'teacher_id': 'GV003',
            'department': 'Khoa Công nghệ thông tin',
            'phone': '0369852147',
        },
        {
            'email': 'dinhcaotin@nctu.edu.vn',
            'first_name': 'Đinh Cao',
            'last_name': 'Tín',
            'teacher_id': 'GV004',
            'department': 'Khoa Khoa học xã hội',
            'phone': '0456789123',
        },
        {
            'email': 'vothanhvinh@nctu.edu.vn',
            'first_name': 'Võ Thanh',
            'last_name': 'Vinh',
            'teacher_id': 'GV005',
            'department': 'Khoa Công nghệ thông tin',
            'phone': '0567891234',
        }
    ]
    
    teachers = []
    for teacher_data in teachers_data:
        teacher, created = User.objects.get_or_create(
            email=teacher_data['email'],
            defaults={
                **teacher_data,
                'role': 'teacher',
                'account_status': 'active',
                'is_active': True,
            }
        )
        if created:
            teacher.set_password('teacher123')
            teacher.save()
            teachers.append(teacher)
            print(f"  ✅ Created teacher: {teacher.full_name}")
        else:
            teachers.append(teacher)
            print(f"  📝 Found existing teacher: {teacher.full_name}")
    
    return teachers

def import_classes(teachers):
    """Import classes from frontend mock data"""
    print("📚 Importing classes...")
    
    classes_data = [
        {
            'class_id': '110101101010',
            'class_name': 'Lập trình Python - DH22TIN06',
            'description': 'Lớp học lập trình Python cho sinh viên năm 2',
            'teacher': teachers[0],  # Đặng Mạnh Huy
            'max_students': 42,
        },
        {
            'class_id': '110101101011',
            'class_name': 'Pháp luật về công nghệ thông tin - DH22TIN07',
            'description': 'Lớp học pháp luật CNTT',
            'teacher': teachers[1],  # Trần Minh Tâm
            'max_students': 40,
        },
        {
            'class_id': '110101101100',
            'class_name': 'Lập trình thiết bị di động - DH22TIN08',
            'description': 'Lớp học lập trình mobile',
            'teacher': teachers[2],  # Đoàn Chí Trung
            'max_students': 35,
        },
        {
            'class_id': '110101101101',
            'class_name': 'Lịch sử Đảng cộng sản Việt Nam - DH22TIN09',
            'description': 'Lớp học lịch sử Đảng',
            'teacher': teachers[3],  # Đinh Cao Tín
            'max_students': 50,
        },
        {
            'class_id': '110101101110',
            'class_name': 'Phát triển phần mềm mã nguồn mở - DH22TIN10',
            'description': 'Lớp học phát triển phần mềm mã nguồn mở',
            'teacher': teachers[4],  # Võ Thanh Vinh
            'max_students': 40,
        }
    ]
    
    classes = []
    for class_data in classes_data:
        class_obj, created = Class.objects.get_or_create(
            class_id=class_data['class_id'],
            defaults={
                **class_data,
                'is_active': True,
            }
        )
        if created:
            classes.append(class_obj)
            print(f"  ✅ Created class: {class_obj.class_name}")
        else:
            classes.append(class_obj)
            print(f"  📝 Found existing class: {class_obj.class_name}")
    
    return classes

def import_subjects():
    """Import subjects from frontend mock data"""
    print("📖 Importing subjects...")
    
    subjects_data = [
        {
            'subject_id': 'DH22TIN06',
            'subject_name': 'Lập trình Python',
            'description': 'Môn học lập trình Python cơ bản',
            'credits': 3,
        },
        {
            'subject_id': 'DH22TIN07',
            'subject_name': 'Pháp luật về công nghệ thông tin',
            'description': 'Môn học pháp luật CNTT',
            'credits': 2,
        },
        {
            'subject_id': 'DH22TIN08',
            'subject_name': 'Lập trình thiết bị di động',
            'description': 'Môn học lập trình mobile',
            'credits': 3,
        },
        {
            'subject_id': 'DH22TIN09',
            'subject_name': 'Lịch sử Đảng cộng sản Việt Nam',
            'description': 'Môn học lịch sử Đảng',
            'credits': 2,
        },
        {
            'subject_id': 'DH22TIN10',
            'subject_name': 'Phát triển phần mềm mã nguồn mở',
            'description': 'Môn học phát triển phần mềm mã nguồn mở',
            'credits': 3,
        }
    ]
    
    subjects = []
    for subject_data in subjects_data:
        subject, created = Subject.objects.get_or_create(
            subject_id=subject_data['subject_id'],
            defaults={
                **subject_data,
                'is_active': True,
            }
        )
        if created:
            subjects.append(subject)
            print(f"  ✅ Created subject: {subject.subject_name}")
        else:
            subjects.append(subject)
            print(f"  📝 Found existing subject: {subject.subject_name}")
    
    return subjects

def get_or_create_students():
    """Get existing students or create some demo ones"""
    print("👨‍🎓 Getting students...")
    
    existing_students = list(Student.objects.all()[:20])  # Get first 20 students
    
    if len(existing_students) >= 20:
        print(f"  📝 Found {len(existing_students)} existing students")
        return existing_students
    
    # Create some demo students if needed
    demo_students = [
        {
            'student_id': 'SV001',
            'first_name': 'Nguyễn Văn',
            'last_name': 'A',
            'email': 'nguyenvana@student.demo',
            'gender': 'male',
            'date_of_birth': date(2003, 5, 15),
            'address': 'Hà Nội',
            'phone': '0123456789'
        },
        {
            'student_id': 'SV002',
            'first_name': 'Trần Thị',
            'last_name': 'B',
            'email': 'tranthib@student.demo',
            'gender': 'female',
            'date_of_birth': date(2003, 8, 22),
            'address': 'TP.HCM',
            'phone': '0987654321'
        },
        {
            'student_id': 'SV003',
            'first_name': 'Lê Văn',
            'last_name': 'C',
            'email': 'levanc@student.demo',
            'gender': 'male',
            'date_of_birth': date(2003, 12, 10),
            'address': 'Đà Nẵng',
            'phone': '0369258147'
        }
    ]
    
    for student_data in demo_students:
        student, created = Student.objects.get_or_create(
            student_id=student_data['student_id'],
            defaults=student_data
        )
        if created:
            existing_students.append(student)
            print(f"  ✅ Created demo student: {student.full_name}")
    
    print(f"  📝 Total students: {len(existing_students)}")
    return existing_students

def assign_students_to_classes(classes, students):
    """Assign students to classes"""
    print("👥 Assigning students to classes...")
    
    for class_obj in classes:
        # Assign 5-10 students per class
        import random
        class_students = random.sample(students, min(random.randint(5, 10), len(students)))
        
        for student in class_students:
            ClassStudent.objects.get_or_create(
                class_obj=class_obj,
                student=student,
                defaults={'is_active': True}
            )
        
        print(f"  ✅ Assigned {len(class_students)} students to {class_obj.class_name}")

def create_grades(classes, students, subjects):
    """Create grades for students"""
    print("📊 Creating grades...")
    
    grade_types = ['midterm', 'final', 'assignment', 'quiz']
    
    for class_obj in classes:
        # Get students in this class
        class_students = [cs.student for cs in class_obj.class_students.filter(is_active=True)]
        
        # Assign a subject to this class
        import random
        subject = random.choice(subjects)
        
        for student in class_students:
            for grade_type in grade_types:
                score = round(random.uniform(6.0, 9.5), 1)
                Grade.objects.get_or_create(
                    student=student,
                    class_obj=class_obj,
                    subject=subject,
                    grade_type=grade_type,
                    defaults={
                        'score': score,
                        'max_score': 10.0,
                        'comment': f'Điểm {grade_type}',
                        'created_by': class_obj.teacher,
                    }
                )
    
    print("  ✅ Grades created successfully")

def create_attendance_sessions(classes, students):
    """Create attendance sessions"""
    print("📝 Creating attendance sessions...")
    
    for class_obj in classes:
        # Create 3-5 attendance sessions
        import random
        num_sessions = random.randint(3, 5)
        
        for i in range(num_sessions):
            session_date = date.today() - timedelta(days=random.randint(1, 30))
            session, created = AttendanceSession.objects.get_or_create(
                class_obj=class_obj,
                session_name=f'Buổi học {i+1}',
                defaults={
                    'description': f'Buổi học thứ {i+1} của lớp {class_obj.class_name}',
                    'session_date': session_date,
                    'start_time': time(8, 0),
                    'end_time': time(10, 0),
                    'location': f'Phòng A{random.randint(101, 110)}',
                    'is_active': True,
                    'created_by': class_obj.teacher,
                }
            )
            
            if created:
                # Create attendance records for students in this class
                class_students = [cs.student for cs in class_obj.class_students.filter(is_active=True)]
                
                for student in class_students:
                    status = random.choices(
                        ['present', 'absent', 'late'],
                        weights=[0.7, 0.2, 0.1]
                    )[0]
                    
                    check_in_time = None
                    if status in ['present', 'late']:
                        base_time = session.start_time
                        if status == 'late':
                            base_time = time(8, random.randint(15, 45))
                        check_in_time = f"{session_date} {base_time}"
                    
                    Attendance.objects.create(
                        session=session,
                        student=student,
                        status=status,
                        check_in_time=check_in_time,
                        notes=f'Điểm danh buổi {i+1}',
                    )
    
    print("  ✅ Attendance sessions created successfully")

def print_summary():
    """Print summary of imported data"""
    print("\n" + "="*60)
    print("📊 IMPORT SUMMARY")
    print("="*60)
    
    print(f"👥 Users: {User.objects.count()}")
    print(f"👨‍🏫 Teachers: {User.objects.filter(role='teacher').count()}")
    print(f"👨‍🎓 Students: {Student.objects.count()}")
    print(f"📚 Classes: {Class.objects.count()}")
    print(f"📖 Subjects: {Subject.objects.count()}")
    print(f"📊 Grades: {Grade.objects.count()}")
    print(f"📝 Attendance Sessions: {AttendanceSession.objects.count()}")
    print(f"✅ Attendance Records: {Attendance.objects.count()}")
    
    print("\n" + "="*60)
    print("🎯 DEMO ACCOUNTS")
    print("="*60)
    print("Admin: admin@qlsv.com / admin123")
    print("Teachers: teacher@demo.com / teacher123")
    print("Or use the imported teacher accounts above")
    
    print("\n" + "="*60)
    print("🚀 Ready for demo!")
    print("="*60)

if __name__ == '__main__':
    from datetime import timedelta
    import_frontend_data()
