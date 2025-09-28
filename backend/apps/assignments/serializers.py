from rest_framework import serializers
from django.utils import timezone
from apps.accounts.serializers import UserSerializer
from apps.students.serializers import StudentSerializer
from apps.classes.serializers import ClassSerializer
from .models import Assignment, AssignmentSubmission


class AssignmentSerializer(serializers.ModelSerializer):
    class_obj = ClassSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    server_now = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id', 'class_obj', 'session', 'title', 'description', 'type',
            'attachment', 'release_at', 'due_at', 'time_limit_minutes',
            'allowed_file_types', 'max_file_size_mb', 'is_published', 'points_max',
            'created_by', 'created_at', 'updated_at', 'server_now'
        ]

    def get_server_now(self, obj):
        return timezone.now()


class AssignmentCreateSerializer(serializers.ModelSerializer):
    class_id = serializers.IntegerField(write_only=True)
    session_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Assignment
        fields = [
            'class_id', 'session_id', 'title', 'description', 'type', 'attachment',
            'release_at', 'due_at', 'time_limit_minutes',
            'allowed_file_types', 'max_file_size_mb', 'is_published', 'points_max'
        ]

    def create(self, validated_data):
        from apps.classes.models import Class
        from apps.attendance.models import AttendanceSession
        class_id = validated_data.pop('class_id')
        session_id = validated_data.pop('session_id', None)
        class_obj = Class.objects.get(id=class_id)
        assignment = Assignment.objects.create(
            class_obj=class_obj,
            created_by=self.context['request'].user,
            **validated_data
        )
        if session_id:
            try:
                assignment.session = AttendanceSession.objects.get(id=session_id)
                assignment.save(update_fields=['session'])
            except AttendanceSession.DoesNotExist:
                pass
        return assignment


class SubmissionSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'student', 'attempt_number',
            'started_at', 'personal_due_at', 'uploaded_at', 'file', 'file_size',
            'status', 'is_late', 'grade', 'feedback', 'graded_at'
        ]
        read_only_fields = ['id', 'uploaded_at', 'file_size', 'status', 'is_late']


class MySubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'attempt_number', 'started_at', 'personal_due_at', 'uploaded_at', 'file', 'status', 'is_late', 'grade', 'feedback'
        ]
