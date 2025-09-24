from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from django.utils import timezone
from datetime import datetime, time

from .models import Building, Room, RoomSchedule
from .serializers import (
    BuildingSerializer, RoomSerializer, RoomScheduleSerializer,
    RoomAvailabilitySerializer
)


class BuildingViewSet(viewsets.ModelViewSet):
    """ViewSet for Building CRUD operations"""
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['building_type', 'is_active']
    search_fields = ['building_id', 'building_name', 'description']
    ordering_fields = ['building_id', 'building_name', 'floors', 'created_at']
    ordering = ['building_id']
    lookup_field = 'building_id'

    def get_permissions(self):
        """
        Different permissions for different actions
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Only admin and teachers can create/update/delete buildings
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def rooms(self, request, building_id=None):
        """Get all rooms in a building"""
        try:
            building = self.get_object()
            rooms = building.rooms.filter(is_active=True)
            serializer = RoomSerializer(rooms, many=True)
            return Response(serializer.data)
        except Building.DoesNotExist:
            return Response(
                {'error': 'Building not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def available_rooms(self, request, building_id=None):
        """Get available rooms in a building"""
        try:
            building = self.get_object()
            available_rooms = building.rooms.filter(
                is_active=True, 
                status='available'
            )
            serializer = RoomSerializer(available_rooms, many=True)
            return Response(serializer.data)
        except Building.DoesNotExist:
            return Response(
                {'error': 'Building not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class RoomViewSet(viewsets.ModelViewSet):
    """ViewSet for Room CRUD operations"""
    queryset = Room.objects.select_related('building').all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['building', 'floor', 'room_type', 'status', 'is_active']
    search_fields = ['room_id', 'room_name', 'description', 'building__building_name']
    ordering_fields = ['room_id', 'capacity', 'floor', 'created_at']
    ordering = ['building', 'floor', 'room_id']
    lookup_field = 'room_id'

    def get_permissions(self):
        """Different permissions for different actions"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Only admin and teachers can create/update/delete rooms
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def change_status(self, request, room_id=None):
        """Change room status"""
        try:
            room = self.get_object()
            new_status = request.data.get('status')
            
            if new_status not in [choice[0] for choice in Room.RoomStatus.choices]:
                return Response(
                    {'error': 'Invalid status value'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            room.status = new_status
            room.save()
            
            serializer = self.get_serializer(room)
            return Response(serializer.data)
        except Room.DoesNotExist:
            return Response(
                {'error': 'Room not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def schedule(self, request, room_id=None):
        """Get room schedule"""
        try:
            room = self.get_object()
            schedules = room.schedules.all().order_by('start_date', 'start_time')
            serializer = RoomScheduleSerializer(schedules, many=True)
            return Response(serializer.data)
        except Room.DoesNotExist:
            return Response(
                {'error': 'Room not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class RoomScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for RoomSchedule CRUD operations"""
    queryset = RoomSchedule.objects.select_related('room', 'created_by').all()
    serializer_class = RoomScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['room', 'start_date', 'is_recurring']
    search_fields = ['title', 'description', 'room__room_name']
    ordering_fields = ['start_date', 'start_time', 'created_at']
    ordering = ['start_date', 'start_time']

    def perform_create(self, serializer):
        """Automatically set the created_by field"""
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Override create to add conflict checking"""
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class BuildingRoomsListView(APIView):
    """List all rooms in a specific building"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, building_id):
        try:
            building = Building.objects.get(building_id=building_id)
            rooms = building.rooms.filter(is_active=True)
            
            # Apply filters
            room_type = request.query_params.get('room_type')
            status_filter = request.query_params.get('status', 'available')
            min_capacity = request.query_params.get('min_capacity')
            
            if room_type:
                rooms = rooms.filter(room_type=room_type)
            if status_filter:
                rooms = rooms.filter(status=status_filter)
            if min_capacity:
                try:
                    min_capacity = int(min_capacity)
                    rooms = rooms.filter(capacity__gte=min_capacity)
                except ValueError:
                    pass
            
            serializer = RoomSerializer(rooms, many=True)
            return Response({
                'building': BuildingSerializer(building).data,
                'rooms': serializer.data
            })
        except Building.DoesNotExist:
            return Response(
                {'error': 'Building not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class AvailableRoomsView(APIView):
    """Find available rooms based on criteria"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get available rooms with optional filters"""
        # Default to current date and next hour
        default_date = timezone.now().date()
        default_start_time = timezone.now().replace(minute=0, second=0, microsecond=0).time()
        default_end_time = (timezone.now() + timezone.timedelta(hours=1)).replace(minute=0, second=0, microsecond=0).time()
        
        # Get query parameters
        date_param = request.query_params.get('date', default_date)
        start_time_param = request.query_params.get('start_time', default_start_time)
        end_time_param = request.query_params.get('end_time', default_end_time)
        building_id = request.query_params.get('building_id')
        room_type = request.query_params.get('room_type')
        min_capacity = request.query_params.get('min_capacity')
        
        try:
            # Parse date and time
            if isinstance(date_param, str):
                query_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            else:
                query_date = date_param
                
            if isinstance(start_time_param, str):
                start_time_obj = datetime.strptime(start_time_param, '%H:%M').time()
            else:
                start_time_obj = start_time_param
                
            if isinstance(end_time_param, str):
                end_time_obj = datetime.strptime(end_time_param, '%H:%M').time()
            else:
                end_time_obj = end_time_param
        
        except ValueError as e:
            return Response(
                {'error': f'Invalid date/time format: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Start with available rooms
        rooms = Room.objects.filter(
            is_active=True,
            status='available'
        ).select_related('building')
        
        # Apply filters
        if building_id:
            rooms = rooms.filter(building__building_id=building_id)
        if room_type:
            rooms = rooms.filter(room_type=room_type)
        if min_capacity:
            try:
                min_capacity = int(min_capacity)
                rooms = rooms.filter(capacity__gte=min_capacity)
            except ValueError:
                pass
        
        # Check for schedule conflicts
        conflicting_rooms = RoomSchedule.objects.filter(
            start_date__lte=query_date,
            end_date__gte=query_date,
            start_time__lt=end_time_obj,
            end_time__gt=start_time_obj
        ).values_list('room_id', flat=True)
        
        available_rooms = rooms.exclude(id__in=conflicting_rooms)
        
        serializer = RoomSerializer(available_rooms, many=True)
        return Response({
            'query': {
                'date': query_date,
                'start_time': start_time_obj,
                'end_time': end_time_obj,
                'filters': {
                    'building_id': building_id,
                    'room_type': room_type,
                    'min_capacity': min_capacity
                }
            },
            'available_rooms': serializer.data
        })

    def post(self, request):
        """Find available rooms with POST data"""
        serializer = RoomAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Start with available rooms
            rooms = Room.objects.filter(
                is_active=True,
                status='available'
            ).select_related('building')
            
            # Apply filters
            if data.get('building_id'):
                rooms = rooms.filter(building__building_id=data['building_id'])
            if data.get('room_type'):
                rooms = rooms.filter(room_type=data['room_type'])
            if data.get('min_capacity'):
                rooms = rooms.filter(capacity__gte=data['min_capacity'])
            
            # Check for schedule conflicts
            conflicting_rooms = RoomSchedule.objects.filter(
                start_date__lte=data['date'],
                end_date__gte=data['date'],
                start_time__lt=data['end_time'],
                end_time__gt=data['start_time']
            ).values_list('room_id', flat=True)
            
            available_rooms = rooms.exclude(id__in=conflicting_rooms)
            
            room_serializer = RoomSerializer(available_rooms, many=True)
            return Response({
                'query': data,
                'available_rooms': room_serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)