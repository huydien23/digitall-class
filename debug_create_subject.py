#!/usr/bin/env python
import requests
import json

BASE_URL = "http://localhost:8001"
EMAIL = "admin@qlsv.com"

print("🔍 DEBUG TẠO MÔN HỌC")
print("=" * 40)

try:
    # Login
    print("1. Đăng nhập...")
    for password in ["123456", "admin123", "password", "admin", "qlsv123"]:
        login_response = requests.post(f"{BASE_URL}/api/auth/login/", 
            json={"email": EMAIL, "password": password}, timeout=5)
        if login_response.status_code == 200:
            print(f"✅ Login OK với password: {password}")
            break
    else:
        print("❌ Login failed")
        exit(1)
    
    token = login_response.json().get('access')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test create subject - giống như frontend gửi
    print("\n2. Test tạo môn học với auto-generate...")
    payload = {
        "code": "",  # Auto-generate
        "name": "Lập trình Python",
        "credits": 3,
        "description": "Học phần lý thuyết"
    }
    
    print(f"Payload: {json.dumps(payload, ensure_ascii=False, indent=2)}")
    
    response = requests.post(f"{BASE_URL}/api/classes/subjects/", 
        json=payload, headers=headers, timeout=10)
    
    print(f"\n3. Response:")
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 201:
        result = response.json()
        print(f"✅ Success!")
        print(f"Created subject: {json.dumps(result, ensure_ascii=False, indent=2)}")
    else:
        print(f"❌ Error {response.status_code}")
        try:
            error_data = response.json()
            print(f"Error data: {json.dumps(error_data, ensure_ascii=False, indent=2)}")
        except:
            print(f"Raw response: {response.text}")

except requests.exceptions.ConnectionError:
    print("❌ Server not running")
except Exception as e:
    print(f"❌ Exception: {e}")
    import traceback
    traceback.print_exc()