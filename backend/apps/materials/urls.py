from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'library', views.MaterialViewSet, basename='materials-library')

urlpatterns = [
    # Legacy class-scoped materials
    path('', views.ClassMaterialListCreateView.as_view(), name='class_material_list_create'),
    path('<int:pk>/', views.ClassMaterialDetailView.as_view(), name='class_material_detail'),

    # Class published materials for students/teachers
    path('library/class/<int:class_id>/published/', views.ClassPublishedMaterialsView.as_view(), name='class_published_materials'),

    # Teacher repository
    path('', include(router.urls)),
]
