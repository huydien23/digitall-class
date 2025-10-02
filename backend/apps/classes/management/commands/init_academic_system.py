"""
Django management command để khởi tạo năm học và học kỳ tự động
Chạy: python manage.py init_academic_system
"""

from django.core.management.base import BaseCommand
from apps.classes.models import AcademicYear, Term
from datetime import date


class Command(BaseCommand):
    help = 'Khởi tạo hệ thống năm học và học kỳ tự động'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Bắt buộc tạo mới nếu đã có dữ liệu'
        )
        parser.add_argument(
            '--year',
            type=str,
            help='Năm học cụ thể (format: 2024-2025), mặc định là năm hiện tại'
        )

    def handle(self, *args, **options):
        force = options['force']
        specific_year = options['year']
        
        # Kiểm tra xem đã có dữ liệu chưa
        if not force and AcademicYear.objects.exists():
            existing_count = AcademicYear.objects.count()
            self.stdout.write(
                self.style.WARNING(f'Đã có {existing_count} năm học trong hệ thống. '
                                 'Dùng --force để ghi đè.')
            )
            return

        if specific_year:
            # Tạo năm học cụ thể
            try:
                start_year, end_year = specific_year.split('-')
                start_year = int(start_year)
                end_year = int(end_year)
                
                if end_year != start_year + 1:
                    self.stdout.write(
                        self.style.ERROR('Năm học phải có dạng YYYY-YYYY+1 (ví dụ: 2024-2025)')
                    )
                    return
                    
                year_code = specific_year
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('Format năm học không hợp lệ. Dùng: 2024-2025')
                )
                return
        else:
            # Tự động xác định năm học hiện tại
            today = date.today()
            if today.month >= 9:  # Tháng 9+ = năm học mới
                start_year = today.year
            else:  # Tháng 1-8 = năm học cũ
                start_year = today.year - 1
            
            end_year = start_year + 1
            year_code = f"{start_year}-{end_year}"

        # Tạo hoặc cập nhật năm học
        academic_year, created = AcademicYear.objects.get_or_create(
            code=year_code,
            defaults={
                'name': f'Năm học {year_code}',
                'start_date': date(start_year, 9, 1),
                'end_date': date(end_year, 8, 31),
                'is_current': True
            }
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Tạo năm học mới: {academic_year.name}')
            )
        else:
            # Cập nhật is_current nếu được yêu cầu
            if force:
                AcademicYear.objects.update(is_current=False)
                academic_year.is_current = True
                academic_year.save(update_fields=['is_current'])
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Cập nhật năm học hiện tại: {academic_year.name}')
                )

        # Tạo 3 học kỳ cho năm học
        terms_created = 0
        
        # HK1 (tháng 9-12)
        hk1, created = Term.objects.get_or_create(
            year=academic_year,
            season=Term.Season.HK1,
            defaults={
                'name': f'HK1 {year_code}',
                'start_date': date(start_year, 9, 1),
                'end_date': date(start_year, 12, 31),
                'is_current': True  # HK1 là học kỳ hiện tại khi khởi tạo
            }
        )
        if created:
            terms_created += 1
            
        # HK2 (tháng 1-5)
        hk2, created = Term.objects.get_or_create(
            year=academic_year,
            season=Term.Season.HK2,
            defaults={
                'name': f'HK2 {year_code}',
                'start_date': date(end_year, 1, 1),
                'end_date': date(end_year, 5, 31),
                'is_current': False
            }
        )
        if created:
            terms_created += 1
            
        # HK3/Hè (tháng 6-8)
        hk3, created = Term.objects.get_or_create(
            year=academic_year,
            season=Term.Season.HK3,
            defaults={
                'name': f'HK3 {year_code}',
                'start_date': date(end_year, 6, 1),
                'end_date': date(end_year, 8, 31),
                'is_current': False
            }
        )
        if created:
            terms_created += 1

        if terms_created > 0:
            self.stdout.write(
                self.style.SUCCESS(f'✓ Tạo {terms_created} học kỳ mới')
            )

        # Đảm bảo chỉ có 1 năm học current
        if AcademicYear.objects.filter(is_current=True).count() > 1:
            AcademicYear.objects.update(is_current=False)
            academic_year.is_current = True
            academic_year.save(update_fields=['is_current'])
            
        # Đảm bảo chỉ có 1 học kỳ current
        if Term.objects.filter(is_current=True).count() > 1:
            Term.objects.update(is_current=False)
            hk1.is_current = True
            hk1.save(update_fields=['is_current'])

        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎓 Hoàn thành khởi tạo hệ thống năm học!'
                f'\n   - Năm học hiện tại: {academic_year.name}'
                f'\n   - Học kỳ hiện tại: {hk1.name}'
                f'\n   - API sẵn sàng: /api/classes/years/my/, /api/classes/terms/my/'
            )
        )