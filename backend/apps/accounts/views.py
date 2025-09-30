from django.utils import timezone
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core import signing
from django.conf import settings
from .models import User
from .models import User as UserModel
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
from .email_utils import send_http_email

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
    from rest_framework.throttling import ScopedRateThrottle
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Fetch the user again but restrict columns to those that surely exist in DB
        base_qs = User.objects.only(
            'id', 'email', 'first_name', 'last_name', 'role', 'account_status',
            'phone', 'avatar', 'student_id', 'teacher_id', 'department',
            'is_active', 'created_at', 'updated_at', 'last_login_at'
        )
        user = base_qs.get(id=serializer.validated_data['user'].id)
        
        # Update last login
        user.last_login_at = timezone.now()
        try:
            user.save(update_fields=['last_login_at'])
        except Exception:
            # If DB mismatch occurs, ignore updating last_login_at to allow login
            pass
        
        # Generate tokens, embed auth version (fallback to 1 if field is unavailable)
        refresh = RefreshToken.for_user(user)
        try:
            refresh['auth_v'] = getattr(user, 'auth_version', 1)
        except Exception:
            refresh['auth_v'] = 1
        
        # Build user payload without triggering deferred fields that may not exist in DB
        user_data = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': (getattr(user, 'full_name', None) or f"{user.first_name} {user.last_name}" ).strip(),
            'role': user.role,
            'account_status': user.account_status,
            'phone': user.phone,
            'avatar': user.avatar.url if getattr(user, 'avatar', None) else None,
            'student_id': user.student_id,
            'teacher_id': getattr(user, 'teacher_id', None),
            'department': user.department,
            'is_active': user.is_active,
            'created_at': user.created_at,
            'updated_at': user.updated_at,
            'last_login_at': user.last_login_at,
        }
        
        needs_setup = False
        try:
            needs_setup = (getattr(user, 'role', None) == User.Role.STUDENT and (not bool(user.email) or getattr(user, 'must_change_password', False)))
        except Exception:
            needs_setup = (getattr(user, 'role', None) == User.Role.STUDENT and (not bool(user.email)))
        
        return Response({
            'message': 'Đăng nhập thành công!',
            'user': user_data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'needs_setup': needs_setup,
            'email_present': bool(user.email),
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
        
        # Change password + rotate auth_version
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        try:
            user.auth_version = (user.auth_version or 1) + 1
        except Exception:
            pass
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


# Activation via HTTP Email
import uuid

class ActivationRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    from rest_framework.throttling import ScopedRateThrottle
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'activation_request'

    def post(self, request):
        student_id = request.data.get('student_id')
        email = request.data.get('email')
        if not student_id or not email:
            return Response({'message': 'student_id và email là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(student_id=student_id)
        except User.DoesNotExist:
            return Response({'message': 'Không tìm thấy sinh viên với MSSV cung cấp.'}, status=status.HTTP_404_NOT_FOUND)

        # Allow only students to request activation via this endpoint
        if user.role != User.Role.STUDENT:
            return Response({'message': 'Chỉ áp dụng xác thực qua email cho tài khoản sinh viên.'}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce student email domain
        email_lc = email.lower()
        if not email_lc.endswith('@student.nctu.edu.vn'):
            return Response({'message': 'Email sinh viên phải có dạng *@student.nctu.edu.vn.'}, status=status.HTTP_400_BAD_REQUEST)

        # If user.email is empty, set it; if set, must match
        if not user.email:
            user.email = email_lc
            user.save(update_fields=['email'])
        elif user.email.lower() != email_lc:
            return Response({'message': 'Email không khớp với hồ sơ.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create activation token (30 minutes) with token id for single-use tracking
        token_id = uuid.uuid4().hex
        payload = {'user_id': user.id, 'purpose': 'activate', 'tid': token_id}
        token = signing.dumps(payload, salt='activate')
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        activate_link = f"{frontend_url}/activate?token={token}"

        # Optionally: persist token id to detect replay (lightweight via status_note)
        try:
            if not user.status_note:
                user.status_note = f"last_activation_tid={token_id}"
            else:
                if 'last_activation_tid=' in user.status_note:
                    # replace
                    parts = []
                    for line in user.status_note.split('\n'):
                        if not line.startswith('last_activation_tid='):
                            parts.append(line)
                    parts.append(f"last_activation_tid={token_id}")
                    user.status_note = '\n'.join([p for p in parts if p])
                else:
                    user.status_note += f"\nlast_activation_tid={token_id}"
            user.save(update_fields=['status_note', 'updated_at'])
        except Exception:
            pass

        subject = 'Xác thực tài khoản sinh viên - EduAttend'
        html = f"""
        <p>Xin chào {user.first_name or ''} {user.last_name or ''},</p>
        <p>Vui lòng nhấn vào liên kết sau để xác thực tài khoản và đặt mật khẩu lần đầu:</p>
        <p><a href="{activate_link}">Xác thực tài khoản</a></p>
        <p>Liên kết có hiệu lực trong 24 giờ.</p>
        """
        sent_ok = send_http_email(user.email, subject, html)
        # Update send stats
        try:
            user.last_activation_sent_at = timezone.now()
            user.activation_send_count = (user.activation_send_count or 0) + 1
            user.save(update_fields=['last_activation_sent_at', 'activation_send_count'])
        except Exception:
            pass
        # Even if sending fails, don't reveal specifics to user
        return Response({'message': 'Đã gửi liên kết xác thực (nếu email hợp lệ).'}, status=status.HTTP_200_OK)


class ActivationConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    from rest_framework.throttling import ScopedRateThrottle
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'activation_confirm'

    def post(self, request):
        token = request.data.get('token')
        password = request.data.get('password')
        if not token or not password:
            return Response({'message': 'Thiếu token hoặc mật khẩu.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            data = signing.loads(token, salt='activate', max_age=1800)
        except signing.SignatureExpired:
            return Response({'message': 'Liên kết đã hết hạn.'}, status=status.HTTP_400_BAD_REQUEST)
        except signing.BadSignature:
            return Response({'message': 'Liên kết không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

        user_id = data.get('user_id')
        tid = data.get('tid')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'message': 'Không tìm thấy người dùng.'}, status=status.HTTP_404_NOT_FOUND)

        # Single-use protection (compare token id)
        try:
            if 'last_activation_tid=' in (user.status_note or ''):
                note_tid = None
                for line in (user.status_note or '').split('\n'):
                    if line.startswith('last_activation_tid='):
                        note_tid = line.split('=',1)[1].strip()
                        break
                if note_tid and tid and note_tid != tid:
                    return Response({'message': 'Liên kết đã được thay thế bởi liên kết mới hơn.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            pass

        user.set_password(password)
        # Mark verified + clear must_change_password and rotate auth_version
        ts_now = timezone.now()
        user.auth_version = (user.auth_version or 1) + 1
        user.email_verified = True
        user.email_verified_at = ts_now
        user.must_change_password = False
        # Optional: keep status_note textual trail
        ts = ts_now.isoformat()
        if not user.status_note:
            user.status_note = f"email_verified_at={ts}"
        elif 'email_verified_at=' not in (user.status_note or ''):
            user.status_note += f"\nemail_verified_at={ts}"
        user.save(update_fields=['password', 'email_verified', 'email_verified_at', 'must_change_password', 'status_note', 'updated_at'])

        return Response({'message': 'Kích hoạt và đặt mật khẩu thành công.'}, status=status.HTTP_200_OK)


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