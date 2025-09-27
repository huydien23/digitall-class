from django.urls import path
from . import views

urlpatterns = [
    # Attendance sessions
    path('sessions/', views.AttendanceSessionListCreateView.as_view(), name='attendance_session_list_create'),
    path('sessions/<int:pk>/', views.AttendanceSessionDetailView.as_view(), name='attendance_session_detail'),
    
    # Session actions
    path('sessions/<int:session_id>/end/', views.end_attendance_session, name='end_attendance_session'),

    # QR Code functionality (support both old and new routes)
    path('sessions/<int:session_id>/generate-qr/', views.generate_qr_code, name='generate_qr_code'),
    path('sessions/<int:session_id>/qr-code/', views.generate_qr_code, name='qr_code_compat'),
    path('sessions/<int:session_id>/analytics/', views.attendance_analytics, name='attendance_analytics'),
    path('check-in-qr/', views.check_in_with_qr, name='check_in_with_qr'),
    
    # Attendance records
    path('', views.AttendanceListCreateView.as_view(), name='attendance_list_create'),
    path('<int:pk>/', views.AttendanceDetailView.as_view(), name='attendance_detail'),
    
    # Statistics and export
    path('statistics/', views.attendance_statistics, name='attendance_statistics'),
    path('import-excel/', views.import_excel, name='import_excel'),
    # path('export/', views.export_attendance, name='export_attendance'),  # Commented out until function is implemented
]
