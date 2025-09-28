from rest_framework import serializers
from apps.grouping.models import GroupSet, Group, GroupMember


class GroupMemberMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    student_id = serializers.CharField()
    full_name = serializers.CharField()
    email = serializers.EmailField()


class GroupSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    index = serializers.IntegerField()
    name = serializers.CharField()
    members = GroupMemberMiniSerializer(many=True)


class GroupSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupSet
        fields = ['id', 'class_obj', 'group_size', 'seed', 'title', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']
