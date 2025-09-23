from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.accounts.models import User
from apps.students.models import Student
from apps.classes.models import Class


class AttendanceSession(models.Model):
    """Attendance session model"""
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='attendance_sessions')
    session_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    session_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=200, blank=True, null=True)
    qr_code = models.CharField(max_length=100, unique=True, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_sessions', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attendance_sessions'
        verbose_name = 'Buổi điểm danh'
        verbose_name_plural = 'Buổi điểm danh'
        ordering = ['-session_date', '-start_time']
    
    def __str__(self):
        return f"{self.class_obj.class_id} - {self.session_name} ({self.session_date})"


class Attendance(models.Model):
    """Attendance model"""
    STATUS_CHOICES = [
        ('present', 'Có mặt'),
        ('absent', 'Vắng mặt'),
        ('late', 'Đi muộn'),
        ('excused', 'Có phép'),
    ]
    
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='attendances')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='absent')
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attendances'
        verbose_name = 'Điểm danh'
        verbose_name_plural = 'Điểm danh'
        unique_together = ['session', 'student']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.student_id} - {self.session.session_name}: {self.get_status_display()}"
    
    @property
    def is_late(self):
        """Check if student is late"""
        if self.check_in_time and self.session.start_time:
            return self.check_in_time.time() > self.session.start_time
        return False


class AttendanceSummary(models.Model):
    """Attendance summary for each student in each class"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_summaries')
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='attendance_summaries')
    total_sessions = models.PositiveIntegerField(default=0)
    present_count = models.PositiveIntegerField(default=0)
    absent_count = models.PositiveIntegerField(default=0)
    late_count = models.PositiveIntegerField(default=0)
    excused_count = models.PositiveIntegerField(default=0)
    attendance_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'attendance_summaries'
        verbose_name = 'Tổng kết điểm danh'
        verbose_name_plural = 'Tổng kết điểm danh'
        unique_together = ['student', 'class_obj']
    
    def __str__(self):
        return f"{self.student.student_id} - {self.class_obj.class_id}: {self.attendance_rate}%"
    
    def calculate_attendance_rate(self):
        """Calculate attendance rate"""
        if self.total_sessions > 0:
            present_and_excused = self.present_count + self.excused_count
            self.attendance_rate = round((present_and_excused / self.total_sessions) * 100, 2)
        else:
            self.attendance_rate = 0.00
        self.save()
