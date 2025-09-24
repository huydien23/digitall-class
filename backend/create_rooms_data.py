#!/usr/bin/env python
"""
Script để tạo dữ liệu mẫu cho các khu và phòng học
Dựa trên cấu trúc thực tế của trường
"""

import os
import sys
import django
from datetime import datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.rooms.models import Building, Room


def create_buildings():
    """Tạo các khu"""
    print("🏢 Đang tạo các khu...")
    
    buildings_data = [
        {
            'building_id': 'D',
            'building_name': 'Khu D',
            'building_type': 'academic',
            'description': 'Khu học tập chính với 4 tầng',
            'floors': 4,
            'address': 'Tòa nhà D - Khu học tập chính'
        },
        {
            'building_id': 'T',
            'building_name': 'Khu T (Thư viện)',
            'building_type': 'library',
            'description': 'Khu thư viện với các phòng học',
            'floors': 4,
            'address': 'Tòa nhà T - Khu thư viện'
        },
        {
            'building_id': 'I',
            'building_name': 'Khu I (IT)',
            'building_type': 'it',
            'description': 'Khu công nghệ thông tin với 7 tầng',
            'floors': 7,
            'address': 'Tòa nhà I - Khu công nghệ thông tin'
        }
    ]
    
    created_count = 0
    for building_data in buildings_data:
        building, created = Building.objects.get_or_create(
            building_id=building_data['building_id'],
            defaults=building_data
        )
        if created:
            created_count += 1
            print(f"  ✅ Tạo khu: {building.building_name}")
        else:
            print(f"  ⚠️  Khu đã tồn tại: {building.building_name}")
    
    print(f"📊 Tạo {created_count} khu mới")
    return created_count


def create_rooms():
    """Tạo các phòng học"""
    print("🏫 Đang tạo các phòng học...")
    
    # Lấy các khu
    building_d = Building.objects.get(building_id='D')
    building_t = Building.objects.get(building_id='T')
    building_i = Building.objects.get(building_id='I')
    
    rooms_data = []
    
    # Khu D - 4 tầng
    for floor in range(1, 5):
        if floor == 4:
            # Tầng 4 chỉ có 1 phòng hội trường
            rooms_data.append({
                'room_id': f'D{floor}-01',
                'room_name': f'D{floor}-01',
                'building': building_d,
                'floor': floor,
                'room_type': 'hall',
                'capacity': 400,
                'description': 'Hội trường lớn'
            })
        else:
            # Các tầng khác có 8 phòng
            for room_num in range(1, 9):
                rooms_data.append({
                    'room_id': f'D{floor}-{room_num:02d}',
                    'room_name': f'D{floor}-{room_num:02d}',
                    'building': building_d,
                    'floor': floor,
                    'room_type': 'lecture',
                    'capacity': 60,
                    'description': f'Phòng lý thuyết tầng {floor}'
                })
    
    # Khu T (Thư viện) - Tầng 1 và 4
    for floor in [1, 4]:
        if floor == 1:
            # Tầng 1 có 6 phòng
            for room_num in range(1, 7):
                rooms_data.append({
                    'room_id': f'T{floor}-{room_num:02d}',
                    'room_name': f'T{floor}-{room_num:02d}',
                    'building': building_t,
                    'floor': floor,
                    'room_type': 'lecture',
                    'capacity': 60,
                    'description': f'Phòng lý thuyết tầng {floor}'
                })
        else:
            # Tầng 4 có 8 phòng
            for room_num in range(1, 9):
                rooms_data.append({
                    'room_id': f'T{floor}-{room_num:02d}',
                    'room_name': f'T{floor}-{room_num:02d}',
                    'building': building_t,
                    'floor': floor,
                    'room_type': 'lecture',
                    'capacity': 60,
                    'description': f'Phòng lý thuyết tầng {floor}'
                })
    
    # Khu I (IT) - 7 tầng (từ tầng 2 đến 7)
    for floor in range(2, 8):
        if floor == 7:
            # Tầng 7 chỉ có 2 phòng
            for room_num in range(1, 3):
                rooms_data.append({
                    'room_id': f'I{floor}-{room_num:02d}',
                    'room_name': f'I{floor}-{room_num:02d}',
                    'building': building_i,
                    'floor': floor,
                    'room_type': 'lecture',
                    'capacity': 60,
                    'description': f'Phòng học đường tầng {floor}'
                })
        else:
            # Các tầng khác có 6 phòng
            room_type = 'practice' if floor in [3, 4, 5] else 'lecture'
            for room_num in range(1, 7):
                rooms_data.append({
                    'room_id': f'I{floor}-{room_num:02d}',
                    'room_name': f'I{floor}-{room_num:02d}',
                    'building': building_i,
                    'floor': floor,
                    'room_type': room_type,
                    'capacity': 60,
                    'description': f'Phòng {room_type} tầng {floor}'
                })
    
    # Tạo các phòng
    created_count = 0
    for room_data in rooms_data:
        room, created = Room.objects.get_or_create(
            room_id=room_data['room_id'],
            defaults=room_data
        )
        if created:
            created_count += 1
            print(f"  ✅ Tạo phòng: {room.room_name}")
        else:
            print(f"  ⚠️  Phòng đã tồn tại: {room.room_name}")
    
    print(f"📊 Tạo {created_count} phòng mới")
    return created_count


def main():
    """Tạo tất cả dữ liệu mẫu"""
    print("🚀 Bắt đầu tạo dữ liệu mẫu cho khu và phòng học...")
    
    try:
        buildings_count = create_buildings()
        rooms_count = create_rooms()
    except Exception as e:
        print(f"❌ Lỗi: {e}")
        return
    
    print("\n✅ Hoàn thành!")
    print(f"📊 Tổng kết:")
    print(f"  - Khu mới: {buildings_count}")
    print(f"  - Phòng mới: {rooms_count}")
    print(f"  - Tổng khu: {Building.objects.count()}")
    print(f"  - Tổng phòng: {Room.objects.count()}")


if __name__ == '__main__':
    main()
