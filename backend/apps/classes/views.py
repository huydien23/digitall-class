from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.db import transaction
from django.core.files.base import ContentFile

from apps.accounts.models import User
from apps.students.models import Student
from apps.students.serializers import StudentSerializer
from apps.attendance.models import AttendanceSession, Attendance
from apps.grades.models import Grade, GradeSummary

from .models import Class, ClassStudent, ClassJoinToken, AcademicYear, Term, Subject
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
        
        # Luôn lọc theo giảng viên hiện tại (không dùng admin)
        queryset = queryset.filter(teacher=self.request.user)
        
        # Apply search filter
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(class_id__icontains=search) |
                Q(class_name__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Filter theo kỳ/môn/năm học nếu có
        term_id = self.request.query_params.get('term_id')
        if term_id:
            queryset = queryset.filter(term_id=term_id)
        subject_id = self.request.query_params.get('subject_id')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        year_code = self.request.query_params.get('year_code')
        if year_code:
            queryset = queryset.filter(term__year__code=year_code)
        season = self.request.query_params.get('season')
        if season:
            queryset = queryset.filter(term__season=season)
        
        # Apply active filter
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('class_id')
    
    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_years(request):
    """Danh sách năm học mà giảng viên hiện tại có lớp, kèm số lớp và số kỳ."""
    try:
        qs = Class.objects.filter(teacher=request.user).select_related('term__year')
        agg = (
            qs.values('term__year_id', 'term__year__code')
              .annotate(class_count=Count('id'), term_count=Count('term', distinct=True))
              .order_by('-term__year__code')
        )
        data = [
            {
                'year_id': r['term__year_id'],
                'code': r['term__year__code'],
                'name': f"Năm học {r['term__year__code']}",
                'class_count': r['class_count'],
                'term_count': r['term_count'],
            }
            for r in agg
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_terms(request):
    """Danh sách học kỳ (HK1/HK2/HK3) theo năm học lựa chọn của giảng viên, kèm số lớp."""
    try:
        year_id = request.query_params.get('year_id')
        year_code = request.query_params.get('year_code')
        qs = Class.objects.filter(teacher=request.user).select_related('term__year')
        if year_id:
            qs = qs.filter(term__year_id=year_id)
        if year_code:
            qs = qs.filter(term__year__code=year_code)
        agg = (
            qs.values('term_id', 'term__name', 'term__season', 'term__year__code')
              .annotate(class_count=Count('id'))
              .order_by('-term__year__code', 'term__season')
        )
        data = [
            {
                'term_id': r['term_id'],
                'year_code': r['term__year__code'],
                'season': r['term__season'],
                'name': r['term__name'],
                'class_count': r['class_count'],
            }
            for r in agg
        ]
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


class SubjectListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.all().order_by('code')
    permission_classes = [permissions.IsAuthenticated]

    class SubjectSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        code = serializers.CharField()
        name = serializers.CharField()
        credits = serializers.IntegerField(required=False, default=3)
        description = serializers.CharField(required=False, allow_blank=True)

        def validate_code(self, value):
            if Subject.objects.filter(code=value).exists():
                raise serializers.ValidationError('Mã môn học đã tồn tại')
            return value

    def get(self, request, *args, **kwargs):
        search = request.query_params.get('search')
        qs = self.get_queryset()
        if search:
            qs = qs.filter(Q(code__icontains=search) | Q(name__icontains=search))
        data = [
            {
                'id': s.id,
                'code': s.code,
                'name': s.name,
                'credits': s.credits,
                'description': s.description,
            } for s in qs[:200]
        ]
        return Response(data)

    def post(self, request, *args, **kwargs):
        ser = self.SubjectSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        s = Subject.objects.create(
            code=ser.validated_data['code'],
            name=ser.validated_data['name'],
            credits=ser.validated_data.get('credits', 3),
            description=ser.validated_data.get('description', ''),
            created_by=request.user
        )
        return Response({
            'id': s.id,
            'code': s.code,
            'name': s.name,
            'credits': s.credits,
            'description': s.description,
        }, status=status.HTTP_201_CREATED)


class AcademicYearListCreateView(generics.ListCreateAPIView):
    queryset = AcademicYear.objects.all().order_by('-code')
    permission_classes = [permissions.IsAuthenticated]

    class YearSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        code = serializers.CharField()
        name = serializers.CharField(required=False)
        start_date = serializers.DateField(required=False, allow_null=True)
        end_date = serializers.DateField(required=False, allow_null=True)

        def validate_code(self, value):
            if AcademicYear.objects.filter(code=value).exists():
                raise serializers.ValidationError('Năm học đã tồn tại')
            return value

    def get(self, request, *args, **kwargs):
        qs = self.get_queryset()
        data = [
            {
                'id': y.id,
                'code': y.code,
                'name': y.name,
                'start_date': y.start_date,
                'end_date': y.end_date,
            } for y in qs[:200]
        ]
        return Response(data)

    def post(self, request, *args, **kwargs):
        ser = self.YearSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        y = AcademicYear.objects.create(
            code=ser.validated_data['code'],
            name=ser.validated_data.get('name') or f"Năm học {ser.validated_data['code']}",
            start_date=ser.validated_data.get('start_date'),
            end_date=ser.validated_data.get('end_date'),
        )
        return Response({
            'id': y.id,
            'code': y.code,
            'name': y.name,
            'start_date': y.start_date,
            'end_date': y.end_date,
        }, status=status.HTTP_201_CREATED)


class TermListCreateView(generics.ListCreateAPIView):
    queryset = Term.objects.select_related('year').all().order_by('-year__code', 'season')
    permission_classes = [permissions.IsAuthenticated]

    class TermSerializer(serializers.Serializer):
        id = serializers.IntegerField(read_only=True)
        year_id = serializers.IntegerField(required=False)
        year_code = serializers.CharField(required=False)
        season = serializers.ChoiceField(choices=Term.Season.choices)
        name = serializers.CharField(required=False)
        is_current = serializers.BooleanField(required=False)
        start_date = serializers.DateField(required=False, allow_null=True)
        end_date = serializers.DateField(required=False, allow_null=True)

    def get(self, request, *args, **kwargs):
        qs = self.get_queryset()
        year_id = request.query_params.get('year_id')
        year_code = request.query_params.get('year_code')
        if year_id:
            qs = qs.filter(year_id=year_id)
        if year_code:
            qs = qs.filter(year__code=year_code)
        data = [
            {
                'id': t.id,
                'name': t.name,
                'season': t.season,
                'is_current': t.is_current,
                'year': {'id': t.year.id, 'code': t.year.code}
            } for t in qs[:300]
        ]
        return Response(data)

    def post(self, request, *args, **kwargs):
        ser = self.TermSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        year = None
        if ser.validated_data.get('year_id'):
            year = AcademicYear.objects.get(id=ser.validated_data['year_id'])
        elif ser.validated_data.get('year_code'):
            year, _ = AcademicYear.objects.get_or_create(
                code=ser.validated_data['year_code'],
                defaults={'name': f"Năm học {ser.validated_data['year_code']}"}
            )
        else:
            return Response({'error': 'Cần cung cấp year_id hoặc year_code'}, status=status.HTTP_400_BAD_REQUEST)
        season = ser.validated_data['season']
        name = ser.validated_data.get('name') or f"{dict(Term.Season.choices)[season]} {year.code}"
        is_current = ser.validated_data.get('is_current', False)
        t, created = Term.objects.get_or_create(
            year=year,
            season=season,
            defaults={
                'name': name,
                'is_current': is_current,
                'start_date': ser.validated_data.get('start_date'),
                'end_date': ser.validated_data.get('end_date'),
            }
        )
        if not created:
            # Update basic fields if already exists
            t.name = name
            t.is_current = is_current
            if 'start_date' in ser.validated_data:
                t.start_date = ser.validated_data.get('start_date')
            if 'end_date' in ser.validated_data:
                t.end_date = ser.validated_data.get('end_date')
            t.save()
        return Response({
            'id': t.id,
            'name': t.name,
            'season': t.season,
            'is_current': t.is_current,
            'year': {'id': t.year.id, 'code': t.year.code}
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def copy_class(request):
    """Sao chép lớp từ kỳ này sang kỳ khác. Không copy roster/điểm/điểm danh.
    Body: {source_class_id, target_term_id, new_class_name?, options?: {copy_materials: true}}
    """
    try:
        source_id = request.data.get('source_class_id')
        target_term_id = request.data.get('target_term_id')
        new_name = request.data.get('new_class_name')
        options = request.data.get('options', {}) or {}
        if not source_id or not target_term_id:
            return Response({'error': 'Thiếu source_class_id hoặc target_term_id'}, status=status.HTTP_400_BAD_REQUEST)
        source = Class.objects.get(id=source_id)
        if source.teacher != request.user:
            return Response({'error': 'Bạn không có quyền sao chép lớp này'}, status=status.HTTP_403_FORBIDDEN)
        target_term = Term.objects.get(id=target_term_id)

        with transaction.atomic():
            # Tạo lớp mới
            prefix = '0101000'
            suffix_len = 12 - len(prefix)
            new_class_id = None
            for _ in range(25):
                candidate = prefix + ''.join('0123456789'[int(x)] for x in str(int(timezone.now().timestamp()*1000))[-suffix_len:])
                if not Class.objects.filter(class_id=candidate).exists():
                    new_class_id = candidate
                    break
            if not new_class_id:
                new_class_id = f"{prefix}{get_random_string(suffix_len, '0123456789')}"

            new_class = Class.objects.create(
                class_id=new_class_id,
                class_name=new_name or source.class_name,
                description=source.description,
                teacher=request.user,
                subject=source.subject,
                term=target_term,
                max_students=source.max_students,
                class_mode=source.class_mode,
                is_active=True,
            )

            # Sao chép tài liệu nếu chọn
            if options.get('copy_materials', True):
                from apps.materials.models import ClassMaterial
                for m in ClassMaterial.objects.filter(class_obj=source):
                    new_file = None
                    if m.file:
                        with m.file.open('rb') as f:
                            content = f.read()
                        filename = m.file.name.split('/')[-1]
                        new_file = ContentFile(content, name=f"copy_{get_random_string(6)}_{filename}")
                    ClassMaterial.objects.create(
                        class_obj=new_class,
                        title=m.title,
                        description=m.description,
                        file=new_file,
                        link=m.link,
                        created_by=request.user,
                    )

        return Response(ClassSerializer(new_class).data, status=status.HTTP_201_CREATED)
    except Class.DoesNotExist:
        return Response({'error': 'Không tìm thấy lớp nguồn'}, status=status.HTTP_404_NOT_FOUND)
    except Term.DoesNotExist:
        return Response({'error': 'Không tìm thấy học kỳ đích'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_roster(request):
    """Sao chép danh sách sinh viên từ lớp cũ sang lớp mới (cùng giảng viên).
    Body: {source_class_id, target_class_id, dry_run?}
    Nếu dry_run=true, chỉ trả về thống kê (created/reactivated/skipped) mà không ghi dữ liệu.
    """
    try:
        source_id = request.data.get('source_class_id')
        target_id = request.data.get('target_class_id')
        dry_run = bool(request.data.get('dry_run', False))
        if not source_id or not target_id:
            return Response({'error': 'Thiếu source_class_id hoặc target_class_id'}, status=status.HTTP_400_BAD_REQUEST)
        source = Class.objects.get(id=source_id)
        target = Class.objects.get(id=target_id)
        # Quyền: phải là lớp của giảng viên hiện tại
        if source.teacher != request.user or target.teacher != request.user:
            return Response({'error': 'Bạn chỉ có thể sao chép sinh viên giữa các lớp của bạn'}, status=status.HTTP_403_FORBIDDEN)

        # Build index of existing students in target for quick checks
        target_map = {
            cs.student_id: (cs.id, cs.is_active)
            for cs in ClassStudent.objects.filter(class_obj=target).only('id', 'student_id', 'is_active')
        }

        created_count = 0
        reactivated_count = 0
        skipped_count = 0
        for rel in ClassStudent.objects.filter(class_obj=source, is_active=True).select_related('student'):
            key = rel.student_id
            if key not in target_map:
                created_count += 1
                if not dry_run:
                    ClassStudent.objects.create(
                        class_obj=target,
                        student=rel.student,
                        status=rel.status,
                        is_active=True,
                        joined_at=timezone.now(),
                        source=ClassStudent.Source.ADMIN,
                    )
            else:
                _, is_active = target_map[key]
                if not is_active:
                    reactivated_count += 1
                    if not dry_run:
                        cs = ClassStudent.objects.get(class_obj=target, student=rel.student)
                        cs.is_active = True
                        cs.status = rel.status
                        cs.joined_at = cs.joined_at or timezone.now()
                        cs.source = cs.source or ClassStudent.Source.ADMIN
                        cs.save(update_fields=['is_active', 'status', 'joined_at', 'source'])
                else:
                    skipped_count += 1

        return Response({
            'message': 'Xem trước' if dry_run else 'Đã sao chép danh sách sinh viên',
            'created': created_count,
            'reactivated': reactivated_count,
            'skipped': skipped_count,
            'target_class_id': target.id,
            'dry_run': dry_run,
        }, status=status.HTTP_200_OK)
    except Class.DoesNotExist:
        return Response({'error': 'Không tìm thấy lớp'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
