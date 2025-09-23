from django.contrib import admin
from .models import Subject, Grade, GradeSummary


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('subject_id', 'subject_name', 'credits', 'is_active', 'created_at')
    list_filter = ('is_active', 'credits', 'created_at')
    search_fields = ('subject_id', 'subject_name', 'description')
    ordering = ('subject_id',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_obj', 'subject', 'grade_type', 'score', 'max_score', 'letter_grade', 'created_at')
    list_filter = ('grade_type', 'created_at', 'class_obj', 'subject')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name', 'class_obj__class_name', 'subject__subject_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'percentage', 'letter_grade')
    
    fieldsets = (
        ('Thông tin điểm', {
            'fields': ('student', 'class_obj', 'subject', 'grade_type')
        }),
        ('Điểm số', {
            'fields': ('score', 'max_score', 'percentage', 'letter_grade')
        }),
        ('Ghi chú', {
            'fields': ('comment', 'created_by')
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GradeSummary)
class GradeSummaryAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_obj', 'subject', 'final_grade', 'letter_grade', 'is_passed', 'updated_at')
    list_filter = ('is_passed', 'letter_grade', 'updated_at', 'class_obj', 'subject')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name', 'class_obj__class_name', 'subject__subject_name')
    ordering = ('-updated_at',)
    readonly_fields = ('updated_at',)
