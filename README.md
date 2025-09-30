<div align="center">

# 🎓 Hệ Thống Quản Lý Sinh Viên

> **Hệ thống quản lý sinh viên hiện đại với điểm danh QR Code thông minh**  
> Được xây dựng với React + Vite frontend và Django REST API backend

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django)](https://djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-316192?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python)](https://python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

</div>

---

## 🚀 Demo nhanh

<div align="center">

### 📱 Điểm danh QR Code chỉ trong 30 giây

https://github.com/Hungdoan565/QLSV_APP/assets/your-video-id/demo-qr-attendance.mp4

**Truy cập demo:** [https://your-demo-url.com](https://your-demo-url.com)

</div>

---

## ✨ Tính năng nổi bật

<table>
<tr>
<td width="50%">

### 👥 **Quản lý sinh viên**

- ✅ CRUD sinh viên đầy đủ
- ✅ Import/Export Excel hàng loạt
- ✅ Tìm kiếm và lọc thông minh
- ✅ Thống kê chi tiết

### 🏫 **Quản lý lớp học**

- ✅ Tạo và quản lý lớp học
- ✅ Thêm/xóa sinh viên khỏi lớp
- ✅ Quản lý sĩ số lớp
- ✅ Thống kê lớp học

### 📊 **Quản lý điểm số**

- ✅ Nhập điểm theo loại (giữa kỳ, cuối kỳ, bài tập)
- ✅ Tính điểm tổng kết tự động
- ✅ Xếp loại điểm (A+, A, B+, B, C+, C, D+, D, F)
- ✅ Export bảng điểm Excel

</td>
<td width="50%">

### 📱 **Điểm danh QR Code thông minh**

- ✅ **QR Scanner**: Camera tích hợp cho sinh viên
- ✅ **QR Generator**: Giáo viên tạo phiên điểm danh
- ✅ **Real-time Updates**: Cập nhật theo thời gian thực
- ✅ **Security Features**: Xác thực thời gian, chống trùng lặp
- ✅ **Mobile Optimized**: Tối ưu cho thiết bị di động
- ✅ **Export & Print**: Xuất và in QR code, báo cáo

### 📈 **Dashboard & Báo cáo**

- ✅ Tổng quan thống kê
- ✅ Biểu đồ trực quan
- ✅ Báo cáo chi tiết

### 🔐 **Xác thực & Phân quyền**

- ✅ JWT Authentication
- ✅ Phân quyền Admin/Teacher
- ✅ Quản lý profile

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite)
![Material--UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat-square&logo=mui)
![Redux](https://img.shields.io/badge/Redux-764ABC?style=flat-square&logo=redux)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript)

### Backend

![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django)
![Django REST](https://img.shields.io/badge/Django%20REST-092E20?style=flat-square&logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis)

### Tools & Libraries

![QR Code](https://img.shields.io/badge/QR%20Code-000000?style=flat-square)
![Excel](https://img.shields.io/badge/Excel-217346?style=flat-square&logo=microsoft-excel)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer)

</div>

---

## 🚀 Cài đặt và chạy

### 📋 Yêu cầu hệ thống

- **Python** 3.8+
- **Node.js** 16+
- **Database**: PostgreSQL 12+ (local) hoặc **Supabase** (cloud) 🌟

### 🌟 Cách 1: Sử dụng Supabase (Khuyến nghị)

<details>
<summary><b>📖 Xem hướng dẫn chi tiết</b></summary>

```bash
# 1. Clone repository
git clone https://github.com/Hungdoan565/QLSV_APP.git
cd QLSV_APP

# 2. Cấu hình Supabase
# - Tạo tài khoản tại https://supabase.com
# - Tạo project mới
# - Copy thông tin kết nối database
# - Xem SUPABASE_SETUP.md để biết chi tiết

# 3. Cấu hình environment
cd backend
cp env.example .env
# Chỉnh sửa .env với thông tin Supabase

# 4. Deploy lên Supabase
./deploy_supabase.sh

# 5. Chạy frontend
cd ../frontend
npm install
npm run dev
```

</details>

### 🏠 Cách 2: Chạy local với PostgreSQL

<details>
<summary><b>📖 Xem hướng dẫn chi tiết</b></summary>

```bash
# 1. Clone repository
git clone https://github.com/Hungdoan565/QLSV_APP.git
cd QLSV_APP

# 2. Chạy backend
./run_backend.sh

# 3. Chạy frontend (terminal mới)
./run_frontend.sh
```

</details>

### ⚙️ Cách 3: Chạy thủ công

<details>
<summary><b>📖 Xem hướng dẫn chi tiết</b></summary>

#### Backend (Django)

```bash
cd backend

# Tạo virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Cấu hình database
# - Tạo database PostgreSQL tên 'student_management'
# - Sao chép env.example thành .env và cập nhật thông tin

# Chạy migrations
python manage.py makemigrations
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser

# Chạy server
python manage.py runserver
```

#### Frontend (React)

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

</details>

---

## 🌐 Truy cập ứng dụng

| Service         | URL                             | Mô tả             |
| --------------- | ------------------------------- | ----------------- |
| **Frontend**    | http://localhost:3000           | Giao diện chính   |
| **Backend API** | http://localhost:8000           | API endpoints     |
| **Admin Panel** | http://localhost:8000/admin     | Quản trị hệ thống |
| **API Docs**    | http://localhost:8000/api/docs/ | Tài liệu API      |

---

## 👤 Tài khoản demo

| Role        | Email               | Password   | Quyền           |
| ----------- | ------------------- | ---------- | --------------- |
| **Admin**   | admin@qlsv.com      | admin123   | Toàn quyền      |
| **Teacher** | teacher@example.com | teacher123 | Quản lý lớp học |

---

## 📁 Cấu trúc dự án

```
QLSV_APP/
├── 📁 backend/                    # Django API
│   ├── 📁 apps/                   # Django applications
│   │   ├── 📁 accounts/           # Quản lý người dùng
│   │   ├── 📁 students/           # Quản lý sinh viên
│   │   ├── 📁 classes/            # Quản lý lớp học
│   │   ├── 📁 grades/             # Quản lý điểm số
│   │   └── 📁 attendance/         # Điểm danh QR
│   ├── 📁 student_management/     # Django settings
│   ├── 📄 requirements.txt        # Python dependencies
│   └── 📄 .env                   # Environment variables
├── 📁 frontend/                  # React application
│   ├── 📁 src/
│   │   ├── 📁 components/        # React components
│   │   ├── 📁 pages/             # Trang chính
│   │   ├── 📁 services/          # API services
│   │   └── 📁 store/             # Redux store
│   ├── 📄 package.json           # Node dependencies
│   └── 📄 vite.config.js         # Vite configuration
├── 📁 supabase/                  # Supabase schema & config
│   ├── 📄 schema.sql             # Database schema
│   └── 📄 config.toml            # Supabase configuration
├── 📄 run_backend.sh             # Script chạy backend
├── 📄 run_frontend.sh            # Script chạy frontend
├── 📄 deploy_supabase.sh        # Deploy lên Supabase
└── 📄 README.md                 # Hướng dẫn này
```

---

## 🔗 API Endpoints

### 🔐 Authentication

| Method | Endpoint                    | Mô tả                 |
| ------ | --------------------------- | --------------------- |
| `POST` | `/api/auth/login/`          | Đăng nhập             |
| `POST` | `/api/auth/register/`       | Đăng ký               |
| `GET`  | `/api/auth/profile/`        | Lấy thông tin profile |
| `PUT`  | `/api/auth/profile/update/` | Cập nhật profile      |

### 👥 Students

| Method   | Endpoint                      | Mô tả               |
| -------- | ----------------------------- | ------------------- |
| `GET`    | `/api/students/`              | Danh sách sinh viên |
| `POST`   | `/api/students/`              | Tạo sinh viên       |
| `GET`    | `/api/students/{id}/`         | Chi tiết sinh viên  |
| `PUT`    | `/api/students/{id}/`         | Cập nhật sinh viên  |
| `DELETE` | `/api/students/{id}/`         | Xóa sinh viên       |
| `POST`   | `/api/students/import-excel/` | Import Excel        |
| `GET`    | `/api/students/export-excel/` | Export Excel        |

### 🏫 Classes

| Method   | Endpoint                      | Mô tả                  |
| -------- | ----------------------------- | ---------------------- |
| `GET`    | `/api/classes/`               | Danh sách lớp học      |
| `POST`   | `/api/classes/`               | Tạo lớp học            |
| `GET`    | `/api/classes/{id}/`          | Chi tiết lớp học       |
| `PUT`    | `/api/classes/{id}/`          | Cập nhật lớp học       |
| `DELETE` | `/api/classes/{id}/`          | Xóa lớp học            |
| `GET`    | `/api/classes/{id}/students/` | Sinh viên trong lớp    |
| `POST`   | `/api/classes/{id}/students/` | Thêm sinh viên vào lớp |

### 📊 Grades

| Method | Endpoint                                         | Mô tả              |
| ------ | ------------------------------------------------ | ------------------ |
| `GET`  | `/api/grades/`                                   | Danh sách điểm     |
| `POST` | `/api/grades/`                                   | Tạo điểm           |
| `GET`  | `/api/grades/summary/{class_id}/{subject_id}/`   | Tổng kết điểm      |
| `POST` | `/api/grades/calculate/{class_id}/{subject_id}/` | Tính điểm tổng kết |

### 📱 Attendance & QR Code

| Method      | Endpoint                                 | Mô tả                        |
| ----------- | ---------------------------------------- | ---------------------------- |
| `GET`       | `/api/attendance/sessions/`              | Danh sách buổi điểm danh     |
| `POST`      | `/api/attendance/sessions/`              | Tạo buổi điểm danh           |
| `GET`       | `/api/attendance/sessions/{id}/qr-code/` | Tạo QR code                  |
| `POST`      | `/api/attendance/check-in-qr/`           | Điểm danh bằng QR            |
| `WebSocket` | **Supabase Real-time**                   | Theo dõi điểm danh real-time |

---

## 🐛 Troubleshooting

<details>
<summary><b>🔧 Lỗi kết nối database</b></summary>

- ✅ Kiểm tra PostgreSQL đang chạy
- ✅ Kiểm tra thông tin database trong `.env`
- ✅ Chạy `python manage.py migrate`

</details>

<details>
<summary><b>🔧 Lỗi frontend không kết nối được API</b></summary>

- ✅ Kiểm tra backend đang chạy tại port 8000
- ✅ Kiểm tra CORS settings trong Django
- ✅ Kiểm tra proxy configuration trong Vite

</details>

<details>
<summary><b>🔧 Lỗi import Excel</b></summary>

- ✅ Đảm bảo file Excel có đúng format
- ✅ Kiểm tra quyền ghi file trong thư mục media
- ✅ Kiểm tra encoding của file Excel

</details>

---

## 📝 Ghi chú quan trọng

- 🚀 **Performance**: Sử dụng Vite thay vì Create React App để build nhanh hơn
- 🗄️ **Database**: Backend sử dụng MySQL cho production
- 🔐 **Security**: Tất cả API đều có authentication JWT
- 🔄 **Proxy**: Frontend tự động proxy API requests đến backend
- 📱 **Mobile**: Giao diện responsive, tối ưu cho mobile
- ⚡ **Real-time**: Sử dụng Supabase WebSocket cho cập nhật real-time

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy:

1. 🍴 Fork repository
2. 🌿 Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to branch (`git push origin feature/AmazingFeature`)
5. 🔄 Tạo Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

### ⭐ Nếu dự án hữu ích, hãy cho một star!

**Made with ❤️ by [Hungdoan565](https://github.com/Hungdoan565)**

</div>
