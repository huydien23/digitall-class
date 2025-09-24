from django.urls import path
from . import views

urlpatterns = [
    path('pending', views.PendingTeachersView.as_view(), name='pending_teachers'),
    path('<int:user_id>/approve', views.ApproveTeacherView.as_view(), name='approve_teacher'),
    path('<int:user_id>/reject', views.RejectTeacherView.as_view(), name='reject_teacher'),
]
