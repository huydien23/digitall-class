# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo with a Django REST API backend (backend/) and a React + Vite frontend (frontend/).
- Backend project: student_management with local apps: apps.accounts, apps.students, apps.classes, apps.grades, apps.attendance. REST is implemented via Django REST Framework with JWT (simplejwt). Custom user model: accounts.User.
- Database: picks MySQL when DB_* env vars are set (python-decouple), otherwise falls back to SQLite for dev. Celery/Redis settings exist but no worker runner is defined here.
- Frontend: React 18 with Redux Toolkit. API layer is centralized in src/services/apiService.js (Axios with JWT interceptors). State slices live in src/store/slices/.
- URLs are mounted under /api/* per app in backend/student_management/urls.py. Static/media are served in DEBUG.

Important environment/config
- Backend env template: backend/env.example → copy to backend/.env and set DB_NAME/DB_USER/DB_PASSWORD/DB_HOST/DB_PORT for MySQL, or omit to use SQLite.
- Frontend env template: frontend/.env.example → copy to frontend/.env and set Supabase keys if needed by UI features.
- Ports used in docs/scripts: Backend typically on 8001; Frontend dev on 3001. Note: vite.config.js proxies /api to http://localhost:8000, but the app’s axios baseURL in src/services/apiService.js is hardcoded to http://localhost:8001/api — so proxy is bypassed. Prefer running backend on 8001 to match the frontend’s baseURL, or change one source of truth if you modify ports.

Common commands
- One-shot local setup (Windows PowerShell):
```pwsh path=null start=null
# From repo root
./setup.bat
```
- One-shot local setup (Linux/macOS):
```bash path=null start=null
# From repo root
chmod +x ./setup.sh
./setup.sh
```

Backend (Django)
- Create/activate venv, install deps:
```pwsh path=null start=null
# From repo root
python -m venv backend/venv
backend/venv/Scripts/Activate.ps1
pip install -r backend/requirements.txt
```
- Env file:
```pwsh path=null start=null
Copy-Item backend/env.example backend/.env
# Edit backend/.env as needed (or omit DB_* to use SQLite)
```
- Database migrations and runserver:
```pwsh path=null start=null
python backend/manage.py makemigrations
python backend/manage.py migrate
python backend/manage.py runserver 8001
```
- Management commands provided by this repo:
```pwsh path=null start=null
# Seed core data (defined under apps.accounts.management.commands)
python backend/manage.py setup_database
python backend/manage.py setup_sample_data
python backend/manage.py test_email

# Import mock/demo data assembled from the frontend
python backend/import_frontend_mock_data.py
```
- Run all tests (Django test runner):
```pwsh path=null start=null
python backend/manage.py test
```
- Run a single test (module or dotted path):
```pwsh path=null start=null
# By module file
python backend/manage.py test backend.test_registration

# Or by dotted test path
python backend/manage.py test apps.accounts.tests:UserTests.test_registration
```

Frontend (React + Vite)
- Install, develop, build, preview:
```pwsh path=null start=null
# From repo root
cd frontend
npm install
npm run dev      # http://localhost:3001
npm run build    # production build to dist/
npm run preview  # preview built assets
```
- Lint:
```pwsh path=null start=null
npm run lint
```

High-level architecture and flow
- Backend
  - student_management/settings.py wires Django + DRF + SimpleJWT; AUTH_USER_MODEL is accounts.User.
  - Database is chosen at runtime: MySQL when DB_* env vars exist; otherwise SQLite (db.sqlite3).
  - REST conventions: each local app exposes models/serializers/views/urls; project urls.py mounts them under /api/<app>/. CORS is permissive in DEBUG.
  - JWT tokens are issued/validated via simplejwt; settings tune token lifetimes and headers. Email and Celery settings are present via env.
- Frontend
  - State management via Redux Toolkit (src/store/store.js) with slices for auth, students, classes, grades, attendance.
  - API interactions centralized in src/services/* using Axios instance with Authorization interceptor that reads tokens from localStorage and performs refresh flows.
  - Vite dev server on port 3001; proxy config points to 8000 but API base is absolute to 8001, so backend should run on 8001 unless you refactor.
  - Feature highlights: QR Code scan/generate flows (components/QRCode/, services/attendanceService.js), Excel import/export for students, dashboards for roles.

Operational tips specific to this repo
- If you change backend port, update either src/services/apiService.js (baseURL) or unify on Vite proxy by using relative API paths in the frontend.
- For quick demo data, prefer the provided management commands and the import_frontend_mock_data.py script after migrations.

Key references
- README.md: end-to-end setup instructions, available routes, and demo notes.
- SETUP_WINDOWS.md / README_TEAM.md / SETUP_FOR_TEAM.md: scripted setup flows and ports/accounts used for demos.
