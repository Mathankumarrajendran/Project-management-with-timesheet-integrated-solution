# PM System MVP - Comprehensive Test Plan

## Test Plan Overview

**Application:** PM System MVP  
**Version:** 1.0.0 MVP  
**Testing Date:** February 16, 2026  
**Tester:** QA Team  
**Environment:** Development (localhost)

---

## Test Environment Setup

### Prerequisites
- **Backend:** Running on http://localhost:5000
- **Frontend:** Running on http://localhost:3001
- **Database:** PostgreSQL on port 5433
- **Browser:** Chrome (latest version)

### Test Data
- **Admin User:** admin@pm-system.com / Admin@123456
- **PM User:** pm@pm-system.com / PM@123456
- **Employee User:** employee@pm-system.com / Employee@123

---

## Test Scope

### In-Scope Features
1. Authentication & Authorization
2. Dashboard & KPIs
3. Client Management (CRUD)
4. Project Management (CRUD)
5. Task Management (CRUD)
6. User Management (CRUD)
7. Time Tracking
8. Sprint Management (View)
9. Navigation & UI/UX

### Out-of-Scope (Future)
- Approval workflows (L1/L2)
- Reports & exports
- Email notifications
- File attachments
- Advanced filters & search

---

## Test Cases

## 1. Authentication Module

### TC-001: Login with Valid Credentials
**Priority:** Critical  
**Precondition:** User exists in database  
**Steps:**
1. Navigate to http://localhost:3001
2. Enter email: admin@pm-system.com
3. Enter password: Admin@123456
4. Click "Sign In"

**Expected Result:**
- Redirect to /dashboard
- JWT token stored in localStorage
- User info displayed in top-right corner
- No error messages

**Status:** ☐ Pass ☐ Fail

---

### TC-002: Login with Invalid Credentials
**Priority:** High  
**Steps:**
1. Navigate to http://localhost:3001
2. Enter email: wrong@email.com
3. Enter password: wrongpass
4. Click "Sign In"

**Expected Result:**
- Error message displayed
- User remains on login page
- No redirect

**Status:** ☐ Pass ☐ Fail

---

### TC-003: Logout Functionality
**Priority:** High  
**Precondition:** User is logged in  
**Steps:**
1. Click user avatar in top-right
2. Click "Logout"

**Expected Result:**
- Redirect to /login
- localStorage cleared
- Cannot access protected routes

**Status:** ☐ Pass ☐ Fail

---

## 2. Dashboard Module

### TC-004: Dashboard Loads with KPIs
**Priority:** High  
**Precondition:** Logged in as admin  
**Steps:**
1. Navigate to /dashboard

**Expected Result:**
- 6 KPI cards displayed:
  - Total Users
  - Active Projects
  - Total Clients
  - Open Tasks
  - SLA Breached Tasks
  - Pending Approvals
- All cards show numeric values
- No loading errors

**Status:** ☐ Pass ☐ Fail

---

## 3. Client Management Module

### TC-005: View Clients List
**Priority:** High  
**Steps:**
1. Navigate to /clients

**Expected Result:**
- Table displays with columns: Name, Contact Person, Email, Phone, Contract Type, Status, Projects
- Existing clients visible
- "New Client" button visible
- No errors

**Status:** ☐ Pass ☐ Fail

---

### TC-006: Create New Client
**Priority:** Critical  
**Steps:**
1. Navigate to /clients
2. Click "New Client" button
3. Fill required fields:
   - Name: "Test Client ABC"
   - Code: "TC001"
   - Contact Name: "John Doe"
   - Contact Email: "john@test.com"
   - Contact Phone: "+1234567890"
4. Click "Save Client"

**Expected Result:**
- Dialog closes
- New client appears in table
- Success indication (dialog closes)
- API call successful (check Network tab)

**Status:** ☐ Pass ☐ Fail

---

### TC-007: Edit Existing Client
**Priority:** High  
**Steps:**
1. Navigate to /clients
2. Click on any client row
3. Modify "Contact Name" field
4. Click "Save Client"

**Expected Result:**
- Dialog closes
- Client data updated in table
- Changes persisted to database

**Status:** ☐ Pass ☐ Fail

---

### TC-008: Client Form Validation
**Priority:** Medium  
**Steps:**
1. Click "New Client"
2. Leave required fields empty
3. Try to save

