from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone

from .models import ClassMaterial, Material, MaterialPublication, MaterialVersion
from .serializers import (
    ClassMaterialSerializer,
    MaterialSerializer,
    MaterialDetailSerializer,
    MaterialPublishSerializer,
    MaterialVersionSerializer,
    PublishedMaterialForClassSerializer,
)
from apps.classes.models import Class, ClassStudent


class ClassMaterialListCreateView(generics.ListCreateAPIView):
    queryset = ClassMaterial.objects.select_related('class_obj', 'created_by').all()
    serializer_class = ClassMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = ClassMaterial.objects.select_related('class_obj', 'created_by').all()
        class_id = self.request.query_params.get('class_id')
        if class_id:
            qs = qs.filter(class_obj_id=class_id)
        # Restrict students to classes they are enrolled in
        user = self.request.user
        if getattr(user, 'role', None) == 'student':
            enrolled_ids = ClassStudent.objects.filter(student__email__iexact=user.email, is_active=True).values_list('class_obj_id', flat=True)
            qs = qs.filter(class_obj_id__in=enrolled_ids)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        class_obj = serializer.validated_data.get('class_obj')
        if getattr(user, 'role', None) != 'admin' and class_obj.teacher != user:
            raise permissions.PermissionDenied('Bạn không có quyền đăng tài liệu cho lớp này')
        serializer.save(created_by=user)


