from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'account_status', 'phone', 'avatar', 
            'student_id', 'department', 'is_active', 
            'created_at', 'updated_at', 'last_login_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login_at']


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'avatar', 'student_id', 'department'
        ]
        read_only_fields = ['id', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'password', 'password_confirm',
            'role', 'phone', 'student_id', 'teacher_id', 'department'
        ]
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'role': {'required': False},
            'phone': {'required': False, 'allow_blank': True},
            'student_id': {'required': False, 'allow_blank': True},
            'teacher_id': {'required': False, 'allow_blank': True},
            'department': {'required': False, 'allow_blank': True},
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email này đã được sử dụng.")
        validate_email(value)
        return value.lower()
    
    def validate_student_id(self, value):
        if value and User.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Mã sinh viên này đã tồn tại.")
        return value
    
    def validate_teacher_id(self, value):
        if value and User.objects.filter(teacher_id=value).exists():
            raise serializers.ValidationError("Mã giảng viên này đã tồn tại.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Mật khẩu xác nhận không khớp."
            })
        
        role = attrs.get('role') or User.Role.STUDENT
        student_id = attrs.get('student_id')
        teacher_id = attrs.get('teacher_id')
        department = attrs.get('department')
        
        # Không bắt buộc student_id cho sinh viên ở bước đăng ký
        # Nếu là giảng viên thì yêu cầu đủ thông tin
        if role == User.Role.TEACHER:
            missing = {}
            if not teacher_id:
                missing['teacher_id'] = "Mã giảng viên là bắt buộc cho giảng viên."
            if not department:
                missing['department'] = "Khoa/Phòng ban là bắt buộc cho giảng viên."
            if missing:
                raise serializers.ValidationError(missing)
        
        attrs['role'] = role
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Email và mật khẩu là bắt buộc.")
        
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Email hoặc mật khẩu không chính xác.")
        
        if not user.is_active:
            raise serializers.ValidationError("Tài khoản đã bị vô hiệu hóa.")
        
        if not user.can_login():
            if user.account_status == User.AccountStatus.PENDING:
                raise serializers.ValidationError("Tài khoản đang chờ phê duyệt từ quản trị viên.")
            elif user.account_status == User.AccountStatus.SUSPENDED:
                raise serializers.ValidationError("Tài khoản đã bị tạm khóa.")
            elif user.account_status == User.AccountStatus.REJECTED:
                raise serializers.ValidationError("Tài khoản đã bị từ chối.")
            else:
                raise serializers.ValidationError("Không thể đăng nhập vào lúc này.")
        
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu cũ không chính xác.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': "Mật khẩu xác nhận không khớp."
            })
        return attrs
