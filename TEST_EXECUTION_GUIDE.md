# PM System - Manual Test Execution Guide

## 🎯 Quick Start Testing Guide

**Your application is ready for testing!**

### Test Environment
- **Frontend:** http://localhost:3001
- **Backend:** http://localhost:5000
- **Complete Test Plan:** See `TEST_PLAN.md` for all 30 test cases

---

## 🚀 Quick Smoke Test (5 minutes)

Follow these steps to verify everything works:

### 1. Login Test ✅
```
URL: http://localhost:3001
Email: admin@pm-system.com
Password: Admin@123456
```

**What to check:**
- ✅ Login form displays
- ✅ Can submit credentials
- ✅ Redirects to /dashboard
- ✅ User name appears in top-right

**Screenshot:** Take screenshot of successful dashboard

---

### 2. Dashboard KPIs ✅
```
URL: http://localhost:3001/dashboard
```

**What to check:**
- ✅ 6 KPI cards visible:
  - Total Users
  - Active Projects
  - Total Clients
  - Open Tasks
  - SLA Breached
  - Pending Approvals
- ✅ All show numbers (not errors)

**Screenshot:** Dashboard with KPI values

---

### 3. Create Client ✅
```
URL: http://localhost:3001/clients
```

**Steps:**
1. Click **"New Client"** button (top right)
2. Fill in form:
   - **Name:** Test Client ABC
   - **Code:** TC001
   - **Contact Name:** John Doe
   - **Contact Email:** john@test.com
   - **Contact Phone:** +1234567890
3. Click **"Save Client"**

**What to check:**
- ✅ Dialog opens
- ✅ All fields editable
- ✅ Dialog closes after save
- ✅ New client appears in table

**Screenshot:** New client in the list

---

### 4. Create Project ✅
```
URL: http://localhost:3001/projects
```

**Steps:**
1. Click **"New Project"**
2. Fill:
   - **Name:** Test Project XYZ
   - **Code:** PRJ001
   - **Client:** Select "Test Client ABC" (from dropdown)
   - **Billing Type:** Billable
   - **Status:** Planning
3. Save

**What to check:**
- ✅ Client dropdown populated
- ✅ PM dropdown shows managers only
- ✅ Project created successfully
- ✅ Appears in table

**Screenshot:** Project list with new project

---

### 5. Create Task ✅
```
URL: http://localhost:3001/tasks
```

**Steps:**
1. Click **"New Task"**
2. Fill:
   - **Title:** Test Task - Feature Development
   - **Project:** Select "Test Project XYZ"
   - **Type:** Development
   - **Priority:** High
   - **Assign To:** Select yourself
   - **Estimated Hours:** 8
   - **SLA Target:** 24
3. Save

**What to check:**
- ✅ Project dropdown works
- ✅ User dropdown shows all users
- ✅ SLA field accepts numbers
- ✅ Task appears in "My Tasks"

**Screenshot:** Task list

---

### 6. Time Logging ✅
```
URL: http://localhost:3001/timelogs
```

**Steps:**
1. Click **"Log Time"**
2. Fill:
   - **Date:** Today
   - **Project:** Select project
   - **Task:** Select task (should filter by project!)
   - **Hours:** 8
   - **Description:** "Worked on feature development"
   - **Billable:** Toggle ON
3. Save

**What to check:**
- ✅ Task dropdown filters by selected project
- ✅ Hours field validates (0.25 - 24)
- ✅ Time log created
- ✅ Appears in table

---

### 7. User Management (Admin Only) ✅
```
URL: http://localhost:3001/users
```

**Steps:**
1. Navigate to Users page
2. Click **"New User"**
3. Fill:
   - **First Name:** Test
   - **Last Name:** Employee
   - **Email:** test.emp@pm.com
   - **Employee ID:** EMP999
   - **Password:** Test@123
   - **Role:** Employee
4. Save

**What to check:**
- ✅ Form validates required fields
- ✅ Role dropdown shows all 7 roles
- ✅ User created
- ✅ Appears in list

**Alternative:** Login as employee and verify "Access Denied" message

---

### 8. Edit Tests ✅

**Test editing for each module:**

**Edit Client:**
1. Go to /clients
2. **Click any row** (not button, click the row itself)
3. Change contact name
4. Save
5. ✅ Verify changes appear

**Edit Project:**
1. Go to /projects
2. Click project row
3. Change status to "In Progress"
4. Save
5. ✅ Verify status chip updates

**Edit Task:**
1. Go to /tasks
2. Click task row
3. Change priority to "Urgent"
4. Save
5. ✅ Verify priority chip turns red

---

## 📋 Full Test Execution Checklist

### Authentication (3 tests)
- [ ] TC-001: Login with valid credentials
- [ ] TC-002: Login with invalid credentials
- [ ] TC-003: Logout

### Dashboard (1 test)
- [ ] TC-004: Dashboard loads with KPIs

### Clients (4 tests)
- [ ] TC-005: View clients list
- [ ] TC-006: Create new client
- [ ] TC-007: Edit existing client
- [ ] TC-008: Client form validation

### Projects (3 tests)
- [ ] TC-009: View projects list
- [ ] TC-010: Create new project
- [ ] TC-011: Edit existing project

