from django.contrib.auth import get_user_model

User = get_user_model()

email = 'dangmanhhuy@nctu.edu.vn'

try:
    user = User.objects.get(email=email)
    print(f"Found user: {user.email}")
    print(f"Current status: Role={user.role}, Status={user.account_status}, Active={user.is_active}")
    
    # Activate the user
    user.account_status = 'active'
    user.is_active = True
    user.save()
    
    print(f"Updated status: Role={user.role}, Status={user.account_status}, Active={user.is_active}")
    print("User has been activated successfully!")
    
except User.DoesNotExist:
    print(f"User with email {email} not found in database")