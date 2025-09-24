from django.contrib.auth import get_user_model

User = get_user_model()

email = 'dangmanhhuy@nctu.edu.vn'
new_password = 'manhhuy123'  # Mat khau moi

try:
    user = User.objects.get(email=email)
    print(f"Found user: {user.email}")
    print(f"Current status: Role={user.role}, Status={user.account_status}, Active={user.is_active}")
    
    # Set new password
    user.set_password(new_password)
    user.save()
    
    print("\nPassword has been reset successfully!")
    print(f"New password: {new_password}")
    print("Please use this password to login.")
    
except User.DoesNotExist:
    print(f"User with email {email} not found in database")
