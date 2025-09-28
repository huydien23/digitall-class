from django.urls import path
from .views import (
    GenerateGroupsView,
    GroupSetListView,
    GroupListView,
    GroupSetDetailView,
    GroupDetailView,
    GroupMemberManageView,
    AvailableStudentsView,
    ExportGroupsExcelView,
)

urlpatterns = [
    path('generate/', GenerateGroupsView.as_view(), name='generate_groups'),
    path('groupsets/', GroupSetListView.as_view(), name='groupset_list'),
    path('groups/', GroupListView.as_view(), name='groups_by_set'),
    path('groupsets/<int:pk>/', GroupSetDetailView.as_view(), name='groupset_detail'),
    path('groups/<int:pk>/', GroupDetailView.as_view(), name='group_detail'),
    path('groups/<int:group_id>/members/', GroupMemberManageView.as_view(), name='group_member_manage'),
    path('available-students/', AvailableStudentsView.as_view(), name='available_students'),
    path('export/<int:groupset_id>/', ExportGroupsExcelView.as_view(), name='export_groups_excel'),
]
