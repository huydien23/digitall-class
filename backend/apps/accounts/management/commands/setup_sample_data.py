"""
Django Management Command: Setup Sample Data
Tương tự như Data Seeding trong .NET Entity Framework
Chạy: python manage.py setup_sample_data
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
    help = 'Setup sample data for development and demo purposes'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )
        parser.add_argument(
            '--demo-only',
            action='store_true',
            help='Create minimal demo data only',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting Sample Data Setup...')
        )

        try:
            with transaction.atomic():
                if options['clear']:
                    self.clear_existing_data()
                
                if options['demo_only']:
                    self.create_demo_data()
                else:
                    self.create_full_sample_data()
                
                self.stdout.write(
                    self.style.SUCCESS('✅ Sample data setup completed successfully!')
                )
                self.print_summary()

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error setting up sample data: {str(e)}')
            )
            raise

    def clear_existing_data(self):
        """Clear existing sample data (keep admin users)"""
        self.stdout.write('🗑️  Clearing existing data...')
        
        # Keep admin users, clear others
        User.objects.filter(role__in=['student', 'teacher']).delete()
        Student.objects.all().delete()
        Class.objects.all().delete()
        Subject.objects.all().delete()
        Grade.objects.all().delete()
        AttendanceSession.objects.all().delete()
        Attendance.objects.all().delete()
        
        self.stdout.write('✅ Existing data cleared')

    def create_demo_data(self):
        """Create minimal demo data using real mock data from frontend"""
        self.stdout.write('📦 Creating demo data from frontend mock data...')
        
        # Create teachers from frontend mock data
        teachers = self.create_teachers_from_mock()
        
        # Create classes from frontend mock data
        classes = self.create_classes_from_mock(teachers)
        
        # Create students (use existing ones from database)
        students = self.get_or_create_students()
        
        # Add students to classes
        self.assign_students_to_classes_from_mock(classes, students)
        
        # Create subjects and grades
        self.create_subjects_and_grades_from_mock(classes, students)
        
        # Create attendance sessions
        self.create_attendance_sessions_from_mock(classes, students)

    def create_full_sample_data(self):
        """Create comprehensive sample data"""
        self.stdout.write('📚 Creating full sample data...')
        
        # Create teachers
        teachers = self.create_teachers()
        
        # Create students
        students = self.create_students()
        
        # Create subjects
        subjects = self.create_subjects()
        
        # Create classes
        classes = self.create_classes(teachers)
        
        # Assign students to classes
        self.assign_students_to_classes(classes, students)
        
        # Create grades
        self.create_grades(classes, students, subjects)
        
        # Create attendance sessions
        self.create_attendance_sessions(classes, students)

    def create_demo_teacher(self):
        """Create demo teacher"""
        teacher, created = User.objects.get_or_create(
            email='teacher@demo.com',
            defaults={
                'first_name': 'Nguyễn Văn',
                'last_name': 'Minh',
                'role': 'teacher',
                'teacher_id': 'GV001',
                'department': 'Khoa CNTT',
                'account_status': 'active',
                'is_active': True,
            }
        )
        if created:
            teacher.set_password('teacher123')
            teacher.save()
            self.stdout.write(f'✅ Created demo teacher: {teacher.full_name}')
        return teacher

    def create_demo_students(self):
        """Create demo students"""
        demo_students = [
            {
                'student_id': 'SV001',
                'first_name': 'Trần Thị',
                'last_name': 'Lan',
                'email': 'lan@student.demo',
                'gender': 'female',
                'date_of_birth': date(2003, 5, 15),
                'address': 'Hà Nội',
                'phone': '0123456789'
            },
            {
                'student_id': 'SV002',
                'first_name': 'Lê Văn',
                'last_name': 'Nam',
                'email': 'nam@student.demo',
                'gender': 'male',
                'date_of_birth': date(2003, 8, 22),
                'address': 'TP.HCM',
                'phone': '0987654321'
            },
            {
                'student_id': 'SV003',
                'first_name': 'Phạm Thị',
                'last_name': 'Hoa',
                'email': 'hoa@student.demo',
                'gender': 'female',
                'date_of_birth': date(2003, 12, 10),
                'address': 'Đà Nẵng',
                'phone': '0369258147'
            }
        ]
        
        students = []
        for student_data in demo_students:
            student, created = Student.objects.get_or_create(
                student_id=student_data['student_id'],
                defaults=student_data
            )
            if created:
                students.append(student)
                self.stdout.write(f'✅ Created demo student: {student.full_name}')
        
        return students

    def create_demo_class(self, teacher):
        """Create demo class"""
        demo_class, created = Class.objects.get_or_create(
            class_id='CS101',
            defaults={
                'class_name': 'Lập trình Web - Demo',
                'description': 'Lớp học demo cho hệ thống quản lý sinh viên',
                'teacher': teacher,
                'max_students': 50,
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(f'✅ Created demo class: {demo_class.class_name}')
        return demo_class

    def add_students_to_class(self, class_obj, students):
        """Add students to demo class"""
        for student in students:
            ClassStudent.objects.get_or_create(
                class_obj=class_obj,
                student=student,
                defaults={'is_active': True}
            )
        self.stdout.write(f'✅ Added {len(students)} students to demo class')

    def create_demo_grades(self, class_obj, students):
        """Create demo grades"""
        # Create demo subject
        subject, created = Subject.objects.get_or_create(
            subject_id='CS101',
            defaults={
                'subject_name': 'Lập trình Web',
                'description': 'Môn học lập trình web cơ bản',
                'credits': 3,
                'is_active': True,
            }
        )
        
        # Create grades for each student
        grade_types = ['midterm', 'final', 'assignment']
        for student in students:
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
                        'comment': f'Điểm {grade_type} cho {student.full_name}',
                        'created_by': class_obj.teacher,
                    }
                )
        
        self.stdout.write('✅ Created demo grades')

    def create_demo_attendance(self, class_obj, students):
        """Create demo attendance sessions"""
        # Create demo attendance session
        session_date = date.today() - timedelta(days=1)
        session, created = AttendanceSession.objects.get_or_create(
            class_obj=class_obj,
            session_name='Buổi học demo',
            defaults={
                'description': 'Buổi học demo cho hệ thống điểm danh',
                'session_date': session_date,
                'start_time': time(8, 0),
                'end_time': time(10, 0),
                'location': 'Phòng A101',
                'is_active': True,
                'created_by': class_obj.teacher,
            }
        )
        
        if created:
            # Create attendance records
            attendance_statuses = ['present', 'present', 'late']  # 2 present, 1 late
            for i, student in enumerate(students):
                status = attendance_statuses[i % len(attendance_statuses)]
                check_in_time = None
                if status in ['present', 'late']:
                    base_time = session.start_time
                    if status == 'late':
                        base_time = time(8, 30)  # 30 minutes late
                    check_in_time = f"{session_date} {base_time}"
                
                Attendance.objects.get_or_create(
                    session=session,
                    student=student,
                    defaults={
                        'status': status,
                        'check_in_time': check_in_time,
                        'notes': f'Điểm danh demo cho {student.full_name}',
                    }
                )
            
            self.stdout.write('✅ Created demo attendance')

    def create_teachers(self):
        """Create sample teachers"""
        teachers_data = [
            {
                'email': 'teacher1@nctu.edu.vn',
                'first_name': 'Nguyễn Văn',
                'last_name': 'Minh',
                'teacher_id': 'GV001',
                'department': 'Khoa CNTT',
            },
            {
                'email': 'teacher2@nctu.edu.vn',
                'first_name': 'Trần Thị',
                'last_name': 'Lan',
                'teacher_id': 'GV002',
                'department': 'Khoa Toán',
            },
            {
                'email': 'teacher3@nctu.edu.vn',
                'first_name': 'Lê Hoàng',
                'last_name': 'Nam',
                'teacher_id': 'GV003',
                'department': 'Khoa Vật Lý',
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
                self.stdout.write(f'✅ Created teacher: {teacher.full_name}')
        
        return teachers

    def create_students(self):
        """Create sample students"""
        # Use existing students from database or create new ones
        existing_students = Student.objects.all()[:10]  # Take first 10 existing students
        
        if existing_students.count() >= 10:
            self.stdout.write(f'✅ Using {existing_students.count()} existing students')
            return list(existing_students)
        
        # Create additional students if needed
        additional_students = []
        for i in range(10 - existing_students.count()):
            student_id = f'SV{i+100:03d}'
            student = Student.objects.create(
                student_id=student_id,
                first_name=f'Sinh viên',
                last_name=f'{i+1}',
                email=f'{student_id.lower()}@student.demo',
                gender=random.choice(['male', 'female']),
                date_of_birth=date(2003, random.randint(1, 12), random.randint(1, 28)),
                address=f'Địa chỉ {i+1}',
                phone=f'0{random.randint(100000000, 999999999)}',
                is_active=True,
            )
            additional_students.append(student)
            self.stdout.write(f'✅ Created student: {student.full_name}')
        
        return list(existing_students) + additional_students

    def create_subjects(self):
        """Create sample subjects"""
        subjects_data = [
            {'subject_id': 'CS101', 'subject_name': 'Lập trình Web', 'credits': 3},
            {'subject_id': 'CS102', 'subject_name': 'Cơ sở dữ liệu', 'credits': 3},
            {'subject_id': 'MATH101', 'subject_name': 'Toán cao cấp', 'credits': 4},
            {'subject_id': 'PHYS101', 'subject_name': 'Vật lý đại cương', 'credits': 3},
            {'subject_id': 'ENG101', 'subject_name': 'Tiếng Anh', 'credits': 2},
        ]
        
        subjects = []
        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                subject_id=subject_data['subject_id'],
                defaults={
                    **subject_data,
                    'description': f'Môn học {subject_data["subject_name"]}',
                    'is_active': True,
                }
            )
            if created:
                subjects.append(subject)
                self.stdout.write(f'✅ Created subject: {subject.subject_name}')
        
        return subjects

    def create_classes(self, teachers):
        """Create sample classes"""
        classes_data = [
            {'class_id': 'CS101-A', 'class_name': 'Lập trình Web - Nhóm A'},
            {'class_id': 'CS101-B', 'class_name': 'Lập trình Web - Nhóm B'},
            {'class_id': 'CS102-A', 'class_name': 'Cơ sở dữ liệu - Nhóm A'},
            {'class_id': 'MATH101-A', 'class_name': 'Toán cao cấp - Nhóm A'},
        ]
        
        classes = []
        for i, class_data in enumerate(classes_data):
            teacher = teachers[i % len(teachers)]
            class_obj, created = Class.objects.get_or_create(
                class_id=class_data['class_id'],
                defaults={
                    **class_data,
                    'description': f'Lớp học {class_data["class_name"]}',
                    'teacher': teacher,
                    'max_students': 50,
                    'is_active': True,
                }
            )
            if created:
                classes.append(class_obj)
                self.stdout.write(f'✅ Created class: {class_obj.class_name}')
        
        return classes

    def assign_students_to_classes(self, classes, students):
        """Assign students to classes"""
        for class_obj in classes:
            # Assign 5-8 students per class
            class_students = random.sample(students, min(random.randint(5, 8), len(students)))
            for student in class_students:
                ClassStudent.objects.get_or_create(
                    class_obj=class_obj,
                    student=student,
                    defaults={'is_active': True}
                )
            self.stdout.write(f'✅ Assigned {len(class_students)} students to {class_obj.class_name}')

    def create_grades(self, classes, students, subjects):
        """Create sample grades"""
        grade_types = ['midterm', 'final', 'assignment', 'quiz']
        
        for class_obj in classes:
            # Get students in this class
            class_students = [cs.student for cs in class_obj.class_students.filter(is_active=True)]
            
            # Assign a subject to this class
            subject = random.choice(subjects)
            
            for student in class_students:
                for grade_type in grade_types:
                    score = round(random.uniform(5.0, 10.0), 1)
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
        
        self.stdout.write('✅ Created sample grades')

    def create_attendance_sessions(self, classes, students):
        """Create sample attendance sessions"""
        for class_obj in classes:
            # Create 3-5 attendance sessions
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
        
        self.stdout.write('✅ Created sample attendance sessions')

    def print_summary(self):
        """Print summary of created data"""
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('📊 SAMPLE DATA SUMMARY'))
        self.stdout.write('='*50)
        
        self.stdout.write(f'👥 Users: {User.objects.count()}')
        self.stdout.write(f'👨‍🏫 Teachers: {User.objects.filter(role="teacher").count()}')
        self.stdout.write(f'👨‍🎓 Students: {Student.objects.count()}')
        self.stdout.write(f'📚 Classes: {Class.objects.count()}')
        self.stdout.write(f'📖 Subjects: {Subject.objects.count()}')
        self.stdout.write(f'📊 Grades: {Grade.objects.count()}')
        self.stdout.write(f'📝 Attendance Sessions: {AttendanceSession.objects.count()}')
        self.stdout.write(f'✅ Attendance Records: {Attendance.objects.count()}')
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('🎯 DEMO ACCOUNTS'))
        self.stdout.write('='*50)
        self.stdout.write('Admin: admin@qlsv.com / admin123')
        self.stdout.write('Teacher: teacher@demo.com / teacher123')
        self.stdout.write('Students: Check database for student emails')
        
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('🚀 Ready for demo!'))
        self.stdout.write('='*50)
