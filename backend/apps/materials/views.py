from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import ClassMaterial
from .serializers import ClassMaterialSerializer
from apps.classes.models import Class, ClassStudent


class ClassMaterialListCreateView(generics.ListCreateAPIView):
    queryset = ClassMaterial.objects.select_related('class_obj', 'created_by').all()
    serializer_class = ClassMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = ClassMaterial.objects.select_related('class_obj', 'created_by').all()
        class_id = self.request.query_params.get('class_id')
        if class_id:
            qs = qs.filter(class_obj_id=class_id)
        # Restrict students to classes they are enrolled in
        user = self.request.user
        if user.role == 'student':
            enrolled_ids = ClassStudent.objects.filter(student__email__iexact=user.email, is_active=True).values_list('class_obj_id', flat=True)
            qs = qs.filter(class_obj_id__in=enrolled_ids)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        class_obj = serializer.validated_data.get('class_obj')
        if user.role != 'admin' and class_obj.teacher != user:
            raise permissions.PermissionDenied('Bạn không có quyền đăng tài liệu cho lớp này')
        serializer.save(created_by=user)


class ClassMaterialDetailView(generics.RetrieveDestroyAPIView):
    queryset = ClassMaterial.objects.select_related('class_obj', 'created_by').all()
    serializer_class = ClassMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        if user.role != 'admin' and instance.class_obj.teacher != user:
            return Response({'error': 'Bạn không có quyền xóa tài liệu này'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
