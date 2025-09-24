# Digital Class Backend - Deployment Guide

## 🚀 Production Deployment Checklist

### 1. Security Fixes Implemented
- ✅ Disabled `CORS_ALLOW_ALL_ORIGINS` (security risk)
- ✅ Added production security settings
- ✅ Configured proper logging
- ✅ Added comprehensive error handling

### 2. Database Optimizations
- ✅ Added database indexes for better performance
- ✅ Added OneToOne relationship between Student and User
- ✅ Optimized queries with select_related()

### 3. New Features Added
- ✅ Complete Room Management API
  - Buildings CRUD
  - Rooms CRUD with availability checking
  - Room Schedules management
- ✅ Enhanced Students API with better error handling
- ✅ Soft delete for Students (is_active=False instead of hard delete)

## 🔧 Environment Setup

### Development
```bash
cp .env .env.local
# Edit .env.local with your development settings
```

### Production
```bash
cp .env.production .env
# Edit .env with your production values:
# - Generate secure SECRET_KEY (50+ characters)
# - Set DEBUG=False
# - Configure ALLOWED_HOSTS
# - Set up production database credentials
```

## 📦 New API Endpoints

### Room Management
- `GET /api/rooms/buildings/` - List all buildings
- `GET /api/rooms/rooms/` - List all rooms
- `GET /api/rooms/rooms/available/` - Find available rooms
- `GET /api/rooms/buildings/{building_id}/rooms/` - Rooms in specific building
- `POST /api/rooms/schedules/` - Create room schedule

### Enhanced Student Management
- `GET /api/students/{student_id}/` - Get student by student_id (was pk)
- `DELETE /api/students/{student_id}/` - Soft delete (sets is_active=False)

## 🛡️ Security Improvements

### Production Settings (Auto-enabled when DEBUG=False)
- HTTPS redirects
- Secure cookies
- HSTS headers
- XSS protection
- Content type sniffing protection

### CORS Configuration
- Removed `CORS_ALLOW_ALL_ORIGINS=True`
- Restricted to specific domains only

## 📊 Performance Improvements

### Database Indexes Added
- Student: student_id, email, name, is_active, created_at
- Class: class_id, teacher, is_active, created_at
- ClassStudent: class_obj, student, is_active, enrolled_at

### Query Optimizations
- Added select_related() for foreign key relationships
- Optimized room availability queries

## 🔄 Migration Commands

```bash
# Apply all new migrations
python manage.py migrate

# Check for deployment issues
python manage.py check --deploy

# Create superuser (if needed)
python manage.py createsuperuser
```

## 🧪 Test Import Data

```bash
# Import the student data
python import_data.py exports/student_data_export_20250924_070215.json

# Check statistics
python check_stats.py
```

## 🐛 Common Issues & Solutions

### 1. MySQL Connection Error
- Ensure MySQL service is running (XAMPP/WAMP)
- Check database credentials in .env
- Verify database exists

### 2. CORS Issues
- Check CORS_ALLOWED_ORIGINS in settings.py
- Add your frontend domain to allowed origins

### 3. Static Files in Production
```bash
python manage.py collectstatic --noinput
```

### 4. Logging
- Logs are written to `logs/django.log`
- Create `logs/` directory if it doesn't exist

## 🔍 Health Check Commands

```bash
# Check system
python manage.py check

# Check with deployment warnings
python manage.py check --deploy

# Test database connection
python manage.py dbshell

# Check migrations
python manage.py showmigrations
```

## 📝 API Documentation

The API now includes comprehensive error handling and validation. All endpoints return structured error responses:

```json
{
  "error": "Description of error",
  "details": "Additional details if available"
}
```

## 🔐 Production Security Checklist

- [ ] Generate secure SECRET_KEY
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure production database with restricted user
- [ ] Set up proper backup strategy
- [ ] Configure monitoring and alerting
- [ ] Review and restrict API permissions
- [ ] Set up rate limiting (if needed)
- [ ] Configure firewall rules

## 📞 Support

If you encounter any issues after deployment, check the logs first:
```bash
tail -f logs/django.log
```