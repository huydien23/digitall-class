from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'buildings', views.BuildingViewSet)
router.register(r'rooms', views.RoomViewSet)
router.register(r'schedules', views.RoomScheduleViewSet)

app_name = 'rooms'

urlpatterns = [
    path('', include(router.urls)),
    path('buildings/<str:building_id>/rooms/', views.BuildingRoomsListView.as_view(), name='building-rooms'),
    path('rooms/available/', views.AvailableRoomsView.as_view(), name='available-rooms'),
]