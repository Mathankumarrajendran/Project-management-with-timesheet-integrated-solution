# Changelog

All notable changes to the **PM System** are documented in this file.

This project follows [Semantic Versioning (SemVer)](https://semver.org/) — `MAJOR.MINOR.PATCH`.

| Type | When to Increment |
|---|---|
| **MAJOR** | Breaking changes, incompatible API changes, architectural overhauls |
| **MINOR** | New backward-compatible features or modules |
| **PATCH** | Backward-compatible bug fixes, minor UI improvements |

---

## [1.0.0] — 2026-07-28 🎉 Initial Release

> First stable, feature-complete release of the PM System — a full-stack project management and timesheet solution.

### ✨ Features Added

#### Authentication & Access Control
- JWT-based login/logout with role-based access control (RBAC)
- Supported roles: `SUPER_ADMIN`, `FINANCE_ADMIN`, `PROJECT_MANAGER`, `TEAM_LEAD`, `EMPLOYEE`, `CLIENT`
- Protected routes via middleware (`authenticate`, `authorize`)

#### User Management (FR-02)
- Create, update, deactivate user accounts
- Profile page with editable personal details and password change
- Hourly rate and department tracking per user

#### Client Management (FR-03)
- Client record management (code, name, contact email, billing terms)
- Client-to-project associations

#### Project Management (FR-04)
- Project creation with SLA policy, billing type (BILLABLE / NON_BILLABLE), project type
- Budget hours and budget amount tracking
- Project health status (HEALTHY, AT_RISK, CRITICAL)
- Project member assignment with roles

#### Sprint Management (FR-05)
- Sprint board with Kanban-style drag-and-drop task cards
- Sprint creation with start/end dates linked to projects

#### Task Management (FR-06)
- Full task lifecycle: TODO → IN_PROGRESS → IN_REVIEW → COMPLETED
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- SLA tracking with automatic status (ON_TRACK, AT_RISK, BREACHED)
- Task detail view with embedded timesheet entries
- Project name displayed on task listings (previously showed code)

#### Time Log Management (FR-07)
- Per-task time log entry with status workflow:
  `DRAFT → SUBMITTED → L1_APPROVED → L2_APPROVED → LOCKED`
- Billable/non-billable flag per log entry

#### Timesheet Management (FR-08)
- Weekly timesheet grouping and bulk submission
- Monthly timesheet for L2 finance approval
- L1 Approval by Project Manager
- L2 Approval by Finance Admin
- Validation: only `APPROVED` logs are eligible for invoicing

#### Dashboard & Analytics (FR-09)
- Admin dashboard with KPIs: total projects, tasks, users, SLA compliance
- Recent activity feed
- Per-user task summary widgets

#### BI Reports & Analytics (FR-10)
- Interactive Recharts graphical analytics:
  - Time Logs bar chart (hours by project)
  - Resource allocation bar chart
  - Task status donut chart
  - SLA compliance donut chart
  - Task priority distribution bar chart
  - Composed project chart: logged vs approved vs billed vs budget hours
- Approved Hours and Billed Hours columns in project summary grid

#### Notifications (FR-11)
- In-app notification bell with real-time polling (30s interval)
- Mark all read functionality

#### Audit Logs (FR-12)
- Full audit trail for all system actions
- Audit log viewer with filtering

#### Invoice Management (FR-13) — NEW
- Invoice generation for billable hours within a date range per client
- Line items: project, task, resource, hours, rate, cost breakdown
- Payment terms: NET-30, NET-60, NET-90, Due on Receipt
- Invoice status workflow: `DRAFT → SENT → PAID → OVERDUE → CANCELLED`
- **Validation**: Only `L1_APPROVED`, `L2_APPROVED`, or `LOCKED` time logs are eligible for billing
- Approved hours and billed hours tracking per project
- Printable / PDF-ready invoice detail page

#### Client Portal Dashboard — NEW
- Dedicated `/client-portal` page for CLIENT-role users
- KPI cards: Active Projects, Completed Tasks, Pending Tasks, Outstanding Invoices
- Project summaries with task progress bars
- Task compliance donut chart (Recharts)
- Tabbed interface:
  - **Tasks Checklist**: filterable by All / Pending / Completed with SLA and priority badges
  - **Invoices & Downloads**: invoice table with Print / Save PDF action
- Admin can preview any client's portal via client switcher dropdown
- CLIENT role automatically redirected from `/dashboard` to `/client-portal`
- CLIENT sidebar locked to show only Client Portal navigation

---

### 🐛 Bugs Fixed

| ID | Description | Module |
|---|---|---|
| BUG-001 | Invoice status change was creating duplicate invoice records (POST instead of PATCH) | Invoices |
| BUG-002 | Invoice total values were duplicating (4000+ instead of 400) when switching statuses | Invoices |
| BUG-003 | Non-approved (SUBMITTED) time logs were being included in invoice calculations | Invoices |
| BUG-004 | Task list showed project code instead of human-readable project name | Tasks |
| BUG-005 | JSX `</Head>` tag in client portal page caused build compilation failure | Client Portal |
| BUG-006 | MUI `<Grid align="right">` caused TypeScript overload mismatch (replaced with `sx={{ textAlign: 'right' }}`) | Invoices |
| BUG-007 | CLIENT users could access internal employee panels (Users, Timesheets, etc.) | Navigation |
| BUG-008 | Recharts SVG hydration mismatch on server-side Next.js render (fixed with `isMounted` guard) | Reports |

---

### 🔧 Technical Improvements

- Backend route modularization: each feature has dedicated controller + route file
- Role-based sidebar navigation in `DashboardLayout.tsx` with proper `isAllowed()` guards
- Semantic Versioning tracking introduced (`VERSION` file, Git tags)
- `CHANGELOG.md` established for ongoing version tracking
- `VERSIONING.md` strategy guide created
- `RELEASE_NOTES/` directory structure introduced for per-version documentation

---

### 📋 Known Limitations (to be addressed in future versions)

- No two-factor authentication (2FA) UI (backend model exists)
- No file attachment support for tasks or timesheets
- Client portal has read-only access (no download-as-PDF native button — uses browser print)
- No automated email notifications on invoice dispatch
- No dark mode UI

---

### 🔗 Commit Reference

| Commit | Description |
|---|---|
| `6f02387` | Initial commit — PM System ready for deployment |
| `c2ea01c` | Remove Dockerfiles to fix Railway build |
| `a7b6b17` | Add vercel.json for frontend + auto migrate on Railway deploy |
| `d66ca4a` | Add production env pointing to Railway backend |
| `6a20aaf` | feat: Add client portal, invoice module, BI analytics, role-based navigation |

---

## [Unreleased]

> Track upcoming changes here before the next version tag.

### 🚧 Planned for v1.1.0
- Email notifications for invoice dispatch
- Task file attachments
- Client portal PDF download (native, without browser print dialog)
- Dark mode toggle
- Advanced search and filtering across all modules

---

*For the full version history, run: `git log --oneline`*
*For release notes per version, see the [`RELEASE_NOTES/`](./RELEASE_NOTES/) directory.*
