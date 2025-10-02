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
from .import_excel_view import import_students_from_excel


class ClassListCreateView(generics.ListCreateAPIView):
    """List and create classes"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClassCreateSerializer
        return ClassSerializer

    def get_queryset(self):
        queryset = Class.objects.select_related(
            'teacher', 'subject', 'term', 'term__year'
        ).prefetch_related('class_students')

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
    """Danh sách năm học mà giảng viên hiện tại có lớp, kèm số lớp và số kỳ.
    Bổ sung: năm học hiện tại và năm kế tiếp nếu chưa có.
    """
    try:
        # Đảm bảo có năm học hiện tại
        current_year = AcademicYear.get_current_year()

        qs = Class.objects.filter(teacher=request.user).select_related('term__year')
        agg = (
            qs.values('term__year_id', 'term__year__code', 'term__year__is_current')
              .annotate(class_count=Count('id'), term_count=Count('term', distinct=True))
              .order_by('-term__year__code')
        )

        # Bổ sung các năm học chưa có lớp nào
        existing_year_ids = {r['term__year_id'] for r in agg}
        all_years = AcademicYear.objects.exclude(id__in=existing_year_ids).order_by('-code')[:3]

        data = []
        # Năm có lớp
        for r in agg:
            data.append({
                'year_id': r['term__year_id'],
                'code': r['term__year__code'],
                'name': f"Năm học {r['term__year__code']}",
                'class_count': r['class_count'],
                'term_count': r['term_count'],
                'is_current': r['term__year__is_current'],
                'has_classes': True
            })

        # Năm chưa có lớp nhưng có thể tạo lớp
        for year in all_years:
            data.append({
                'year_id': year.id,
                'code': year.code,
                'name': year.name,
                'class_count': 0,
                'term_count': year.terms.count(),
                'is_current': year.is_current,
                'has_classes': False
            })

        # Sắp xếp lại theo code giảm dần
        data.sort(key=lambda x: x['code'], reverse=True)
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_terms(request):
    """Danh sách học kỳ (HK1/HK2/HK3) theo năm học lựa chọn của giảng viên, kèm số lớp.
    Hiển thị tất cả 3 học kỳ của năm học, kể cả học kỳ chưa có lớp nào.
    """
    try:
        year_id = request.query_params.get('year_id')
        year_code = request.query_params.get('year_code')

        # Xác định năm học cần lấy học kỳ
        target_year = None
        if year_id:
            target_year = AcademicYear.objects.filter(id=year_id).first()
        elif year_code:
            target_year = AcademicYear.objects.filter(code=year_code).first()
        else:
            target_year = AcademicYear.get_current_year()

        if not target_year:
            return Response({'error': 'Không tìm thấy năm học'}, status=status.HTTP_404_NOT_FOUND)

        # Lấy số lượng lớp theo học kỳ
        class_counts = {}
        qs = Class.objects.filter(teacher=request.user, term__year=target_year)
        agg = qs.values('term_id').annotate(class_count=Count('id'))
        for item in agg:
            class_counts[item['term_id']] = item['class_count']

        # Lấy tất cả học kỳ của năm đó
        all_terms = Term.objects.filter(year=target_year).order_by('season')

        data = []
        for term in all_terms:
            data.append({
                'term_id': term.id,
                'year_code': target_year.code,
                'season': term.season,
                'name': term.name,
                'class_count': class_counts.get(term.id, 0),
                'is_current': term.is_current,
                'start_date': term.start_date,
                'end_date': term.end_date,
            })

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
            # Perform deletions step by step, handling errors for each step
            # Delete related attendance records
            Attendance.objects.filter(session__class_obj=instance).delete()
            AttendanceSession.objects.filter(class_obj=instance).delete()

            # Delete related grades
            Grade.objects.filter(class_obj=instance).delete()
            GradeSummary.objects.filter(class_obj=instance).delete()

            # Delete class materials (legacy) - with error handling
            try:
                from apps.materials.models import ClassMaterial
                ClassMaterial.objects.filter(class_obj=instance).delete()
            except (ImportError, Exception):
                # Materials app might not be installed or table doesn't exist
                pass

            # Delete material publications - separate try block
            try:
                from apps.materials.models import MaterialPublication
                MaterialPublication.objects.filter(class_obj=instance).delete()
            except (ImportError, Exception):
                # Table might not exist, skip
                pass

            # Delete assignments and submissions - with error handling
            try:
                from apps.assignments.models import Assignment
                Assignment.objects.filter(class_obj=instance).delete()
            except (ImportError, Exception):
                # Assignments app might not be installed
                pass

            # Delete grouping data - with error handling
            try:
                from apps.grouping.models import GroupSet
                GroupSet.objects.filter(class_obj=instance).delete()
            except (ImportError, Exception):
                # Grouping app might not be installed
                pass

            # Delete join tokens
            ClassJoinToken.objects.filter(class_obj=instance).delete()

            # Delete class-student relations
            ClassStudent.objects.filter(class_obj=instance).delete()

            # Finally delete the class
            try:
                instance.delete()
            except Exception as delete_err:
                # If deletion fails due to missing through-table (e.g., material_publications),
                # fallback to raw SQL deletion to avoid ORM touching the missing table.
                try:
                    from django.db import connection
                    table = instance._meta.db_table
                    with connection.cursor() as cursor:
                        cursor.execute(f"DELETE FROM {table} WHERE id = %s", [instance.id])
                except Exception:
                    # Re-raise the original error if fallback also fails
                    raise delete_err
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            return Response({'error': str(e), 'detail': error_detail}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    """Remove a student from a class """
    try:
        class_obj = Class.objects.get(id=class_id)

        # Check permission
        if request.user.role != 'admin' and class_obj.teacher != request.user:
            return Response(
                {'error': 'Bạn không có quyền xóa sinh viên khỏi lớp này'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Find the ClassStudent relationship
        class_student = ClassStudent.objects.get(
            class_obj=class_obj,
            student__student_id=student_id,
            is_active=True
        )

        # HARD DELETE: Xóa vĩnh viễn khỏi database (cho dev/test)
        # NOTE: Nên sử dụng soft delete (is_active=False) trong production
        class_student.delete()

        return Response({'message': 'Đã xóa sinh viên khỏi lớp thành công (hard delete)'})

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
                'first_name': student.first_name,
                'last_name': student.last_name,
                'email': student.email,
                'phone': student.phone,
                'gender': student.gender,
                'date_of_birth': student.date_of_birth.isoformat() if student.date_of_birth else None,
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
        code = serializers.CharField(max_length=32, help_text='Mã môn học (VD: CS101, MATH201)')
        name = serializers.CharField(max_length=128, help_text='Tên môn học')
        credits = serializers.IntegerField(required=False, default=3, min_value=1, max_value=6, help_text='Số tín chỉ (1-6)')
        description = serializers.CharField(required=False, allow_blank=True, help_text='Mô tả môn học')

        def validate_code(self, value):
            # Nếu mã trống, sẽ auto-generate ở validate() method
            if not value or not value.strip():
                return ''

            # Chuẩn hóa mã môn: viết hoa, loại bỏ khoảng trắng
            value = value.upper().strip()
            if Subject.objects.filter(code=value).exists():
                raise serializers.ValidationError(f'Mã môn học "{value}" đã tồn tại')
            return value

        def validate_name(self, value):
            value = value.strip()
            if not value:
                raise serializers.ValidationError('Tên môn học không được để trống')
            if len(value) < 3:
                raise serializers.ValidationError('Tên môn học phải có ít nhất 3 ký tự')
            return value

        def generate_subject_code(self, name, strategy='smart'):
            """Tự động tạo mã môn học"""
            import re
            import random
            import unicodedata

            # Normalize Vietnamese text
            def normalize_vietnamese(text):
                # Convert to ASCII, remove accents
                normalized = unicodedata.normalize('NFD', text)
                ascii_text = normalized.encode('ascii', 'ignore').decode('ascii')
                return ascii_text.lower()

            if strategy == 'smart':
                # Normalize Vietnamese input
                normalized_name = normalize_vietnamese(name)

                # Smart keyword mapping for common terms
                keyword_map = {
                    # Programming languages
                    'python': 'PY',
                    'java': 'JV',
                    'javascript': 'JS',
                    'csharp': 'CS',
                    'cpp': 'CP',

                    # Domains
                    'lap': 'PR',      # Lập trình
                    'trinh': 'PR',
                    'programming': 'PR',
                    'web': 'WB',
                    'mobile': 'MB',
                    'android': 'AD',
                    'ios': 'IO',

                    # Subjects
                    'co': 'DB',       # Cơ sở
                    'so': 'DB',
                    'du': 'DB',       # Dữ liệu
                    'lieu': 'DB',
                    'database': 'DB',
                    'mang': 'NT',     # Mạng
                    'network': 'NT',
                    'tri': 'AI',      # Trí tuệ
                    'tue': 'AI',
                    'artificial': 'AI',
                    'intelligence': 'AI',
                    'toan': 'MT',     # Toán
                    'math': 'MT',
                    'tieng': 'EN',    # Tiếng Anh
                    'anh': 'EN',
                    'english': 'EN',
                    'quan': 'MG',     # Quản lý
                    'ly': 'MG',
                    'management': 'MG',
                    'phat': 'DV',     # Phát triển
                    'trien': 'DV',
                    'development': 'DV',
                }

                # Extract meaningful words (length > 2, not stopwords)
                stopwords = ['va', 'cua', 'trong', 'voi', 'cho', 'mot', 'cac', 'la', 'co', 'khong', 'nang', 'cao', 'co', 'ban', 'thuc', 'hanh']
                words = re.findall(r'\b\w+\b', normalized_name)
                filtered_words = [w for w in words if len(w) > 2 and w not in stopwords]

                # Build code from keywords
                code_parts = []
                used_keywords = set()

                for word in filtered_words[:3]:  # Max 3 words
                    if word in keyword_map and word not in used_keywords:
                        code_parts.append(keyword_map[word])
                        used_keywords.add(word)
                    elif len(code_parts) < 2:  # Fill up to 2 parts
                        code_parts.append(word[:2].upper())

                # Ensure we have at least 2 characters
                while len(code_parts) < 1:
                    # Fallback: first letters of each word
                    words = normalized_name.split()
                    code_parts = [w[0].upper() for w in words[:4] if w]
                    break

                base_code = ''.join(code_parts)[:4]  # Max 4 chars for prefix

                # Add number suffix for uniqueness
                for i in range(100, 1000):
                    candidate = f"{base_code}{i:03d}"[:8]  # Max 8 chars total
                    if not Subject.objects.filter(code=candidate).exists():
                        return candidate

            # Strategy 'sequential' or fallback
            prefix = '0101000'
            suffix_len = 5

            for _ in range(50):
                suffix = ''.join([str(random.randint(0, 9)) for _ in range(suffix_len)])
                candidate = f"{prefix}{suffix}"
                if not Subject.objects.filter(code=candidate).exists():
                    return candidate

            # Final fallback
            import time
            timestamp_suffix = str(int(time.time()))[-5:]
            return f"{prefix}{timestamp_suffix}"

        def validate(self, attrs):
            # Auto-generate code nếu chưa có
            if not attrs.get('code'):
                name = attrs.get('name', '')
                if name:
                    attrs['code'] = self.generate_subject_code(name, strategy='smart')
                else:
                    raise serializers.ValidationError('Cần tên môn học để tự động tạo mã')

            return attrs

    def get(self, request, *args, **kwargs):
        search = request.query_params.get('search', '').strip()
        qs = self.get_queryset()

        if search:
            qs = qs.filter(
                Q(code__icontains=search) |
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )

        # Giữ nguyên format cũ để tương thích với frontend
        limit = min(int(request.query_params.get('limit', 200)), 200)
        data = [
            {
                'id': s.id,
                'code': s.code,
                'name': s.name,
                'credits': s.credits,
                'description': s.description or '',
            } for s in qs[:limit]
        ]

        return Response(data)

    def post(self, request, *args, **kwargs):
        # Chuẩn hóa input để giảm lỗi phía FE gửi kiểu dữ liệu string
        data = {
            'code': request.data.get('code', ''),
            'name': (request.data.get('name') or '').strip(),
            'credits': request.data.get('credits', 3),
            'description': request.data.get('description', ''),
        }

        # Force cast credits to int with default = 3
        try:
            data['credits'] = int(data['credits'])
        except Exception:
            data['credits'] = 3

        ser = self.SubjectSerializer(data=data)
        try:
            ser.is_valid(raise_exception=True)
        except serializers.ValidationError as e:
            # Trả về lỗi theo format đơn giản để FE hiển thị được
            flat_errors = {}
            for k, v in e.detail.items() if isinstance(e.detail, dict) else []:
                flat_errors[k] = ', '.join([str(x) for x in v]) if isinstance(v, (list, tuple)) else str(v)
            return Response({
                'error': 'Dữ liệu không hợp lệ',
                'details': flat_errors or e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = ser.validated_data
            s = Subject.objects.create(
                code=payload['code'],
                name=payload['name'],
                credits=payload.get('credits', 3),
                description=payload.get('description', ''),
                created_by=request.user
            )
            return Response({
                'id': s.id,
                'code': s.code,
                'name': s.name,
                'credits': s.credits,
                'description': s.description,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log lỗi chi tiết để dễ debug
            import logging
            logging.getLogger('apps').exception('Create subject failed: %s', e)
            return Response({
                'error': 'Lỗi khi tạo môn học',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
def advance_to_next_year(request):
    """Chuyển sang năm học tiếp theo (chỉ admin/superuser)"""
    if not (request.user.is_superuser or getattr(request.user, 'role', None) == 'admin'):
        return Response({'error': 'Chỉ admin mới có thể chuyển năm học'}, status=status.HTTP_403_FORBIDDEN)

    try:
        current_year = AcademicYear.objects.filter(is_current=True).first()
        if not current_year:
            current_year = AcademicYear.get_current_year()

        # Tạo hoặc lấy năm học tiếp theo
        next_year = AcademicYear.create_next_year()

        # Chuyển cờ is_current
        current_year.is_current = False
        current_year.save(update_fields=['is_current'])

        next_year.is_current = True
        next_year.save(update_fields=['is_current'])

        # Cập nhật Term.is_current cho HK1 của năm mới
        Term.objects.filter(is_current=True).update(is_current=False)
        hk1_next = Term.objects.filter(year=next_year, season=Term.Season.HK1).first()
        if hk1_next:
            hk1_next.is_current = True
            hk1_next.save(update_fields=['is_current'])

        return Response({
            'message': f'Chuyển thành công sang năm học {next_year.code}',
            'previous_year': current_year.code,
            'current_year': next_year.code,
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def switch_current_term(request):
    """Chuyển học kỳ hiện tại (chỉ admin/superuser)"""
    if not (request.user.is_superuser or getattr(request.user, 'role', None) == 'admin'):
        return Response({'error': 'Chỉ admin mới có thể chuyển học kỳ'}, status=status.HTTP_403_FORBIDDEN)

    try:
        term_id = request.data.get('term_id')
        if not term_id:
            return Response({'error': 'Thiếu term_id'}, status=status.HTTP_400_BAD_REQUEST)

        new_term = Term.objects.get(id=term_id)

        # Bỏ is_current củ tất cả Term
        Term.objects.update(is_current=False)

        # Đặt is_current cho term mới
        new_term.is_current = True
        new_term.save(update_fields=['is_current'])

        return Response({
            'message': f'Chuyển thành công sang {new_term.name}',
            'current_term': {
                'id': new_term.id,
                'name': new_term.name,
                'season': new_term.season,
                'year_code': new_term.year.code
            }
        })
    except Term.DoesNotExist:
        return Response({'error': 'Không tìm thấy học kỳ'}, status=status.HTTP_404_NOT_FOUND)
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