class ClassMaterialDetailView(generics.RetrieveDestroyAPIView):
    queryset = ClassMaterial.objects.select_related('class_obj', 'created_by').all()
    serializer_class = ClassMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if getattr(user, 'role', None) != 'admin' and instance.class_obj.teacher != user:
            return Response({'error': 'Bạn không có quyền xóa tài liệu này'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


# ---------------------------
# Teacher-centric repository
# ---------------------------

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if getattr(user, 'role', None) == 'admin':
            return True
        owner = getattr(obj, 'owner', None)
        return owner == user


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all().select_related('owner').prefetch_related('versions', 'publications')
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action in ['retrieve']:
            return MaterialDetailSerializer
        return MaterialSerializer

    def get_queryset(self):
        qs = Material.objects.all().select_related('owner').prefetch_related('versions', 'publications')
        user = self.request.user
        # Teachers: only own materials; Admin: all
        if getattr(user, 'role', None) != 'admin':
            qs = qs.filter(owner=user)
        # Exclude trashed by default (except for trash/restore/purge actions)
        if getattr(self, 'action', None) not in ('trash', 'restore', 'purge'):
            qs = qs.filter(is_deleted=False)
        # Filters
        mtype = self.request.query_params.get('type')
        status_param = self.request.query_params.get('status')
        q = self.request.query_params.get('q')
        if mtype:
            qs = qs.filter(type=mtype)
        if status_param:
            qs = qs.filter(status=status_param)
        if q:
            from django.db.models import Q
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q) | Q(tags__icontains=q))
        return qs.order_by('-updated_at')

    def perform_create(self, serializer):
        # Create material with owner; if file provided, create initial version
        material = serializer.save(owner=self.request.user)
        upfile = self.request.data.get('file')
        change_note = self.request.data.get('change_note') or 'Initial version'
        if upfile:
            MaterialVersion.objects.create(material=material, file=upfile, change_note=change_note, created_by=self.request.user)
        return material

    def perform_update(self, serializer):
        instance = self.get_object()
        # Permission check
        if not IsOwnerOrAdmin().has_object_permission(self.request, self, instance):
            raise permissions.PermissionDenied('Bạn không có quyền sửa tài liệu này')
        return serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not IsOwnerOrAdmin().has_object_permission(request, self, instance):
            return Response({'error': 'Bạn không có quyền xóa tài liệu này'}, status=status.HTTP_403_FORBIDDEN)
        # Only allow soft delete (move to trash) when not published
        if instance.publications.exists():
            return Response({'error': 'Tài liệu đang được công bố. Hãy hủy công bố trước khi xóa.'}, status=status.HTTP_400_BAD_REQUEST)
        if instance.is_deleted:
            return Response({'message': 'Tài liệu đã nằm trong Thùng rác'}, status=status.HTTP_200_OK)
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])
        return Response({'message': 'Đã chuyển vào Thùng rác'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        material = self.get_object()
        if material.is_deleted:
            return Response({'error': 'Tài liệu đang ở Thùng rác, không thể công bố'}, status=status.HTTP_400_BAD_REQUEST)
        if not IsOwnerOrAdmin().has_object_permission(request, self, material):
            return Response({'error': 'Bạn không có quyền công bố tài liệu này'}, status=status.HTTP_403_FORBIDDEN)
        serializer = MaterialPublishSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        class_ids = data['class_ids']
        start = data.get('publish_start_at')
        end = data.get('publish_end_at')
        allow_download = data.get('allow_download', material.allow_download)
        # Create/update publications
        success_ids = []
        for cid in class_ids:
            try:
                class_obj = Class.objects.get(id=cid)
                # Teacher can only publish to their own classes (unless admin)
                if getattr(request.user, 'role', None) != 'admin' and class_obj.teacher != request.user:
                    continue
                MaterialPublication.objects.update_or_create(
                    material=material,
                    class_obj=class_obj,
                    defaults={
                        'publish_start_at': start,
                        'publish_end_at': end,
                        'allow_download': allow_download,
                    }
                )
                success_ids.append(cid)
            except Class.DoesNotExist:
                continue
        # Update status
        if success_ids:
            material.status = Material.Status.PUBLISHED
            material.save(update_fields=['status', 'updated_at'])
        return Response({'published_to': success_ids}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'])
    def versions(self, request, pk=None):
        material = self.get_object()
        if request.method.lower() == 'get':
            ser = MaterialVersionSerializer(material.versions.all().order_by('-version'), many=True, context={'request': request})
            return Response({'data': ser.data})
        # POST: upload new version
        if not IsOwnerOrAdmin().has_object_permission(request, self, material):
            return Response({'error': 'Bạn không có quyền cập nhật phiên bản'}, status=status.HTTP_403_FORBIDDEN)
        upfile = request.data.get('file')
        if not upfile:
            return Response({'error': 'Thiếu file'}, status=status.HTTP_400_BAD_REQUEST)
        change_note = request.data.get('change_note')
        ver = MaterialVersion.objects.create(material=material, file=upfile, change_note=change_note, created_by=request.user)
        return Response(MaterialVersionSerializer(ver, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='unpublish')
    def unpublish(self, request, pk=None):
        material = self.get_object()
        if not IsOwnerOrAdmin().has_object_permission(request, self, material):
            return Response({'error': 'Bạn không có quyền hủy công bố tài liệu này'}, status=status.HTTP_403_FORBIDDEN)
        class_ids = request.data.get('class_ids')
        if not isinstance(class_ids, list) or not class_ids:
            return Response({'error': 'class_ids phải là danh sách ID lớp'}, status=status.HTTP_400_BAD_REQUEST)
        removed = []
        for cid in class_ids:
            try:
                class_obj = Class.objects.get(id=cid)
                if getattr(request.user, 'role', None) != 'admin' and class_obj.teacher != request.user:
                    continue
                MaterialPublication.objects.filter(material=material, class_obj=class_obj).delete()
                removed.append(cid)
            except Class.DoesNotExist:
                continue
        # If no more publications, set back to draft
        if material.publications.count() == 0 and material.status != Material.Status.DRAFT:
            material.status = Material.Status.DRAFT
            material.save(update_fields=['status', 'updated_at'])
        return Response({'unpublished_from': removed, 'remaining_publications': material.publications.count()})


    @action(detail=False, methods=['get'])
    def trash(self, request):
        user = request.user
        qs = Material.objects.select_related('owner').prefetch_related('versions', 'publications').filter(is_deleted=True)
        if getattr(user, 'role', None) != 'admin':
            qs = qs.filter(owner=user)
        page = self.paginate_queryset(qs.order_by('-deleted_at'))
        serializer = MaterialSerializer(page or qs, many=True, context={'request': request})
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        material = self.get_object()
        if not IsOwnerOrAdmin().has_object_permission(request, self, material):
            return Response({'error': 'Bạn không có quyền khôi phục tài liệu này'}, status=status.HTTP_403_FORBIDDEN)
        if not material.is_deleted:
            return Response({'message': 'Tài liệu không ở Thùng rác'}, status=status.HTTP_200_OK)
        material.is_deleted = False
        material.deleted_at = None
        material.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])
        return Response({'message': 'Đã khôi phục tài liệu'})

    @action(detail=True, methods=['delete'])
    def purge(self, request, pk=None):
        material = self.get_object()
        if not IsOwnerOrAdmin().has_object_permission(request, self, material):
            return Response({'error': 'Bạn không có quyền xóa vĩnh viễn'}, status=status.HTTP_403_FORBIDDEN)
        if not material.is_deleted:
            return Response({'error': 'Chỉ xóa vĩnh viễn tài liệu trong Thùng rác'}, status=status.HTTP_400_BAD_REQUEST)
        if material.publications.exists():
            return Response({'error': 'Tài liệu đang được công bố. Hãy hủy công bố trước khi xóa vĩnh viễn.'}, status=status.HTTP_400_BAD_REQUEST)
        # Delete permanently; MaterialVersion files removed by signals
        material.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ClassPublishedMaterialsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        return PublishedMaterialForClassSerializer

    def get_queryset(self):
        class_id = self.kwargs.get('class_id')
        user = self.request.user
        now = None
        from django.utils import timezone as dj_tz
        now = dj_tz.now()

        # Permission checks
        try:
            class_obj = Class.objects.get(id=class_id)
        except Class.DoesNotExist:
            from django.http import Http404
            raise Http404

        if getattr(user, 'role', None) == 'student':
            enrolled = ClassStudent.objects.filter(class_obj_id=class_id, student__email__iexact=user.email, is_active=True).exists()
            if not enrolled:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Bạn không thuộc lớp này')
        elif getattr(user, 'role', None) == 'teacher':
            if class_obj.teacher != user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Bạn không phụ trách lớp này')
        # admin can view

        from django.db.models import Q
        qs = Material.objects.filter(
            publications__class_obj_id=class_id,
            status=Material.Status.PUBLISHED,
        ).select_related('owner').prefetch_related('versions', 'publications')

        # Students only see materials in active window
        if getattr(user, 'role', None) == 'student':
            qs = qs.filter(
                Q(publications__publish_start_at__isnull=True) | Q(publications__publish_start_at__lte=now),
                Q(publications__publish_end_at__isnull=True) | Q(publications__publish_end_at__gte=now),
            )
        return qs.order_by('-updated_at')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['class_id'] = self.kwargs.get('class_id')
        return ctx
