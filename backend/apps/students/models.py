from django.db import models
from django.core.validators import RegexValidator
from apps.accounts.models import User


class Student(models.Model):
    """Student model"""
    GENDER_CHOICES = [
        ('male', 'Nam'),
        ('female', 'Nữ'),
        ('other', 'Khác'),
    ]
    
    # Relationship with User account
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile',
        blank=True,
        null=True,
        verbose_name='Tài khoản người dùng'
    )
    
    student_id = models.CharField(
        max_length=20, 
        unique=True,
        validators=[RegexValidator(
            regex=r'^[A-Z0-9]+$',
            message='Mã sinh viên chỉ được chứa chữ hoa và số'
        )]
    )
    # In this project, first_name is the given name ("Tên"), last_name is the family + middle ("Họ đệm")
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    address = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='student_avatars/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'students'
        verbose_name = 'Sinh viên'
        verbose_name_plural = 'Sinh viên'
        ordering = ['student_id']
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['email']),
            models.Index(fields=['last_name', 'first_name']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.student_id} - {self.full_name}"
    
    @property
    def full_name(self):
        # Keep display consistent with Vietnamese name order: "Họ đệm" + "Tên"
        return f"{self.last_name} {self.first_name}".strip()
    
    @property
    def age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
