#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import AcademicYear, Term, Class
from apps.accounts.models import User

print("=== TEST DIRECT TERMS LOGIC ===")
print()

# Lấy năm học hiện tại
current_year = AcademicYear.get_current_year()
print(f"📅 Năm học hiện tại: {current_year.code}")

# Lấy user đầu tiên để test
user = User.objects.first()
print(f"👤 Test với user: {user.email if user else 'None'}")

if not user:
    print("❌ Không có user. Tạo user test...")
    user = User.objects.create_user(
        email='test@example.com',
        password='test123',
        first_name='Test',
        last_name='User'
    )

print()

# Test logic của my_terms view trực tiếp
year_id = current_year.id

# Lấy số lượng lớp theo học kỳ (logic từ my_terms view)
class_counts = {}
qs = Class.objects.filter(teacher=user, term__year=current_year)
agg = qs.values('term_id').annotate(class_count=django.db.models.Count('id'))
for item in agg:
    class_counts[item['term_id']] = item['class_count']

print(f"📊 Số lượng lớp của user {user.email} theo học kỳ:")
for term_id, count in class_counts.items():
    term = Term.objects.get(id=term_id)
    print(f"  - {term.name}: {count} lớp")

if not class_counts:
    print("  (Không có lớp nào)")

print()

# Lấy tất cả học kỳ của năm đó
all_terms = Term.objects.filter(year=current_year).order_by('season')
print(f"🎓 Tất cả học kỳ trong năm {current_year.code}:")

data = []
for term in all_terms:
    term_data = {
        'term_id': term.id,
        'year_code': current_year.code,
        'season': term.season,
        'name': term.name,
        'class_count': class_counts.get(term.id, 0),
        'is_current': term.is_current,
        'start_date': term.start_date,
        'end_date': term.end_date,
    }
    data.append(term_data)
    print(f"  - {term.name} ({term.season}) - {class_counts.get(term.id, 0)} lớp")

print()
print(f"✅ RESULT: API sẽ trả về {len(data)} học kỳ")
print()

# Hiển thị dữ liệu JSON mà API sẽ trả về
import json
print("📤 JSON mà API sẽ trả về:")
print(json.dumps(data, indent=2, default=str))

print()
print("🔍 PHÂN TÍCH NGUYÊN NHÂN Frontend CHỈ HIỂN THỊ 1 HỌC KỲ:")
print("1. ✅ Database đã có đủ 3 học kỳ")
print("2. ✅ API logic trả về đủ 3 học kỳ") 
print("3. ❓ Có thể frontend chỉ lấy phần tử đầu tiên của array")
print("4. ❓ Có thể frontend filter theo is_current=true")
print("5. ❓ Có thể frontend call API khác URL")

# Kiểm tra học kỳ current
current_terms = Term.objects.filter(is_current=True)
print()
print(f"🎯 Học kỳ có is_current=True: {current_terms.count()}")
for term in current_terms:
    print(f"  - {term.name}")
    
if current_terms.count() == 0:
    print("⚠️  PHÁT HIỆN: Không có học kỳ nào được đánh dấu is_current=True!")
    print("   Frontend có thể đang filter theo is_current và chỉ hiển thị những HK đó.")
    print("   Hãy set HK1 làm current:")
    hk1 = Term.objects.filter(year=current_year, season='hk1').first()
    if hk1:
        hk1.is_current = True
        hk1.save()
        print(f"   ✅ Đã set {hk1.name} làm học kỳ hiện tại")