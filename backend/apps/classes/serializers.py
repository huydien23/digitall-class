from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.students.serializers import StudentSerializer
from .models import Class, ClassStudent
import random


class ClassSerializer(serializers.ModelSerializer):
    """Serializer for Class model"""
    teacher = UserSerializer(read_only=True)
    current_students_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'class_id', 'class_name', 'description', 'teacher',
            'max_students', 'class_mode', 'current_students_count', 'is_full',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClassCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating classes"""
    
    class Meta:
        model = Class
        fields = ['class_id', 'class_name', 'description', 'max_students', 'class_mode']
        extra_kwargs = {
            'class_id': {'required': False, 'allow_blank': True},
            'description': {'required': False, 'allow_blank': True},
        }
    
    def validate_class_id(self, value):
        # Cho phép bỏ trống để hệ thống tự sinh mã
        if value in [None, '']:
            return value
        if Class.objects.filter(class_id=value).exists():
            raise serializers.ValidationError("Mã lớp đã tồn tại")
        str_val = str(value)
        if not str_val.isdigit() or len(str_val) != 12:
            raise serializers.ValidationError("Mã lớp phải gồm đúng 12 chữ số")
        prefix = '0101000'
        if not str_val.startswith(prefix):
            raise serializers.ValidationError(f"Mã lớp phải bắt đầu bằng {prefix}")
        return value

    def create(self, validated_data):
        # Nếu không cung cấp class_id (đặc biệt với giảng viên), tự sinh mã theo định dạng 0101000 + 5 số (tổng 12)
        class_id = validated_data.get('class_id')
        if not class_id:
            prefix = '0101000'
            suffix_len = 12 - len(prefix)
            for _ in range(25):
                generated = prefix + ''.join(random.choices('0123456789', k=suffix_len))
                if not Class.objects.filter(class_id=generated).exists():
                    validated_data['class_id'] = generated
                    break
            else:
                raise serializers.ValidationError("Không thể sinh mã lớp duy nhất, vui lòng thử lại")
        return super().create(validated_data)


class ClassStudentSerializer(serializers.ModelSerializer):
    """Serializer for ClassStudent model"""
    student = StudentSerializer(read_only=True)
    student_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = ClassStudent
        fields = ['id', 'student', 'student_id', 'enrolled_at', 'is_active']
        read_only_fields = ['id', 'enrolled_at']
    
    def create(self, validated_data):
        student_id = validated_data.pop('student_id')
        try:
            student = Student.objects.get(student_id=student_id)
            validated_data['student'] = student
            return super().create(validated_data)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Không tìm thấy sinh viên với mã này")


class ClassDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed class view with students"""
    teacher = UserSerializer(read_only=True)
    students = StudentSerializer(many=True, read_only=True)
    current_students_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'class_id', 'class_name', 'description', 'teacher',
            'max_students', 'current_students_count', 'is_full',
            'students', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
