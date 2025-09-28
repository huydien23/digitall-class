from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from django.db import transaction
from django.http import HttpResponse
import random
import io
from openpyxl import Workbook

from apps.grouping.models import GroupSet, Group, GroupMember
from apps.grouping.serializers import GroupSetSerializer, GroupSerializer
from apps.classes.models import Class, ClassStudent
from apps.students.models import Student


class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if isinstance(obj, Class):
            return obj.teacher_id == request.user.id
        if isinstance(obj, GroupSet):
            return obj.class_obj.teacher_id == request.user.id
        return False


class GenerateGroupsView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    @transaction.atomic
    def post(self, request):
        try:
            class_id = int(request.data.get('class_id'))
            group_size = int(request.data.get('group_size', 3))
            seed = request.data.get('seed') or ''
            title = request.data.get('title') or None
        except Exception:
            return Response({'error': 'Thiếu hoặc sai tham số class_id/group_size'}, status=status.HTTP_400_BAD_REQUEST)

        if group_size < 2:
            return Response({'error': 'Kích thước nhóm tối thiểu là 2'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            class_obj = Class.objects.get(id=class_id)
        except Class.DoesNotExist:
            return Response({'error': 'Không tìm thấy lớp'}, status=status.HTTP_404_NOT_FOUND)

        # Permission
        perm = IsTeacherOrAdmin()
        if not perm.has_object_permission(request, self, class_obj):
            return Response({'error': 'Bạn không có quyền chia nhóm cho lớp này'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch active students of the class
        student_qs = ClassStudent.objects.select_related('student').filter(class_obj=class_obj, is_active=True)
        students = [cs.student for cs in student_qs]
        if not students:
            return Response({'error': 'Lớp chưa có sinh viên hoạt động'}, status=status.HTTP_400_BAD_REQUEST)

        # Shuffle by seed
        rnd = random.Random(seed or None)
        rnd.shuffle(students)

        # Determine number of groups
        n = len(students)
        groups_count = (n + group_size - 1) // group_size
        if groups_count <= 0:
            groups_count = 1

        # Round-robin distribute so size diff <= 1
        buckets = [[] for _ in range(groups_count)]
        for i, st in enumerate(students):
            buckets[i % groups_count].append(st)

        # Create GroupSet and groups
        gs = GroupSet.objects.create(
            class_obj=class_obj,
            group_size=group_size,
            seed=seed or None,
            title=title,
            created_by=request.user
        )
        groups = []
        for idx, members in enumerate(buckets, start=1):
            g = Group.objects.create(groupset=gs, index=idx, name=f"Nhóm {idx}")
            GroupMember.objects.bulk_create([
                GroupMember(group=g, student=st) for st in members
            ])
            groups.append({
                'id': g.id,
                'index': g.index,
                'name': g.name,
                'members': [
                    {
                        'id': st.id,
                        'student_id': st.student_id,
                        'full_name': st.full_name,
                        'email': st.email,
                    } for st in members
                ]
            })

        payload = {
            'groupset': GroupSetSerializer(gs).data,
            'groups': groups
        }
        return Response(payload)


class GroupSetListView(generics.ListAPIView):
    serializer_class = GroupSetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = GroupSet.objects.select_related('class_obj', 'created_by').all()
        class_id = self.request.query_params.get('class_id')
        if class_id:
            qs = qs.filter(class_obj_id=class_id)
        # Teachers can only see their classes
        user = self.request.user
        if user.role == 'teacher':
            qs = qs.filter(class_obj__teacher_id=user.id)
        return qs.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        latest = request.query_params.get('latest')
        response = super().list(request, *args, **kwargs)
        if latest:
            data = response.data
            items = data.get('results') if isinstance(data, dict) else data
            response.data = items[0] if items else None
        return response


class GroupListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        groupset_id = request.query_params.get('groupset_id')
        if not groupset_id:
            return Response({'error': 'Thiếu groupset_id'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            gs = GroupSet.objects.get(id=int(groupset_id))
        except GroupSet.DoesNotExist:
            return Response({'error': 'Không tìm thấy GroupSet'}, status=status.HTTP_404_NOT_FOUND)

        # Permission
        if request.user.role != 'admin' and gs.class_obj.teacher_id != request.user.id:
            return Response({'error': 'Không có quyền xem nhóm của lớp này'}, status=status.HTTP_403_FORBIDDEN)

        groups = []
        for g in gs.groups.all().order_by('index'):
            members = [
                {
                    'id': m.student.id,
                    'student_id': m.student.student_id,
                    'full_name': m.student.full_name,
                    'email': m.student.email,
                } for m in g.memberships.select_related('student').all()
            ]
            groups.append({'id': g.id, 'index': g.index, 'name': g.name, 'members': members})
        return Response({'groupset': GroupSetSerializer(gs).data, 'groups': groups})


class GroupSetDetailView(generics.DestroyAPIView):
    queryset = GroupSet.objects.all()
    serializer_class = GroupSetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        gs = self.get_object()
        if request.user.role != 'admin' and gs.class_obj.teacher_id != request.user.id:
            return Response({'error': 'Bạn không có quyền xóa GroupSet này'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class GroupDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            group = Group.objects.select_related('groupset', 'groupset__class_obj').get(id=int(pk))
        except Group.DoesNotExist:
            return Response({'error': 'Không tìm thấy nhóm'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'admin' and group.groupset.class_obj.teacher_id != request.user.id:
            return Response({'error': 'Bạn không có quyền xóa nhóm này'}, status=status.HTTP_403_FORBIDDEN)
        group.delete()
        return Response({'success': True})

    def patch(self, request, pk):
        try:
            group = Group.objects.select_related('groupset', 'groupset__class_obj').get(id=int(pk))
        except Group.DoesNotExist:
            return Response({'error': 'Không tìm thấy nhóm'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'admin' and group.groupset.class_obj.teacher_id != request.user.id:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)
        name = (request.data.get('name') or '').strip()
        if not name:
            return Response({'error': 'Thiếu name'}, status=status.HTTP_400_BAD_REQUEST)
        group.name = name
        group.save(update_fields=['name'])
        return Response({'id': group.id, 'name': group.name})


class GroupMemberManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, group_id):
        """Add a student to a group. Body supports student_id or student_pk."""
        try:
            group = Group.objects.select_related('groupset', 'groupset__class_obj').get(id=int(group_id))
        except Group.DoesNotExist:
            return Response({'error': 'Không tìm thấy nhóm'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'admin' and group.groupset.class_obj.teacher_id != request.user.id:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)

        student_code = request.data.get('student_id')
        student_pk = request.data.get('student_pk') or request.data.get('student')
        if not student_code and not student_pk:
            return Response({'error': 'Thiếu student_id hoặc student_pk'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            if student_code:
                st = Student.objects.get(student_id=student_code)
            else:
                st = Student.objects.get(id=int(student_pk))
        except Student.DoesNotExist:
            return Response({'error': 'Không tìm thấy sinh viên'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure student belongs to the class
        if not ClassStudent.objects.filter(class_obj=group.groupset.class_obj, student=st, is_active=True).exists():
            return Response({'error': 'Sinh viên không thuộc lớp này'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure unique per GroupSet: remove from other groups in same GroupSet
        GroupMember.objects.filter(group__groupset=group.groupset, student=st).exclude(group=group).delete()

        # Create membership if not exists
        GroupMember.objects.get_or_create(group=group, student=st)
        return Response({'success': True})

    def delete(self, request, group_id):
        """Remove a student from a group. Accept student_id or student_pk via query params."""
        student_code = request.query_params.get('student_id')
        student_pk = request.query_params.get('student_pk') or request.query_params.get('student')
        if not student_code and not student_pk:
            return Response({'error': 'Thiếu student_id hoặc student_pk'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            group = Group.objects.select_related('groupset', 'groupset__class_obj').get(id=int(group_id))
        except Group.DoesNotExist:
            return Response({'error': 'Không tìm thấy nhóm'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'admin' and group.groupset.class_obj.teacher_id != request.user.id:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)
        try:
            if student_code:
                st = Student.objects.get(student_id=student_code)
            else:
                st = Student.objects.get(id=int(student_pk))
        except Student.DoesNotExist:
            return Response({'error': 'Không tìm thấy sinh viên'}, status=status.HTTP_404_NOT_FOUND)
        deleted, _ = GroupMember.objects.filter(group=group, student=st).delete()
        return Response({'success': True, 'deleted': deleted})


class AvailableStudentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        groupset_id = request.query_params.get('groupset_id')
        if not groupset_id:
            return Response({'error': 'Thiếu groupset_id'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            gs = GroupSet.objects.select_related('class_obj').get(id=int(groupset_id))
        except GroupSet.DoesNotExist:
            return Response({'error': 'Không tìm thấy GroupSet'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'admin' and gs.class_obj.teacher_id != request.user.id:
            return Response({'error': 'Không có quyền'}, status=status.HTTP_403_FORBIDDEN)

        # Students in class
        class_student_ids = ClassStudent.objects.filter(class_obj=gs.class_obj, is_active=True).values_list('student_id', flat=True)
        # Students already in any group of this groupset
        assigned_ids = GroupMember.objects.filter(group__groupset=gs).values_list('student_id', flat=True)
        from apps.students.models import Student
        qs = Student.objects.filter(id__in=class_student_ids).exclude(id__in=assigned_ids).order_by('student_id')
        data = [
            {
                'id': st.id,
                'student_id': st.student_id,
                'full_name': st.full_name,
                'email': st.email,
            } for st in qs
        ]
        return Response({'results': data})


class ExportGroupsExcelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, groupset_id):
        try:
            gs = GroupSet.objects.get(id=int(groupset_id))
        except GroupSet.DoesNotExist:
            return Response({'error': 'Không tìm thấy GroupSet'}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role != 'admin' and gs.class_obj.teacher_id != request.user.id:
            return Response({'error': 'Không có quyền export'}, status=status.HTTP_403_FORBIDDEN)

        # Build workbook
        wb = Workbook()
        ws = wb.active
        ws.title = 'Groups'
        # Header
        ws.append(['STT', 'Nhóm', 'MSSV', 'Họ tên', 'Email'])
        row = 2
        idx = 1
        for g in gs.groups.all().order_by('index'):
            for m in g.memberships.select_related('student').all():
                st = m.student
                ws.append([idx, g.name, st.student_id, st.full_name, st.email])
                idx += 1
                row += 1

        # Save to bytes
        buf = io.BytesIO()
        wb.save(buf)
        buf.seek(0)
        resp = HttpResponse(
            buf.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        filename = f"Groups_{gs.class_obj.class_id}_{gs.created_at.strftime('%Y%m%d')}.xlsx"
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp
