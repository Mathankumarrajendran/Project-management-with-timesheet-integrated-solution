# Project Setup and Installation Guide

## Prerequisites
- Node.js 20 or higher
- PostgreSQL 15 or higher (or use Docker)
- Docker and Docker Compose (optional, but recommended)

## Quick Start with Docker (Recommended)

1. **Navigate to project directory**
```powershell
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system"
```

2. **Start all services (PostgreSQL, Redis, Backend, Frontend)**
```powershell
docker-compose up -d
```

3. **Wait for services to start** (about 30 seconds)

4. **Run database migrations and seed**
```powershell
cd backend
npm run prisma:migrate
npm run prisma:seed
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
```powershell
cd "c:\Users\HP\Desktop\AI learnings\ Project management\pm-system\backend"
```

2. **Install dependencies**
```powershell
npm install
```

3. **Set up environment variables**
- Edit `.env` file and update DATABASE_URL with your PostgreSQL credentials

4. **Generate Prisma Client**
```powershell
npm run prisma:generate
```

5. **Run database migrations**
```powershell
npm run prisma:migrate
```

6. **Seed the database with test users**
```powershell
npm run prisma:seed
```

7. **Start the backend server**
```powershell
npm run dev
```

Backend will be running at http://localhost:5000

### Frontend Setup

1. **Open a new PowerShell terminal and navigate to frontend directory**
```powershell
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\frontend"
```

2. **Install dependencies**
```powershell
npm install
```

3. **Start the development server**
```powershell
npm run dev
```

Frontend will be running at http://localhost:3000

## Test Users

After seeding the database, you can login with these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@pm-system.com | Admin@123456 |
| Finance Admin | finance@pm-system.com | Finance@123 |
| Project Manager | pm@pm-system.com | PM@123456 |
| Team Lead | lead@pm-system.com | Lead@123456 |
| Employee | employee@pm-system.com | Employee@123 |

## API Endpoints (Available Now)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (Super Admin only)
- `GET /api/auth/profile` - Get current user (requires authentication)
- `PUT /api/auth/update-password` - Update password (requires authentication)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

## Testing the API

You can test the API using tools like:
- **Postman**
- **Thunder Client** (VS Code extension)
- **curl**

### Example: Login Request
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@pm-system.com\",\"password\":\"Admin@123456\"}'
```

## Development Tools

### Prisma Studio (Database GUI)
```powershell
cd backend
npm run prisma:studio
```

Access Prisma Studio at http://localhost:5555

### View Logs
```powershell
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Or if running manually, logs will appear in the terminal
```

## Troubleshooting

### Port Already in Use
If you get "port in use" errors:
- Frontend (3000): Check if another Next.js app is running
- Backend (5000): Check if another Node.js server is running
- PostgreSQL (5432): Check if PostgreSQL is already running locally

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Ensure database `pm_system` exists

### Dependencies Not Installing
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## What's Completed

✅ **Milestone 1: Foundation & Authentication**
- Project structure with Next.js + Express + TypeScript
- PostgreSQL database with Prisma ORM
- Complete database schema (14 models)
- JWT authentication system
- Role-based access control (RBAC)
- User management with 7 roles
- Password reset functionality
- Docker containerization
- Database seeding with test users

## Next Steps

The following features will be implemented next:
- Client management module
- Project management module
- Task management with SLA tracking
- Time tracking and timesheets
- Dashboards and analytics
- SCRUM/Agile features
- Reporting module
- Email notifications

## Need Help?

Check the main [README.md](../README.md) for more information about the project architecture and features.
