from django.urls import path
from . import views

urlpatterns = [
    path('', views.AssignmentListCreateView.as_view(), name='assignment_list_create'),
    path('<int:pk>/', views.AssignmentDetailView.as_view(), name='assignment_detail'),

    path('<int:assignment_id>/start/', views.start_assignment, name='assignment_start'),
    path('<int:assignment_id>/my-submission/', views.my_submission, name='assignment_my_submission'),
    path('<int:assignment_id>/submit/', views.submit_assignment, name='assignment_submit'),
    path('<int:assignment_id>/unsubmit/', views.unsubmit_assignment, name='assignment_unsubmit'),
    path('<int:assignment_id>/submissions/', views.list_submissions, name='assignment_submissions'),
    path('<int:assignment_id>/submissions/<int:submission_id>/grade/', views.grade_submission, name='assignment_grade_submission'),
]
