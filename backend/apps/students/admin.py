from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'full_name', 'email', 'gender', 'date_of_birth', 'is_active', 'created_at')
    list_filter = ('gender', 'is_active', 'created_at')
    search_fields = ('student_id', 'first_name', 'last_name', 'email')
    ordering = ('student_id',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('student_id', 'first_name', 'last_name', 'email', 'phone')
        }),
        ('Thông tin cá nhân', {
            'fields': ('gender', 'date_of_birth', 'address', 'avatar')
        }),
        ('Trạng thái', {
            'fields': ('is_active',)
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
