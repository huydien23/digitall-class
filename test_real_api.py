#!/usr/bin/env python
import requests
import json

print("=== TEST REAL API ENDPOINTS ===")
print()

# API base URL
BASE_URL = "http://localhost:8001"

# Test credentials (sử dụng user có trong database)
TEST_EMAIL = "admin@qlsv.com"
TEST_PASSWORD = "admin123"  # thay đổi nếu cần

try:
    # 1. Login để lấy token
    print("🔐 1. ĐĂNG NHẬP...")
    login_response = requests.post(f"{BASE_URL}/api/auth/login/", 
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        },
        timeout=5
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        
        # Thử với password khác
        print("\n🔄 Thử với password khác...")
        for pwd in ["123456", "password", "admin", "qlsv123"]:
            resp = requests.post(f"{BASE_URL}/api/auth/login/", 
                json={"email": TEST_EMAIL, "password": pwd}, timeout=5)
            if resp.status_code == 200:
                print(f"✅ Login thành công với password: {pwd}")
                login_response = resp
                break
        else:
            print("❌ Không thể login với các password thử nghiệm")
            exit(1)
    
    login_data = login_response.json()
    access_token = login_data.get('access')
    
    if not access_token:
        print(f"❌ Không lấy được access token: {login_data}")
        exit(1)
        
    print(f"✅ Login thành công! Token: {access_token[:20]}...")
    
    # 2. Test API years
    print("\n📅 2. TEST API YEARS...")
    headers = {"Authorization": f"Bearer {access_token}"}
    
    years_response = requests.get(f"{BASE_URL}/api/classes/years/my/", 
        headers=headers, timeout=5)
    
    print(f"Status: {years_response.status_code}")
    if years_response.status_code == 200:
        years_data = years_response.json()
        print(f"✅ Năm học: {len(years_data)} records")
        for year in years_data:
            current_mark = " 🎯" if year.get('is_current') else ""
            print(f"  - {year.get('code')}: {year.get('name')}{current_mark}")
            
        # Lấy year_id cho bước tiếp theo
        current_year_id = None
        for year in years_data:
            if year.get('is_current'):
                current_year_id = year.get('year_id')
                break
        if not current_year_id and years_data:
            current_year_id = years_data[0].get('year_id')
    else:
        print(f"❌ Years API failed: {years_response.text}")
        current_year_id = 1  # fallback
    
    # 3. Test API terms
    print(f"\n🎓 3. TEST API TERMS (year_id={current_year_id})...")
    
    terms_response = requests.get(f"{BASE_URL}/api/classes/terms/my/?year_id={current_year_id}", 
        headers=headers, timeout=5)
    
    print(f"Status: {terms_response.status_code}")
    if terms_response.status_code == 200:
        terms_data = terms_response.json()
        print(f"✅ Học kỳ: {len(terms_data)} records")
        for term in terms_data:
            current_mark = " 🎯" if term.get('is_current') else ""
            print(f"  - {term.get('name')} ({term.get('season')}) - {term.get('class_count', 0)} lớp{current_mark}")
            
        print(f"\n🎉 SUCCESS: API trả về {len(terms_data)} học kỳ!")
        
        # Hiển thị JSON response
        print(f"\n📤 JSON Response:")
        print(json.dumps(terms_data, indent=2))
        
    else:
        print(f"❌ Terms API failed: {terms_response.text}")
        
    # 4. Test API terms không có tham số
    print(f"\n🎓 4. TEST API TERMS (no params)...")
    terms_response_no_params = requests.get(f"{BASE_URL}/api/classes/terms/my/", 
        headers=headers, timeout=5)
    
    print(f"Status: {terms_response_no_params.status_code}")
    if terms_response_no_params.status_code == 200:
        terms_data_no_params = terms_response_no_params.json()
        print(f"✅ Học kỳ (no params): {len(terms_data_no_params)} records")
    else:
        print(f"❌ Terms API (no params) failed: {terms_response_no_params.text}")

except requests.exceptions.ConnectionError:
    print("❌ Không thể kết nối đến server. Hãy chắc chắn server đang chạy:")
    print("   python backend/manage.py runserver 0.0.0.0:8000")
except requests.exceptions.Timeout:
    print("❌ Request timeout. Server có thể đang chậm.")
except Exception as e:
    print(f"❌ Lỗi: {e}")
    import traceback
    traceback.print_exc()