from rest_framework import generics, status, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Submission
from .serializers import SubmissionSerializer
from apps.classes.models import Class, ClassStudent
from apps.students.models import Student


class IsAuthenticatedAndRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class SubmissionListCreateView(generics.ListCreateAPIView):
    queryset = Submission.objects.select_related('class_obj', 'student').all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticatedAndRole]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = Submission.objects.select_related('class_obj', 'student').all()
        user = self.request.user
        class_id = self.request.query_params.get('class_id')
        student_id = self.request.query_params.get('student_id')  # optional filter for teachers/admin

        if user.role == 'student':
            # Only own submissions
            qs = qs.filter(student__email__iexact=user.email)
            if class_id:
                qs = qs.filter(class_obj_id=class_id)
            return qs.order_by('-created_at')

        if user.role == 'teacher':
            # Only submissions for classes owned by this teacher
            qs = qs.filter(class_obj__teacher=user)
            if class_id:
                qs = qs.filter(class_obj_id=class_id)
            if student_id:
                qs = qs.filter(student__student_id=student_id)
            return qs.order_by('-created_at')

        # Admin: can filter by class/student
        if class_id:
            qs = qs.filter(class_obj_id=class_id)
        if student_id:
            qs = qs.filter(student__student_id=student_id)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'student':
            raise permissions.PermissionDenied('Chỉ sinh viên mới được nộp bài.')

        class_obj = serializer.validated_data.get('class_obj')
        if not class_obj:
            raise permissions.PermissionDenied('Thiếu thông tin lớp học.')

        # Verify enrollment
        is_enrolled = ClassStudent.objects.filter(
            class_obj=class_obj, student__email__iexact=user.email, is_active=True
        ).exists()
        if not is_enrolled:
            raise permissions.PermissionDenied('Bạn không thuộc lớp này, không thể nộp bài.')

        # Find the Student profile
        try:
            student = Student.objects.get(email__iexact=user.email)
        except Student.DoesNotExist:
            raise permissions.PermissionDenied('Không tìm thấy hồ sơ sinh viên cho tài khoản này.')

        serializer.save(student=student, created_by=user)


class SubmissionDetailView(generics.RetrieveDestroyAPIView):
    queryset = Submission.objects.select_related('class_obj', 'student').all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticatedAndRole]

    def destroy(self, request, *args, **kwargs):
        submission = self.get_object()
        user = request.user
        if user.role == 'admin':
            return super().destroy(request, *args, **kwargs)
        if user.role == 'student':
            if submission.student.email.lower() == user.email.lower():
                return super().destroy(request, *args, **kwargs)
            return Response({'error': 'Bạn chỉ có thể xoá bài nộp của chính mình.'}, status=status.HTTP_403_FORBIDDEN)
        if user.role == 'teacher':
            if submission.class_obj.teacher_id == user.id:
                return super().destroy(request, *args, **kwargs)
            return Response({'error': 'Bạn không có quyền xoá bài nộp này.'}, status=status.HTTP_403_FORBIDDEN)
        return Response({'error': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)
