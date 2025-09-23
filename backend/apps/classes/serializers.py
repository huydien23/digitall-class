from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.students.serializers import StudentSerializer
from .models import Class, ClassStudent


class ClassSerializer(serializers.ModelSerializer):
    """Serializer for Class model"""
    teacher = UserSerializer(read_only=True)
    current_students_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'class_id', 'class_name', 'description', 'teacher',
            'max_students', 'current_students_count', 'is_full',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClassCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating classes"""
    
    class Meta:
        model = Class
        fields = ['class_id', 'class_name', 'description', 'max_students']
    
    def validate_class_id(self, value):
        if Class.objects.filter(class_id=value).exists():
            raise serializers.ValidationError("Mã lớp đã tồn tại")
        return value


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
