from django.urls import path
from . import views

urlpatterns = [
    path('', views.StudentListCreateView.as_view(), name='student_list_create'),
    path('<str:student_id>/', views.StudentDetailView.as_view(), name='student_detail'),
    path('bulk-create/', views.bulk_create_students, name='bulk_create_students'),
    path('import-excel/', views.import_excel, name='import_excel'),
    path('export-excel/', views.export_excel, name='export_excel'),
    path('statistics/', views.student_statistics, name='student_statistics'),
]
