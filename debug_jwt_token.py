import requests
import json
import os

# API base URL
BASE_URL = "http://127.0.0.1:8001/api"

def login_and_get_token(email="admin@qlsv.com", password="admin123"):
    """Đăng nhập và lấy JWT token mới"""
    url = f"{BASE_URL}/auth/login/"
    data = {
        "email": email,
        "password": password
    }
    
    print(f"🔐 Đăng nhập với {email}...")
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        result = response.json()
        token = result.get('access')
        refresh_token = result.get('refresh')
        
        print(f"✅ Đăng nhập thành công!")
        print(f"Access Token: {token[:20]}...{token[-20:] if len(token) > 40 else token}")
        print(f"Refresh Token: {refresh_token[:20]}...{refresh_token[-20:] if len(refresh_token) > 40 else refresh_token}")
        
        return token, refresh_token
    else:
        print(f"❌ Đăng nhập thất bại: {response.status_code}")
        print(f"Response: {response.text}")
        return None, None

def test_token_validity(token):
    """Kiểm tra tính hợp lệ của token"""
    print(f"\n🔍 Kiểm tra token hợp lệ...")
    
    # Test với API subjects (yêu cầu authentication)
    url = f"{BASE_URL}/subjects/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        print(f"✅ Token hợp lệ!")
        data = response.json()
        print(f"Subjects count: {data.get('count', 0)}")
        return True
    elif response.status_code == 401:
        print(f"❌ Token không hợp lệ hoặc đã hết hạn")
        print(f"Response: {response.text}")
        return False
    else:
        print(f"⚠️  Lỗi khác: {response.text}")
        return False

def create_subject_with_token(token, subject_data):
    """Tạo môn học với token"""
    print(f"\n📚 Tạo môn học mới...")
    
    url = f"{BASE_URL}/subjects/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"Data gửi đi: {json.dumps(subject_data, ensure_ascii=False)}")
    
    response = requests.post(url, json=subject_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print(f"✅ Tạo môn học thành công!")
        return response.json()
    else:
        print(f"❌ Tạo môn học thất bại!")
        return None

def main():
    print("🚀 DEBUG JWT TOKEN VÀ API AUTHENTICATION")
    print("=" * 50)
    
    # Bước 1: Đăng nhập và lấy token mới
    token, refresh_token = login_and_get_token()
    
    if not token:
        print("Không thể lấy token. Kết thúc.")
        return
    
    # Bước 2: Kiểm tra token có hợp lệ không
    is_valid = test_token_validity(token)
    
    if not is_valid:
        print("Token không hợp lệ. Kết thúc.")
        return
    
    # Bước 3: Thử tạo môn học với token hợp lệ
    test_subject = {
        "name": "Test Môn Học Debug",
        "credits": 3,
        "description": "Môn học test để debug API"
    }
    
    # Test tự động sinh mã
    print(f"\n🧪 Test 1: Tự động sinh mã môn học")
    result = create_subject_with_token(token, test_subject)
    
    if result:
        print(f"Mã môn học được tạo: {result.get('code')}")
    
    # Test nhập mã thủ công
    print(f"\n🧪 Test 2: Nhập mã môn học thủ công")
    manual_subject = test_subject.copy()
    manual_subject["code"] = "MANUAL001"
    manual_subject["name"] = "Test Môn Học Manual"
    
    result2 = create_subject_with_token(token, manual_subject)
    
    if result2:
        print(f"Mã môn học manual: {result2.get('code')}")

if __name__ == "__main__":
    main()