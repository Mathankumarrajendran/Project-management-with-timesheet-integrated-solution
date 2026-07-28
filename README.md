# Project Management & Time Tracking System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./RELEASE_NOTES/v1.0.0.md)
[![Changelog](https://img.shields.io/badge/changelog-view-green.svg)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)]()

Enterprise-grade Project Management, Time Tracking & Billing System — built for teams managing client projects, multi-level timesheet approvals, and billable hour invoicing.

> **Current Version: v1.0.0** — [Full Release Notes](./RELEASE_NOTES/v1.0.0.md) | [Changelog](./CHANGELOG.md) | [Versioning Strategy](./VERSIONING.md)

---

## 🚀 Features (v1.0.0)

- **Multi-Client Management**: Manage multiple clients with detailed profiles and billing terms
- **Project Management**: Complete project lifecycle with SLA policy, budget tracking, health status
- **Task Management**: Full task lifecycle (TODO → COMPLETED) with priority and SLA tracking
- **Time Tracking**: Daily time entry with 5-stage approval workflow (DRAFT → LOCKED)
- **Timesheet Approvals**: Dual-level approval — L1 (Project Manager) + L2 (Finance Admin)
- **Invoice Generation**: Billable-hours invoicing per client with approved-only validation
- **Client Portal**: Dedicated dashboard for clients to monitor project progress and download invoices
- **BI Analytics**: Interactive Recharts graphs — time logs, resource allocation, task compliance, project hours
- **Sprint Board**: Kanban-style sprint management
- **Dashboard & KPIs**: Role-specific real-time dashboards
- **Notifications**: In-app notification bell with real-time polling
- **Audit Trail**: Complete change tracking for compliance
- **Role-Based Access Control**: 6 roles — SUPER_ADMIN, FINANCE_ADMIN, PROJECT_MANAGER, TEAM_LEAD, EMPLOYEE, CLIENT


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

For support, email madhankumarknms@gmail.com

---

Built with ❤️ for Project management and tracking
