from django.db import models
from apps.accounts.models import User
from apps.classes.models import Class
from apps.students.models import Student


class GroupSet(models.Model):
    """A saved random grouping for a class."""
    class_obj = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='group_sets')
    group_size = models.PositiveIntegerField(default=3)
    seed = models.CharField(max_length=64, blank=True, null=True)
    title = models.CharField(max_length=200, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_group_sets')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'group_sets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['class_obj']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"GroupSet({self.class_obj.class_id}, size={self.group_size}, seed={self.seed})"


class Group(models.Model):
    """A single group inside a GroupSet."""
    groupset = models.ForeignKey(GroupSet, on_delete=models.CASCADE, related_name='groups')
    index = models.PositiveIntegerField()
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'groups'
        unique_together = ['groupset', 'index']
        ordering = ['index']
        indexes = [
            models.Index(fields=['groupset']),
        ]

    def __str__(self):
        return f"{self.name} (#{self.index})"


class GroupMember(models.Model):
    """Membership of a student in a group."""
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='group_memberships')

    class Meta:
        db_table = 'group_members'
        unique_together = ['group', 'student']
        indexes = [
            models.Index(fields=['group']),
            models.Index(fields=['student']),
        ]

    def __str__(self):
        return f"{self.student.student_id} -> {self.group.name}"
