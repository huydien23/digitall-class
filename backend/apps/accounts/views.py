from django.utils import timezone
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    UserSerializer, 
    UserProfileSerializer,
    AvatarUploadSerializer,
    RegisterSerializer, 
    LoginSerializer, 
    ChangePasswordSerializer,
    # ForgotPasswordSerializer,
    # ResetPasswordSerializer
)

# -----------------------
# Admin Teacher Approval APIs
# -----------------------
class PendingTeachersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Only admin/staff can access
        if not (request.user.is_superuser or request.user.is_staff or getattr(request.user, 'role', None) == User.Role.ADMIN):
            return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        teachers = User.objects.filter(
            role=User.Role.TEACHER,
            account_status=User.AccountStatus.PENDING
        ).order_by('-created_at')

        data = [
            {
                'id': t.id,
                'email': t.email,
                'first_name': t.first_name,
                'last_name': t.last_name,
                'full_name': t.full_name,
                'department': t.department,
                'phone': t.phone,
                'account_status': t.account_status,
                'created_at': t.created_at,
            }
            for t in teachers
        ]
        return Response({'data': data}, status=status.HTTP_200_OK)


class ApproveTeacherView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if not (request.user.is_superuser or request.user.is_staff or getattr(request.user, 'role', None) == User.Role.ADMIN):
            return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(id=user_id, role=User.Role.TEACHER)
            user.account_status = User.AccountStatus.ACTIVE
            user.is_active = True
            user.save(update_fields=['account_status', 'is_active', 'updated_at'])
            return Response({'message': 'Teacher approved successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class RejectTeacherView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if not (request.user.is_superuser or request.user.is_staff or getattr(request.user, 'role', None) == User.Role.ADMIN):
            return Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(id=user_id, role=User.Role.TEACHER)
            user.account_status = User.AccountStatus.REJECTED
            user.is_active = False
            # accept optional reason
            reason = request.data.get('reason')
            if reason:
                user.status_note = reason
            user.save(update_fields=['account_status', 'is_active', 'status_note', 'updated_at'])
            return Response({'message': 'Teacher rejected successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class RegisterView(generics.CreateAPIView):
    """User Registration API"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Đăng ký thành công!',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'require_approval': user.account_status == User.AccountStatus.PENDING
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User Login API"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Update last login
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Đăng nhập thành công!',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """User Logout API"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Đăng xuất thành công!'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Đăng xuất thành công!'  # Always show success to user
            }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """User Profile Management API"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Update user profile"""
        serializer = UserProfileSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Cập nhật thông tin thành công!',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """Change Password API"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Change password
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Đổi mật khẩu thành công!'
        }, status=status.HTTP_200_OK)


class AvatarUploadView(APIView):
    """Avatar Upload API"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = AvatarUploadSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        
        # Delete old avatar if exists
        if request.user.avatar:
            try:
                request.user.avatar.delete(save=False)
            except:
                pass
        
        user = serializer.save()
        
        return Response({
            'message': 'Cập nhật ảnh đại diện thành công!',
            'user': UserSerializer(user).data,
            'avatar_url': user.avatar.url if user.avatar else None
        }, status=status.HTTP_200_OK)
    
    def delete(self, request):
        """Delete avatar"""
        if request.user.avatar:
            try:
                request.user.avatar.delete(save=True)
                return Response({
                    'message': 'Xóa ảnh đại diện thành công!'
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'message': 'Lỗi khi xóa ảnh đại diện.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({
                'message': 'Không có ảnh đại diện để xóa.'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """API Health Check"""
    return Response({
        'status': 'healthy',
        'message': 'Student Management API is running!',
        'timestamp': timezone.now()
    }, status=status.HTTP_200_OK)


# Temporarily commented out for superuser creation
# class ForgotPasswordView(APIView):
#     """Forgot Password API"""
#     permission_classes = [permissions.AllowAny]
#     
#     def post(self, request):
#         serializer = ForgotPasswordSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         
#         email = serializer.validated_data['email']
#         
#         try:
#             user = User.objects.get(email=email, is_active=True)
#             
#             # Generate reset token
#             from django.contrib.auth.tokens import default_token_generator
#             from django.utils.http import urlsafe_base64_encode
#             from django.utils.encoding import force_bytes
#             from .email_utils import send_password_reset_email
#             
#             # Create reset token
#             token = default_token_generator.make_token(user)
#             uid = urlsafe_base64_encode(force_bytes(user.pk))
#             
#             # Create reset URL
#             frontend_url = getattr(request, 'build_absolute_uri', lambda x: f"http://localhost:5173{x}")
#             reset_url = f"{frontend_url('/reset-password')}?uid={uid}&token={token}"
#             
#             # Send email
#             email_sent = send_password_reset_email(user, reset_url)
#             
#             if not email_sent:
#                 # Log for development, but still return success to prevent enumeration
#                 print(f"Failed to send email to {email}, but returning success for security")
#             
#             # Always return success to prevent email enumeration
#             return Response({
#                 'message': 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.'
#             }, status=status.HTTP_200_OK)
#             
#         except User.DoesNotExist:
#             # Always return success to prevent email enumeration
#             return Response({
#                 'message': 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.'
#             }, status=status.HTTP_200_OK)


# class ResetPasswordView(APIView):
#     """Reset Password with Token API"""
#     permission_classes = [permissions.AllowAny]
#     
#     def post(self, request):
#         serializer = ResetPasswordSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         
#         from django.contrib.auth.tokens import default_token_generator
#         from django.utils.http import urlsafe_base64_decode
#         from django.utils.encoding import force_str
#         
#         try:
#             # Extract uid and token from request data
#             uid = request.data.get('uid')
#             token = serializer.validated_data['token']
#             
#             # Decode user ID
#             user_id = force_str(urlsafe_base64_decode(uid))
#             user = User.objects.get(pk=user_id)
#             
#             # Verify token
#             if default_token_generator.check_token(user, token):
#                 # Set new password
#                 user.set_password(serializer.validated_data['new_password'])
#                 user.save()
#                 
#                 # Send confirmation email
#                 from .email_utils import send_password_reset_confirmation_email
#                 send_password_reset_confirmation_email(user)
#                 
#                 return Response({
#                     'message': 'Mật khẩu đã được đặt lại thành công!'
#                 }, status=status.HTTP_200_OK)
#             else:
#                 return Response({
#                     'message': 'Token không hợp lệ hoặc đã hết hạn.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
#                 
#         except (TypeError, ValueError, OverflowError, User.DoesNotExist):
#             return Response({
#                 'message': 'Token không hợp lệ.'
#             }, status=status.HTTP_400_BAD_REQUEST)