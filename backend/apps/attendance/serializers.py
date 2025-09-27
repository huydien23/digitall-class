from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.students.serializers import StudentSerializer
from apps.classes.serializers import ClassSerializer
from .models import AttendanceSession, Attendance, AttendanceSummary


class AttendanceSessionSerializer(serializers.ModelSerializer):
    """Serializer for AttendanceSession model"""
    class_obj = ClassSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'class_obj', 'session_name', 'description',
            'session_date', 'start_time', 'end_time', 'location',
            'session_type', 'group_name',
            'qr_code', 'is_active', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating attendance sessions"""
    class_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = AttendanceSession
        fields = [
            'class_id', 'session_name', 'description',
            'session_date', 'start_time', 'end_time', 'location',
            'session_type', 'group_name'
        ]
    
    def create(self, validated_data):
        class_id = validated_data.pop('class_id')
        from apps.classes.models import Class
        class_obj = Class.objects.get(id=class_id)
        validated_data.update({
            'class_obj': class_obj,
            'created_by': self.context['request'].user
        })
        return super().create(validated_data)


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance model"""
    student = StudentSerializer(read_only=True)
    session = AttendanceSessionSerializer(read_only=True)
    is_late = serializers.ReadOnlyField()
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'session', 'student', 'status', 'check_in_time',
            'check_out_time', 'notes', 'is_late', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AttendanceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating attendance records.
    Hỗ trợ cả:
    - student_id (mã SV dạng string)
    - student hoặc student_pk (primary key dạng số)
    """
    session_id = serializers.IntegerField(write_only=True)
    student_id = serializers.CharField(write_only=True, required=False)
    student = serializers.IntegerField(write_only=True, required=False)
    student_pk = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Attendance
        fields = ['session_id', 'student_id', 'student', 'student_pk', 'status', 'notes', 'check_in_time', 'check_out_time']
        extra_kwargs = {
            'check_in_time': {'required': False},
            'check_out_time': {'required': False},
            'status': {'required': False},
        }
    
    def validate(self, attrs):
        from apps.students.models import Student
        from apps.attendance.models import AttendanceSession
        errors = {}

        # Resolve session
        session_id = attrs.get('session_id')
        try:
            session = AttendanceSession.objects.get(id=session_id)
        except AttendanceSession.DoesNotExist:
            errors['session_id'] = 'Buổi điểm danh không tồn tại'
            raise serializers.ValidationError(errors)
        
        # Resolve student via any provided identifier
        student_obj = None
        student_input_id = attrs.get('student_id')  # string student code
        student_input_pk = attrs.get('student')  # integer pk from 'student' field
        student_input_alt_pk = attrs.get('student_pk')  # integer pk from 'student_pk' field
        
        if student_input_id:
            try:
                student_obj = Student.objects.get(student_id=student_input_id)
            except Student.DoesNotExist:
                errors['student_id'] = 'Không tìm thấy sinh viên với mã student_id'
        elif student_input_pk is not None:
            try:
                student_obj = Student.objects.get(pk=student_input_pk)
            except Student.DoesNotExist:
                errors['student'] = 'Không tìm thấy sinh viên với id'
        elif student_input_alt_pk is not None:
            try:
                student_obj = Student.objects.get(pk=student_input_alt_pk)
            except Student.DoesNotExist:
                errors['student_pk'] = 'Không tìm thấy sinh viên với id'
        else:
            errors['student_id'] = 'Cần cung cấp student_id hoặc student (pk)'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        # Clear all input fields and set resolved objects
        # Save other values before clearing
        status_val = attrs.get('status')
        check_in_val = attrs.get('check_in_time')
        check_out_val = attrs.get('check_out_time')
        notes_val = attrs.get('notes')
        
        attrs.clear()
        attrs['session'] = session
        attrs['student'] = student_obj
        
        # Restore saved values
        if status_val:
            attrs['status'] = status_val
        if check_in_val:
            attrs['check_in_time'] = check_in_val
        if check_out_val:
            attrs['check_out_time'] = check_out_val
        if notes_val:
            attrs['notes'] = notes_val

        # Defaults
        if not attrs.get('status'):
            attrs['status'] = 'present'
        if attrs['status'] == 'present' and not attrs.get('check_in_time'):
            from django.utils import timezone
            attrs['check_in_time'] = timezone.now()
        return attrs

    def create(self, validated_data):
        """Upsert theo (session, student)."""
        from .models import Attendance
        session = validated_data['session']
        student = validated_data['student']
        status_val = validated_data.get('status', 'present')
        check_in_time = validated_data.get('check_in_time')
        notes = validated_data.get('notes')

        attendance, created = Attendance.objects.get_or_create(
            session=session,
            student=student,
            defaults={
                'status': status_val,
                'check_in_time': check_in_time,
                'notes': notes,
            },
        )
        if not created:
            attendance.status = status_val
            if status_val == 'present' and check_in_time:
                attendance.check_in_time = check_in_time
            if notes is not None:
                attendance.notes = notes
            attendance.save()
        return attendance


class AttendanceBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating attendance records"""
    session_id = serializers.IntegerField()
    attendances = serializers.ListField(
        child=serializers.DictField()
    )
    
    def validate_attendances(self, value):
        """Validate attendance data"""
        for attendance_data in value:
            if 'student_id' not in attendance_data:
                raise serializers.ValidationError("Thiếu student_id trong dữ liệu điểm danh")
            if 'status' not in attendance_data:
                raise serializers.ValidationError("Thiếu status trong dữ liệu điểm danh")
        return value


class AttendanceSummarySerializer(serializers.ModelSerializer):
    """Serializer for AttendanceSummary model"""
    student = StudentSerializer(read_only=True)
    class_obj = ClassSerializer(read_only=True)
    
    class Meta:
        model = AttendanceSummary
        fields = [
            'id', 'student', 'class_obj', 'total_sessions',
            'present_count', 'absent_count', 'late_count',
            'excused_count', 'attendance_rate', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class QRCodeSerializer(serializers.Serializer):
    """Serializer for QR code generation"""
    session_id = serializers.IntegerField()
    qr_code = serializers.CharField(read_only=True)
    expires_at = serializers.DateTimeField(read_only=True)
