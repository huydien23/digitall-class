from django.db import models
from django.core.exceptions import ValidationError
import os
from apps.accounts.models import User
from apps.classes.models import Class

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip'}
MAX_FILE_SIZE_MB = 20
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024


class ClassMaterial(models.Model):
    """Learning material uploaded for a class (legacy class-scoped materials)."""
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


# ---------------------------
# Teacher-centric Materials
# ---------------------------

class Material(models.Model):
    """Centralized teacher material (repository-level)."""

    class MaterialType(models.TextChoices):
        LECTURE = 'lecture', 'Bài giảng'
        SYLLABUS = 'syllabus', 'Đề cương'
        EXAM = 'exam', 'Đề thi'
        ASSIGNMENT = 'assignment', 'Bài tập'
        REFERENCE = 'reference', 'Tài liệu tham khảo'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Nháp'
        PUBLISHED = 'published', 'Đã công bố'
        ARCHIVED = 'archived', 'Lưu trữ'

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=20, choices=MaterialType.choices, default=MaterialType.LECTURE)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='materials_repository')
    tags = models.CharField(max_length=255, blank=True, null=True, help_text='Comma-separated tags')
    allow_download = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    # Trash/soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Publication relationship (many classes)
    published_classes = models.ManyToManyField(
        Class, through='MaterialPublication', related_name='published_materials', blank=True
    )

    class Meta:
        db_table = 'materials'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['status']),
            models.Index(fields=['owner']),
            models.Index(fields=['is_deleted']),
            models.Index(fields=['created_at']),
            models.Index(fields=['updated_at']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"


class MaterialVersion(models.Model):
    """Versioned file for a Material."""
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to='materials/')
    version = models.PositiveIntegerField(default=1)
    change_note = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='material_versions_created')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'material_versions'
        ordering = ['-version']
        unique_together = [('material', 'version')]
        indexes = [
            models.Index(fields=['material']),
            models.Index(fields=['version']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.material.title} v{self.version}"

    def save(self, *args, **kwargs):
        # Auto-increment version on create if not explicitly set
        if not self.pk and (not self.version or self.version == 1):
            last = MaterialVersion.objects.filter(material=self.material).order_by('-version').first()
            self.version = (last.version + 1) if last else 1
        super().save(*args, **kwargs)


class MaterialPublication(models.Model):
    """Publication settings of a material for a class."""
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='publications')
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='material_publications')
    publish_start_at = models.DateTimeField(blank=True, null=True)
    publish_end_at = models.DateTimeField(blank=True, null=True)
    allow_download = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'material_publications'
        unique_together = [('material', 'class_obj')]
        indexes = [
            models.Index(fields=['class_obj']),
            models.Index(fields=['material']),
            models.Index(fields=['publish_start_at']),
            models.Index(fields=['publish_end_at']),
        ]

    def __str__(self):
        return f"{self.material.title} -> {self.class_obj.class_id}"
