from django.db import models
from django.core.exceptions import ValidationError
import os
from apps.accounts.models import User
from apps.classes.models import Class

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip'}
MAX_FILE_SIZE_MB = 20
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024


class ClassMaterial(models.Model):
    """Learning material uploaded for a class"""
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='class_materials/', blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_materials')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'class_materials'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['class_obj']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.class_obj.class_id} - {self.title}"

    def clean(self):
        # Ensure at least one of file or link is provided
        if not self.file and not self.link:
            raise ValidationError({'file': 'Cần chọn file hoặc nhập link.', 'link': 'Cần chọn file hoặc nhập link.'})
        # Validate file extension and size if file is provided
        if self.file:
            ext = os.path.splitext(self.file.name)[1].lower().lstrip('.')
            if ext not in ALLOWED_EXTENSIONS:
                allowed = ', '.join(sorted(ALLOWED_EXTENSIONS))
                raise ValidationError({'file': f'Định dạng không hợp lệ. Cho phép: {allowed}.'})
            size = getattr(self.file, 'size', 0)
            if size and size > MAX_FILE_SIZE:
                raise ValidationError({'file': f'File quá lớn (>{MAX_FILE_SIZE_MB}MB). Vui lòng nén hoặc chia nhỏ.'})
        return super().clean()

    @property
    def file_name(self):
        try:
            return os.path.basename(self.file.name) if self.file else ''
        except Exception:
            return ''
