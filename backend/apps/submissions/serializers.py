from rest_framework import serializers
from .models import Submission, SUBMISSION_ALLOWED_EXTENSIONS, SUBMISSION_MAX_FILE_SIZE, SUBMISSION_MAX_FILE_SIZE_MB
import os


class SubmissionSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    student_info = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            'id', 'class_obj', 'student', 'title', 'description', 'file',
            'file_url', 'file_size', 'student_info', 'created_at'
        ]
        read_only_fields = ['id', 'student', 'created_at', 'file_size', 'student_info']

    def validate(self, attrs):
        file = attrs.get('file') or getattr(getattr(self, 'instance', None), 'file', None)
        errors = {}
        if not file:
            errors['file'] = 'Cần upload file.'
        else:
            ext = os.path.splitext(file.name)[1].lower().lstrip('.')
            if ext not in SUBMISSION_ALLOWED_EXTENSIONS:
                errors['file'] = f'Định dạng không hợp lệ. Cho phép: {", ".join(sorted(SUBMISSION_ALLOWED_EXTENSIONS))}.'
            size = getattr(file, 'size', 0)
            if size and size > SUBMISSION_MAX_FILE_SIZE:
                errors['file'] = f'File quá lớn (>{SUBMISSION_MAX_FILE_SIZE_MB}MB).'
        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    def get_file_url(self, obj):
        request = self.context.get('request')
        try:
            if obj.file and hasattr(obj.file, 'url'):
                return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        except Exception:
            return None
        return None

    def get_file_size(self, obj):
        try:
            return getattr(obj.file, 'size', None) if obj.file else None
        except Exception:
            return None

    def get_student_info(self, obj):
        st = obj.student
        return {
            'id': st.id,
            'student_id': st.student_id,
            'full_name': st.full_name,
            'email': st.email,
        }
