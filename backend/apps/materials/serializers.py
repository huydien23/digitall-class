from rest_framework import serializers
from .models import ClassMaterial


class ClassMaterialSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploader = serializers.SerializerMethodField()

    class Meta:
        model = ClassMaterial
        fields = [
            'id', 'class_obj', 'title', 'description', 'file', 'file_url', 'link',
            'created_by', 'uploader', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'uploader', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        try:
            if obj.file and hasattr(obj.file, 'url'):
                return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        except Exception:
            return None
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
