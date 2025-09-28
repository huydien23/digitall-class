from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone

from apps.classes.models import Class, ClassStudent
from apps.students.models import Student
from .models import Assignment, AssignmentSubmission
from .serializers import AssignmentSerializer, AssignmentCreateSerializer, SubmissionSerializer, MySubmissionSerializer


class AssignmentListCreateView(generics.ListCreateAPIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AssignmentCreateSerializer
        return AssignmentSerializer

    def get_queryset(self):
        queryset = Assignment.objects.all()
        class_id = self.request.query_params.get('class_id')
        if class_id:
            queryset = queryset.filter(class_obj_id=class_id)
        # Students see published assignments of classes they are enrolled in (including not-yet-open)
        user = self.request.user
        if hasattr(user, 'role') and user.role == 'student':
            student = Student.objects.filter(user=user).first()
            if not student:
                return Assignment.objects.none()
            queryset = queryset.filter(
                is_published=True,
                class_obj__class_students__student=student,
                class_obj__class_students__is_active=True,
            )
        return queryset.order_by('-release_at', '-created_at')

    def perform_create(self, serializer):
        # Teacher only for the class
        class_id = self.request.data.get('class_id')
        try:
            class_obj = Class.objects.get(id=class_id)
        except Class.DoesNotExist:
            raise generics.ValidationError('Class not found')
        user = self.request.user
        if user.role != 'admin' and class_obj.teacher != user:
            raise permissions.PermissionDenied('Bạn không có quyền tạo bài cho lớp này')
        serializer.save()


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def update(self, request, *args, **kwargs):
        assignment = self.get_object()
        user = request.user
        if user.role != 'admin' and assignment.created_by != user and assignment.class_obj.teacher != user:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        assignment = self.get_object()
        user = request.user
        if user.role != 'admin' and assignment.class_obj.teacher != user:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_assignment(request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        user = request.user
        student = Student.objects.filter(user=user).first()
        if not student:
            return Response({'error': 'Không tìm thấy hồ sơ sinh viên'}, status=status.HTTP_400_BAD_REQUEST)
        if not ClassStudent.objects.filter(class_obj=assignment.class_obj, student=student, is_active=True).exists():
            return Response({'error': 'Bạn không thuộc lớp này'}, status=status.HTTP_403_FORBIDDEN)
        subm, _ = AssignmentSubmission.objects.get_or_create(assignment=assignment, student=student, attempt_number=1)
        if not subm.started_at:
            subm.started_at = timezone.now()
            if assignment.time_limit_minutes:
                subm.personal_due_at = subm.started_at + timezone.timedelta(minutes=assignment.time_limit_minutes)
            subm.save(update_fields=['started_at', 'personal_due_at'])
        return Response(MySubmissionSerializer(subm).data)
    except Assignment.DoesNotExist:
        return Response({'error': 'Không tìm thấy bài'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def grade_submission(request, assignment_id, submission_id):
    """Teacher/Admin grades a submission"""
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        subm = AssignmentSubmission.objects.get(id=submission_id, assignment=assignment)
        user = request.user
        if user.role != 'admin' and assignment.class_obj.teacher != user:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)
        grade = request.data.get('grade')
        feedback = request.data.get('feedback')
        updated = False
        if grade is not None and grade != '':
            try:
                subm.grade = float(grade)
                updated = True
            except Exception:
                return Response({'error': 'Điểm không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)
        if feedback is not None:
            subm.feedback = feedback
            updated = True
        if updated:
            subm.status = AssignmentSubmission.Status.GRADED
            subm.graded_at = timezone.now()
            subm.graded_by = user
            subm.save()
        return Response(SubmissionSerializer(subm).data)
    except Assignment.DoesNotExist:
        return Response({'error': 'Không tìm thấy bài'}, status=status.HTTP_404_NOT_FOUND)
    except AssignmentSubmission.DoesNotExist:
        return Response({'error': 'Không tìm thấy bài nộp'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_submission(request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        user = request.user
        student = Student.objects.filter(user=user).first()
        if not student:
            return Response({'error': 'Không tìm thấy hồ sơ sinh viên'}, status=status.HTTP_400_BAD_REQUEST)
        subm = AssignmentSubmission.objects.filter(assignment=assignment, student=student).order_by('-attempt_number').first()
        if not subm:
            return Response({'detail': 'no submission'}, status=status.HTTP_204_NO_CONTENT)
        return Response(MySubmissionSerializer(subm).data)
    except Assignment.DoesNotExist:
        return Response({'error': 'Không tìm thấy bài'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_assignment(request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        user = request.user
        student = Student.objects.filter(user=user).first()
        if not student:
            return Response({'error': 'Không tìm thấy hồ sơ sinh viên'}, status=status.HTTP_400_BAD_REQUEST)
        if not ClassStudent.objects.filter(class_obj=assignment.class_obj, student=student, is_active=True).exists():
            return Response({'error': 'Bạn không thuộc lớp này'}, status=status.HTTP_403_FORBIDDEN)
        f = request.FILES.get('file')
        if not f:
            return Response({'error': 'Thiếu file'}, status=status.HTTP_400_BAD_REQUEST)
        if assignment.max_file_size_mb and f.size > assignment.max_file_size_mb * 1024 * 1024:
            return Response({'error': f'Kích thước vượt quá {assignment.max_file_size_mb}MB'}, status=status.HTTP_400_BAD_REQUEST)
        if assignment.allowed_file_types:
            allow = [ext.strip().lower() for ext in assignment.allowed_file_types.split(',') if ext.strip()]
            import os
            ext = os.path.splitext(f.name)[1].replace('.', '').lower()
            if allow and ext not in allow:
                return Response({'error': f'Chỉ cho phép: {assignment.allowed_file_types}'}, status=status.HTTP_400_BAD_REQUEST)
        subm, _ = AssignmentSubmission.objects.get_or_create(assignment=assignment, student=student, attempt_number=1)
        subm.file = f
        subm.file_size = f.size
        subm.uploaded_at = timezone.now()
        subm.status = AssignmentSubmission.Status.SUBMITTED
        subm.compute_late()
        subm.save()
        return Response(MySubmissionSerializer(subm).data)
    except Assignment.DoesNotExist:
        return Response({'error': 'Không tìm thấy bài'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_submissions(request, assignment_id):
    try:
        assignment = Assignment.objects.get(id=assignment_id)
        user = request.user
        if user.role != 'admin' and assignment.class_obj.teacher != user:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)
        subms = AssignmentSubmission.objects.filter(assignment=assignment).select_related('student')
        return Response(SubmissionSerializer(subms, many=True).data)
    except Assignment.DoesNotExist:
        return Response({'error': 'Không tìm thấy bài'}, status=status.HTTP_404_NOT_FOUND)
