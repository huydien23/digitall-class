from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClassListCreateView.as_view(), name='class_list_create'),
    path('<int:id>/', views.ClassDetailView.as_view(), name='class_detail'),
    path('<int:class_id>/students/', views.ClassStudentListCreateView.as_view(), name='class_students'),
    path('<int:class_id>/students/<str:student_id>/remove/', views.remove_student_from_class, name='remove_student_from_class'),
    path('<int:class_id>/available-students/', views.available_students, name='available_students'),
    path('<int:class_id>/detail/', views.class_detail_with_students, name='class_detail_with_students'),
    path('statistics/', views.class_statistics, name='class_statistics'),
]
