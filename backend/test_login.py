import requests
import json

# Test login API
url = "http://127.0.0.1:8001/api/auth/login/"
data = {
    "email": "dangmanhhuy@nctu.edu.vn",
    "password": "Teacher@123"  # New password for recreated account
}

print(f"Testing login to: {url}")
print(f"With email: {data['email']}")

try:
    response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("\n✅ Login successful!")
        result = response.json()
        if 'tokens' in result:
            print(f"Access Token: {result['tokens']['access'][:50]}...")
    else:
        print("\n❌ Login failed!")
        
except requests.exceptions.ConnectionError:
    print("\n❌ Cannot connect to server. Make sure backend is running on port 8001")
except Exception as e:
    print(f"\n❌ Error: {e}")