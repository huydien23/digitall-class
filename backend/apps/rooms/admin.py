from django.contrib import admin
from .models import Building, Room, RoomSchedule


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ('building_id', 'building_name', 'building_type', 'floors', 'total_rooms', 'is_active')
    list_filter = ('building_type', 'is_active', 'created_at')
    search_fields = ('building_id', 'building_name', 'description')
    ordering = ('building_id',)
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('building_id', 'building_name', 'building_type', 'description')
        }),
        ('Địa chỉ', {
            'fields': ('address',)
        }),
        ('Cấu hình', {
            'fields': ('floors', 'is_active')
        }),
    )


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_id', 'room_name', 'building', 'floor', 'room_type', 'capacity', 'status', 'is_active')
    list_filter = ('building', 'room_type', 'status', 'floor', 'is_active', 'created_at')
    search_fields = ('room_id', 'room_name', 'building__building_name', 'description')
    ordering = ('building', 'floor', 'room_id')
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('room_id', 'room_name', 'building', 'floor', 'room_type')
        }),
        ('Cấu hình', {
            'fields': ('capacity', 'area', 'equipment', 'description')
        }),
        ('Trạng thái', {
            'fields': ('status', 'is_active')
        }),
    )


@admin.register(RoomSchedule)
class RoomScheduleAdmin(admin.ModelAdmin):
    list_display = ('room', 'title', 'start_date', 'end_date', 'start_time', 'end_time', 'created_by')
    list_filter = ('room__building', 'room', 'start_date', 'is_recurring', 'created_at')
    search_fields = ('title', 'room__room_name', 'description')
    ordering = ('start_date', 'start_time')
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('room', 'title', 'description')
        }),
        ('Thời gian', {
            'fields': ('start_date', 'end_date', 'start_time', 'end_time')
        }),
        ('Lặp lại', {
            'fields': ('is_recurring', 'recurring_days')
        }),
        ('Người tạo', {
            'fields': ('created_by',)
        }),
    )
