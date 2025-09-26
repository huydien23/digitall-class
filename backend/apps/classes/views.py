from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from django.utils.crypto import get_random_string

from apps.accounts.models import User
from apps.students.models import Student
from apps.students.serializers import StudentSerializer
from apps.attendance.models import AttendanceSession, Attendance
from apps.grades.models import Grade, GradeSummary

from .models import Class, ClassStudent, ClassJoinToken
from .serializers import (
    ClassSerializer, ClassCreateSerializer, ClassDetailSerializer, ClassStudentSerializer
)


class ClassListCreateView(generics.ListCreateAPIView):
    """List and create classes"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClassCreateSerializer
        return ClassSerializer
    
    def get_queryset(self):
        queryset = Class.objects.all()
        
        # Filter by teacher if not admin
        if self.request.user.role != 'admin':
            queryset = queryset.filter(teacher=self.request.user)
        
        # Apply search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(class_id__icontains=search) |
                Q(class_name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Apply active filter
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('class_id')
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_classes(request):
    """Return classes that current student is enrolled in.
    Be tolerant to missing Student profile by trying both user link and email.
    If not found, auto-create a minimal Student profile to avoid empty results after join.
    """
    try:
        user = request.user
        # Prefer explicit user link
        student = Student.objects.filter(user=user).first()
        # Fallback by email (case-insensitive)
        if not student:
            student = Student.objects.filter(email__iexact=user.email).first()
        # As a last resort, attempt to create a Student profile
        if not student:
            from datetime import date
            student = Student.objects.create(
                user=user,
                student_id=user.student_id or f"U{user.id}",
                first_name=user.first_name or user.email.split('@')[0],
                last_name=user.last_name or '',
                email=user.email.lower(),
                gender='other',
                date_of_birth=date(2000, 1, 1)
            )
        classes = Class.objects.filter(
            class_students__student=student,
            class_students__is_active=True
        ).distinct().order_by('class_id')
        data = ClassSerializer(classes, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_join_token(request, class_id):
    """Teacher/Admin create a join token for a class"""
    try:
        class_obj = Class.objects.get(id=class_id)
        # Permission: teacher owns the class or admin
        if request.user.role != 'admin' and class_obj.teacher != request.user:
            return Response({'error': 'Bạn không có quyền tạo token cho lớp này'}, status=status.HTTP_403_FORBIDDEN)
        
        # Params
        expires_in_minutes = int(request.data.get('expires_in_minutes', 60))
        max_uses = int(request.data.get('max_uses', 0))
        token = get_random_string(24)
        expires_at = timezone.now() + timezone.timedelta(minutes=expires_in_minutes) if expires_in_minutes > 0 else None
        
        join_token = ClassJoinToken.objects.create(
            class_obj=class_obj,
            token=token,
            expires_at=expires_at,
            max_uses=max_uses,
            created_by=request.user
        )
        
        return Response({
            'token': join_token.token,
            'expires_at': join_token.expires_at,
            'max_uses': join_token.max_uses,
            'join_link': f"/api/classes/join/?token={join_token.token}"
        })
    except Class.DoesNotExist:
        return Response({'error': 'Không tìm thấy lớp học'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_class(request):
    """Student joins class using a join token OR a class_id (mã lớp)."""
    try:
        token = request.data.get('token') or request.query_params.get('token')
        class_id = request.data.get('class_id') or request.query_params.get('class_id')

        class_obj = None
        join_token = None

        if token:
            try:
                join_token = ClassJoinToken.objects.get(token=token, is_active=True)
            except ClassJoinToken.DoesNotExist:
                return Response({'error': 'Token không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)
            if not join_token.can_use():
                return Response({'error': 'Token đã hết hạn hoặc hết lượt sử dụng'}, status=status.HTTP_400_BAD_REQUEST)
            class_obj = join_token.class_obj
        elif class_id:
            # Allow join by mã lớp (12 số). Không cần token.
            try:
                class_obj = Class.objects.get(class_id=str(class_id))
            except Class.DoesNotExist:
                return Response({'error': 'Mã lớp không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Thiếu token hoặc mã lớp'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        
        # Optional roster restriction by email
        if class_obj.restrict_to_roster_emails:
            if not Student.objects.filter(email__iexact=user.email).exists():
                return Response({'error': 'Email của bạn chưa có trong danh sách lớp. Liên hệ giảng viên.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Ensure Student profile exists
        student = Student.objects.filter(email__iexact=user.email).first()
        if not student:
            from datetime import date
            student = Student.objects.create(
                user=user,
                student_id=user.student_id or f"U{user.id}",
                first_name=user.first_name or user.email.split('@')[0],
                last_name=user.last_name or '',
                email=user.email.lower(),
                gender='other',
                date_of_birth=date(2000, 1, 1)
            )
        else:
            # Ensure the student is linked to this user for future queries
            if not student.user:
                student.user = user
                student.save(update_fields=['user'])
        
        # Enroll if not exists
        rel, created = ClassStudent.objects.get_or_create(
            class_obj=class_obj,
            student=student,
            defaults={
                'status': ClassStudent.Status.ACTIVE,
                'is_active': True,
                'joined_at': timezone.now(),
                'source': ClassStudent.Source.JOIN_CODE
            }
        )
        # Re-activate if previously removed or inactive
        if not created and (rel.status != ClassStudent.Status.ACTIVE or not rel.is_active):
            rel.status = ClassStudent.Status.ACTIVE
            rel.is_active = True
            rel.joined_at = rel.joined_at or timezone.now()
            rel.source = rel.source or ClassStudent.Source.JOIN_CODE
            rel.save(update_fields=['status', 'is_active', 'joined_at', 'source'])
        
        # consume token if used
        if join_token:
            join_token.use_count += 1
            join_token.save(update_fields=['use_count'])
        
        return Response({'message': 'Tham gia lớp thành công', 'class_id': class_obj.id})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a class"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ClassDetailSerializer
        return ClassSerializer
    
    def get_queryset(self):
        queryset = Class.objects.all()
        
        # Filter by teacher if not admin
        if self.request.user.role != 'admin':
            queryset = queryset.filter(teacher=self.request.user)
        
        return queryset

    def destroy(self, request, *args, **kwargs):
        """Override destroy to safely delete related records to avoid DB constraint errors."""
        instance = self.get_object()
        # Permission check: teacher can only delete own class
        if request.user.role != 'admin' and instance.teacher != request.user:
            return Response({'error': 'Bạn không có quyền xóa lớp này'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # Delete related attendance first
            Attendance.objects.filter(session__class_obj=instance).delete()
            AttendanceSession.objects.filter(class_obj=instance).delete()
            # Delete related grades
            Grade.objects.filter(class_obj=instance).delete()
            GradeSummary.objects.filter(class_obj=instance).delete()
            # Delete class-student relations
            ClassStudent.objects.filter(class_obj=instance).delete()
            # Finally delete the class
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClassStudentListCreateView(generics.ListCreateAPIView):
    """List and add students to a class"""
    serializer_class = ClassStudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        class_id = self.kwargs['class_id']
        return ClassStudent.objects.filter(class_obj_id=class_id, is_active=True)
    
    def perform_create(self, serializer):
        class_id = self.kwargs['class_id']
        try:
            class_obj = Class.objects.get(id=class_id)
            # Check if user has permission to add students to this class
            if self.request.user.role != 'admin' and class_obj.teacher != self.request.user:
                raise PermissionError("Bạn không có quyền thêm sinh viên vào lớp này")
            
            # Check if class is full
            if class_obj.is_full:
                raise ValueError("Lớp đã đầy")
            
            serializer.save(class_obj=class_obj)
        except Class.DoesNotExist:
            raise ValueError("Không tìm thấy lớp học")


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_student_from_class(request, class_id, student_id):
    """Remove a student from a class"""
    try:
        class_obj = Class.objects.get(id=class_id)
        
        # Check permission
        if request.user.role != 'admin' and class_obj.teacher != request.user:
            return Response(
                {'error': 'Bạn không có quyền xóa sinh viên khỏi lớp này'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        class_student = ClassStudent.objects.get(
            class_obj=class_obj,
            student__student_id=student_id,
            is_active=True
        )
        class_student.is_active = False
        try:
            # Update status for clarity
            from .models import ClassStudent as CS
            class_student.status = CS.Status.REMOVED
        except Exception:
            pass
        class_student.save(update_fields=['is_active', 'status'])
        
        return Response({'message': 'Đã xóa sinh viên khỏi lớp thành công'})
        
    except Class.DoesNotExist:
        return Response({'error': 'Không tìm thấy lớp học'}, status=status.HTTP_404_NOT_FOUND)
    except ClassStudent.DoesNotExist:
        return Response({'error': 'Không tìm thấy sinh viên trong lớp'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def class_statistics(request):
    """Get comprehensive class statistics"""
    try:
        from django.db.models import Count, Avg, Q
        from datetime import date, timedelta
        
        queryset = Class.objects.all()
        
        # Filter by teacher if not admin
        if request.user.role != 'admin':
            queryset = queryset.filter(teacher=request.user)
        
        # Basic counts
        total_classes = queryset.count()
        active_classes = queryset.filter(is_active=True).count()
        inactive_classes = queryset.filter(is_active=False).count()
        
        # Student enrollment statistics
        classes_with_students = queryset.filter(class_students__is_active=True).distinct()
        total_students_in_classes = sum(
            class_obj.current_students_count for class_obj in classes_with_students
        )
        avg_students_per_class = (
            total_students_in_classes / active_classes if active_classes > 0 else 0
        )
        
        # Capacity analysis
        full_classes = 0
        empty_classes = 0
        
        for class_obj in classes_with_students:
            if class_obj.current_students_count >= class_obj.max_students:
                full_classes += 1
            elif class_obj.current_students_count == 0:
                empty_classes += 1
        
        # Recent activity
        thirty_days_ago = date.today() - timedelta(days=30)
        recent_classes = queryset.filter(created_at__gte=thirty_days_ago).count()
        
        # Teacher distribution (for admin)
        teacher_stats = []
        if request.user.role == 'admin':
            teacher_stats = list(
                queryset.values('teacher__first_name', 'teacher__last_name')
                .annotate(class_count=Count('id'))
                .order_by('-class_count')[:10]
            )
        
        return Response({
            'total_classes': total_classes,
            'active_classes': active_classes,
            'inactive_classes': inactive_classes,
            'total_students_in_classes': total_students_in_classes,
            'avg_students_per_class': round(avg_students_per_class, 2),
            'capacity_analysis': {
                'full_classes': full_classes,
                'empty_classes': empty_classes,
                'utilization_rate': round(
                    (total_students_in_classes / (active_classes * 50) * 100) 
                    if active_classes > 0 else 0, 2
                )
            },
            'recent_activity': {
                'new_classes_last_30_days': recent_classes
            },
            'teacher_distribution': teacher_stats
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_students(request, class_id):
    """Get students not in the specified class"""
    try:
        class_obj = Class.objects.get(id=class_id)
        
        # Get students already in this class
        enrolled_student_ids = ClassStudent.objects.filter(
            class_obj=class_obj, is_active=True
        ).values_list('student_id', flat=True)
        
        # Get available students
        available_students = Student.objects.filter(
            is_active=True
        ).exclude(id__in=enrolled_student_ids)
        
        serializer = StudentSerializer(available_students, many=True)
        return Response(serializer.data)
        
    except Class.DoesNotExist:
        return Response({'error': 'Không tìm thấy lớp học'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def class_detail_with_students(request, class_id):
    """Get detailed class information with students, attendance, and grades"""
    try:
        # Get class
        class_obj = Class.objects.get(id=class_id)
        
        # Check permission
        if request.user.role != 'admin' and class_obj.teacher != request.user:
            return Response(
                {'error': 'Bạn không có quyền xem lớp này'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get students in class
        class_students = ClassStudent.objects.filter(
            class_obj=class_obj, 
            is_active=True
        ).select_related('student')
        
        # Get attendance sessions for this class
        attendance_sessions = AttendanceSession.objects.filter(
            class_obj=class_obj
        ).order_by('session_date')
        
        # Prepare student data with attendance and grades
        students_data = []
        for cs in class_students:
            student = cs.student
            
            # Get attendance records for this student
            attendance_records = {}
            for session in attendance_sessions:
                try:
                    attendance = Attendance.objects.get(
                        session=session, 
                        student=student
                    )
                    attendance_records[session.id] = attendance.status == 'present'
                except Attendance.DoesNotExist:
                    attendance_records[session.id] = False
            
            # Get grades for this student in this class
            grades = Grade.objects.filter(
                student=student,
                class_obj=class_obj
            )
            
            grades_data = {
                'regular': None,
                'midterm': None,
                'final': None
            }
            
            for grade in grades:
                if grade.grade_type == 'regular':
                    grades_data['regular'] = float(grade.score)
                elif grade.grade_type == 'midterm':
                    grades_data['midterm'] = float(grade.score)
                elif grade.grade_type == 'final':
                    grades_data['final'] = float(grade.score)
            
            students_data.append({
                'id': student.id,
                'student_id': student.student_id,
                'name': student.full_name,
                'email': student.email,
                'phone': student.phone,
                'attendance': attendance_records,
                'grades': grades_data
            })
        
        # Prepare attendance sessions data
        sessions_data = []
        for session in attendance_sessions:
            sessions_data.append({
                'id': session.id,
                'session_name': session.session_name,
                'session_date': session.session_date.strftime('%Y-%m-%d'),
                'start_time': session.start_time.strftime('%H:%M'),
                'end_time': session.end_time.strftime('%H:%M'),
                'location': session.location or '',
                'qr_code': session.qr_code or ''
            })
        
        # Prepare class data
        class_data = {
            'id': class_obj.id,
            'class_id': class_obj.class_id,
            'class_name': class_obj.class_name,
            'description': class_obj.description,
            'teacher': class_obj.teacher.get_full_name(),
            'teacher_id': class_obj.teacher.id,
            'max_students': class_obj.max_students,
            'current_students': len(students_data),
            'is_active': class_obj.is_active,
            'created_at': class_obj.created_at.isoformat(),
            'updated_at': class_obj.updated_at.isoformat()
        }
        
        return Response({
            'class': class_data,
            'students': students_data,
            'attendance_sessions': sessions_data
        })
        
    except Class.DoesNotExist:
        return Response(
            {'error': 'Không tìm thấy lớp học'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
