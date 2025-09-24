from rest_framework import serializers
from .models import Building, Room, RoomSchedule


class BuildingSerializer(serializers.ModelSerializer):
    total_rooms = serializers.ReadOnlyField()
    available_rooms = serializers.ReadOnlyField()
    
    class Meta:
        model = Building
        fields = [
            'id', 'building_id', 'building_name', 'building_type',
            'description', 'address', 'floors', 'is_active',
            'total_rooms', 'available_rooms', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoomSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.building_name', read_only=True)
    full_name = serializers.ReadOnlyField()
    is_available = serializers.ReadOnlyField()
    
    class Meta:
        model = Room
        fields = [
            'id', 'room_id', 'room_name', 'building', 'building_name',
            'floor', 'room_type', 'capacity', 'area', 'equipment',
            'description', 'status', 'is_active', 'full_name',
            'is_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Validate floor is within building's floor range
        if 'building' in data and 'floor' in data:
            building = data['building']
            floor = data['floor']
            if floor > building.floors:
                raise serializers.ValidationError({
                    'floor': f'Floor {floor} exceeds building maximum of {building.floors} floors.'
                })
        return data


class RoomScheduleSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.room_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = RoomSchedule
        fields = [
            'id', 'room', 'room_name', 'title', 'description',
            'start_date', 'end_date', 'start_time', 'end_time',
            'is_recurring', 'recurring_days', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        # Validate date and time range
        if 'start_date' in data and 'end_date' in data:
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date.'
                })
        
        if 'start_time' in data and 'end_time' in data:
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError({
                    'end_time': 'End time must be after start time.'
                })
        
        return data


class RoomAvailabilitySerializer(serializers.Serializer):
    """Serializer for room availability queries"""
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    building_id = serializers.CharField(required=False)
    room_type = serializers.ChoiceField(choices=Room.RoomType.choices, required=False)
    min_capacity = serializers.IntegerField(required=False, min_value=1)

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time.'
            })
        return data