**Expected Result:**
- Form validation errors shown
- Cannot submit with empty required fields
- Helpful error messages

**Status:** ☐ Pass ☐ Fail

---

## 4. Project Management Module

### TC-009: View Projects List
**Priority:** High  
**Steps:**
1. Navigate to /projects

**Expected Result:**
- Table displays: Code, Name, Type, Billing, Status, Start Date, End Date
- Status chips color-coded
- "New Project" button visible

**Status:** ☐ Pass ☐ Fail

---

### TC-010: Create New Project
**Priority:** Critical  
**Steps:**
1. Navigate to /projects
2. Click "New Project"
3. Fill required fields:
   - Name: "Test Project XYZ"
   - Code: "PRJ001"
   - Client: Select from dropdown
   - Billing Type: "Billable"
   - Status: "Planning"
4. Click "Save Project"

**Expected Result:**
- Dialog closes
- New project in table
- Client dropdown populated from API
- PM dropdown shows only managers

**Status:** ☐ Pass ☐ Fail

---

### TC-011: Edit Existing Project
**Priority:** High  
**Steps:**
1. Click on project row
2. Change status to "In Progress"
3. Add budget amount
4. Save

**Expected Result:**
- Changes saved
- Status chip updates
- Budget displayed

**Status:** ☐ Pass ☐ Fail

---

## 5. Task Management Module

### TC-012: View My Tasks
**Priority:** High  
**Precondition:** Logged in user has assigned tasks  
**Steps:**
1. Navigate to /tasks

**Expected Result:**
- Table shows: Code, Title, Project, Priority, Status, SLA Status, Due Date
- Tasks filtered by logged-in user
- SLA status color-coded

**Status:** ☐ Pass ☐ Fail

---

### TC-013: Create New Task
**Priority:** Critical  
**Steps:**
1. Navigate to /tasks
2. Click "New Task"
3. Fill:
   - Title: "Test Task 123"
   - Project: Select from dropdown
   - Type: "Development"
   - Priority: "High"
   - Assign To: Select user
   - Estimated Hours: "8"
   - SLA Target: "24"
4. Save

**Expected Result:**
- Dialog closes
- Task created successfully
- SLA countdown starts
- Task visible in list

**Status:** ☐ Pass ☐ Fail

---

### TC-014: Edit Task Priority
**Priority:** Medium  
**Steps:**
1. Click task row
2. Change priority from "Medium" to "Urgent"
3. Save

**Expected Result:**
- Priority chip updates to red/urgent
- Changes saved

**Status:** ☐ Pass ☐ Fail

---

## 6. User Management Module

### TC-015: View Users (Admin Only)
**Priority:** High  
**Precondition:** Logged in as admin  
**Steps:**
1. Navigate to /users

**Expected Result:**
- User table visible
- Shows: Employee ID, Name, Email, Role, Department, Status
- Role chips color-coded

**Status:** ☐ Pass ☐ Fail

---

### TC-016: Access Control - Non-Admin
**Priority:** Critical  
**Precondition:** Logged in as employee  
**Steps:**
1. Navigate to /users

**Expected Result:**
- "Access Denied" message
- No user data visible

**Status:** ☐ Pass ☐ Fail

---

### TC-017: Create New User
**Priority:** Critical  
**Precondition:** Logged in as admin  
**Steps:**
1. Click "New User"
2. Fill:
   - First Name: "Test"
   - Last Name: "User"
   - Email: "testuser@pm.com"
   - Employee ID: "EMP999"
   - Password: "Test@123"
   - Role: "Employee"
3. Save

**Expected Result:**
- User created
- Appears in table
- Can log in with credentials

**Status:** ☐ Pass ☐ Fail

---

### TC-018: Edit User Role
**Priority:** High  
**Steps:**
1. Click user row
2. Change role from "Employee" to "Team Lead"
3. Save

**Expected Result:**
- Role updated
- Role chip changes color
- User permissions updated

**Status:** ☐ Pass ☐ Fail

---

## 7. Time Tracking Module

### TC-019: View Time Logs
**Priority:** High  
**Steps:**
1. Navigate to /timelogs

**Expected Result:**
- Table shows time entries
- "Log Time" button visible
- Entries show: Date, Project, Task, Hours, Billable, Status

