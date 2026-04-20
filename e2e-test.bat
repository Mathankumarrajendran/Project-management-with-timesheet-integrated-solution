@echo off
setlocal enabledelayedexpansion

echo === E2E STEP 1: Login ===
for /f "delims=" %%i in ('curl.exe -s -X POST "http://localhost:5000/api/auth/login" -H "Content-Type: application/json" -d @test-login.json') do set LOGIN=%%i
echo Login response received
echo %LOGIN% | findstr "success.*true" > nul && echo [PASS] Login successful || echo [FAIL] Login failed
:: Extract token using PowerShell since batch can't parse JSON
for /f "delims=" %%t in ('powershell -NoProfile -Command "$r='%LOGIN%' -replace '.*\"token\":\"',''; $r.Substring(0,$r.IndexOf('\"'))"') do set TOKEN=%%t
echo Token extracted: !TOKEN:~0,20!...

echo.
echo === E2E STEP 2: Get My Weekly Timesheets ===
curl.exe -s "http://localhost:5000/api/timesheets/weekly/my" -H "Authorization: Bearer !TOKEN!" -H "Content-Type: application/json" > ts_resp.json
type ts_resp.json

echo.
echo === E2E STEP 3: Get L1 Pending ===
curl.exe -s "http://localhost:5000/api/timesheets/weekly/pending-l1" -H "Authorization: Bearer !TOKEN!" > l1_resp.json
type l1_resp.json

echo.
echo === E2E STEP 4: Notifications ===
curl.exe -s "http://localhost:5000/api/notifications" -H "Authorization: Bearer !TOKEN!" > notif_resp.json
type notif_resp.json

echo.
echo === E2E STEP 5: All Monthly Timesheets ===
curl.exe -s "http://localhost:5000/api/timesheets/monthly/all" -H "Authorization: Bearer !TOKEN!" > monthly_resp.json
type monthly_resp.json

echo.
echo === E2E STEP 6: Reports ===
curl.exe -s "http://localhost:5000/api/reports/time-logs" -H "Authorization: Bearer !TOKEN!" > reports_resp.json
type reports_resp.json

echo.
echo ========================================
echo  E2E Test Runs Completed
echo ========================================
endlocal
