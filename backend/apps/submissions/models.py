from django.db import models
from django.core.exceptions import ValidationError
import os

from apps.accounts.models import User
from apps.classes.models import Class, ClassStudent
from apps.students.models import Student

SUBMISSION_ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip'}
SUBMISSION_MAX_FILE_SIZE_MB = 20
SUBMISSION_MAX_FILE_SIZE = SUBMISSION_MAX_FILE_SIZE_MB * 1024 * 1024


def submission_upload_path(instance, filename):
    # Organize by class and student codes for easier browsing
    base = os.path.basename(filename)
    return f"submissions/{instance.class_obj.class_id}/{instance.student.student_id}/{base}"


class Submission(models.Model):
    """Student submission for a class"""
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='submissions')
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to=submission_upload_path)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_submissions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'submissions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['class_obj']),
            models.Index(fields=['student']),
            models.Index(fields=['created_at']),
        ]
        unique_together = []  # allow multiple submissions per student/class

    def __str__(self):
        return f"{self.class_obj.class_id} - {self.student.student_id} - {self.file_name or self.title or 'submission'}"

    @property
    def file_name(self):
        try:
            return os.path.basename(self.file.name) if self.file else ''
        except Exception:
            return ''

    def clean(self):
        # Validate file extension and size
        if not self.file:
            raise ValidationError({'file': 'Cần chọn file để nộp.'})
        ext = os.path.splitext(self.file.name)[1].lower().lstrip('.')
        if ext not in SUBMISSION_ALLOWED_EXTENSIONS:
            allowed = ', '.join(sorted(SUBMISSION_ALLOWED_EXTENSIONS))
            raise ValidationError({'file': f'Định dạng không hợp lệ. Cho phép: {allowed}.'})
        size = getattr(self.file, 'size', 0)
        if size and size > SUBMISSION_MAX_FILE_SIZE:
            raise ValidationError({'file': f'File quá lớn (>{SUBMISSION_MAX_FILE_SIZE_MB}MB). Vui lòng nén hoặc chia nhỏ.'})
        return super().clean()
