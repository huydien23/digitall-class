from django.contrib import admin
from .models import Class, ClassStudent


class ClassStudentInline(admin.TabularInline):
    model = ClassStudent
    extra = 0
    readonly_fields = ('enrolled_at',)


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('class_id', 'class_name', 'teacher', 'current_students_count', 'max_students', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'teacher')
    search_fields = ('class_id', 'class_name', 'description', 'teacher__first_name', 'teacher__last_name')
    ordering = ('class_id',)
    readonly_fields = ('created_at', 'updated_at', 'current_students_count')
    inlines = [ClassStudentInline]
    
    fieldsets = (
        ('Thông tin lớp học', {
            'fields': ('class_id', 'class_name', 'description', 'teacher')
        }),
        ('Cấu hình', {
            'fields': ('max_students', 'is_active')
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ClassStudent)
class ClassStudentAdmin(admin.ModelAdmin):
    list_display = ('class_obj', 'student', 'enrolled_at', 'is_active')
    list_filter = ('is_active', 'enrolled_at', 'class_obj')
    search_fields = ('class_obj__class_name', 'student__student_id', 'student__first_name', 'student__last_name')
    ordering = ('-enrolled_at',)
