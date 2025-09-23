#!/bin/bash

echo "🚀 Setting up QLSV App..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install Python 3.12+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    print_warning "MySQL is not running. Please start MySQL service:"
    echo "sudo systemctl start mysql"
    echo "Or install MySQL if not installed"
fi

print_status "Starting setup..."

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate virtual environment
source venv/bin/activate
print_status "Virtual environment activated"

# Install dependencies
pip install -r requirements.txt
print_status "Dependencies installed"

# Run migrations
python manage.py migrate
print_status "Database migrations applied"

# Setup sample data
python manage.py setup_database
print_status "Sample data created"

# Start backend in background
echo "🚀 Starting backend server..."
python manage.py runserver 8001 &
BACKEND_PID=$!
print_status "Backend server started (PID: $BACKEND_PID)"

# Wait for backend to start
sleep 5

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend

# Install dependencies
npm install
print_status "Frontend dependencies installed"

# Start frontend
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
print_status "Frontend server started (PID: $FRONTEND_PID)"

# Wait for frontend to start
sleep 10

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📱 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:8001/api"
echo "👨‍💼 Admin Panel: http://localhost:8001/admin"
echo ""
echo "🔑 Default Accounts:"
echo "   Admin: admin@qlsv.com / admin123"
echo "   Student: dien226514@student.nctu.edu.vn / Huydien@123"
echo "   Teacher: teacher1@nctu.edu.vn / Teacher123"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep script running
wait
