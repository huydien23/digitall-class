from django.contrib.auth import get_user_model

User = get_user_model()

email = 'dangmanhhuy@nctu.edu.vn'

# Step 1: Delete existing user if exists
try:
    old_user = User.objects.get(email=email)
    old_user.delete()
    print(f"[DELETED] Old user with email {email} has been removed")
except User.DoesNotExist:
    print(f"[INFO] No existing user with email {email}")

# Step 2: Create new teacher account
try:
    new_user = User.objects.create_user(
        email=email,
        username='dangmanhhuy',  # username from email
        password='Teacher@123',  # New password - strong password
        first_name='Dang Manh',
        last_name='Huy',
        role='teacher',
        teacher_id='GV001',
        department='Khoa Cong nghe thong tin',
        phone='0123456789',
        is_active=True,
        account_status='active'  # Set active immediately
    )
    
    print(f"\n[SUCCESS] New teacher account created!")
    print(f"Email: {new_user.email}")
    print(f"Password: Teacher@123")
    print(f"Role: {new_user.role}")
    print(f"Teacher ID: {new_user.teacher_id}")
    print(f"Department: {new_user.department}")
    print(f"Status: {new_user.account_status}")
    print(f"Active: {new_user.is_active}")
    print("\nYou can now login with these credentials")
    
except Exception as e:
    print(f"[ERROR] Failed to create user: {e}")