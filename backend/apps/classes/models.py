from django.db import models
from apps.accounts.models import User
from apps.students.models import Student


class Class(models.Model):
    """Class model"""
    class_id = models.CharField(max_length=20, unique=True)
    class_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='classes')
    max_students = models.PositiveIntegerField(default=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'classes'
        verbose_name = 'Lớp học'
        verbose_name_plural = 'Lớp học'
        ordering = ['class_id']
    
    def __str__(self):
        return f"{self.class_id} - {self.class_name}"
    
    @property
    def current_students_count(self):
        return self.students.count()
    
    @property
    def is_full(self):
        return self.current_students_count >= self.max_students


class ClassStudent(models.Model):
    """Many-to-many relationship between Class and Student"""
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='class_students')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='class_students')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'class_students'
        verbose_name = 'Sinh viên trong lớp'
        verbose_name_plural = 'Sinh viên trong lớp'
        unique_together = ['class_obj', 'student']
    
    def __str__(self):
        return f"{self.class_obj.class_id} - {self.student.student_id}"
