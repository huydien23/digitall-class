# 🚀 QLSV Demo Setup - Hướng Dẫn Cho Đồng Nghiệp

## 📋 Tổng Quan

Dự án **QLSV (Quản Lý Sinh Viên)** đã được setup hoàn chỉnh với mock data từ frontend. Chỉ cần chạy 1 script duy nhất là có đầy đủ dữ liệu demo!

## ⚡ Setup Nhanh (1 Lệnh)

```bash
# Clone project về máy
git clone <your-repo-url>
cd QLSV_APP

# Chạy setup tự động
chmod +x setup_demo.sh
./setup_demo.sh
```

**Thế là xong!** 🎉

## 🔧 Setup Thủ Công (Nếu Cần)

### 1. Backend Setup

```bash
cd backend

# Copy file config
cp env.example .env
# Edit .env với thông tin MySQL của bạn

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup database
python manage.py makemigrations
python manage.py migrate

# Import mock data từ frontend
python import_frontend_mock_data.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Chạy Project

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8001

# Terminal 2: Frontend  
cd frontend
npm run dev
```

## 📊 Dữ Liệu Demo Có Sẵn

Sau khi chạy setup, bạn sẽ có:

- **👥 15 Users**: 1 admin + 7 teachers + 7 students
- **📚 7 Classes**: Các lớp học thật từ mock data frontend
- **📖 5 Subjects**: Môn học đầy đủ
- **📊 364 Grades**: Điểm số mẫu
- **📝 430 Attendance Records**: Báo cáo điểm danh

## 🎯 Tài Khoản Demo

### Admin Account
- **Email**: `admin@qlsv.com`
- **Password**: `admin123`

### Teacher Accounts (Từ Mock Data Frontend)
- **Đặng Mạnh Huy**: `dangmanhhuy@nctu.edu.vn` / `teacher123`
- **Trần Minh Tâm**: `tranminhtam@nctu.edu.vn` / `teacher123`
- **Đoàn Chí Trung**: `doanchitrung@nctu.edu.vn` / `teacher123`
- **Đinh Cao Tín**: `dinhcaotin@nctu.edu.vn` / `teacher123`
- **Võ Thanh Vinh**: `vothanhvinh@nctu.edu.vn` / `teacher123`

## 🌐 Truy Cập

- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:8001
- **Django Admin**: http://localhost:8001/admin/

## 🎨 Features Demo

### Cho Admin:
- ✅ Quản lý sinh viên, giáo viên, lớp học
- ✅ Quản lý điểm số, điểm danh
- ✅ Thống kê và báo cáo
- ✅ Import/Export Excel
- ✅ QR Code attendance

### Cho Teacher:
- ✅ Xem danh sách lớp học
- ✅ Quản lý điểm danh bằng QR Code
- ✅ Nhập điểm sinh viên
- ✅ Xem thống kê lớp học

### Cho Student:
- ✅ Xem thông tin cá nhân
- ✅ Xem điểm số
- ✅ Xem lịch học
- ✅ Điểm danh bằng QR Code

## 🔧 Troubleshooting

### Lỗi MySQL Connection
```bash
# Kiểm tra MySQL đang chạy
sudo systemctl status mysql

# Restart MySQL nếu cần
sudo systemctl restart mysql
```

### Lỗi Python Dependencies
```bash
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Lỗi Node.js Dependencies
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Reset Database (Nếu Cần)
```bash
cd backend
source venv/bin/activate
python manage.py flush --noinput
python import_frontend_mock_data.py
```

## 📝 Lưu Ý Quan Trọng

1. **Mock Data**: Tất cả dữ liệu demo được lấy từ frontend mock data thật
2. **MySQL Required**: Cần MySQL server để chạy
3. **Ports**: Backend chạy port 8001, Frontend port 3003
4. **Environment**: Đã test trên Ubuntu 22.04, Python 3.12, Node.js 18+

## 🎉 Enjoy!

Dự án đã được setup hoàn chỉnh với mock data từ frontend. Chúc bạn demo thành công! 🚀

---

**Created by**: Senior Fullstack Developer  
**Last Updated**: $(date)  
**Version**: 1.0.0
