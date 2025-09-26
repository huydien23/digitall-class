from django.urls import path
from . import views

urlpatterns = [
    # Grades
    path('', views.GradeListCreateView.as_view(), name='grade_list_create'),
    path('<int:pk>/', views.GradeDetailView.as_view(), name='grade_detail'),

    # Upsert (create or update) a grade for a student in a class
    path('upsert/', views.upsert_grade, name='upsert_grade'),
    
    # Grade calculations and summaries
    path('statistics/', views.grade_statistics, name='grade_statistics'),
    path('student/<str:student_id>/summary/', views.student_grade_summary, name='student_grade_summary'),
    path('class/<int:class_id>/summary/', views.class_grade_summary, name='class_grade_summary'),
    
    # Import/Export
    path('import-excel/', views.import_excel, name='import_excel'),
    # path('export/', views.export_grades, name='export_grades'),
]
