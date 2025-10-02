from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.students.serializers import StudentSerializer
from apps.students.models import Student
from .models import Class, ClassStudent, Subject, Term, AcademicYear
import random


class SubjectSerializer(serializers.ModelSerializer):
    """Serializer for Subject model"""

    class Meta:
        model = Subject
        fields = [
            'id', 'code', 'name', 'credits', 'description',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClassSerializer(serializers.ModelSerializer):
    """Serializer for Class model"""
    teacher = UserSerializer(read_only=True)
    current_students_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    subject = serializers.SerializerMethodField()
    term = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'class_id', 'class_name', 'description', 'teacher',
            'subject', 'term',
            'max_students', 'class_mode', 'current_students_count', 'is_full',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_subject(self, obj):
        s = getattr(obj, 'subject', None)
        if not s:
            return None
        return {'id': s.id, 'code': s.code, 'name': s.name, 'credits': s.credits}

    def get_term(self, obj):
        t = getattr(obj, 'term', None)
        if not t:
            return None
        return {
            'id': t.id,
            'name': t.name,
            'season': t.season,
            'year': {'id': t.year.id, 'code': t.year.code}
        }


class ClassCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating classes"""
    subject_id = serializers.IntegerField(write_only=True)
    # Cho phép truyền trực tiếp term_id hoặc cặp (year_code, season)
    term_id = serializers.IntegerField(write_only=True, required=False)
    year_code = serializers.CharField(write_only=True, required=False)
    season = serializers.ChoiceField(write_only=True, required=False, choices=Term.Season.choices)
    
    class Meta:
        model = Class
        fields = ['class_id', 'class_name', 'description', 'max_students', 'class_mode', 'subject_id', 'term_id', 'year_code', 'season']
        extra_kwargs = {
            'class_id': {'required': False, 'allow_blank': True},
            'description': {'required': False, 'allow_blank': True},
        }
    
    def validate_class_id(self, value):
        # Cho phép bỏ trống để hệ thống tự sinh mã
        if value in [None, '']:
            return value
        if Class.objects.filter(class_id=value).exists():
            raise serializers.ValidationError("Mã lớp đã tồn tại")
        str_val = str(value)
        if not str_val.isdigit() or len(str_val) != 12:
            raise serializers.ValidationError("Mã lớp phải gồm đúng 12 chữ số")
        prefix = '0101000'
        if not str_val.startswith(prefix):
            raise serializers.ValidationError(f"Mã lớp phải bắt đầu bằng {prefix}")
        return value

    def validate(self, attrs):
        # subject bắt buộc
        subject_id = attrs.get('subject_id')
        try:
            attrs['subject'] = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            raise serializers.ValidationError({'subject_id': 'Môn học không tồn tại'})

        # Xác định term
        term_id = attrs.get('term_id')
        year_code = attrs.get('year_code')
        season = attrs.get('season')
        if term_id:
            try:
                attrs['term'] = Term.objects.get(id=term_id)
            except Term.DoesNotExist:
                raise serializers.ValidationError({'term_id': 'Học kỳ không tồn tại'})
        else:
            if not (year_code and season):
                raise serializers.ValidationError({'term': 'Cần cung cấp term_id hoặc (year_code, season)'})
            year, _ = AcademicYear.objects.get_or_create(
                code=year_code,
                defaults={'name': f'Năm học {year_code}'}
            )
            term, _ = Term.objects.get_or_create(
                year=year,
                season=season,
                defaults={'name': f"{dict(Term.Season.choices).get(season, season)} {year.code}"}
            )
            attrs['term'] = term
        return attrs

    def create(self, validated_data):
        # Nếu không cung cấp class_id (đặc biệt với giảng viên), tự sinh mã theo định dạng 0101000 + 5 số (tổng 12)
        class_id = validated_data.get('class_id')
        if not class_id:
            prefix = '0101000'
            suffix_len = 12 - len(prefix)
            for _ in range(25):
                generated = prefix + ''.join(random.choices('0123456789', k=suffix_len))
                if not Class.objects.filter(class_id=generated).exists():
                    validated_data['class_id'] = generated
                    break
            else:
                raise serializers.ValidationError("Không thể sinh mã lớp duy nhất, vui lòng thử lại")
        # Áp dụng subject và term đã chuẩn hóa ở validate()
        validated_data['subject'] = validated_data.pop('subject')
        validated_data['term'] = validated_data.pop('term')
        # Xóa trường phụ
        validated_data.pop('subject_id', None)
        validated_data.pop('term_id', None)
        validated_data.pop('year_code', None)
        validated_data.pop('season', None)
        return super().create(validated_data)


class ClassStudentSerializer(serializers.ModelSerializer):
    """Serializer for ClassStudent model"""
    student = StudentSerializer(read_only=True)
    student_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = ClassStudent
        fields = ['id', 'student', 'student_id', 'enrolled_at', 'is_active']
        read_only_fields = ['id', 'enrolled_at']
    
    def create(self, validated_data):
        student_id = validated_data.pop('student_id')
        try:
            student = Student.objects.get(student_id=student_id)
            validated_data['student'] = student
            return super().create(validated_data)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Không tìm thấy sinh viên với mã này")


class ClassDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed class view with students"""
    teacher = UserSerializer(read_only=True)
    students = StudentSerializer(many=True, read_only=True)
    current_students_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    subject = serializers.SerializerMethodField()
    term = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'class_id', 'class_name', 'description', 'teacher',
            'subject', 'term',
            'max_students', 'current_students_count', 'is_full',
            'students', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_subject(self, obj):
        s = getattr(obj, 'subject', None)
        if not s:
            return None
        return {'id': s.id, 'code': s.code, 'name': s.name, 'credits': s.credits}

    def get_term(self, obj):
        t = getattr(obj, 'term', None)
        if not t:
            return None
        return {
            'id': t.id,
            'name': t.name,
            'season': t.season,
            'year': {'id': t.year.id, 'code': t.year.code}
        }
