from django.urls import path
from . import views

urlpatterns = [
    path('', views.SubmissionListCreateView.as_view(), name='submission_list_create'),
    path('<int:pk>/', views.SubmissionDetailView.as_view(), name='submission_detail'),
]
