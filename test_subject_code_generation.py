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
import requests
import json

def test_auto_generation():
    print("🧪 === TEST AUTO-GENERATE SUBJECT CODES ===")
    print()
    
    # Test cases
    test_subjects = [
        "Lập trình Python",
        "Lập trình Java nâng cao", 
        "Cơ sở dữ liệu",
        "Mạng máy tính",
        "Trí tuệ nhân tạo",
        "Toán rời rạc",
        "Tiếng Anh chuyên ngành",
        "Quản lý dự án CNTT",
        "Phát triển Web",
        "Lập trình Mobile Android",
    ]
    
    BASE_URL = "http://localhost:8001"
    LOGIN_EMAIL = "admin@qlsv.com"
    
    try:
        # Login
        print("🔐 Đang đăng nhập...")
        for password in ["123456", "admin123", "password", "admin", "qlsv123"]:
            login_response = requests.post(f"{BASE_URL}/api/auth/login/", 
                json={"email": LOGIN_EMAIL, "password": password}, 
                timeout=5)
            if login_response.status_code == 200:
                print(f"✅ Login thành công")
                break
        else:
            print("❌ Không thể login")
            return
            
        token = login_response.json().get('access')
        headers = {"Authorization": f"Bearer {token}"}
        
        print("\n🎯 TEST AUTO-GENERATE CODES:")
        print("-" * 60)
        
        for i, subject_name in enumerate(test_subjects, 1):
            print(f"{i:2d}. {subject_name:<30}", end=" → ")
            
            # Test create subject với auto-generate (code='')
            payload = {
                "code": "",  # Empty = auto-generate
                "name": subject_name,
                "credits": 3,
                "description": f"Môn học {subject_name}"
            }
            
            response = requests.post(f"{BASE_URL}/api/classes/subjects/", 
                json=payload, 
                headers=headers, 
                timeout=10)
            
            if response.status_code == 201:
                result = response.json()
                generated_code = result.get('code', 'N/A')
                print(f"✅ {generated_code}")
            else:
                error_data = response.json()
                print(f"❌ {response.status_code}: {error_data.get('error', 'Unknown')}")
        
        print("\n" + "=" * 60)
        print("📋 DANH SÁCH MÔN HỌC SAU KHI TẠO:")
        
        # Get all subjects
        subjects_response = requests.get(f"{BASE_URL}/api/classes/subjects/", 
            headers=headers, timeout=5)
        
        if subjects_response.status_code == 200:
            subjects = subjects_response.json()
            for subject in subjects:
                print(f"  {subject['code']:<12} - {subject['name']}")
        
        print(f"\nTổng cộng: {len(subjects) if subjects_response.status_code == 200 else 'N/A'} môn học")
        
    except requests.exceptions.ConnectionError:
        print("❌ Server không chạy. Hãy start server:")
        print("   python backend/manage.py runserver 0.0.0.0:8001")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    test_auto_generation()