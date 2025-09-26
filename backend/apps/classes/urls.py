from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClassListCreateView.as_view(), name='class_list_create'),
    # Use <int:pk>/ so DRF generic views resolve lookup correctly
    path('<int:pk>/', views.ClassDetailView.as_view(), name='class_detail'),
    path('<int:class_id>/students/', views.ClassStudentListCreateView.as_view(), name='class_students'),
    path('<int:class_id>/students/<str:student_id>/remove/', views.remove_student_from_class, name='remove_student_from_class'),
    path('<int:class_id>/available-students/', views.available_students, name='available_students'),
    path('<int:class_id>/detail/', views.class_detail_with_students, name='class_detail_with_students'),
    path('statistics/', views.class_statistics, name='class_statistics'),

    # Join tokens & Join class
    path('my-classes/', views.my_classes, name='my_classes'),
    path('<int:class_id>/join-tokens/', views.create_join_token, name='create_join_token'),
    path('join/', views.join_class, name='join_class'),
]
