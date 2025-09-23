#!/usr/bin/env python
"""
Script to create admin user for QLSV project
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management.settings')
django.setup()

from apps.accounts.models import User

def create_admin():
    """Create admin user"""
    try:
        # Check if admin already exists
        if User.objects.filter(email='admin@qlsv.com').exists():
            print("❌ Admin user already exists!")
            return
        
        # Create admin user
        admin_user = User.objects.create_user(
            email='admin@qlsv.com',
            password='admin123',
            first_name='Admin',
            last_name='System',
            role='admin',
            account_status='active',
            is_staff=True,
            is_superuser=True
        )
        
        print("✅ Admin user created successfully!")
        print(f"📧 Email: {admin_user.email}")
        print(f"🔑 Password: admin123")
        print(f"👤 Role: {admin_user.role}")
        print(f"📊 Status: {admin_user.account_status}")
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")

if __name__ == "__main__":
    create_admin()
