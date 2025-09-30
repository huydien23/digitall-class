from rest_framework import serializers
from .models import (
    ClassMaterial,
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    MAX_FILE_SIZE_MB,
    Material,
    MaterialPublication,
    MaterialVersion,
)
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


# ---------------------------
# Teacher-centric Serializers
# ---------------------------

class MaterialVersionSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MaterialVersion
        fields = ['id', 'version', 'file', 'file_url', 'change_note', 'created_by', 'created_at']
        read_only_fields = ['id', 'version', 'created_by', 'created_at', 'file_url']

    def get_file_url(self, obj):
        request = self.context.get('request')
        try:
            if obj.file and hasattr(obj.file, 'url'):
                return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        except Exception:
            return None
        return None


class MaterialPublicationBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialPublication
        fields = ['class_obj', 'publish_start_at', 'publish_end_at', 'allow_download']


class MaterialSerializer(serializers.ModelSerializer):
    owner_email = serializers.SerializerMethodField()
    latest_version = serializers.SerializerMethodField()
    publications_count = serializers.IntegerField(source='publications.count', read_only=True)

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'description', 'type', 'status', 'tags', 'allow_download',
            'owner', 'owner_email', 'created_at', 'updated_at',
            'latest_version', 'publications_count'
        ]
        read_only_fields = ['id', 'owner', 'owner_email', 'created_at', 'updated_at', 'publications_count', 'latest_version']

    def get_owner_email(self, obj):
        return getattr(obj.owner, 'email', None)

    def get_latest_version(self, obj):
        last = obj.versions.order_by('-version').first()
        if not last:
            return None
        return MaterialVersionSerializer(last, context=self.context).data


class MaterialDetailSerializer(MaterialSerializer):
    versions = MaterialVersionSerializer(many=True, read_only=True)
    publications = MaterialPublicationBriefSerializer(many=True, read_only=True)

    class Meta(MaterialSerializer.Meta):
        fields = MaterialSerializer.Meta.fields + ['versions', 'publications']


class MaterialPublishSerializer(serializers.Serializer):
    class_ids = serializers.ListField(child=serializers.IntegerField(), allow_empty=False)
    publish_start_at = serializers.DateTimeField(required=False, allow_null=True)
    publish_end_at = serializers.DateTimeField(required=False, allow_null=True)
    allow_download = serializers.BooleanField(required=False)


class PublishedMaterialForClassSerializer(MaterialSerializer):
    publish_start_at = serializers.SerializerMethodField()
    publish_end_at = serializers.SerializerMethodField()
    allow_download = serializers.SerializerMethodField()

    class Meta(MaterialSerializer.Meta):
        fields = MaterialSerializer.Meta.fields + ['publish_start_at', 'publish_end_at', 'allow_download']

    def _get_publication(self, obj):
        class_id = self.context.get('class_id')
        if not class_id:
            return None
        try:
            return obj.publications.select_related('class_obj').get(class_obj_id=class_id)
        except MaterialPublication.DoesNotExist:
            return None

    def get_publish_start_at(self, obj):
        pub = self._get_publication(obj)
        return pub.publish_start_at if pub else None

    def get_publish_end_at(self, obj):
        pub = self._get_publication(obj)
        return pub.publish_end_at if pub else None

    def get_allow_download(self, obj):
        pub = self._get_publication(obj)
        return pub.allow_download if pub else getattr(obj, 'allow_download', True)
