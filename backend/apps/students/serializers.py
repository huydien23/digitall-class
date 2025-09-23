from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    """Serializer for Student model"""
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Student
        fields = [
            'id', 'student_id', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'gender', 'date_of_birth', 'age',
            'address', 'avatar', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating students"""
    
    class Meta:
        model = Student
        fields = [
            'student_id', 'first_name', 'last_name', 'email', 'phone',
            'gender', 'date_of_birth', 'address', 'avatar', 'is_active'
        ]
    
    def validate_student_id(self, value):
        # Check if student_id already exists (excluding current instance for updates)
        queryset = Student.objects.filter(student_id=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("Mã sinh viên đã tồn tại")
        return value
    
    def validate_email(self, value):
        # Check if email already exists (excluding current instance for updates)
        queryset = Student.objects.filter(email=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError("Email đã tồn tại")
        return value


class StudentBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating students from Excel"""
    students = StudentCreateSerializer(many=True)
    
    def create(self, validated_data):
        students_data = validated_data['students']
        students = []
        for student_data in students_data:
            student = Student.objects.create(**student_data)
            students.append(student)
        return {'students': students}
