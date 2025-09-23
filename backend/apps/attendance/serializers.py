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
            'session_date', 'start_time', 'end_time', 'location'
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
    """Serializer for creating attendance records"""
    session_id = serializers.IntegerField(write_only=True)
    student_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = Attendance
        fields = ['session_id', 'student_id', 'status', 'notes']
    
    def create(self, validated_data):
        session_id = validated_data.pop('session_id')
        student_id = validated_data.pop('student_id')
        
        from apps.students.models import Student
        from apps.attendance.models import AttendanceSession
        
        student = Student.objects.get(student_id=student_id)
        session = AttendanceSession.objects.get(id=session_id)
        
        validated_data.update({
            'student': student,
            'session': session
        })
        
        return super().create(validated_data)


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
