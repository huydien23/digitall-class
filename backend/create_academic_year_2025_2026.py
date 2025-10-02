import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import AcademicYear, Term

print("=" * 70)
print("TẠO NĂM HỌC 2025-2026")
print("=" * 70)

# Tạo năm học 2025-2026
academic_year, created = AcademicYear.objects.get_or_create(
    code='2025-2026',
    defaults={
        'name': 'Năm học 2025-2026',
        'start_date': date(2025, 9, 1),
        'end_date': date(2026, 8, 31),
        'is_current': True
    }
)

if created:
    print(f"✓ Đã tạo năm học: {academic_year.name}")
    
    # Đặt các năm học khác thành không phải current
    AcademicYear.objects.exclude(id=academic_year.id).update(is_current=False)
    
    # Tạo học kỳ 1 (HK1)
    term1, created1 = Term.objects.get_or_create(
        year=academic_year,
        season=Term.Season.HK1,
        defaults={
            'name': 'HK1 2025-2026',
            'start_date': date(2025, 9, 1),
            'end_date': date(2025, 12, 31),
            'is_current': True
        }
    )
    if created1:
        print(f"  ✓ Đã tạo học kỳ: {term1.name}")
    
    # Tạo học kỳ 2 (HK2)
    term2, created2 = Term.objects.get_or_create(
        year=academic_year,
        season=Term.Season.HK2,
        defaults={
            'name': 'HK2 2025-2026',
            'start_date': date(2026, 1, 1),
            'end_date': date(2026, 5, 31),
            'is_current': False
        }
    )
    if created2:
        print(f"  ✓ Đã tạo học kỳ: {term2.name}")
    
    # Tạo học kỳ 3 (HK3)
    term3, created3 = Term.objects.get_or_create(
        year=academic_year,
        season=Term.Season.HK3,
        defaults={
            'name': 'HK3 2025-2026',
            'start_date': date(2026, 6, 1),
            'end_date': date(2026, 8, 31),
            'is_current': False
        }
    )
    if created3:
        print(f"  ✓ Đã tạo học kỳ: {term3.name}")
    
    print("\n" + "=" * 70)
    print("THỐNG KÊ")
    print("=" * 70)
    print(f"""
📅 Năm học: {academic_year.name}
   • Mã: {academic_year.code}
   • Bắt đầu: {academic_year.start_date}
   • Kết thúc: {academic_year.end_date}
   • Trạng thái: {'Đang diễn ra' if academic_year.is_current else 'Không hoạt động'}

📚 Các học kỳ:
   1. {term1.name} ({term1.start_date} → {term1.end_date}) {'[ĐANG HOẠT ĐỘNG]' if term1.is_current else ''}
   2. {term2.name} ({term2.start_date} → {term2.end_date}) {'[ĐANG HOẠT ĐỘNG]' if term2.is_current else ''}
   3. {term3.name} ({term3.start_date} → {term3.end_date}) {'[ĐANG HOẠT ĐỘNG]' if term3.is_current else ''}

💡 Lưu ý:
   • HK1 đã được đặt làm học kỳ hiện tại
   • Bạn có thể thay đổi học kỳ hiện tại trong admin panel
   • Các thông tin chi tiết khác có thể chỉnh sửa sau
    """)
    
else:
    print(f"⚠ Năm học {academic_year.name} đã tồn tại!")
    print(f"   • Mã: {academic_year.code}")
    print(f"   • Trạng thái: {'Đang diễn ra' if academic_year.is_current else 'Không hoạt động'}")
    
    # Hiển thị các học kỳ hiện có
    terms = Term.objects.filter(year=academic_year).order_by('season')
    if terms.exists():
        print(f"\n   Các học kỳ đã có:")
        for term in terms:
            status = '[ĐANG HOẠT ĐỘNG]' if term.is_current else ''
            print(f"   • {term.name} ({term.start_date} → {term.end_date}) {status}")

print("\n✅ Hoàn tất!")
