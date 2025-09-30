from django.db import models
from apps.accounts.models import User
from apps.students.models import Student


class AcademicYear(models.Model):
    """Năm học, ví dụ: 2024-2025"""
    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=32)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'academic_years'
        ordering = ['-code']

    def __str__(self):
        return self.name or self.code


class Term(models.Model):
    """Học kỳ thuộc một năm học. Trường có 3 kỳ: HK1, HK2, HK3"""
    class Season(models.TextChoices):
        HK1 = 'hk1', 'HK1'
        HK2 = 'hk2', 'HK2'
        HK3 = 'hk3', 'HK3'

    year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='terms')
    season = models.CharField(max_length=8, choices=Season.choices)
    name = models.CharField(max_length=64)
    is_current = models.BooleanField(default=False)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'terms'
        unique_together = [('year', 'season')]
        indexes = [models.Index(fields=['year', 'season', 'is_current'])]

    def __str__(self):
        return self.name


class Subject(models.Model):
    """Môn học chuẩn hóa để tránh trùng lặp giữa các lớp và năm học"""
    code = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=128)
    credits = models.PositiveSmallIntegerField(default=3)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'subjects'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Class(models.Model):
    """Class model"""
    class ClassMode(models.TextChoices):
        LECTURE_ONLY = 'lecture_only', 'Lý thuyết'
        PRACTICE_ONLY = 'practice_only', 'Thực hành'
        LECTURE_PRACTICE = 'lecture_practice', 'Lý thuyết + Thực hành'

    class_id = models.CharField(max_length=20, unique=True)
    class_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='classes')
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT, related_name='classes', null=True, blank=True)
    term = models.ForeignKey(Term, on_delete=models.PROTECT, related_name='classes', null=True, blank=True)
    max_students = models.PositiveIntegerField(default=50)
    class_mode = models.CharField(
        max_length=32,
        choices=ClassMode.choices,
        default=ClassMode.LECTURE_ONLY,
        verbose_name='Học phần'
    )
    is_active = models.BooleanField(default=True)
    # New flags for class enrollment/attendance flows
    restrict_to_roster_emails = models.BooleanField(default=False, help_text='Chỉ cho phép email có trong roster tham gia lớp')
    allow_auto_enroll_on_attendance_qr = models.BooleanField(default=True, help_text='Tự động ghi danh khi SV quét QR điểm danh nếu email hợp lệ')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'classes'
        verbose_name = 'Lớp học'
        verbose_name_plural = 'Lớp học'
        ordering = ['class_id']
        indexes = [
            models.Index(fields=['class_id']),
            models.Index(fields=['teacher']),
            models.Index(fields=['teacher', 'term']),
            models.Index(fields=['subject', 'term']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
            models.Index(fields=['class_mode']),
        ]
    
    def __str__(self):
        return f"{self.class_id} - {self.class_name}"
    
    @property
    def current_students_count(self):
        return self.class_students.filter(is_active=True).count()
    
    @property
    def is_full(self):
        return self.current_students_count >= self.max_students


class ClassStudent(models.Model):
    """Many-to-many relationship between Class and Student"""
    class Status(models.TextChoices):
        INVITED = 'invited', 'Được mời'
        ACTIVE = 'active', 'Đang tham gia'
        REMOVED = 'removed', 'Đã rời lớp'

    class Source(models.TextChoices):
        IMPORT = 'import', 'Import'
        JOIN_CODE = 'join_code', 'Mã tham gia'
        QR = 'qr', 'Quét QR'
        ADMIN = 'admin', 'Quản trị'
        MANUAL = 'manual', 'Thủ công'

    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='class_students')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='class_students')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    # New fields for richer roster status
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    joined_at = models.DateTimeField(blank=True, null=True)
    source = models.CharField(max_length=16, choices=Source.choices, default=Source.MANUAL)
    
    class Meta:
        db_table = 'class_students'
        verbose_name = 'Sinh viên trong lớp'
        verbose_name_plural = 'Sinh viên trong lớp'
        unique_together = ['class_obj', 'student']
        indexes = [
            models.Index(fields=['class_obj']),
            models.Index(fields=['student']),
            models.Index(fields=['is_active']),
            models.Index(fields=['enrolled_at']),
        ]
    
    def __str__(self):
        return f"{self.class_obj.class_id} - {self.student.student_id}"


class ClassJoinToken(models.Model):
    """Join token for students to join a class via link/QR"""
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='join_tokens')
    token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    max_uses = models.PositiveIntegerField(default=0, help_text='0 = unlimited')
    use_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_join_tokens')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'class_join_tokens'
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['class_obj']),
            models.Index(fields=['is_active'])
        ]

    def __str__(self):
        return f"JoinToken({self.class_obj.class_id})"

    def can_use(self):
        from django.utils import timezone
        if not self.is_active:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        if self.max_uses and self.use_count >= self.max_uses:
            return False
        return True
