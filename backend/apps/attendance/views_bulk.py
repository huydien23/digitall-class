from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
import logging

from .models import AttendanceSession
from .serializers import AttendanceSessionSerializer, AttendanceSessionCreateSerializer

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_create_sessions(request):
    """
    Create multiple attendance sessions at once.
    
    Expected payload:
    {
        "class_id": 1,
        "sessions": [
            {
                "session_name": "Buổi 1",
                "description": "...",
                "session_date": "2024-01-01",
                "start_time": "07:00",
                "end_time": "11:00",
                "location": "Room 101",
                "session_type": "lecture"
            },
            ...
        ]
    }
    
    Or for auto-generation:
    {
        "class_id": 1,
        "auto_generate": {
            "number_of_weeks": 15,
            "sessions_per_week": 1,
            "day_of_week": 2,  # 0=Sunday, 1=Monday, etc.
            "start_date": "2024-01-01",
            "session_prefix": "Buổi",
            "default_location": "Room 101",
            "default_start_time": "07:00",
            "default_end_time": "11:00",
            "session_type": "lecture"
        }
    }
    """
    try:
        class_id = request.data.get('class_id')
        if not class_id:
            return Response(
                {'error': 'class_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has permission for this class
        from apps.classes.models import Class
        try:
            class_obj = Class.objects.get(id=class_id)
            if request.user.role != 'admin' and class_obj.teacher != request.user:
                return Response(
                    {'error': 'You do not have permission to create sessions for this class'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Class.DoesNotExist:
            return Response(
                {'error': 'Class not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        sessions_data = []
        
        # Check if auto-generation is requested
        if 'auto_generate' in request.data:
            config = request.data['auto_generate']
            sessions_data = generate_sessions_from_config(config)
        elif 'sessions' in request.data:
            sessions_data = request.data['sessions']
        else:
            return Response(
                {'error': 'Either "sessions" array or "auto_generate" config must be provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and create sessions
        created_sessions = []
        errors = []
        
        with transaction.atomic():
            for idx, session_data in enumerate(sessions_data):
                try:
                    # Add class_id to each session
                    session_data['class_id'] = class_id
                    
                    serializer = AttendanceSessionCreateSerializer(
                        data=session_data,
                        context={'request': request}
                    )
                    
                    if serializer.is_valid():
                        session = serializer.save()
                        created_sessions.append(AttendanceSessionSerializer(session).data)
                    else:
                        errors.append({
                            'index': idx,
                            'data': session_data,
                            'errors': serializer.errors
                        })
                        
                except Exception as e:
                    logger.error(f"Error creating session {idx}: {str(e)}")
                    errors.append({
                        'index': idx,
                        'data': session_data,
                        'error': str(e)
                    })
        
        # Prepare response
        response_data = {
            'success': len(created_sessions) > 0,
            'created_count': len(created_sessions),
            'created_sessions': created_sessions,
            'errors': errors
        }
        
        if errors:
            response_data['message'] = f'Created {len(created_sessions)} sessions. {len(errors)} failed.'
            return Response(response_data, status=status.HTTP_207_MULTI_STATUS)
        else:
            response_data['message'] = f'Successfully created {len(created_sessions)} sessions.'
            return Response(response_data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Bulk create sessions error: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def generate_sessions_from_config(config):
    """
    Generate session data based on auto-generation config.
    """
    sessions = []
    
    number_of_weeks = config.get('number_of_weeks', 15)
    sessions_per_week = config.get('sessions_per_week', 1)
    day_of_week = config.get('day_of_week', 1)  # Default to Monday
    start_date_str = config.get('start_date', timezone.now().date().isoformat())
    session_prefix = config.get('session_prefix', 'Buổi')
    default_location = config.get('default_location', '')
    default_start_time = config.get('default_start_time', '07:00')
    default_end_time = config.get('default_end_time', '11:00')
    session_type = config.get('session_type', 'lecture')
    
    # Parse start date
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    
    # Find the first occurrence of the specified day of week
    days_ahead = day_of_week - start_date.weekday()
    if days_ahead < 0:  # Target day already happened this week
        days_ahead += 7
    
    current_date = start_date + timedelta(days=days_ahead)
    
    session_counter = 1
    
    for week in range(number_of_weeks):
        for session_in_week in range(sessions_per_week):
            # Calculate session date
            if session_in_week > 0:
                # For multiple sessions per week, space them 2 days apart
                session_date = current_date + timedelta(days=session_in_week * 2)
            else:
                session_date = current_date
            
            # Generate session name
            session_name = f"{session_prefix} {session_counter}"
            if sessions_per_week > 1 and session_in_week > 0:
                session_name += f" - Nhóm {session_in_week + 1}"
            
            # Add description based on week
            description = f"Nội dung tuần {week + 1}"
            if session_type == 'practice':
                description = f"Thực hành tuần {week + 1}"
            elif session_type == 'exam':
                description = f"Kiểm tra tuần {week + 1}"
            
            sessions.append({
                'session_name': session_name,
                'description': description,
                'session_date': session_date.isoformat(),
                'start_time': default_start_time,
                'end_time': default_end_time,
                'location': default_location,
                'session_type': session_type
            })
            
            session_counter += 1
        
        # Move to next week
        current_date += timedelta(weeks=1)
    
    return sessions


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def duplicate_session(request, session_id):
    """
    Duplicate an existing session with optional modifications.
    
    Expected payload:
    {
        "count": 3,  # Number of duplicates to create
        "date_increment": 7,  # Days to increment for each duplicate
        "name_pattern": "Buổi {n}",  # Pattern for naming ({n} will be replaced)
        "modifications": {
            "location": "New Room",
            ...
        }
    }
    """
    try:
        # Get original session
        try:
            original_session = AttendanceSession.objects.get(id=session_id)
        except AttendanceSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if request.user.role != 'admin' and original_session.class_obj.teacher != request.user:
            return Response(
                {'error': 'You do not have permission to duplicate this session'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        count = request.data.get('count', 1)
        date_increment = request.data.get('date_increment', 7)
        name_pattern = request.data.get('name_pattern', original_session.session_name + ' (Copy {n})')
        modifications = request.data.get('modifications', {})
        
        created_sessions = []
        
        with transaction.atomic():
            for i in range(1, count + 1):
                # Calculate new date
                new_date = original_session.session_date + timedelta(days=date_increment * i)
                
                # Generate new name
                new_name = name_pattern.format(n=i)
                
                # Create session data
                session_data = {
                    'class_id': original_session.class_obj.id,
                    'session_name': new_name,
                    'description': original_session.description,
                    'session_date': new_date.isoformat(),
                    'start_time': original_session.start_time.strftime('%H:%M') if original_session.start_time else '07:00',
                    'end_time': original_session.end_time.strftime('%H:%M') if original_session.end_time else '11:00',
                    'location': original_session.location,
                    'session_type': original_session.session_type,
                }
                
                # Apply modifications
                session_data.update(modifications)
                
                # Create session
                serializer = AttendanceSessionCreateSerializer(
                    data=session_data,
                    context={'request': request}
                )
                
                if serializer.is_valid():
                    session = serializer.save()
                    created_sessions.append(AttendanceSessionSerializer(session).data)
                else:
                    return Response(
                        {'error': f'Failed to create duplicate {i}', 'details': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        
        return Response({
            'success': True,
            'message': f'Successfully created {count} duplicate(s)',
            'created_sessions': created_sessions
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Duplicate session error: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )