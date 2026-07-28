# Setup & Installation Guide

## Prerequisites

- **Node.js** 20 or higher
- **PostgreSQL** 15 or higher (or use Docker)
- **Docker** and Docker Compose (optional but recommended)

---

## Quick Start with Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd pm-system
```

2. **Start all services (PostgreSQL, Redis, Backend, Frontend)**
```bash
docker-compose up -d
```

3. **Wait for services to start** (~30 seconds), then run migrations and seed:
```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/health

---

## Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend
npm install

# Configure your environment
cp .env.example .env
# Edit .env and set your DATABASE_URL and JWT_SECRET

npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend runs at: **http://localhost:5000**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Default Login Credentials (Development Only)

After seeding the database, use these credentials to log in during development:

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@pm-system.com | See seed file |
| Finance Admin | finance@pm-system.com | See seed file |
| Project Manager | pm@pm-system.com | See seed file |
| Team Lead | lead@pm-system.com | See seed file |
| Employee | employee@pm-system.com | See seed file |

> **Note:** Change all default passwords before any staging or production deployment.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | Create new user (Super Admin only) |
| `GET` | `/api/auth/profile` | Get current user profile |
| `PUT` | `/api/auth/update-password` | Change password |
| `POST` | `/api/auth/forgot-password` | Initiate password reset |
| `POST` | `/api/auth/reset-password` | Complete password reset |

---

## Development Tools

### Prisma Studio (Database GUI)
```bash
cd backend
npm run prisma:studio
# Opens at http://localhost:5555
```

### Docker Service Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Port 3000 in use | Stop other Next.js apps or change port in `package.json` |
| Port 5000 in use | Stop other Node.js servers |
| PostgreSQL connection error | Verify `DATABASE_URL` in `backend/.env` |
| npm install fails | Run `npm cache clean --force`, delete `node_modules`, retry |

---

## Need Help?

See [README.md](./README.md) for architecture overview, feature list, and project structure.