### Tasks (3 tests)
- [ ] TC-012: View my tasks
- [ ] TC-013: Create new task
- [ ] TC-014: Edit task priority

### Users (4 tests)
- [ ] TC-015: View users (admin only)
- [ ] TC-016: Access control - non-admin
- [ ] TC-017: Create new user
- [ ] TC-018: Edit user role

### Time Tracking (3 tests)
- [ ] TC-019: View time logs
- [ ] TC-020: Create time entry
- [ ] TC-021: Cascading dropdown (project → task)

### Sprints (1 test)
- [ ] TC-022: View sprints

### Navigation (3 tests)
- [ ] TC-023: Sidebar navigation
- [ ] TC-024: Role-based menu items
- [ ] TC-025: Responsive design

### Data & API (3 tests)
- [ ] TC-026: Form data persistence
- [ ] TC-027: API error handling
- [ ] TC-028: Concurrent user actions

### Performance (2 tests)
- [ ] TC-029: Page load time
- [ ] TC-030: Form submission speed

---

## 🐛 Bug Reporting

**If you find any issues, document them like this:**

### Bug Report Template

```markdown
**Bug ID:** BUG-001
**Severity:** Critical / High / Medium / Low
**Module:** [e.g., Client Management]
**Test Case:** TC-XXX

**Summary:** Brief description of the issue

**Steps to Reproduce:**
1. Navigate to...
2. Click...
3. Enter...

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:** [If any]

**Browser:** Chrome / Firefox / Edge
**Logged in as:** admin@pm-system.com / pm@pm-system.com
```

---

## ✅ Test Result Summary Template

After testing, fill this out:

### Test Execution Summary

**Date:** _____________  
**Tester:** _____________  
**Environment:** Development (localhost)

| Module | Total Tests | Passed | Failed | Notes |
|--------|-------------|--------|--------|-------|
| Authentication | 3 | | | |
| Dashboard | 1 | | | |
| Clients | 4 | | | |
| Projects | 3 | | | |
| Tasks | 3 | | | |
| Users | 4 | | | |
| Time Tracking | 3 | | | |
| Sprints | 1 | | | |
| Navigation | 3 | | | |
| Data & API | 3 | | | |
| Performance | 2 | | | |
| **TOTAL** | **30** | | | |

**Pass Rate:** ____%

### Critical Issues Found
- 

### High Priority Issues
- 

### Medium/Low Issues
- 

### Recommendations
- 

---

## 🎯 Advanced Testing Scenarios

### Scenario 1: Complete Project Workflow
1. Login as admin
2. Create client "ACME Corp"
3. Create project "ACME Website" for that client
4. Assign yourself as PM
5. Create 3 tasks for the project
6. Assign tasks to different users
7. Log time against tasks
8. Verify all relationships work

### Scenario 2: Role-Based Access
1. Login as employee
2. Try to access /users → Should see "Access Denied"
3. Navigate to /tasks → Should only see YOUR tasks
4. Create time log → Should work
5. Logout
6. Login as admin
7. Access /users → Should work

### Scenario 3: Data Integrity
1. Create project with specific budget (e.g., $50,000)
2. Refresh browser
3. Edit project
4. Verify budget still shows $50,000
5. Create task for project
6. Verify task shows correct project

### Scenario 4: Form Validation
1. Try to create client without required fields
2. Try to create task with 0 hours
3. Try to create user with invalid email
4. Try to log more than 24 hours
5. Verify helpful error messages

---

## 📸 Screenshot Checklist

**Recommended screenshots to capture:**

1. ✅ Login page
2. ✅ Dashboard with KPIs populated
3. ✅ Clients list (empty and with data)
4. ✅ Client creation form (dialog open)
5. ✅ Projects list with various statuses
6. ✅ Project creation form
7. ✅ Tasks list with SLA status colors
8. ✅ Task creation form
9. ✅ Time log dialog (showing cascading dropdown)
10. ✅ Users page (showing role chips)
11. ✅ User creation form with role dropdown
12. ✅ Sprints page (card grid)
13. ✅ Sidebar navigation (desktop)
14. ✅ Mobile view (drawer)

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot create client - Name already exists"
**Solution:** Client codes must be unique. Use a different code (e.g., TC002, TC003)

### Issue: "No projects in dropdown when creating task"
**Solution:** Create at least one project first

### Issue: "Task dropdown empty in time log"
**Solution:** Select a project first - dropdown is filtered by project

### Issue: "Access Denied on Users page"
**Solution:** Must be logged in as admin, PM, or Team Lead

### Issue: "Page shows loading spinner forever"
**Solution:** Check backend server is running on port 5000

---

## ✨ Next Steps After Testing

Once testing is complete:

1. **Document Results:** Fill out test summary above
2. **Report Bugs:** Create bug reports for any issues
3. **Create Test Evidence:** Save screenshots
4. **Review with Team:** Discuss findings
5. **Plan Fixes:** Prioritize bug fixes
6. **Retest:** After fixes, rerun failed tests

---

## 🎉 Success Criteria

**The application passes if:**

✅ All 30 test cases pass  
✅ No critical bugs found  
✅ All CRUD operations work  
✅ Forms validate properly  
✅ Role-based access works  
✅ Data persists correctly  
✅ UI is responsive  
✅ No console errors  

**Ready for next phase if:** Pass rate ≥ 90%
