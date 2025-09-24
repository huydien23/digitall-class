from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Building(models.Model):
    """Building model - Quản lý các khu"""
    
    class BuildingType(models.TextChoices):
        ACADEMIC = 'academic', 'Học tập'
        LIBRARY = 'library', 'Thư viện'
        IT = 'it', 'Công nghệ thông tin'
        ADMIN = 'admin', 'Hành chính'
        LAB = 'lab', 'Phòng thí nghiệm'
    
    building_id = models.CharField(max_length=20, unique=True, verbose_name='Mã khu')
    building_name = models.CharField(max_length=100, verbose_name='Tên khu')
    building_type = models.CharField(
        max_length=20, 
        choices=BuildingType.choices, 
        default=BuildingType.ACADEMIC,
        verbose_name='Loại khu'
    )
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả')
    address = models.TextField(blank=True, null=True, verbose_name='Địa chỉ')
    floors = models.PositiveIntegerField(
        default=1, 
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        verbose_name='Số tầng'
    )
    is_active = models.BooleanField(default=True, verbose_name='Hoạt động')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'buildings'
        verbose_name = 'Khu'
        verbose_name_plural = 'Các khu'
        ordering = ['building_id']
    
    def __str__(self):
        return f"{self.building_id} - {self.building_name}"
    
    @property
    def total_rooms(self):
        return self.rooms.count()
    
    @property
    def available_rooms(self):
        return self.rooms.filter(status='available').count()


class Room(models.Model):
    """Room model - Quản lý các phòng học"""
    
    class RoomType(models.TextChoices):
        LECTURE = 'lecture', 'Phòng lý thuyết'
        PRACTICE = 'practice', 'Phòng thực hành'
        LAB = 'lab', 'Phòng thí nghiệm'
        HALL = 'hall', 'Hội trường'
        LIBRARY = 'library', 'Thư viện'
        COMPUTER = 'computer', 'Phòng máy tính'
        MEETING = 'meeting', 'Phòng họp'
        OFFICE = 'office', 'Văn phòng'
    
    class RoomStatus(models.TextChoices):
        AVAILABLE = 'available', 'Trống'
        OCCUPIED = 'occupied', 'Đang sử dụng'
        MAINTENANCE = 'maintenance', 'Bảo trì'
        RESERVED = 'reserved', 'Đã đặt'
        CLOSED = 'closed', 'Đóng cửa'
    
    room_id = models.CharField(max_length=20, unique=True, verbose_name='Mã phòng')
    room_name = models.CharField(max_length=100, verbose_name='Tên phòng')
    building = models.ForeignKey(
        Building, 
        on_delete=models.CASCADE, 
        related_name='rooms',
        verbose_name='Khu'
    )
    floor = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        verbose_name='Tầng'
    )
    room_type = models.CharField(
        max_length=20,
        choices=RoomType.choices,
        default=RoomType.LECTURE,
        verbose_name='Loại phòng'
    )
    capacity = models.PositiveIntegerField(
        default=60,
        validators=[MinValueValidator(1), MaxValueValidator(1000)],
        verbose_name='Sức chứa'
    )
    area = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        blank=True, 
        null=True,
        verbose_name='Diện tích (m²)'
    )
    equipment = models.TextField(blank=True, null=True, verbose_name='Thiết bị')
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả')
    status = models.CharField(
        max_length=20,
        choices=RoomStatus.choices,
        default=RoomStatus.AVAILABLE,
        verbose_name='Trạng thái'
    )
    is_active = models.BooleanField(default=True, verbose_name='Hoạt động')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rooms'
        verbose_name = 'Phòng học'
        verbose_name_plural = 'Các phòng học'
        ordering = ['building', 'floor', 'room_id']
        unique_together = ['building', 'room_name']
    
    def __str__(self):
        return f"{self.room_name} - {self.building.building_name}"
    
    @property
    def full_name(self):
        return f"{self.room_name} ({self.building.building_name})"
    
    @property
    def is_available(self):
        return self.status == self.RoomStatus.AVAILABLE
    
    @property
    def is_occupied(self):
        return self.status == self.RoomStatus.OCCUPIED


class RoomSchedule(models.Model):
    """Room schedule model - Lịch sử dụng phòng"""
    
    room = models.ForeignKey(
        Room, 
        on_delete=models.CASCADE, 
        related_name='schedules',
        verbose_name='Phòng'
    )
    title = models.CharField(max_length=200, verbose_name='Tiêu đề')
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả')
    start_date = models.DateField(verbose_name='Ngày bắt đầu')
    end_date = models.DateField(verbose_name='Ngày kết thúc')
    start_time = models.TimeField(verbose_name='Giờ bắt đầu')
    end_time = models.TimeField(verbose_name='Giờ kết thúc')
    is_recurring = models.BooleanField(default=False, verbose_name='Lặp lại')
    recurring_days = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        verbose_name='Ngày lặp lại'
    )
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='created_schedules',
        verbose_name='Người tạo'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'room_schedules'
        verbose_name = 'Lịch phòng'
        verbose_name_plural = 'Lịch các phòng'
        ordering = ['start_date', 'start_time']
    
    def __str__(self):
        return f"{self.room.room_name} - {self.title} ({self.start_date})"
