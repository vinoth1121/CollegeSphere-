# CollegeSphere — Development Setup Guide

## 1. Prerequisites
- Node.js LTS (v20+ or v24+)
- npm v10+
- MongoDB 7.0+ (Local MongoDB Community Server or MongoDB Atlas cluster connection string)
- Git 2.40+

## 2. Directory Structure
```
c:\StudentManagementBackups\
├── backend/            # Express.js + TypeScript REST API
├── frontend/           # React + Vite + Tailwind CSS SPA
├── database/           # Seeds, schema validators, migrations
├── docs/               # Architecture, API, Security, Backup guides
├── infra/              # Docker compose, CI workflows
├── .env.example        # Environment variable template
└── README.md
```

## 3. Quickstart

### Step 1: Environment Configuration
Copy `.env.example` to `backend/.env` and `frontend/.env`:
```bash
# In backend/.env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/college_sphere
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long_min
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# In frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Step 2: Install Backend Dependencies & Seed
```bash
cd backend
npm install
npm run seed     # Populates default institution, academic departments, users, students, courses
npm run test     # Executes automated test suite
npm run dev      # Starts development API server on port 5000
```

### Step 3: Install Frontend Dependencies & Start UI
```bash
cd ../frontend
npm install
npm run dev      # Starts Vite server on http://localhost:5173
```

### Step 4: Login with Default Credentials
- **Admin**: `admin@collegesphere.edu` / `Admin@12345`
- **Faculty**: `faculty.cse@collegesphere.edu` / `Faculty@12345`
- **Student**: `student.arun@collegesphere.edu` / `Student@12345`
- **Accounts**: `accounts@collegesphere.edu` / `Accounts@12345`
- **Exam Officer**: `exam@collegesphere.edu` / `Exam@12345`
