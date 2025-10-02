import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from django.db import transaction
from apps.classes.models import Class, ClassStudent
from apps.attendance.models import AttendanceSession, Attendance, AttendanceSummary
from apps.grades.models import Grade, GradeSummary
from apps.materials.models import ClassMaterial, MaterialPublication
from apps.assignments.models import Assignment, AssignmentSubmission
from apps.students.models import Student
from apps.accounts.models import User

print("=" * 70)
print("XÓA DỮ LIỆU LỚP HỌC VÀ SINH VIÊN – AN TOÀN")
print("=" * 70)

confirm = input("Bạn có chắc muốn xóa TẤT CẢ lớp học và TẤT CẢ sinh viên? gõ YES để xác nhận: ")
if confirm.strip().upper() != 'YES':
    print("Huỷ thao tác.")
    raise SystemExit(0)

with transaction.atomic():
    # 1) Xóa dữ liệu liên quan tới lớp học trước (để tránh FK)
    print("\nĐang xoá dữ liệu liên quan tới lớp học...")

    # Assignments & submissions
    cnt = AssignmentSubmission.objects.count()
    AssignmentSubmission.objects.all().delete()
    print(f"- Xoá AssignmentSubmission: {cnt}")

    cnt = Assignment.objects.count()
    Assignment.objects.all().delete()
    print(f"- Xoá Assignment: {cnt}")

    # Materials
    cnt = MaterialPublication.objects.count()
    MaterialPublication.objects.all().delete()
    print(f"- Xoá MaterialPublication: {cnt}")

    cnt = ClassMaterial.objects.count()
    ClassMaterial.objects.all().delete()
    print(f"- Xoá ClassMaterial: {cnt}")

    # Attendance
    cnt = Attendance.objects.count()
    Attendance.objects.all().delete()
    print(f"- Xoá Attendance: {cnt}")

    cnt = AttendanceSession.objects.count()
    AttendanceSession.objects.all().delete()
    print(f"- Xoá AttendanceSession: {cnt}")

    cnt = AttendanceSummary.objects.count()
    AttendanceSummary.objects.all().delete()
    print(f"- Xoá AttendanceSummary: {cnt}")

    # Grades
    cnt = Grade.objects.count()
    Grade.objects.all().delete()
    print(f"- Xoá Grade: {cnt}")

    cnt = GradeSummary.objects.count()
    GradeSummary.objects.all().delete()
    print(f"- Xoá GradeSummary: {cnt}")

    # Class roster relations
    cnt = ClassStudent.objects.count()
    ClassStudent.objects.all().delete()
    print(f"- Xoá ClassStudent: {cnt}")

    # Cuối cùng xoá toàn bộ lớp
    cnt = Class.objects.count()
    Class.objects.all().delete()
    print(f"- Xoá Class: {cnt}")

    # 2) Xoá toàn bộ sinh viên và tài khoản student
    print("\nĐang xoá SINH VIÊN...")
    # Xoá Student sẽ CASCADE sang nhiều bảng đã xoá ở trên, nên an toàn
    cnt = Student.objects.count()
    # Thu thập user id trước khi xoá Student (nếu có liên kết)
    user_ids = list(Student.objects.exclude(user__isnull=True).values_list('user_id', flat=True))
    Student.objects.all().delete()
    print(f"- Xoá Student: {cnt}")

    # Xoá tài khoản User có role=student (kể cả không link Student)
    student_users = User.objects.filter(role='student')
    cnt = student_users.count()
    student_users.delete()
    print(f"- Xoá User(role=student): {cnt}")

print("\n✅ Hoàn tất xoá dữ liệu lớp học và sinh viên.")
