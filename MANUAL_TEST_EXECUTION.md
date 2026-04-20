# PM System - Manual Test Execution Checklist

> **Your Application is Running!**  
> Frontend: http://localhost:3000  
> Backend: http://localhost:5000  
> Status: ✅ READY FOR TESTING

---

## 🎯 Quick Test Execution (10 Minutes)

**Follow these steps in your browser. Check ✅ as you complete each one.**

---

### Test 1: Login & Authentication ✅

**URL:** http://localhost:3000

- [ ] **Step 1.1:** Navigate to http://localhost:3000
- [ ] **Step 1.2:** See login page with email and password fields
- [ ] **Step 1.3:** Enter email: `admin@pm-system.com`
- [ ] **Step 1.4:** Enter password: `Admin@123456`
- [ ] **Step 1.5:** Click "Sign In" button
- [ ] **Step 1.6:** Successfully redirect to /dashboard
- [ ] **Step 1.7:** See user name in top-right corner

**Expected Result:** ✅ Login successful, redirected to dashboard  
**Actual Result:** _____________  
**Status:** PASS / FAIL  
**Notes:** _____________

---

### Test 2: Dashboard KPIs ✅

**URL:** http://localhost:3000/dashboard

- [ ] **Step 2.1:** See 6 KPI cards displayed
- [ ] **Step 2.2:** Card 1 - "Total Users" shows a number
- [ ] **Step 2.3:** Card 2 - "Active Projects" shows a number
- [ ] **Step 2.4:** Card 3 - "Total Clients" shows a number
- [ ] **Step 2.5:** Card 4 - "Open Tasks" shows a number
- [ ] **Step 2.6:** Card 5 - "SLA Breached" shows a number
- [ ] **Step 2.7:** Card 6 - "Pending Approvals" shows a number

**Record KPI Values:**
- Total Users: _____
- Active Projects: _____
- Total Clients: _____
- Open Tasks: _____
- SLA Breached: _____
- Pending Approvals: _____

**Expected Result:** ✅ All 6 KPIs display numeric values  
**Status:** PASS / FAIL

---

### Test 3: Client Management - CREATE ✅

**URL:** http://localhost:3000/clients

- [ ] **Step 3.1:** Click on "Clients" in sidebar
- [ ] **Step 3.2:** See clients list page
- [ ] **Step 3.3:** Click "New Client" button (top right)
- [ ] **Step 3.4:** Dialog opens with form
- [ ] **Step 3.5:** Fill Name: `Test Client Manual`
- [ ] **Step 3.6:** Fill Code: `TCM001`
- [ ] **Step 3.7:** Fill Contact Name: `Manual Tester`
- [ ] **Step 3.8:** Fill Contact Email: `manual@test.com`
- [ ] **Step 3.9:** Fill Contact Phone: `+1234567890`
- [ ] **Step 3.10:** Click "Save Client"
- [ ] **Step 3.11:** Dialog closes
- [ ] **Step 3.12:** New client "Test Client Manual" appears in table

**Expected Result:** ✅ Client created and visible in list  
**Status:** PASS / FAIL  
**Screenshot:** (Optional) Take screenshot of client in list

---

### Test 4: Client Management - EDIT ✅

- [ ] **Step 4.1:** Find "Test Client Manual" in the table
- [ ] **Step 4.2:** Click on the row (not edit button, click the row itself)
- [ ] **Step 4.3:** Edit dialog opens with existing data
- [ ] **Step 4.4:** Verify data is populated correctly
- [ ] **Step 4.5:** Change Contact Name to: `Manual Tester EDITED`
- [ ] **Step 4.6:** Click "Save Client"
- [ ] **Step 4.7:** Dialog closes
- [ ] **Step 4.8:** Table updates with new contact name

**Expected Result:** ✅ Client updated successfully  
**Status:** PASS / FAIL

---

### Test 5: Project Management - CREATE ✅

**URL:** http://localhost:3000/projects

