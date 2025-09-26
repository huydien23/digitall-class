from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.accounts.models import User
from apps.students.models import Student
from apps.classes.models import Class


class Subject(models.Model):
    """Subject model"""
    subject_id = models.CharField(max_length=20, unique=True)
    subject_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    credits = models.PositiveIntegerField(default=3)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subjects'
        verbose_name = 'Môn học'
        verbose_name_plural = 'Môn học'
        ordering = ['subject_id']
    
    def __str__(self):
        return f"{self.subject_id} - {self.subject_name}"


class Grade(models.Model):
    """Grade model"""
    GRADE_TYPE_CHOICES = [
        ('regular', 'Thường xuyên'),
        ('midterm', 'Giữa kỳ'),
        ('final', 'Cuối kỳ'),
        ('assignment', 'Bài tập'),
        ('quiz', 'Kiểm tra'),
        ('other', 'Khác'),
    ]
    COMPONENT_CHOICES = [
        ('lecture', 'Lý thuyết'),
        ('practice', 'Thực hành'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='grades')
    grade_type = models.CharField(max_length=20, choices=GRADE_TYPE_CHOICES)
    component = models.CharField(max_length=20, choices=COMPONENT_CHOICES, blank=True, null=True)
    score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    max_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        default=10.00,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    comment = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_grades')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'grades'
        verbose_name = 'Điểm số'
        verbose_name_plural = 'Điểm số'
        unique_together = ['student', 'class_obj', 'subject', 'grade_type']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.student_id} - {self.subject.subject_name} - {self.get_grade_type_display()}: {self.score}"
    
    @property
    def percentage(self):
        """Calculate percentage score"""
        if self.max_score > 0:
            return round((self.score / self.max_score) * 100, 2)
        return 0
    
    @property
    def letter_grade(self):
        """Convert score to letter grade"""
        percentage = self.percentage
        if percentage >= 90:
            return 'A+'
        elif percentage >= 85:
            return 'A'
        elif percentage >= 80:
            return 'B+'
        elif percentage >= 75:
            return 'B'
        elif percentage >= 70:
            return 'C+'
        elif percentage >= 65:
            return 'C'
        elif percentage >= 60:
            return 'D+'
        elif percentage >= 55:
            return 'D'
        else:
            return 'F'


class GradeSummary(models.Model):
    """Grade summary for each student in each class"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grade_summaries')
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='grade_summaries')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='grade_summaries')
    midterm_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    assignment_avg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    quiz_avg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    final_grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    letter_grade = models.CharField(max_length=2, blank=True, null=True)
    is_passed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'grade_summaries'
        verbose_name = 'Tổng kết điểm'
        verbose_name_plural = 'Tổng kết điểm'
        unique_together = ['student', 'class_obj', 'subject']
    
    def __str__(self):
        return f"{self.student.student_id} - {self.subject.subject_name}: {self.final_grade}"
