from django.contrib import admin
from .models import AttendanceSession, Attendance, AttendanceSummary


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('session_name', 'class_obj', 'session_date', 'start_time', 'end_time', 'is_active', 'created_at')
    list_filter = ('is_active', 'session_date', 'created_at', 'class_obj')
    search_fields = ('session_name', 'description', 'class_obj__class_name', 'location')
    ordering = ('-session_date', '-start_time')
    readonly_fields = ('created_at', 'updated_at', 'qr_code')
    
    fieldsets = (
        ('Thông tin buổi điểm danh', {
            'fields': ('class_obj', 'session_name', 'description')
        }),
        ('Thời gian và địa điểm', {
            'fields': ('session_date', 'start_time', 'end_time', 'location')
        }),
        ('Cấu hình', {
            'fields': ('is_active', 'qr_code', 'created_by')
        }),
        ('Thời gian', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'status', 'check_in_time', 'created_at')
    list_filter = ('status', 'created_at', 'session__class_obj')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name', 'session__session_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Thông tin điểm danh', {
            'fields': ('session', 'student', 'status')
        }),
        ('Thời gian', {
            'fields': ('check_in_time', 'check_out_time')
        }),
        ('Ghi chú', {
            'fields': ('notes',)
        }),
        ('Thời gian tạo', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AttendanceSummary)
class AttendanceSummaryAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_obj', 'total_sessions', 'present_count', 'attendance_rate', 'updated_at')
    list_filter = ('updated_at', 'class_obj')
    search_fields = ('student__student_id', 'student__first_name', 'student__last_name', 'class_obj__class_name')
    ordering = ('-updated_at',)
    readonly_fields = ('updated_at',)
