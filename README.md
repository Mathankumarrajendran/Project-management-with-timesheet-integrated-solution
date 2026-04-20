# Project Management & Time Tracking System

Enterprise-grade Project Management, Time Tracking & Billing System for PCB engineering industries.

## 🚀 Features

- **Multi-Client Management**: Manage multiple clients with detailed profiles
- **Project Management**: Complete project lifecycle management with team assignment
- **Task Management**: Comprehensive task tracking with SLA monitoring
- **Time Tracking**: Daily time entry, weekly timesheet submission with dual-level approvals (L1/L2)
- **SCRUM/Agile**: Sprint planning, backlog management, burndown charts
- **Dashboards**: Role-specific dashboards with real-time KPIs and analytics
- **Reporting**: Client billing, employee productivity, project profitability reports
- **Role-Based Access Control**: 7 roles with granular permissions
- **Notifications**: Email and in-app notifications for key events
- **Audit Trail**: Complete change tracking for compliance

## 📋 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18) with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit + RTK Query
- **Charts**: Recharts + Apache ECharts

### Backend
- **Framework**: Node.js 20 + Express.js with TypeScript
- **Database**: PostgreSQL 15 with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT + bcrypt

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (planned)

## 🛠️ Installation

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (recommended)
- PostgreSQL 15 (if not using Docker)

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
```bash
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system"
```

2. **Start all services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 5000
- Frontend app on port 3000

3. **Run database migrations**
```bash
cd backend
npm run prisma:migrate
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
pm-system/
├── frontend/                # Next.js frontend application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable components
│   │   ├── store/          # Redux store
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                # Express backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
└── docker-compose.yml      # Docker services configuration
```

## 🎯 Development Roadmap

### Milestone 1: Foundation & Authentication ✅
- [x] Project setup
- [x] Database schema
- [x] Docker configuration
- [ ] User authentication
- [ ] RBAC middleware

### Milestone 2: Client & Project Management (In Progress)
- [ ] Client CRUD operations
- [ ] Project management module
- [ ] Team member assignment

### Milestone 3: Task Management & SLA Tracking
- [ ] Task CRUD operations
- [ ] SLA monitoring
- [ ] Comments and attachments

### Milestone 4: Time Tracking & Approval Workflow
- [ ] Daily time entry
- [ ] Weekly timesheet submission
- [ ] L1 approval (weekly)
- [ ] L2 approval (monthly/payroll)

### Milestone 5: Dashboards & Analytics
- [ ] Super Admin dashboard
- [ ] Project dashboard
- [ ] Employee dashboard
- [ ] Finance dashboard
- [ ] Client portal

### Milestone 6: SCRUM, Reporting & Notifications
- [ ] Sprint management
- [ ] Reporting module
- [ ] Email notifications
- [ ] In-app notifications

## 👥 User Roles

1. **Super Admin**: Full system access
2. **Finance Admin**: Financial operations and L2 approvals
3. **Project Manager**: Project and team management
4. **Team Lead**: Team leadership and L1 approvals
5. **Employee**: Time entry and task execution
6. **Client**: View-only access to their projects
7. **Auditor**: Read-only access for compliance

## 📊 Database Schema

The system uses PostgreSQL with the following core tables:
- `User`: User accounts and profiles
- `Client`: Client information
- `Project`: Project details and budgets
- `Task`: Task management with SLA tracking
- `TimeLog`: Daily time entries
- `WeeklyTimesheet`: Weekly timesheet submissions
- `MonthlyTimesheet`: Monthly compilations for payroll
- `Sprint`: SCRUM sprint management
- `AuditLog`: Complete audit trail
- `Notification`: User notifications

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation with Joi
- SQL injection prevention with Prisma ORM
- CORS protection
- Environment variable configuration

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For support, email support@pm-system.com

---

Built with ❤️ for PCB Engineering Industries
