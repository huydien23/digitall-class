#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import AcademicYear, Term

print("=== KIỂM TRA DỮ LIỆU NĂM HỌC VÀ HỌC KỲ ===")
print()

# Kiểm tra năm học
print("📅 DANH SÁCH NĂM HỌC:")
for year in AcademicYear.objects.all().order_by('-code'):
    current_mark = " ✅ (HIỆN TẠI)" if year.is_current else ""
    print(f"  - {year.code}: {year.name}{current_mark}")
print()

# Kiểm tra học kỳ
current_year = AcademicYear.objects.filter(is_current=True).first()
if current_year:
    print(f"🎓 HỌC KỲ TRONG NĂM HỌC HIỆN TẠI ({current_year.code}):")
    terms = Term.objects.filter(year=current_year).order_by('season')
    for term in terms:
        current_mark = " ✅ (HIỆN TẠI)" if term.is_current else ""
        print(f"  - {term.season.upper()}: {term.name}{current_mark}")
    print(f"  Tổng số học kỳ: {terms.count()}")
else:
    print("❌ Không tìm thấy năm học hiện tại!")

print()
print("🔍 TỔNG KẾT:")
print(f"  - Tổng số năm học: {AcademicYear.objects.count()}")
print(f"  - Tổng số học kỳ: {Term.objects.count()}")
print(f"  - Năm học có is_current=True: {AcademicYear.objects.filter(is_current=True).count()}")
print(f"  - Học kỳ có is_current=True: {Term.objects.filter(is_current=True).count()}")