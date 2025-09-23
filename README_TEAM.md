# 🚀 QLSV App - Team Setup Guide

## 📋 Quick Start

### Linux/Mac:
```bash
git clone <your-repo-url>
cd QLSV_APP
chmod +x setup.sh
./setup.sh
```

### Windows:
```bash
git clone <your-repo-url>
cd QLSV_APP
setup.bat
```

## 🔧 Manual Setup (If needed)

### Backend Setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_database
python manage.py runserver 8001
```

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001/api
- **Admin Panel**: http://localhost:8001/admin

## 🔑 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@qlsv.com | admin123 |
| Student | dien226514@student.nctu.edu.vn | Huydien@123 |
| Teacher | teacher1@nctu.edu.vn | Teacher123 |

## 📊 Sample Data

The setup script creates:
- ✅ 1 Admin user
- ✅ 2 Student users
- ✅ 1 Teacher user
- ✅ 2 Sample classes
- ✅ Sample grades and attendance records

## 🐛 Troubleshooting

### MySQL Connection Error:
```bash
# Start MySQL service
sudo systemctl start mysql

# Check MySQL status
sudo systemctl status mysql
```

### Python Dependencies Error:
```bash
# Update pip
python -m pip install --upgrade pip

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

### Node.js Dependencies Error:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Contact the team lead
3. Create an issue on GitHub

## 🎯 Development Workflow

1. **Pull latest changes**: `git pull origin main`
2. **Run migrations**: `python manage.py migrate`
3. **Start development**: `./setup.sh` or `setup.bat`
4. **Make changes**: Edit code as needed
5. **Test changes**: Verify functionality
6. **Commit changes**: `git add . && git commit -m "Your message"`
7. **Push changes**: `git push origin main`