- [ ] **Step 5.1:** Click "Projects" in sidebar
- [ ] **Step 5.2:** See projects list
- [ ] **Step 5.3:** Click "New Project" button
- [ ] **Step 5.4:** Dialog opens
- [ ] **Step 5.5:** Fill Name: `Test Project Manual`
- [ ] **Step 5.6:** Fill Code: `TPM001`
- [ ] **Step 5.7:** Select "Test Client Manual" from Client dropdown
- [ ] **Step 5.8:** Select Billing Type: `Billable`
- [ ] **Step 5.9:** Select Status: `Planning`
- [ ] **Step 5.10:** Click "Save Project"
- [ ] **Step 5.11:** New project appears in list
- [ ] **Step 5.12:** Verify client name shows correctly

**Expected Result:** ✅ Project created with client association  
**Status:** PASS / FAIL

---

### Test 6: Project Management - EDIT ✅

- [ ] **Step 6.1:** Click on "Test Project Manual" row
- [ ] **Step 6.2:** Edit dialog opens
- [ ] **Step 6.3:** Change Status to: `In Progress`
- [ ] **Step 6.4:** Save
- [ ] **Step 6.5:** Status chip changes color/text in table

**Expected Result:** ✅ Project status updated  
**Status:** PASS / FAIL

---

### Test 7: Task Management - CREATE ✅

**URL:** http://localhost:3000/tasks

- [ ] **Step 7.1:** Click "Tasks" in sidebar
- [ ] **Step 7.2:** See tasks list (may be empty or show existing)
- [ ] **Step 7.3:** Click "New Task" button
- [ ] **Step 7.4:** Dialog opens
- [ ] **Step 7.5:** Fill Title: `Test Task Manual`
- [ ] **Step 7.6:** Select Project: `Test Project Manual`
- [ ] **Step 7.7:** Select Type: `Development`
- [ ] **Step 7.8:** Select Priority: `High`
- [ ] **Step 7.9:** Fill Estimated Hours: `8`
- [ ] **Step 7.10:** Fill SLA Target Hours: `24`
- [ ] **Step 7.11:** Select Assign To: (Select yourself)
- [ ] **Step 7.12:** Save
- [ ] **Step 7.13:** Task appears in "My Tasks" section
- [ ] **Step 7.14:** SLA status shows "Within SLA" or similar

**Expected Result:** ✅ Task created with SLA tracking  
**Status:** PASS / FAIL

---

### Test 8: Task Management - EDIT ✅

- [ ] **Step 8.1:** Click on "Test Task Manual" row
- [ ] **Step 8.2:** Edit dialog opens
- [ ] **Step 8.3:** Change Priority to: `Urgent`
- [ ] **Step 8.4:** Save
- [ ] **Step 8.5:** Priority chip turns red and shows "Urgent"

**Expected Result:** ✅ Task priority updated  
**Status:** PASS / FAIL

---

### Test 9: Time Tracking ✅

**URL:** http://localhost:3000/timelogs

