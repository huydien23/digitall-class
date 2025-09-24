from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.validators import RegexValidator


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email là bắt buộc')
        
        email = self.normalize_email(email)
        # Generate username from email if not provided
        if 'username' not in extra_fields:
            extra_fields['username'] = email.split('@')[0]
            
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('account_status', 'active')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with role-based authentication"""
    
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Quản trị viên'
        TEACHER = 'teacher', 'Giảng viên'
        STUDENT = 'student', 'Sinh viên'
    
    class AccountStatus(models.TextChoices):
        ACTIVE = 'active', 'Hoạt động'
        PENDING = 'pending', 'Chờ phê duyệt'
        SUSPENDED = 'suspended', 'Tạm khóa'
        REJECTED = 'rejected', 'Từ chối'
    
    # Basic info
    email = models.EmailField(unique=True, verbose_name='Email')
    role = models.CharField(
        max_length=20, 
        choices=Role.choices, 
        default=Role.STUDENT,
        verbose_name='Vai trò'
    )
    account_status = models.CharField(
        max_length=20,
        choices=AccountStatus.choices,
        default=AccountStatus.ACTIVE,
        verbose_name='Trạng thái tài khoản'
    )
    
    # Contact info
    phone_validator = RegexValidator(
        regex=r'^(\+84|84|0)?[0-9]{9,10}$',
        message="Số điện thoại không hợp lệ. Vd: 0123456789"
    )
    phone = models.CharField(
        max_length=15, 
        validators=[phone_validator],
        blank=True, 
        null=True,
        verbose_name='Số điện thoại'
    )
    avatar = models.ImageField(
        upload_to='avatars/', 
        blank=True, 
        null=True,
        verbose_name='Ảnh đại diện'
    )
    
    # Student specific fields
    student_id = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        unique=True,
        verbose_name='Mã sinh viên'
    )
    
    # Teacher specific fields
    teacher_id = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        unique=True,
        verbose_name='Mã giảng viên'
    )
    department = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        verbose_name='Khoa/Phòng ban'
    )

    # Admin notes / status note
    status_note = models.TextField(
        blank=True,
        null=True,
        verbose_name='Ghi chú trạng thái'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')
    last_login_at = models.DateTimeField(blank=True, null=True, verbose_name='Đăng nhập cuối')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    objects = UserManager()
    
    class Meta:
        db_table = 'users'
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['account_status']),
            models.Index(fields=['student_id']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    def is_teacher(self):
        return self.role == self.Role.TEACHER
    
    def is_student(self):
        return self.role == self.Role.STUDENT
    
    def is_account_active(self):
        return self.account_status == self.AccountStatus.ACTIVE
    
    def can_login(self):
        return self.is_active and self.is_account_active()
    
    def save(self, *args, **kwargs):
        # Auto-generate username from email if not provided
        if not self.username:
            self.username = self.email.split('@')[0]
        
        # Set account status based on role
        if not self.pk:  # New user
            if self.role == self.Role.TEACHER:
                self.account_status = self.AccountStatus.PENDING
            else:
                self.account_status = self.AccountStatus.ACTIVE
                
        super().save(*args, **kwargs)
