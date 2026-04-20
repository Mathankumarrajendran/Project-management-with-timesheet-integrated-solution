# Functional Design Document (FDD)
## Project Management System (pm-system)

**Version:** 1.0  
**Date:** 2026-03-18  
**Document Type:** Functional Design Document — Functional Requirements Only

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles & Access Control](#2-user-roles--access-control)
3. [FR-01: Authentication & Session Management](#3-fr-01-authentication--session-management)
4. [FR-02: User Management](#4-fr-02-user-management)
5. [FR-03: Client Management](#5-fr-03-client-management)
6. [FR-04: Project Management](#6-fr-04-project-management)
7. [FR-05: Sprint Management](#7-fr-05-sprint-management)
8. [FR-06: Task Management](#8-fr-06-task-management)
9. [FR-07: Time Log Management](#9-fr-07-time-log-management)
10. [FR-08: Timesheet Management (Weekly & Monthly)](#10-fr-08-timesheet-management-weekly--monthly)
11. [FR-09: Dashboard & Analytics](#11-fr-09-dashboard--analytics)
12. [FR-10: Reporting](#12-fr-10-reporting)
13. [FR-11: Notifications](#13-fr-11-notifications)
14. [FR-12: Audit Logs](#14-fr-12-audit-logs)

---

## 1. System Overview

The **Project Management System (pm-system)** is a full-stack web application designed to manage projects, tasks, sprints, team members, clients, time tracking, and timesheet approvals within an organisation. The system enforces role-based access control across all modules.

---

## 2. User Roles & Access Control

The system supports the following roles:

| Role | Description |
|---|---|
| `SUPER_ADMIN` | Full system access; manages users, projects, approvals, audit logs |
| `FINANCE_ADMIN` | Access to financial data, monthly timesheet L2 approval, reports |
| `PROJECT_MANAGER` | Manages projects, tasks, sprints, L1 timesheet approval |
| `TEAM_LEAD` | Creates/manages tasks and sprints within assigned projects |
| `EMPLOYEE` | Creates tasks, logs time, submits weekly timesheets |
| `CLIENT` | Read-only access to their own project portal dashboard |

---

## 3. FR-01: Authentication & Session Management

### FR-01.1 — User Registration
- Only a `SUPER_ADMIN` (authenticated) can register new users in the system.
- Required fields: first name, last name, email, password, role.

### FR-01.2 — User Login
- Any user can log in using their registered email and password.
- On successful login, the system returns a session token (JWT).

### FR-01.3 — Forgot Password
- Any user can initiate a password reset by submitting their registered email.
- The system sends a reset link/token to the provided email.

### FR-01.4 — Reset Password
- Users can reset their password using a valid password reset token.

### FR-01.5 — View Own Profile
- Any authenticated user can view their own profile.

### FR-01.6 — Update Password
- Any authenticated user can update their own account password.

---

## 4. FR-02: User Management

### FR-02.1 — List All Users
- `SUPER_ADMIN`, `FINANCE_ADMIN`, `PROJECT_MANAGER`, and `TEAM_LEAD` can retrieve a list of all users.

### FR-02.2 — View User by ID
- Any authenticated user can view a specific user's profile by ID.

### FR-02.3 — Update Own Profile
- Any authenticated user can update their own profile details (e.g., name, contact information).

### FR-02.4 — Update Any User (Admin)
- `SUPER_ADMIN` and `FINANCE_ADMIN` can update any user's details including role and status.

### FR-02.5 — Deactivate User
- `SUPER_ADMIN` can deactivate (soft-delete) a user account.

### FR-02.6 — Activate User
- `SUPER_ADMIN` can re-activate a previously deactivated user account.

### FR-02.7 — View User Statistics
- `SUPER_ADMIN` and `FINANCE_ADMIN` can retrieve aggregate statistics on users (e.g., active vs. inactive counts).

---

## 5. FR-03: Client Management

### FR-03.1 — List All Clients
- Any authenticated user can view the list of all clients.

### FR-03.2 — View Client by ID
- Any authenticated user can view a specific client's details.

### FR-03.3 — Create Client
- `SUPER_ADMIN`, `FINANCE_ADMIN`, and `PROJECT_MANAGER` can create a new client record.
- Required fields: name, contact information.

### FR-03.4 — Update Client
- `SUPER_ADMIN`, `FINANCE_ADMIN`, and `PROJECT_MANAGER` can update an existing client's information.

### FR-03.5 — Deactivate Client
- `SUPER_ADMIN` and `FINANCE_ADMIN` can deactivate (soft-delete) a client record.

---

## 6. FR-04: Project Management

### FR-04.1 — List All Projects
- Any authenticated user can retrieve a list of all projects.

### FR-04.2 — View Project by ID
- Any authenticated user can view the full details of a specific project.

### FR-04.3 — Create Project
- `SUPER_ADMIN`, `FINANCE_ADMIN`, and `PROJECT_MANAGER` can create a new project.
- Required fields: name, project code, client, budget hours, budget amount, start date, end date, project manager.

### FR-04.4 — Update Project
- `SUPER_ADMIN`, `FINANCE_ADMIN`, and `PROJECT_MANAGER` can update project details (name, status, dates, budget, etc.).

### FR-04.5 — Add Team Member to Project
- `SUPER_ADMIN` and `PROJECT_MANAGER` can assign a user to a project team.
- Required fields: user ID, role within the project.

### FR-04.6 — Remove Team Member from Project
- `SUPER_ADMIN` and `PROJECT_MANAGER` can remove a user from a project team.

---

## 7. FR-05: Sprint Management

### FR-05.1 — List All Sprints
- Any authenticated user can retrieve a list of sprints (with optional filters).

### FR-05.2 — View Sprint by ID
- Any authenticated user can view the full details of a specific sprint.

### FR-05.3 — Create Sprint
- `SUPER_ADMIN`, `PROJECT_MANAGER`, and `TEAM_LEAD` can create a new sprint.
- Required fields: project ID, sprint name, start date, end date, goal.

### FR-05.4 — Update Sprint
- `SUPER_ADMIN`, `PROJECT_MANAGER`, and `TEAM_LEAD` can update sprint details.

### FR-05.5 — Start Sprint
- `SUPER_ADMIN`, `PROJECT_MANAGER`, and `TEAM_LEAD` can officially start a sprint (changes status to ACTIVE).

### FR-05.6 — Complete Sprint
- `SUPER_ADMIN`, `PROJECT_MANAGER`, and `TEAM_LEAD` can mark a sprint as completed.

### FR-05.7 — View Sprint Burndown Data
- Any authenticated user can retrieve burndown chart data for a specific sprint (tasks completed vs. remaining over time).

---

## 8. FR-08: Task Management

### FR-06.1 — List All Tasks
- Any authenticated user can retrieve tasks with optional filters (by project, status, assignee, SLA status, etc.).

### FR-06.2 — View Task by ID
- Any authenticated user can view the full details of a specific task.

### FR-06.3 — Get Tasks by SLA Status
- Any authenticated user can filter and retrieve tasks by their SLA status (`ON_TRACK`, `AT_RISK`, `BREACHED`).

### FR-06.4 — Create Task
- `SUPER_ADMIN`, `PROJECT_MANAGER`, `TEAM_LEAD`, and `EMPLOYEE` can create a new task.
- Required fields: title, project ID, assignee, priority, due date.
- Optional fields: description, sprint ID, estimated hours.

### FR-06.5 — Update Task
- `SUPER_ADMIN`, `PROJECT_MANAGER`, `TEAM_LEAD`, and `EMPLOYEE` can update task details.

### FR-06.6 — Update Task Status
- Any authenticated user can update the status of a task.
- Valid statuses: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `CANCELLED`.
- The system automatically tracks and updates the SLA status based on the due date.

### FR-06.7 — Add Comment to Task
- Any authenticated user can post a comment on a task.

### FR-06.8 — View Task Comments
- Any authenticated user can retrieve all comments for a specific task.

### FR-06.9 — Add Attachment to Task
- Any authenticated user can add an attachment (file URL or metadata) to a task.

---

## 9. FR-07: Time Log Management

### FR-07.1 — Create Time Log
- Any authenticated user can log time against a specific task and project.
- Required fields: task ID, project ID, date, hours (min 0.25, max 24), description.
- Optional fields: billable flag (default: false).

### FR-07.2 — View Own Time Logs
- Any authenticated user can retrieve their own time log entries.

### FR-07.3 — View All Time Logs
- Any authenticated user can retrieve all time logs (admin/PM use; may be filtered).

---

## 10. FR-08: Timesheet Management (Weekly & Monthly)

### Weekly Timesheets

### FR-08.1 — View Own Weekly Timesheets
- Any authenticated `EMPLOYEE` can view their own weekly timesheet records.

### FR-08.2 — Submit Weekly Timesheet
- An `EMPLOYEE` can submit a specific weekly timesheet for L1 approval.
- The system compiles all time logs for the selected week.

### FR-08.3 — View L1 Pending Weekly Timesheets
- `SUPER_ADMIN` and `PROJECT_MANAGER` can view all weekly timesheets pending L1 (first-level) approval.

### FR-08.4 — Approve Weekly Timesheet (L1)
- `SUPER_ADMIN` and `PROJECT_MANAGER` can approve a submitted weekly timesheet (L1 approval).
- Status transitions from `SUBMITTED` → `L1_APPROVED`.

### FR-08.5 — Reject Weekly Timesheet (L1)
- `SUPER_ADMIN` and `PROJECT_MANAGER` can reject a submitted weekly timesheet with optional comments.
- Status transitions from `SUBMITTED` → `REJECTED`.

### Monthly Timesheets

### FR-08.6 — Compile Monthly Timesheet
- `SUPER_ADMIN`, `PROJECT_MANAGER`, and `FINANCE_ADMIN` can compile a monthly timesheet for a specific user, year, and month.
- The system aggregates all L1-approved weekly timesheets for that period.

### FR-08.7 — View All Monthly Timesheets
- `SUPER_ADMIN` and `FINANCE_ADMIN` can retrieve all monthly timesheet records.

### FR-08.8 — View L2 Pending Monthly Timesheets
- `SUPER_ADMIN` and `FINANCE_ADMIN` can view all monthly timesheets pending L2 (second-level) approval.

### FR-08.9 — Approve Monthly Timesheet (L2)
- `SUPER_ADMIN` and `FINANCE_ADMIN` can approve a compiled monthly timesheet.
- Status transitions from `SUBMITTED` → `L2_APPROVED`.

### FR-08.10 — Reject Monthly Timesheet (L2)
- `SUPER_ADMIN` and `FINANCE_ADMIN` can reject a monthly timesheet with optional comments.
- Status transitions from `SUBMITTED` → `REJECTED`.

---

## 11. FR-09: Dashboard & Analytics

### FR-09.1 — Admin / Business Overview Dashboard
- Available to `SUPER_ADMIN`, `PROJECT_MANAGER`, and `FINANCE_ADMIN`.
- Displays:
  - Total users and active users
  - Total projects and active (in-progress) projects
  - Total clients
  - Total tasks, open tasks, and SLA-breached tasks
  - Pending L1 and L2 timesheet approvals
  - Monthly total hours logged

### FR-09.2 — Project Dashboard
- Available to any authenticated user (scoped to a specific project).
- Displays:
  - Project details, client, project manager, and team members
  - Task breakdown by status
  - SLA status summary (on-track, at-risk, breached)
  - Total hours logged, budget hours, and budget utilisation percentage

### FR-09.3 — Employee Dashboard
- Available to any authenticated user (personal view).
- Displays:
  - List of up to 10 open tasks assigned to the user (ordered by due date)
  - Projects the user is a member of
  - Number of pending timesheet approvals
  - Hours logged this week and this month

### FR-09.4 — Finance Dashboard
- Available to `SUPER_ADMIN` and `FINANCE_ADMIN`.
- Displays:
  - Number of monthly timesheets pending L2 approval
  - All monthly timesheets for the current month
  - Total approved payroll hours for the current month
  - Total active project budget (client billing)
  - Total billable hours logged in the current month

### FR-09.5 — Client Portal Dashboard
- Available to `SUPER_ADMIN` and `CLIENT`.
- Scoped to a specific client.
- Displays:
  - Client profile information
  - All projects linked to the client (including project manager and task count)
  - Summary: total projects, active projects, total budget spent

---

## 12. FR-10: Reporting

All reports are restricted to `SUPER_ADMIN`, `PROJECT_MANAGER`, and `FINANCE_ADMIN`.

### FR-10.1 — Time Log Report
- Generates a report of time log entries with filters (e.g., by project, date range, user, billable flag).

### FR-10.2 — Task Report
- Generates a report of tasks with filters (e.g., by project, status, assignee, SLA status, priority).

### FR-10.3 — Project Report
- Generates a report of projects with filters (e.g., by status, client, date range, budget utilisation).

---

## 13. FR-11: Notifications

### FR-11.1 — View Own Notifications
- Any authenticated user can retrieve their own notification list.

### FR-11.2 — Mark Notification as Read
- Any authenticated user can mark a specific notification as read.

### FR-11.3 — Mark All Notifications as Read
- Any authenticated user can mark all their notifications as read at once.

### FR-11.4 — Clear (Delete) a Notification
- Any authenticated user can delete a specific notification from their list.

### FR-11.5 — Clear All Notifications
- Any authenticated user can delete all their notifications at once.

---

## 14. FR-12: Audit Logs

### FR-12.1 — View Audit Logs
- `SUPER_ADMIN` and `PROJECT_MANAGER` can retrieve a list of all system audit log entries.
- Supports filters and pagination (e.g., by entity type, action, user, date range).

---

*End of Functional Design Document*