- [ ] **Step 9.1:** Click "Time Logs" in sidebar
- [ ] **Step 9.2:** See time logs page
- [ ] **Step 9.3:** Click "Log Time" button
- [ ] **Step 9.4:** Dialog opens
- [ ] **Step 9.5:** Select Date: (Today's date)
- [ ] **Step 9.6:** Select Project: `Test Project Manual`
- [ ] **Step 9.7:** **CRITICAL:** Task dropdown filters to show only tasks for selected project
- [ ] **Step 9.8:** Select Task: `Test Task Manual`
- [ ] **Step 9.9:** Enter Hours: `8`
- [ ] **Step 9.10:** Enter Description: `Manual testing work`
- [ ] **Step 9.11:** Toggle Billable: ON
- [ ] **Step 9.12:** Save
- [ ] **Step 9.13:** Time entry appears in list

**Expected Result:** ✅ Time log created, dropdown cascading works  
**Status:** PASS / FAIL  
**Critical Check:** Did task dropdown filter by project? YES / NO

---

### Test 10: User Management (Admin Only) ✅

**URL:** http://localhost:3000/users

- [ ] **Step 10.1:** Click "Users" in sidebar
- [ ] **Step 10.2:** See users list (you should have access as admin)
- [ ] **Step 10.3:** Click "New User" button
- [ ] **Step 10.4:** Dialog opens
- [ ] **Step 10.5:** Fill First Name: `Test`
- [ ] **Step 10.6:** Fill Last Name: `Employee`
- [ ] **Step 10.7:** Fill Email: `test.manual@pm.com`
- [ ] **Step 10.8:** Fill Employee ID: `EMPMAN001`
- [ ] **Step 10.9:** Fill Password: `Test@123`
- [ ] **Step 10.10:** Select Role: `Employee`
- [ ] **Step 10.11:** Save
- [ ] **Step 10.12:** New user appears in list

**Expected Result:** ✅ User created successfully  
**Status:** PASS / FAIL

---

### Test 11: Sprints View ✅

**URL:** http://localhost:3000/sprints

- [ ] **Step 11.1:** Click "Sprints" in sidebar
- [ ] **Step 11.2:** Page loads without errors
- [ ] **Step 11.3:** See sprint cards or empty state

**Expected Result:** ✅ Page loads  
**Status:** PASS / FAIL

---

### Test 12: Navigation & Responsiveness ✅

- [ ] **Step 12.1:** Click each menu item and verify page loads
- [ ] **Step 12.2:** Resize browser window to mobile size (<768px)
- [ ] **Step 12.3:** Verify sidebar collapses to hamburger menu
- [ ] **Step 12.4:** Click hamburger icon
- [ ] **Step 12.5:** Drawer opens with navigation
- [ ] **Step 12.6:** Navigate to different pages from drawer

**Expected Result:** ✅ Responsive design works  
**Status:** PASS / FAIL

---

### Test 13: Form Validation ✅

**Test 13.1: Client Form**
- [ ] Click "New Client"
- [ ] Try to save without filling any fields
- [ ] Verify error messages appear for required fields
- [ ] Status: PASS / FAIL

**Test 13.2: Project Form**
- [ ] Click "New Project"
- [ ] Leave Name field empty
- [ ] Try to save
- [ ] Verify validation error
- [ ] Status: PASS / FAIL

**Expected Result:** ✅ Forms validate required fields  

---

### Test 14: Data Persistence ✅

- [ ] **Step 14.1:** Refresh browser (F5)
- [ ] **Step 14.2:** Navigate back to /clients
- [ ] **Step 14.3:** Verify "Test Client Manual" still exists
- [ ] **Step 14.4:** Navigate to /projects
- [ ] **Step 14.5:** Verify "Test Project Manual" still exists
- [ ] **Step 14.6:** Navigate to /tasks
- [ ] **Step 14.7:** Verify "Test Task Manual" still exists

**Expected Result:** ✅ All data persists after refresh  
**Status:** PASS / FAIL

---

### Test 15: Logout ✅

- [ ] **Step 15.1:** Find user menu (top right corner)
- [ ] **Step 15.2:** Click on user name or profile icon
- [ ] **Step 15.3:** Click "Logout" option
- [ ] **Step 15.4:** Redirect to login page
- [ ] **Step 15.5:** Try to access /dashboard directly
- [ ] **Step 15.6:** Should redirect to login (protected route)

**Expected Result:** ✅ Logout works, routes protected  
**Status:** PASS / FAIL

---

## 📊 Test Summary

**Total Tests:** 15  
**Tests Passed:** _____  
**Tests Failed:** _____  
**Pass Rate:** _____% 

---

## 🐛 Bugs Found

**List any issues discovered:**

1. _____________
2. _____________
3. _____________

---

## ✅ Critical Features Verification

- [ ] Authentication works
- [ ] Dashboard displays KPIs
- [ ] Can create clients
- [ ] Can create projects
- [ ] Can create tasks
- [ ] Time tracking works
- [ ] Cascading dropdowns work
- [ ] Data persists
- [ ] Forms validate
- [ ] Navigation works
- [ ] Responsive design works

---

## 🎯 Overall Assessment

**Application Stability:** Excellent / Good / Fair / Poor

**Ready for Production:** YES / NO

**Critical Issues:** _____________

**Recommended Actions:** _____________

---

## ✨ Sign-Off

**Tested By:** _____________  
**Date:** _____________  
**Time Spent:** _____ minutes  
**Approved:** YES / NO

---

**Next Steps:**
1. Fix any bugs found
2. Re-test failed scenarios
3. Document results in TEST_RESULTS.md
4. Proceed to next development phase
