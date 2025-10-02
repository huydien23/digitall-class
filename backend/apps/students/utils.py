import re
import unicodedata
from typing import Optional

from django.conf import settings
from django.db import models


def slugify_given_name(name: str) -> str:
    """
    Convert a Vietnamese given name (Tên) to a lowercase ASCII slug without spaces.
    - Keep only a-z characters
    - Remove accents and special characters
    - Convert đ/Đ to d
    """
    if not name:
        return ""
    s = str(name).strip()
    # Normalize accents
    s = s.replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = s.lower()
    # Keep only letters a-z
    s = re.sub(r"[^a-z]+", "", s)
    return s


def build_student_email(given_name: str, student_id: str, domain: Optional[str] = None) -> str:
    """
    Build email in the format: {lowercase_given_name}{MSSV}@{domain}
    - Only the given name is lowercased and normalized (no accents)
    - MSSV is appended as-is (to match your requirement)
    - Domain defaults to settings.STUDENT_EMAIL_DOMAIN
    """
    dom = (domain or getattr(settings, "STUDENT_EMAIL_DOMAIN", "student.nctu.edu.vn")).strip().lower()
    slug = slugify_given_name(given_name) or "sv"
    sid = (student_id or "").strip()
    return f"{slug}{sid}@{dom}"


def create_user_for_student(student, default_password: Optional[str] = None, force: bool = False):
    """
    Create or update User account for a Student.
    
    Args:
        student: Student instance
        default_password: Password to set (defaults to student_id if None)
        force: If True, update existing User account
    
    Returns:
        (User, created) tuple
    """
    from apps.accounts.models import User
    
    # Skip if student already has a user and force is False
    if student.user and not force:
        return (student.user, False)
    
    # Default password is student_id
    password = default_password or student.student_id
    
    # Check if User already exists by email or student_id
    existing_user = User.objects.filter(
        models.Q(email=student.email) | models.Q(student_id=student.student_id)
    ).first()
    
    if existing_user:
        # Update existing user
        if force:
            existing_user.email = student.email
            existing_user.student_id = student.student_id
            existing_user.first_name = student.first_name
            existing_user.last_name = student.last_name
            existing_user.role = User.Role.STUDENT
            existing_user.account_status = User.AccountStatus.ACTIVE
            existing_user.is_active = True
            if default_password:  # Only reset password if explicitly provided
                existing_user.set_password(password)
            existing_user.save()
            
            # Link to student if not already
            if student.user != existing_user:
                student.user = existing_user
                student.save(update_fields=['user'])
                
        return (existing_user, False)
    
    # Create new user
    user = User.objects.create_user(
        email=student.email,
        password=password,
        first_name=student.first_name,
        last_name=student.last_name,
        role=User.Role.STUDENT,
        account_status=User.AccountStatus.ACTIVE,
        student_id=student.student_id,
        is_active=True,
    )
    
    # Link user to student
    student.user = user
    student.save(update_fields=['user'])
    
    return (user, True)
