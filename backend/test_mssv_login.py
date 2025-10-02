"""
Test script to verify MSSV (student_id) login functionality.
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from django.contrib.auth import authenticate
from apps.students.models import Student

def test_login(username, password):
    """Test login with given credentials."""
    user = authenticate(username=username, password=password)
    if user:
        print(f"✓ SUCCESS: Login with '{username}' worked!")
        print(f"  User: {user.email}")
        print(f"  Name: {user.full_name if hasattr(user, 'full_name') else 'N/A'}")
        print(f"  Role: {user.role}")
        return True
    else:
        print(f"✗ FAILED: Login with '{username}' failed")
        return False

print("=" * 60)
print("Testing MSSV Login Functionality")
print("=" * 60)

# Get first student
student = Student.objects.first()
if not student:
    print("No students found in database!")
    exit(1)

print(f"\nStudent Info:")
print(f"  MSSV: {student.student_id}")
print(f"  Email: {student.email}")
print(f"  Name: {student.full_name}")

print("\n" + "-" * 60)
print("Test 1: Login with MSSV (student_id)")
print("-" * 60)
test_login(student.student_id, student.student_id)

print("\n" + "-" * 60)
print("Test 2: Login with Email")
print("-" * 60)
test_login(student.email, student.student_id)

print("\n" + "-" * 60)
print("Test 3: Login with wrong password")
print("-" * 60)
test_login(student.student_id, "wrongpassword")

print("\n" + "=" * 60)
print("Testing Complete!")
print("=" * 60)
