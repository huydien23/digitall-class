from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClassListCreateView.as_view(), name='class_list_create'),
    # Use <int:pk>/ so DRF generic views resolve lookup correctly
    path('<int:pk>/', views.ClassDetailView.as_view(), name='class_detail'),

    # Graceful fallback for FE bug calling /classes/undefined/detail/ or /classes/undefined/detail/<int>
    path('undefined/detail/', views.class_detail_default, name='class_detail_default'),
    path('undefined/detail/<int:page>/', views.class_detail_default, name='class_detail_default_paged'),

    path('<int:class_id>/students/', views.ClassStudentListCreateView.as_view(), name='class_students'),
    path('<int:class_id>/students/<str:student_id>/remove/', views.remove_student_from_class, name='remove_student_from_class'),
    path('<int:class_id>/import-excel/', views.import_students_from_excel, name='import_students_from_excel'),
    path('<int:class_id>/available-students/', views.available_students, name='available_students'),
    path('<int:class_id>/detail/', views.class_detail_with_students, name='class_detail_with_students'),
    path('statistics/', views.class_statistics, name='class_statistics'),

    # Aggregations for teacher by year/term
    path('years/my/', views.my_years, name='my_years'),
    path('terms/my/', views.my_terms, name='my_terms'),

    # Global management for academic years and terms (teacher can create)
    path('years/', views.AcademicYearListCreateView.as_view(), name='years'),
    path('terms/', views.TermListCreateView.as_view(), name='terms'),

    # Subjects management (teacher-level)
    path('subjects/', views.SubjectListCreateView.as_view(), name='subjects'),

    # Copy class between terms and import roster
    path('copy/', views.copy_class, name='copy_class'),
    path('import-roster/', views.import_roster, name='import_roster'),

    # Join tokens & Join class
    path('my-classes/', views.my_classes, name='my_classes'),
    path('<int:class_id>/join-tokens/', views.create_join_token, name='create_join_token'),
    path('join/', views.join_class, name='join_class'),
    
    # Academic year and term management (admin only)
    path('advance-year/', views.advance_to_next_year, name='advance_to_next_year'),
    path('switch-term/', views.switch_current_term, name='switch_current_term'),
]
