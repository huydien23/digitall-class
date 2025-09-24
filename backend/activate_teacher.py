from django.contrib.auth import get_user_model

User = get_user_model()

email = 'dangmanhhuy@nctu.edu.vn'

try:
    user = User.objects.get(email=email)
    # Force set to active status
    user.account_status = 'active'
    user.is_active = True
    user.save()
    
    print(f"[SUCCESS] Account activated!")
    print(f"Email: {user.email}")
    print(f"Status: {user.account_status}")
    print(f"Active: {user.is_active}")
    
except User.DoesNotExist:
    print(f"[ERROR] User not found: {email}")