#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.classes.models import AcademicYear, Term
from apps.accounts.models import User
from django.test import RequestFactory
from apps.classes.views import my_terms

print("=== TEST API TERMS ===")
print()

# Tạo mock request
factory = RequestFactory()
request = factory.get('/api/classes/terms/my/')

# Tạo mock user (giả lập user đăng nhập)
try:
    user = User.objects.first()  # Lấy user đầu tiên có sẵn
    if not user:
        print("❌ Không tìm thấy user nào trong hệ thống")
        print("Hãy tạo user trước hoặc chạy: python manage.py createsuperuser")
        sys.exit(1)
    request.user = user
    print(f"👤 Sử dụng user: {user.email}")
    print()
    
    # Test API my_terms với current year
    current_year = AcademicYear.get_current_year()
    request.GET = {'year_id': str(current_year.id)}
    
    print(f"📞 Gọi API: /api/classes/terms/my/?year_id={current_year.id}")
    response = my_terms(request)
    
    print(f"📤 Response Status: {response.status_code}")
    print(f"📊 Response Data:")
    
    if hasattr(response, 'data'):
        data = response.data
    else:
        import json
        data = json.loads(response.content.decode())
    
    if isinstance(data, list):
        print(f"  📋 Số học kỳ trả về: {len(data)}")
        for i, term in enumerate(data, 1):
            print(f"    {i}. {term.get('name', 'N/A')} ({term.get('season', 'N/A')}) - {term.get('class_count', 0)} lớp")
    else:
        print(f"  ❌ Lỗi: {data}")
        
    print()
    print("🔍 PHÂN TÍCH:")
    
    # Kiểm tra trực tiếp database
    terms_in_db = Term.objects.filter(year=current_year).order_by('season')
    print(f"  - Database có {terms_in_db.count()} học kỳ")
    for term in terms_in_db:
        print(f"    * {term.name} (season={term.season})")
        
    # Test API không có tham số
    print()
    print("📞 Gọi API không có tham số: /api/classes/terms/my/")
    request.GET = {}
    response = my_terms(request)
    
    if hasattr(response, 'data'):
        data = response.data
    else:
        import json
        data = json.loads(response.content.decode())
        
    if isinstance(data, list):
        print(f"  📋 Số học kỳ trả về: {len(data)}")
    else:
        print(f"  ❌ Lỗi: {data}")

except Exception as e:
    import traceback
    print(f"❌ Lỗi: {e}")
    print("Stack trace:")
    traceback.print_exc()