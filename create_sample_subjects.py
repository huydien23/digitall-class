#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import Subject
from apps.accounts.models import User

print("=== TẠO MÔN HỌC MẪU ===")
print()

# Lấy user để làm created_by
user = User.objects.first()

# Danh sách môn học mẫu (theo chương trình đại học công nghệ thông tin)
sample_subjects = [
    # Cơ sở
    {"code": "CS101", "name": "Nhập môn Lập trình", "credits": 3, "description": "Học lập trình cơ bản với Python"},
    {"code": "CS102", "name": "Cấu trúc Dữ liệu và Giải thuật", "credits": 3, "description": "Các cấu trúc dữ liệu và giải thuật cơ bản"},
    {"code": "CS103", "name": "Lập trình Hướng đối tượng", "credits": 3, "description": "OOP với Java/C#"},
    {"code": "CS201", "name": "Cơ sở Dữ liệu", "credits": 3, "description": "Thiết kế và quản lý cơ sở dữ liệu"},
    {"code": "CS202", "name": "Mạng Máy tính", "credits": 3, "description": "Nguyên lý và giao thức mạng"},
    {"code": "CS203", "name": "Hệ điều hành", "credits": 3, "description": "Nguyên lý hoạt động của hệ điều hành"},
    
    # Web & Mobile
    {"code": "WEB301", "name": "Lập trình Web", "credits": 4, "description": "HTML, CSS, JavaScript, PHP/Django"},
    {"code": "WEB302", "name": "Phát triển Web nâng cao", "credits": 4, "description": "React, Vue.js, Node.js"},
    {"code": "MOB401", "name": "Lập trình Mobile", "credits": 3, "description": "Android/iOS development"},
    
    # AI & Data
    {"code": "AI501", "name": "Trí tuệ Nhân tạo", "credits": 3, "description": "Machine Learning cơ bản"},
    {"code": "AI502", "name": "Xử lý Dữ liệu lớn", "credits": 3, "description": "Big Data với Python/Spark"},
    
    # Quản lý dự án
    {"code": "PM601", "name": "Quản lý Dự án CNTT", "credits": 2, "description": "Agile, Scrum, DevOps"},
    {"code": "PM602", "name": "Thực tập Doanh nghiệp", "credits": 4, "description": "Thực tập tại công ty"},
    
    # Toán học
    {"code": "MATH101", "name": "Toán Rời rạc", "credits": 3, "description": "Logic, tập hợp, đồ thị"},
    {"code": "MATH201", "name": "Xác suất Thống kê", "credits": 3, "description": "Xác suất và thống kê ứng dụng"},
    
    # Ngoại ngữ
    {"code": "ENG101", "name": "Tiếng Anh Chuyên ngành CNTT", "credits": 2, "description": "Technical English"},
]

created_count = 0
updated_count = 0

for subject_data in sample_subjects:
    subject, created = Subject.objects.get_or_create(
        code=subject_data["code"],
        defaults={
            "name": subject_data["name"],
            "credits": subject_data["credits"],
            "description": subject_data.get("description", ""),
            "created_by": user
        }
    )
    
    if created:
        created_count += 1
        print(f"✅ Tạo mới: {subject.code} - {subject.name}")
    else:
        updated_count += 1
        # Cập nhật thông tin nếu có thay đổi
        subject.name = subject_data["name"]
        subject.credits = subject_data["credits"]
        subject.description = subject_data.get("description", subject.description)
        subject.save()
        print(f"🔄 Cập nhật: {subject.code} - {subject.name}")

print()
print(f"🎉 HOÀN THÀNH:")
print(f"  - Tạo mới: {created_count} môn")
print(f"  - Cập nhật: {updated_count} môn")
print(f"  - Tổng cộng: {Subject.objects.count()} môn học")

print()
print("📚 DANH SÁCH TẤT CẢ MÔN HỌC:")
for subject in Subject.objects.all().order_by('code')[:20]:
    print(f"  {subject.code}: {subject.name} ({subject.credits}TC)")

print()
print("🔧 HƯỚNG DẪN SỬ DỤNG:")
print("1. API lấy danh sách: GET /api/classes/subjects/")
print("2. API tạo môn mới: POST /api/classes/subjects/")
print("   Body: {\"code\": \"CS999\", \"name\": \"Môn mới\", \"credits\": 3}")
print("3. Tìm kiếm: GET /api/classes/subjects/?search=web")
print("4. Frontend cần thêm form tạo môn học trong modal/popup")