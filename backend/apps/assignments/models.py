from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.classes.models import Class
from apps.attendance.models import AttendanceSession
from apps.students.models import Student


class Assignment(models.Model):
    class Type(models.TextChoices):
        ASSIGNMENT = 'assignment', 'Bài tập'
        EXAM = 'exam', 'Bài thi'

    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='assignments')
    session = models.ForeignKey(AttendanceSession, on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments')

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.ASSIGNMENT)

    attachment = models.FileField(upload_to='assignment_attachments/%Y/%m/', blank=True, null=True)

    release_at = models.DateTimeField(blank=True, null=True)
    due_at = models.DateTimeField(blank=True, null=True)
    time_limit_minutes = models.PositiveIntegerField(blank=True, null=True)

    allowed_file_types = models.CharField(max_length=200, blank=True, null=True, help_text='vd: pdf,doc,docx,zip')
    max_file_size_mb = models.PositiveIntegerField(default=20)

    is_published = models.BooleanField(default=True)
    points_max = models.DecimalField(max_digits=6, decimal_places=2, default=10)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_assignments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignments'
        ordering = ['-release_at', '-created_at']
        indexes = [
            models.Index(fields=['class_obj']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.class_obj.class_id} - {self.title}"

    @property
    def is_open(self):
        now = timezone.now()
        if self.release_at and now < self.release_at:
            return False
        if self.due_at and now > self.due_at:
            return False
        return True


class AssignmentSubmission(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Đang làm'
        SUBMITTED = 'submitted', 'Đã nộp'
        LATE = 'late', 'Nộp trễ'
        GRADED = 'graded', 'Đã chấm'
        AUTO_CLOSED = 'auto_closed', 'Đã khóa'

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assignment_submissions')

    attempt_number = models.PositiveIntegerField(default=1)
    started_at = models.DateTimeField(blank=True, null=True)
    personal_due_at = models.DateTimeField(blank=True, null=True)

    uploaded_at = models.DateTimeField(blank=True, null=True)
    file = models.FileField(upload_to='assignment_submissions/%Y/%m/', blank=True, null=True)
    file_size = models.PositiveIntegerField(default=0)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_late = models.BooleanField(default=False)

    grade = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)
    graded_at = models.DateTimeField(blank=True, null=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignment_submissions'
        unique_together = ['assignment', 'student', 'attempt_number']
        ordering = ['-uploaded_at', '-created_at']
        indexes = [
            models.Index(fields=['assignment']),
            models.Index(fields=['student']),
        ]

    def __str__(self):
        return f"{self.assignment_id}-{self.student_id}-#{self.attempt_number}"

    def compute_late(self):
        now = timezone.now()
        due = self.personal_due_at or self.assignment.due_at
        if due and now > due:
            self.is_late = True
            if self.status == self.Status.SUBMITTED:
                self.status = self.Status.LATE
        else:
            self.is_late = False
