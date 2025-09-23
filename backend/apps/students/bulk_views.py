from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_create_students(request):
    """
    Bulk create students from JSON data
    """
    try:
        data = request.data
        students_data = data.get('students', [])
        
        if not students_data:
            return Response({
                'success': False,
                'error': 'No students data provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        created_students = []
        errors = []
        
        for i, student_data in enumerate(students_data):
            try:
                # Validate required fields
                required_fields = ['student_id', 'first_name', 'last_name']
                missing_fields = [field for field in required_fields if not student_data.get(field)]
                
                if missing_fields:
                    errors.append({
                        'row': i + 1,
                        'error': f'Missing required fields: {", ".join(missing_fields)}',
                        'data': student_data
                    })
                    continue
                
                # Check if student already exists
                if Student.objects.filter(student_id=student_data['student_id']).exists():
                    errors.append({
                        'row': i + 1,
                        'error': f'Student with ID {student_data["student_id"]} already exists',
                        'data': student_data
                    })
                    continue
                
                # Create student
                serializer = StudentSerializer(data=student_data)
                if serializer.is_valid():
                    student = serializer.save()
                    created_students.append(student)
                    print(f"DEBUG: Bulk create row {i+1} success: {student.student_id}")
                else:
                    errors.append({
                        'row': i + 1,
                        'error': f'Validation failed: {serializer.errors}',
                        'data': student_data
                    })
                    
            except Exception as e:
                errors.append({
                    'row': i + 1,
                    'error': f'Unexpected error: {str(e)}',
                    'data': student_data
                })
        
        return Response({
            'success': True,
            'message': f'Successfully created {len(created_students)} students',
            'details': {
                'total_rows': len(students_data),
                'successful_imports': len(created_students),
                'failed_imports': len(errors)
            },
            'created_students': StudentSerializer(created_students, many=True).data,
            'errors': errors
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
