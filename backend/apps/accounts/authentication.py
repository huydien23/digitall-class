from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from apps.accounts.models import User


class EmailOrStudentIdBackend(ModelBackend):
    """
    Custom authentication backend that allows users to login with:
    - Email
    - Student ID (MSSV)
    
    For students, both email and student_id can be used as username.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        if not username or not password:
            return None
        
        try:
            # Try to find user by email or student_id
            user = User.objects.filter(
                Q(email__iexact=username) | 
                Q(student_id__iexact=username) |
                Q(username__iexact=username)
            ).first()
            
            if user and user.check_password(password):
                # Verify account status
                if user.can_login():
                    return user
                    
        except User.DoesNotExist:
            return None
        except Exception as e:
            # Log error if needed
            return None
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
