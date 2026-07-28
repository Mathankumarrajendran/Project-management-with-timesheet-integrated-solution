# PM System - Testing Guide

## 🚀 Quick Start - Running the Application

### Issue: PowerShell Execution Policy
If you see an error about "running scripts is disabled", you need to allow PowerShell to execute npm commands.

**Fix (Run PowerShell as Administrator):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Step-by-Step Testing Instructions

### Step 1: Start Backend Server

Open **Terminal 1** (PowerShell or CMD):

```powershell
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\backend"

# If first time, install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed test data
npm run prisma:seed

# Start backend server
npm run dev
```

**Expected Output:**
```
Server running on port 5000
```

**Backend URL:** http://localhost:5000

---

### Step 2: Start Frontend Server

Open **Terminal 2** (New PowerShell window):

```powershell
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\frontend"

# If first time, install dependencies
npm install

# Start frontend dev server
npm run dev
```

**Expected Output:**
```
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

**Frontend URL:** http://localhost:3000

---

## Step 3: Test the Application

### 1. **Login Flow**
1. Open browser: http://localhost:3000
2. Should auto-redirect to `/login`
3. Use test credentials:
   - **Email:** `admin@pm-system.com`
   - **Password:** `Admin@123456`
4. Click "Sign In"
5. Should redirect to `/dashboard`

### 2. **Dashboard**
- See 6 KPI cards with real data:
  - Total Users (5)
  - Active Projects (0 initially)
  - Total Clients (0 initially)
  - Open Tasks (0 initially)
  - SLA Breached (0)
  - Pending Approvals (0)
- Cards should have hover animation (moves up)

### 3. **Navigation**
Click sidebar menu items:
- ✅ Dashboard
- ✅ Users (Admin only)
- ✅ Clients
- ✅ Projects
- ✅ Tasks
- ✅ Time Logs
- ✅ Sprints

### 4. **Create Time Entry**
1. Go to **Time Logs**
2. Click "**Log Time**" button
3. Fill form:
   - Date: Today
   - Project: (will be empty initially)
   - Task: (will be empty initially)
   - Hours: 8
   - Description: "Initial development work"
   - Billable: Yes
4. Click "Save"
5. See success message
6. Entry appears in table

**Note:** You'll need to create a project and task first via API or backend.

### 5. **Check Users Page**
1. Go to **Users**
2. Should see 5 test users:
   - 1 Super Admin
   - 1 Finance Admin
   - 1 Project Manager
   - 1 Team Lead
   - 1 Employee
3. See role chips with different colors

### 6. **Test Different User Roles**
1. Logout (Click avatar → Logout)
2. Login as different users:

**Employee Account:**
- Email: `employee@pm-system.com`
- Password: `Employee@123`
- Notice: "Users" menu is hidden (RBAC in action)

**Project Manager:**
- Email: `pm@pm-system.com`
- Password: `PM@123456`
- All menus visible

---

## 🧪 API Testing (Optional)

### Test Backend Directly

**1. Health Check:**
```powershell
curl http://localhost:5000/api/health
```

**2. Login API:**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@pm-system.com\",\"password\":\"Admin@123456\"}'
```

**3. Get Dashboard Stats:**
```powershell
curl http://localhost:5000/api/dashboard/admin `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 Test User Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Super Admin | admin@pm-system.com | Admin@123456 | All features |
| Finance Admin | finance@pm-system.com | Finance@123 | Finance, projects |
| Project Manager | pm@pm-system.com | PM@123456 | Projects, tasks, users |
| Team Lead | lead@pm-system.com | Lead@123456 | Projects, tasks |
| Employee | employee@pm-system.com | Employee@123 | Tasks, time logs |

---

## 🔍 What to Verify

### Frontend ✅
- [x] Login page loads
- [x] JWT token stored in localStorage after login
- [x] Dashboard shows real data from backend
- [x] Navigation menu shows/hides based on role
- [x] All pages load without errors
- [x] Hover effects work on cards
- [x] Forms open and close
- [x] Logout clears token and redirects

### Backend ✅
- [x] Server starts on port 5000
- [x] Database connection works
- [x] API endpoints respond
- [x] JWT authentication works
- [x] RBAC authorization works
- [x] Data returns correctly

### Full-Stack Integration ✅
- [x] Frontend calls backend APIs
- [x] JWT token sent in Authorization header
- [x] Data flows from backend to UI
- [x] Error handling works (try wrong password)
- [x] 401 errors auto-logout

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Check backend server is running on port 5000
- Check `.env.local` has correct API URL
- Verify no CORS errors in browser console

### "Login fails"
- Check backend logs
- Verify database has seeded users
- Try: `npm run prisma:seed` in backend

### "Dashboard shows zeros"
- Normal if no data created yet
- Create projects/tasks via API or add create forms

### "Users page is blank"
- Login with Super Admin, PM, or Team Lead
- Regular employees don't have access

### "npm command not working"
- Run PowerShell as Administrator
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## 🎯 Next Testing Steps

After basic testing, try:

1. **Create a Client** (via API for now)
```powershell
curl -X POST http://localhost:5000/api/clients `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test Client\",\"contactPerson\":\"John Doe\",\"email\":\"john@test.com\",\"phone\":\"1234567890\",\"contractType\":\"FIXED_PRICE\",\"status\":\"ACTIVE\"}'
```

2. **Create a Project**
3. **Create Tasks**
4. **Log Time**
5. **Test SLA tracking**
6. **Test approval workflows**

---

## ✨ What You Should See

### Login Page
- Purple gradient background
- White card with PM System branding
- Email and password fields
- Sign In button with gradient
- Test credentials displayed at bottom

### Dashboard
- 6 animated stat cards in a grid
- Each card has icon, value, and subtitle
- Hover effect: card moves up with shadow
- Recent Activity and Quick Actions placeholders

### All Pages
- Consistent header with page title
- Responsive sidebar (collapse on mobile)
- User avatar in top-right
- Clean Material-UI design
- Loading spinners while fetching data

---

## 🎉 Success Criteria

Your app is working if:
1. ✅ Both servers start without errors
2. ✅ Login works and redirects to dashboard
3. ✅ Dashboard shows data from backend
4. ✅ You can navigate between pages
5. ✅ Different users see different menus
6. ✅ No console errors in browser
7. ✅ API calls visible in Network tab
8. ✅ Logout works and clears session

---

**Ready to test! Open two terminals and follow Steps 1-2 above.** 🚀
