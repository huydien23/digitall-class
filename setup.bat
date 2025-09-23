@echo off
echo 🚀 Setting up QLSV App...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.12+
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)

echo ✅ Starting setup...

REM Setup Backend
echo 📦 Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    python -m venv venv
    echo ✅ Virtual environment created
)

REM Activate virtual environment
call venv\Scripts\activate
echo ✅ Virtual environment activated

REM Install dependencies
pip install -r requirements.txt
echo ✅ Dependencies installed

REM Run migrations
python manage.py migrate
echo ✅ Database migrations applied

REM Setup sample data
python manage.py setup_database
echo ✅ Sample data created

REM Start backend in background
echo 🚀 Starting backend server...
start /B python manage.py runserver 8001
echo ✅ Backend server started

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Setup Frontend
echo 📦 Setting up Frontend...
cd ..\frontend

REM Install dependencies
npm install
echo ✅ Frontend dependencies installed

REM Start frontend
echo 🚀 Starting frontend server...
start /B npm run dev
echo ✅ Frontend server started

REM Wait for frontend to start
timeout /t 10 /nobreak >nul

echo.
echo 🎉 Setup completed!
echo.
echo 📱 Frontend: http://localhost:3001
echo 🔧 Backend API: http://localhost:8001/api
echo 👨‍💼 Admin Panel: http://localhost:8001/admin
echo.
echo 🔑 Default Accounts:
echo    Admin: admin@qlsv.com / admin123
echo    Student: dien226514@student.nctu.edu.vn / Huydien@123
echo    Teacher: teacher1@nctu.edu.vn / Teacher123
echo.
echo Press any key to exit...
pause >nul
