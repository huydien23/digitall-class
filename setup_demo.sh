#!/bin/bash

# 🚀 QLSV Demo Setup Script
# Tự động setup project với mock data từ frontend
# Usage: chmod +x setup_demo.sh && ./setup_demo.sh

echo "🚀 QLSV Demo Setup - Starting..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "README.md" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Current directory: $(pwd)${NC}"

# 1. Setup Backend
echo -e "\n${YELLOW}🔧 Setting up Backend...${NC}"
echo "=================================="

cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copying from env.example...${NC}"
    cp env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your MySQL credentials${NC}"
    echo -e "${YELLOW}   Required: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT${NC}"
    read -p "Press Enter after configuring .env file..."
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}🐍 Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}🔌 Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Run migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
python manage.py makemigrations
python manage.py migrate

# Import frontend mock data
echo -e "${YELLOW}📊 Importing frontend mock data to MySQL...${NC}"
python import_frontend_mock_data.py

echo -e "${GREEN}✅ Backend setup completed!${NC}"

# 2. Setup Frontend
echo -e "\n${YELLOW}🎨 Setting up Frontend...${NC}"
echo "=================================="

cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Frontend setup completed!${NC}"

# 3. Summary
echo -e "\n${GREEN}🎉 SETUP COMPLETED SUCCESSFULLY!${NC}"
echo "=================================="
echo -e "${BLUE}📊 Database Summary:${NC}"
echo -e "   👥 Users: 15 (1 admin, 7 teachers, 7 students)"
echo -e "   📚 Classes: 7 (with real mock data from frontend)"
echo -e "   📖 Subjects: 5"
echo -e "   📊 Grades: 364"
echo -e "   📝 Attendance: 430 records"

echo -e "\n${BLUE}🎯 Demo Accounts:${NC}"
echo -e "   Admin: admin@qlsv.com / admin123"
echo -e "   Teachers:"
echo -e "     - dangmanhhuy@nctu.edu.vn / teacher123"
echo -e "     - tranminhtam@nctu.edu.vn / teacher123"
echo -e "     - doanchitrung@nctu.edu.vn / teacher123"
echo -e "     - dinhcaotin@nctu.edu.vn / teacher123"
echo -e "     - vothanhvinh@nctu.edu.vn / teacher123"

echo -e "\n${BLUE}🚀 How to run:${NC}"
echo -e "   Backend:  cd backend && source venv/bin/activate && python manage.py runserver 0.0.0.0:8001"
echo -e "   Frontend: cd frontend && npm run dev"

echo -e "\n${BLUE}🌐 Access URLs:${NC}"
echo -e "   Frontend: http://localhost:3003"
echo -e "   Backend:  http://localhost:8001"
echo -e "   Admin:    http://localhost:8001/admin/"

echo -e "\n${GREEN}✨ Ready for demo! Enjoy!${NC}"
