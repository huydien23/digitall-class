from rest_framework import serializers
from .models import ClassMaterial, ALLOWED_EXTENSIONS, MAX_FILE_SIZE, MAX_FILE_SIZE_MB
import os


class ClassMaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploader = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = ClassMaterial
        fields = [
            'id', 'class_obj', 'title', 'description', 'file', 'file_url', 'file_size', 'link',
            'created_by', 'uploader', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'uploader', 'created_at', 'file_size']

    def validate(self, attrs):
        file = attrs.get('file') or getattr(getattr(self, 'instance', None), 'file', None)
        link = attrs.get('link') or getattr(getattr(self, 'instance', None), 'link', None)
        errors = {}
        if not file and not link:
            errors['file'] = 'Cần upload file hoặc nhập link.'
            errors['link'] = 'Cần upload file hoặc nhập link.'
        if file:
            ext = os.path.splitext(file.name)[1].lower().lstrip('.')
            if ext not in ALLOWED_EXTENSIONS:
                errors['file'] = f'Định dạng không hợp lệ. Cho phép: {", ".join(sorted(ALLOWED_EXTENSIONS))}.'
            size = getattr(file, 'size', 0)
            if size and size > MAX_FILE_SIZE:
                errors['file'] = f'File quá lớn (>{MAX_FILE_SIZE_MB}MB).'
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

    def get_uploader(self, obj):
        user = obj.created_by
        if not user:
            return None
        return {
            'id': user.id,
            'email': user.email,
            'full_name': getattr(user, 'full_name', f"{user.first_name} {user.last_name}".strip())
        }
