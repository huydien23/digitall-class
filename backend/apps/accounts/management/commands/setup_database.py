from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import User
from apps.classes.models import Class
from apps.grades.models import Grade
from apps.attendance.models import AttendanceSession
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Setup database with sample data for QLSV App'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Setting up QLSV database...')
        
        # Tạo admin user
        self.create_admin_user()
        
        # Tạo sample users
        self.create_sample_users()
        
        # Tạo sample classes
        self.create_sample_classes()
        
        # Tạo sample grades (sẽ tạo sau khi có Student model)
        # self.create_sample_grades()
        
        # Tạo sample attendance (sẽ tạo sau khi có Student model)
        # self.create_sample_attendance()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Database setup completed!')
        )
        self.stdout.write('📧 Admin: admin@qlsv.com / admin123')
        self.stdout.write('👨‍🎓 Student: dien226514@student.nctu.edu.vn / Huydien@123')

    def create_admin_user(self):
        if not User.objects.filter(email='admin@qlsv.com').exists():
            User.objects.create_superuser(
                email='admin@qlsv.com',
                password='admin123',
                first_name='Admin',
                last_name='System',
                role='admin',
                account_status='active',
                phone='0123456789'
            )
            self.stdout.write('✅ Admin user created')
        else:
            self.stdout.write('⚠️ Admin user already exists')

    def create_sample_users(self):
        # Tạo sample students
        students = [
            {
                'email': 'dien226514@student.nctu.edu.vn',
                'first_name': 'Nguyễn Huy',
                'last_name': 'Điển',
                'student_id': '226514',
                'role': 'student',
                'department': 'Công nghệ thông tin',
                'phone': '0987654321',
                'password': 'Huydien@123'
            },
            {
                'email': 'student2@student.nctu.edu.vn',
                'first_name': 'Nguyễn Văn',
                'last_name': 'A',
                'student_id': '226515',
                'role': 'student',
                'department': 'Công nghệ thông tin',
                'phone': '0987654322',
                'password': 'Student123'
            }
        ]
        
        for student_data in students:
            if not User.objects.filter(email=student_data['email']).exists():
                password = student_data.pop('password')
                # Set unique username to avoid conflicts
                student_data['username'] = student_data['email'].split('@')[0] + '_' + student_data['student_id']
                User.objects.create_user(
                    password=password,
                    **student_data
                )
                self.stdout.write(f'✅ Student {student_data["email"]} created')
        
        # Tạo sample teachers
        teachers = [
            {
                'email': 'teacher1@nctu.edu.vn',
                'first_name': 'Thầy',
                'last_name': 'Giáo viên',
                'teacher_id': 'GV0921',
                'role': 'teacher',
                'department': 'Công nghệ thông tin',
                'phone': '0987654323',
                'password': 'Teacher123'
            }
        ]
        
        for teacher_data in teachers:
            if not User.objects.filter(email=teacher_data['email']).exists():
                password = teacher_data.pop('password')
                # Set unique username to avoid conflicts
                teacher_data['username'] = teacher_data['email'].split('@')[0] + '_' + teacher_data['teacher_id']
                User.objects.create_user(
                    password=password,
                    **teacher_data
                )
                self.stdout.write(f'✅ Teacher {teacher_data["email"]} created')

    def create_sample_classes(self):
        if not Class.objects.exists():
            # Lấy teacher
            teacher = User.objects.filter(role='teacher').first()
            if teacher:
                classes = [
                    {
                        'class_id': 'IT001',
                        'class_name': 'Lập trình Web',
                        'description': 'Học lập trình web với React và Django',
                        'teacher': teacher,
                        'max_students': 30
                    },
                    {
                        'class_id': 'IT002',
                        'class_name': 'Cơ sở dữ liệu',
                        'description': 'Học MySQL, PostgreSQL',
                        'teacher': teacher,
                        'max_students': 25
                    }
                ]
                
                for class_data in classes:
                    class_obj = Class.objects.create(**class_data)
                    
                    # Thêm students vào class (sẽ tạo sau khi có Student model)
                    # students = User.objects.filter(role='student')
                    # class_obj.students.set(students)
                    
                    self.stdout.write(f'✅ Class {class_obj.class_name} created')

    def create_sample_grades(self):
        if not Grade.objects.exists():
            classes = Class.objects.all()
            students = User.objects.filter(role='student')
            
            for class_obj in classes:
                for student in students:
                    # Tạo sample grades
                    Grade.objects.create(
                        student=student,
                        class_obj=class_obj,
                        assignment_name='Bài tập 1',
                        score=8.5,
                        max_score=10.0,
                        weight=0.3
                    )
                    Grade.objects.create(
                        student=student,
                        class_obj=class_obj,
                        assignment_name='Bài tập 2',
                        score=9.0,
                        max_score=10.0,
                        weight=0.3
                    )
                    Grade.objects.create(
                        student=student,
                        class_obj=class_obj,
                        assignment_name='Thi cuối kỳ',
                        score=8.0,
                        max_score=10.0,
                        weight=0.4
                    )
            
            self.stdout.write('✅ Sample grades created')

    def create_sample_attendance(self):
        if not AttendanceSession.objects.exists():
            classes = Class.objects.all()
            
            for class_obj in classes:
                # Tạo attendance session
                session = AttendanceSession.objects.create(
                    class_obj=class_obj,
                    date=datetime.now().date(),
                    start_time=datetime.now().time(),
                    end_time=(datetime.now() + timedelta(hours=2)).time(),
                    room=class_obj.room,
                    qr_code='sample_qr_code_123'
                )
                
                self.stdout.write(f'✅ Attendance session for {class_obj.name} created')
