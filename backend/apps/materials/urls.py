from django.urls import path
from . import views

urlpatterns = [
    path('', views.ClassMaterialListCreateView.as_view(), name='class_material_list_create'),
    path('<int:pk>/', views.ClassMaterialDetailView.as_view(), name='class_material_detail'),
]
