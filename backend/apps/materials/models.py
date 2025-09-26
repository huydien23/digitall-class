from django.db import models
from apps.accounts.models import User
from apps.classes.models import Class


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

    @property
    def file_name(self):
        try:
            return self.file.name.split('/')[-1] if self.file else ''
        except Exception:
            return ''
