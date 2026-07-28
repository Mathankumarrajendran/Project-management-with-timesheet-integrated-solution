# TROUBLESHOOTING GUIDE - Frontend Not Working

## Common Issues & Solutions

### Issue 1: "This site can't be reached" or "localhost refused to connect"

**Cause:** Frontend dev server is not running

**Solution:**
1. Open PowerShell in the frontend directory
2. Run: `npm install` (if dependencies not installed)
3. Run: `npm run dev`
4. Wait for message: `Local: http://localhost:3000`

---

### Issue 2: Blank white page or "Application error"

**Cause:** TypeScript compilation errors or missing dependencies

**Solution:**
```powershell
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\frontend"

# Delete .next folder and node_modules
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules

# Reinstall dependencies
npm install

# Try running again
npm run dev
```

---

### Issue 3: "Module not found" errors

**Cause:** Missing npm packages

**Solution:**
```powershell
# Make sure you're in the frontend directory
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\frontend"

# Install all dependencies
npm install

# If specific packages are missing, install them:
npm install @mui/material @emotion/react @emotion/styled
npm install @reduxjs/toolkit react-redux
npm install axios jwt-decode
```

---

### Issue 4: Port 3000 already in use

**Error:** "Port 3000 is already in use"

**Solution:**
```powershell
# Option 1: Kill the process using port 3000
netstat -ano | findstr :3000
# Note the PID number
taskkill /PID <PID_NUMBER> /F

# Option 2: Use a different port
# In frontend directory, run:
$env:PORT=3001; npm run dev
```

---

### Issue 5: "Cannot find module '@/hooks/useAuth'"

**Cause:** The useAuth hook file doesn't exist

**Solution:** The file should exist at:
`frontend/src/hooks/useAuth.ts`

If missing, I need to create it.

---

## Step-by-Step Diagnostic

### Step 1: Check if dependencies are installed

```powershell
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\frontend"
dir node_modules
```

If `node_modules` folder doesn't exist, run:
```powershell
npm install
```

---

### Step 2: Try starting the dev server

```powershell
npm run dev
```

**What to look for:**
- ✅ **Success:** See `Local: http://localhost:3000`
- ❌ **Error:** Note the error message and check solutions above

---

### Step 3: Check browser console

1. Open http://localhost:3000 in browser
2. Press F12 to open Developer Tools
3. Go to **Console** tab
4. Look for red error messages

**Common errors:**
- "Cannot connect to localhost:5000" → Backend not running
- "Module not found" → Missing dependency
- "useAuth is not defined" → Hook file missing

---

### Step 4: Verify backend is running

```powershell
# In a separate terminal
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\backend"
npm run dev
```

Should see: `Server running on port 5000`

Test backend:
```powershell
curl http://localhost:5000/api/health
```

---

## Quick Fix: Fresh Start

If nothing works, try this complete reset:

```powershell
# 1. Stop all running servers (Ctrl+C in each terminal)

# 2. Frontend cleanup
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\frontend"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
npm run dev

# 3. In a new terminal - Backend cleanup
cd "c:\Users\HP\Desktop\AI learnings\Project management\pm-system\backend"
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install
npm run dev
```

---

## What Error Are You Seeing?

Please tell me:
1. **What happens when you try to start the server?** (Error message?)
2. **What do you see in the browser?** (Blank page? Error message?)
3. **Any errors in the terminal?** (Copy the error text)

Once I know the specific error, I can provide a targeted fix!

---

## Quick Checklist

Before testing, ensure:
- [ ] Node.js is installed (`node --version`)
- [ ] npm is working (`npm --version`)
- [ ] You're in the correct directory
- [ ] Backend server is running on port 5000
- [ ] Frontend server is running on port 3000
- [ ] No other apps using ports 3000 or 5000
- [ ] `.env.local` file exists in frontend directory

---

## Need Immediate Help?

**Tell me exactly what you see when you:**
1. Run `npm run dev` in the frontend folder
2. Open http://localhost:3000 in your browser

I'll provide a specific fix based on your error! 🔧
