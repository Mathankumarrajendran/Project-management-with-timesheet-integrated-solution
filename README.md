# Project Management & Time Tracking System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./RELEASE_NOTES/v1.0.0.md)
[![Changelog](https://img.shields.io/badge/changelog-view-green.svg)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)]()

A full-stack Project Management and Timesheet Integrated Solution for managing projects, tasks, team members, timesheet approvals, and billable hour invoicing in a single platform.

> **Current Version: v1.0.0** — [Full Release Notes](./RELEASE_NOTES/v1.0.0.md) | [Changelog](./CHANGELOG.md) | [Versioning Strategy](./VERSIONING.md)

---

## 🚀 Features (v1.0.0)

- **Project Management**: Full lifecycle with SLA policy, budget tracking, and health status
- **Task Management**: Complete workflow (TODO → COMPLETED) with priority and SLA tracking
- **Time Tracking**: Daily time entry with 5-stage approval workflow (DRAFT → LOCKED)
- **Timesheet Approvals**: Dual-level approval — L1 (Project Manager) + L2 (Finance Admin)
- **Invoice Generation**: Billable-hours invoicing with approved-only validation
- **Client Portal**: Dedicated read-only dashboard for clients to track progress and download invoices
- **BI Analytics**: Interactive Recharts graphs — time logs, resource allocation, task compliance, project hours
- **Sprint Board**: Kanban-style sprint management
- **Dashboard & KPIs**: Role-specific real-time dashboards
- **Notifications**: In-app notification bell with real-time polling
- **Audit Trail**: Complete change tracking for compliance
- **Role-Based Access Control**: 6 roles — SUPER_ADMIN, FINANCE_ADMIN, PROJECT_MANAGER, TEAM_LEAD, EMPLOYEE, CLIENT

---

## 📋 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18) with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Charts**: Recharts

### Backend
- **Framework**: Node.js 20 + Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt

### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: Railway (backend) + Vercel (frontend)

---

## 🛠️ Installation

See [SETUP.md](./SETUP.md) for full setup instructions.

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd pm-system

# Start with Docker
docker-compose up -d

# Run migrations and seed
cd backend
npm run prisma:migrate
npm run prisma:seed
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 📁 Project Structure

```
pm-system/
├── README.md               # This file
├── CHANGELOG.md            # Full version history
├── VERSIONING.md           # Versioning strategy & release guide
├── VERSION                 # Current version number
├── FDD.md                  # Functional Design Document
├── SETUP.md                # Installation & setup guide
├── docker-compose.yml      # Docker services configuration
│
├── RELEASE_NOTES/          # Per-version release documentation
│   └── v1.0.0.md
│
├── frontend/               # Next.js frontend application
│   └── src/
│       ├── app/            # App router pages
│       ├── components/     # Reusable components
│       └── store/          # Redux store
│
└── backend/                # Express.js REST API
    ├── src/
    │   ├── controllers/    # Route controllers
    │   ├── middleware/      # Auth & role middleware
    │   └── routes/         # API route definitions
    └── prisma/
        └── schema.prisma   # Database schema
```

---

## 👥 User Roles

| Role | Access Level |
|---|---|
| `SUPER_ADMIN` | Full system access |
| `FINANCE_ADMIN` | Financial data, L2 approvals, reports |
| `PROJECT_MANAGER` | Projects, tasks, sprints, L1 approvals |
| `TEAM_LEAD` | Tasks and sprints within assigned projects |
| `EMPLOYEE` | Time entry and task execution |
| `CLIENT` | Read-only project portal dashboard |

---

## 📊 Database Schema (Core Tables)

| Table | Purpose |
|---|---|
| `User` | User accounts with role and hourly rate |
| `Client` | Client records and billing terms |
| `Project` | Projects linked to clients, budget tracking |
| `Task` | Tasks with SLA, priority, and status |
| `TimeLog` | Daily time entries per task |
| `WeeklyTimesheet` | Weekly submission and L1 approval |
| `MonthlyTimesheet` | Monthly L2 approval and payroll |
| `Sprint` | Agile sprint management |
| `Invoice` | Billable-hours invoices per client |
| `AuditLog` | Full audit trail |
| `Notification` | In-app notifications |

---

## 🔐 Security

- JWT-based authentication with role enforcement
- Password hashing with bcrypt
- Input validation via Joi
- SQL injection prevention through Prisma ORM
- CORS protection
- Environment-variable-only secrets (never hardcoded)

---

## 📖 Documentation

| Document | Description |
|---|---|
| [FDD.md](./FDD.md) | Functional Design Document (FR-01 to FR-13) |
| [CHANGELOG.md](./CHANGELOG.md) | Full version history |
| [VERSIONING.md](./VERSIONING.md) | Semantic versioning strategy & release guide |
| [SETUP.md](./SETUP.md) | Installation and development setup |
| [RELEASE_NOTES/v1.0.0.md](./RELEASE_NOTES/v1.0.0.md) | v1.0.0 feature matrix and bug tracker |

---

## 📝 License

Proprietary — All rights reserved.

## 🤝 Support

For support, email: madhankumarknms@gmail.com

---

*Built for project management and time tracking.*
