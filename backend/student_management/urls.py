"""
URL configuration for student_management project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/classes/', include('apps.classes.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/grades/', include('apps.grades.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/rooms/', include('apps.rooms.urls')),
    path('api/teachers/', include('apps.accounts.teacher_urls')),
    path('api/materials/', include('apps.materials.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
