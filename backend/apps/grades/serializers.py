from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.students.serializers import StudentSerializer
from apps.classes.serializers import ClassSerializer, SubjectSerializer
from apps.classes.models import Subject  # Import Subject từ classes app
from .models import Grade, GradeSummary


class GradeSerializer(serializers.ModelSerializer):
    """Serializer for Grade model"""
    student = StudentSerializer(read_only=True)
    class_obj = ClassSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    percentage = serializers.ReadOnlyField()
    letter_grade = serializers.ReadOnlyField()
    
    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'class_obj', 'subject', 'grade_type', 'component',
            'score', 'max_score', 'percentage', 'letter_grade',
            'comment', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GradeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating grades"""
    student_id = serializers.CharField(write_only=True)
    class_id = serializers.IntegerField(write_only=True)
    subject_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Grade
        fields = [
            'student_id', 'class_id', 'subject_id', 'grade_type', 'component',
            'score', 'max_score', 'comment'
        ]
    
    def create(self, validated_data):
        student_id = validated_data.pop('student_id')
        class_id = validated_data.pop('class_id')
        subject_id = validated_data.pop('subject_id')
        
        from apps.students.models import Student
        from apps.classes.models import Class, Subject
        
        student = Student.objects.get(student_id=student_id)
        class_obj = Class.objects.get(id=class_id)
        subject = Subject.objects.get(id=subject_id)
        
        validated_data.update({
            'student': student,
            'class_obj': class_obj,
            'subject': subject,
            'created_by': self.context['request'].user
        })
        
        return super().create(validated_data)


class GradeSummarySerializer(serializers.ModelSerializer):
    """Serializer for GradeSummary model"""
    student = StudentSerializer(read_only=True)
    class_obj = ClassSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    
    class Meta:
        model = GradeSummary
        fields = [
            'id', 'student', 'class_obj', 'subject',
            'midterm_score', 'final_score', 'assignment_avg',
            'quiz_avg', 'final_grade', 'letter_grade',
            'is_passed', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class GradeBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating grades"""
    class_id = serializers.IntegerField()
    subject_id = serializers.IntegerField()
    grade_type = serializers.CharField()
    grades = serializers.ListField(
        child=serializers.DictField()
    )
    
    def validate_grades(self, value):
        """Validate grades data"""
        for grade_data in value:
            if 'student_id' not in grade_data:
                raise serializers.ValidationError("Thiếu student_id trong dữ liệu điểm")
            if 'score' not in grade_data:
                raise serializers.ValidationError("Thiếu score trong dữ liệu điểm")
        return value
