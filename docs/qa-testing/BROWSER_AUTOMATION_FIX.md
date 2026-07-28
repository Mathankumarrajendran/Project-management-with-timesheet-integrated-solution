# Browser Automation Environment Fix

## Issue
Browser automation failed with error:
```
failed to create browser context: failed to install playwright: $HOME environment variable is not set
```

## Root Cause
The Playwright browser engine requires the `HOME` environment variable to be set to install browser binaries. On Windows systems, this variable is not set by default.

## Solution Attempted

### Attempt 1: Session-Level Variable
```powershell
$env:HOME = $env:USERPROFILE
```
**Result:** ❌ Only applied to current PowerShell session, did not persist to browser service

### Attempt 2: User-Level Permanent Variable
```powershell
[Environment]::SetEnvironmentVariable("HOME", $env:USERPROFILE, "User")
```
**Status:** Requires execution approval and system restart

## Recommended Fix

### Option 1: Set Permanently via PowerShell (Administrator)
1. Open PowerShell as Administrator
2. Run:
```powershell
[Environment]::SetEnvironmentVariable("HOME", $env:USERPROFILE, "User")
[Environment]::SetEnvironmentVariable("HOME", $env:USERPROFILE, "Machine")
```
3. Restart your IDE/Terminal
4. Retry browser automation

### Option 2: Set via System Properties (GUI)
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to "Advanced" tab
3. Click "Environment Variables"
4. Under "User variables", click "New"
5. Variable name: `HOME`
6. Variable value: `C:\Users\HP` (or your user folder)
7. Click OK
8. Restart applications

### Option 3: Set via Command Line
```cmd
setx HOME "%USERPROFILE%"
```
Then restart terminal/IDE

## Why This Matters
Playwright (used for browser automation) needs to know where to install:
- Browser binaries (Chrome, Firefox, etc.)
- Browser profiles
- Cache files
- User data directories

Without `HOME`, it cannot determine the installation path.

## Verification
After setting the variable, verify with:
```powershell
echo $env:HOME
# Should output: C:\Users\HP
```

## Alternative: Manual Testing
If browser automation cannot be fixed immediately, use the comprehensive manual testing guides:
- `TEST_PLAN.md` - 30 detailed test cases
- `TEST_EXECUTION_GUIDE.md` - Step-by-step instructions
- `TEST_RESULTS.md` - Results tracking template

## Status
- ⏳ Environment fix requires system-level changes
- ✅ Manual testing documentation complete and ready to use
- ✅ All test cases documented (30 tests)
- ✅ Quick 5-minute smoke test available

## Next Steps
1. **User action required:** Set HOME environment variable permanently
2. Restart IDE/Terminal
3. Retry browser automation
4. **OR** proceed with manual testing using provided guides
