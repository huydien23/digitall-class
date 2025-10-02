import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import AcademicYear

print("=" * 70)
print("KÍCH HOẠT NĂM HỌC 2025-2026")
print("=" * 70)

# Tắt tất cả năm học khác
AcademicYear.objects.update(is_current=False)

# Kích hoạt năm học 2025-2026
academic_year = AcademicYear.objects.get(code='2025-2026')
academic_year.is_current = True
academic_year.save()

print(f"✓ Đã kích hoạt năm học: {academic_year.name}")
print(f"  • Mã: {academic_year.code}")
print(f"  • Trạng thái: Đang hoạt động")

print("\n✅ Hoàn tất! Bây giờ bạn có thể chọn học kỳ trong frontend.")
