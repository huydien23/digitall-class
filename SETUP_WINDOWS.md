# 🚀 Hướng dẫn Setup cho Windows

## 📋 Yêu cầu hệ thống
- Windows 10/11
- Python 3.12+
- Git
- Node.js 18+

## 🔧 Cài đặt Backend

### Bước 1: Clone repository
```bash
git clone <your-repo-url>
cd QLSV_APP/backend
```

### Bước 2: Tạo virtual environment
```bash
python -m venv venv
venv\Scripts\activate
```

### Bước 3: Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### Bước 4: Cấu hình database MySQL với XAMPP

#### Yêu cầu: MySQL Database
1. Tải và cài XAMPP: https://www.apachefriends.org/
2. Khởi động MySQL trong XAMPP Control Panel
3. Mở phpMyAdmin: http://localhost/phpmyadmin
4. Tạo database: `qlsv_production`
5. Tạo user: `qlsv_user` / password: `admin@123`
6. Copy file `.env` từ Linux:
```env
DB_NAME=qlsv_production
DB_USER=qlsv_user
DB_PASSWORD=admin@123
DB_HOST=localhost
DB_PORT=3306
```
7. Chạy migration:
```bash
python manage.py migrate
```

#### Tùy chọn C: Docker (Khuyến nghị)
1. Cài Docker Desktop
2. Tạo file `docker-compose.yml`:
```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: qlsv_production
      MYSQL_USER: qlsv_user
      MYSQL_PASSWORD: admin@123
      MYSQL_ROOT_PASSWORD: admin@123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```
3. Chạy: `docker-compose up -d`
4. Chạy migration: `python manage.py migrate`

### Bước 5: Tạo admin user
```bash
python manage.py shell
```
```python
from apps.accounts.models import User
User.objects.create_user(
    email='admin@qlsv.com',
    password='admin123',
    first_name='Admin',
    last_name='System',
    role='admin',
    account_status='active',
    is_staff=True,
    is_superuser=True
)
exit()
```

### Bước 6: Khởi động server
```bash
python manage.py runserver 8001
```

## 🔧 Cài đặt Frontend

### Bước 1: Vào thư mục frontend
```bash
cd ../frontend
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Khởi động development server
```bash
npm run dev
```

## 🌐 Truy cập ứng dụng
- Frontend: http://localhost:3001
- Backend API: http://localhost:8001/api
- Admin: http://localhost:8001/admin

## 🔑 Tài khoản mặc định
- **Admin**: admin@qlsv.com / admin123
- **Test Student**: dien226514@student.nctu.edu.vn / Huydien@123

## 🐛 Troubleshooting

### Lỗi MySQL connection
```bash
# Kiểm tra MySQL đang chạy
netstat -an | findstr 3306

# Restart XAMPP nếu cần
```

### Lỗi Python dependencies
```bash
# Cập nhật pip
python -m pip install --upgrade pip

# Cài lại requirements
pip install -r requirements.txt --force-reinstall
```

### Lỗi Node.js
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📞 Hỗ trợ
Nếu gặp vấn đề, liên hệ team lead hoặc tạo issue trên GitHub.