**Status:** ☐ Pass ☐ Fail

---

### TC-020: Create Time Entry
**Priority:** Critical  
**Steps:**
1. Click "Log Time"
2. Select date
3. Select project
4. Select task (filtered by project)
5. Enter hours: "8"
6. Add description
7. Toggle billable
8. Save

**Expected Result:**
- Dialog closes
- New entry in table
- Success notification
- Hours total updates

**Status:** ☐ Pass ☐ Fail

---

### TC-021: Cascading Dropdown (Project → Task)
**Priority:** Medium  
**Steps:**
1. Open time log dialog
2. Select Project A
3. Open Task dropdown

**Expected Result:**
- Task dropdown shows only tasks for selected project
- No tasks from other projects

**Status:** ☐ Pass ☐ Fail

---

## 8. Sprint Management Module

### TC-022: View Sprints
**Priority:** Medium  
**Steps:**
1. Navigate to /sprints

**Expected Result:**
- Sprint cards displayed in grid
- Shows: Name, Goal, Project, Status, Progress
- Active sprints show progress bar
- Status chips color-coded

**Status:** ☐ Pass ☐ Fail

---

## 9. Navigation & UI/UX

### TC-023: Sidebar Navigation
**Priority:** High  
**Steps:**
1. Click each menu item:
   - Dashboard
   - Clients
   - Projects
   - Tasks
   - Time Logs
   - Users
   - Sprints

**Expected Result:**
- Each page loads without errors
- Active menu item highlighted
- Smooth transitions

**Status:** ☐ Pass ☐ Fail

---

### TC-024: Role-Based Menu Items
**Priority:** High  
**Steps:**
1. Login as employee
2. Check sidebar menu

**Expected Result:**
- "Users" menu hidden
- Only accessible features shown

**Status:** ☐ Pass ☐ Fail

---

### TC-025: Responsive Design
**Priority:** Medium  
**Steps:**
1. Resize browser to mobile width
2. Check sidebar becomes drawer
3. Test navigation

**Expected Result:**
- Drawer icon appears
- Sidebar converts to mobile drawer
- All functionality works

**Status:** ☐ Pass ☐ Fail

---

## 10. Data Integrity & API

### TC-026: Form Data Persistence
**Priority:** Critical  
**Steps:**
1. Create client with specific data
2. Refresh page
3. Navigate to clients
4. Click created client

**Expected Result:**
- All data persisted correctly
- No data loss
- Foreign keys maintained

**Status:** ☐ Pass ☐ Fail

---

### TC-027: API Error Handling
**Priority:** High  
**Steps:**
1. Stop backend server
2. Try to create client

**Expected Result:**
- Error message shown
- User-friendly message
- No app crash

**Status:** ☐ Pass ☐ Fail

---

### TC-028: Concurrent User Actions
**Priority:** Medium  
**Steps:**
1. Login as admin in browser 1
2. Login as employee in browser 2
3. Both create tasks simultaneously

**Expected Result:**
- Both tasks created
- No conflicts
- No data corruption

**Status:** ☐ Pass ☐ Fail

---

## Performance Tests

### TC-029: Page Load Time
**Priority:** Medium  
**Steps:**
1. Measure dashboard load time
2. Measure projects page load with 50+ projects

**Expected Result:**
- Dashboard loads < 2 seconds
- Tables load < 3 seconds

**Status:** ☐ Pass ☐ Fail

---

### TC-030: Form Submission Speed
**Priority:** Medium  
**Steps:**
1. Create client and measure time
2. Create project and measure

**Expected Result:**
- Forms submit < 1 second
- Dialog closes promptly

**Status:** ☐ Pass ☐ Fail

---

## Bug Report Template

**Bug ID:** BUG-XXX  
**Severity:** Critical / High / Medium / Low  
**Module:** [Module name]  
**Summary:** [Brief description]  
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**  
**Actual Result:**  
**Screenshots:** [If applicable]  
**Environment:** Browser, OS, etc.

---

## Test Execution Summary

**Total Test Cases:** 30  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___  
**Pass Rate:** ___%

**Critical Issues:**
- 

**High Issues:**
- 

**Recommendations:**
- 

---

## Sign-off

**Tested By:** _______________  
**Date:** _______________  
**Approved By:** _______________  
**Date:** _______________
