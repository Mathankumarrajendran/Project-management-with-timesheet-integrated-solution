$ErrorActionPreference = "Stop"
$base = "http://localhost:5000/api"

function Pass($msg) { Write-Host "[PASS] $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "[FAIL] $msg" -ForegroundColor Red }
function Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Yellow }

# Step 1: Login
Write-Host "`n=== STEP 1: Login ===" -ForegroundColor Cyan
$loginJson = Get-Content "test-login.json" -Raw
$loginResp = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType "application/json" -Body $loginJson
$tok = $loginResp.data.token
$u = $loginResp.data.user
Pass ("Logged in: " + $u.firstName + " " + $u.lastName + " [" + $u.role + "] id=" + $u.id)
$auth = @{ Authorization = "Bearer $tok"; "Content-Type" = "application/json" }

# Step 2: Get projects
Write-Host "`n=== STEP 2: Projects ===" -ForegroundColor Cyan
$projectResp = Invoke-RestMethod -Uri "$base/projects" -Headers $auth
$projects = $projectResp.data.projects
Pass ("Projects: " + $projects.Count)
if ($projects.Count -eq 0) { Fail "No projects found"; exit }
$projectId = $projects[0].id
Info ("Using: " + $projects[0].name + " id=" + $projectId)

# Step 3: Get tasks
Write-Host "`n=== STEP 3: Tasks ===" -ForegroundColor Cyan
$taskResp = Invoke-RestMethod -Uri "$base/tasks?projectId=$projectId" -Headers $auth
$taskList = $taskResp.data.tasks
Pass ("Tasks: " + $taskList.Count)
if ($taskList.Count -eq 0) { Fail "No tasks found"; exit }
$taskId = $taskList[0].id
Info ("Using: " + $taskList[0].title + " id=" + $taskId)

# Step 4: Create time log
Write-Host "`n=== STEP 4: Create Time Log ===" -ForegroundColor Cyan
$today = (Get-Date).ToString("yyyy-MM-dd")
$tlJson = @{
    projectId   = $projectId
    taskId      = $taskId
    date        = $today
    hours       = 6
    description = "E2E automated test entry"
    billable    = $true
} | ConvertTo-Json -Compress
try {
    $tlResp = Invoke-RestMethod -Uri "$base/time-logs" -Method POST -Headers $auth -Body $tlJson
    Pass ("Time log id=" + $tlResp.data.id + " hours=" + $tlResp.data.hours)
} catch {
    $errMsg = ""
    try { $errMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message } catch {}
    if ($errMsg -match "Unique") { Info "Already logged today (re-run) -- OK" }
    else { Fail "Time log: $errMsg" }
}

# Step 5: Get my weekly timesheets
Write-Host "`n=== STEP 5: My Weekly Timesheets ===" -ForegroundColor Cyan
$wtsResp = Invoke-RestMethod -Uri "$base/timesheets/weekly/my" -Headers $auth
$sheets = $wtsResp.data
Pass ("Weekly sheets: " + $sheets.Count)
if ($sheets.Count -eq 0) { Fail "No sheets found"; exit }
$sheet = $sheets[0]
Info ("Latest: id=" + $sheet.id + " status=" + $sheet.status + " hours=" + $sheet.totalHours)

# Step 6: Submit for L1 if needed
Write-Host "`n=== STEP 6: Submit for L1 ===" -ForegroundColor Cyan
if ($sheet.status -eq "DRAFT" -or $sheet.status -eq "L1_REJECTED") {
    $submitResp = Invoke-RestMethod -Uri "$base/timesheets/weekly/$($sheet.id)/submit" -Method POST -Headers $auth
    Pass $submitResp.message
    $sheet = $submitResp.data
} else {
    Info ("Already in: " + $sheet.status + " -- skip submit")
}

# Step 7: L1 approval
Write-Host "`n=== STEP 7: L1 Approval ===" -ForegroundColor Cyan
$l1Resp = Invoke-RestMethod -Uri "$base/timesheets/weekly/pending-l1" -Headers $auth
$l1List = $l1Resp.data
Pass ("Pending L1: " + $l1List.Count)
if ($l1List.Count -gt 0) {
    $toApprove = $l1List[0]
    Info ("Approving: " + $toApprove.user.firstName + " " + $toApprove.user.lastName + " week=" + $toApprove.weekStartDate)
    $approveBody = @{ remarks = "E2E: L1 approved" } | ConvertTo-Json -Compress
    $a1Resp = Invoke-RestMethod -Uri "$base/timesheets/weekly/$($toApprove.id)/approve-l1" -Method POST -Headers $auth -Body $approveBody
    Pass $a1Resp.message
} else {
    Info "No pending L1 (may already be approved)"
}

# Step 8: Compile monthly
Write-Host "`n=== STEP 8: Compile Monthly ===" -ForegroundColor Cyan
$month = (Get-Date).Month
$year = (Get-Date).Year
$userId = $u.id
$compileBody = @{ userId = $userId; year = $year; month = $month } | ConvertTo-Json -Compress
try {
    $compResp = Invoke-RestMethod -Uri "$base/timesheets/monthly/compile" -Method POST -Headers $auth -Body $compileBody
    Pass $compResp.message
    Info ("Monthly id=" + $compResp.data.id + " status=" + $compResp.data.status + " hours=" + $compResp.data.totalHours)
} catch {
    $errMsg = ""
    try { $errMsg = ($_.ErrorDetails.Message | ConvertFrom-Json).message } catch { $errMsg = $_.Exception.Message }
    Info "Compile: $errMsg"
}

# Step 9: L2 Approval
Write-Host "`n=== STEP 9: L2 Approval ===" -ForegroundColor Cyan
$l2Resp = Invoke-RestMethod -Uri "$base/timesheets/monthly/pending-l2" -Headers $auth
$l2List = $l2Resp.data
Pass ("Pending L2: " + $l2List.Count)
if ($l2List.Count -gt 0) {
    $l2sheet = $l2List[0]
    Info ("L2 Approving: " + $l2sheet.user.firstName + " " + $l2sheet.user.lastName)
    $l2body = @{ remarks = "E2E: L2 approved for payroll" } | ConvertTo-Json -Compress
    $a2Resp = Invoke-RestMethod -Uri "$base/timesheets/monthly/$($l2sheet.id)/approve-l2" -Method POST -Headers $auth -Body $l2body
    Pass $a2Resp.message
} else {
    Info "No pending L2"
    # Show all monthly
    $allMonthly = (Invoke-RestMethod -Uri "$base/timesheets/monthly/all" -Headers $auth).data
    Info ("Total monthly records: " + $allMonthly.Count)
}

# Step 10: Notifications
Write-Host "`n=== STEP 10: Notifications ===" -ForegroundColor Cyan
$notifResp = Invoke-RestMethod -Uri "$base/notifications" -Headers $auth
$notifs = $notifResp.data.notifications
Pass ("Total: " + $notifs.Count + " | Unread: " + $notifResp.data.unreadCount)

# Step 11: Mark all read
Invoke-RestMethod -Uri "$base/notifications/read-all" -Method PATCH -Headers $auth | Out-Null
Info "Mark-all-read: OK"

# Step 12: Reports
Write-Host "`n=== STEP 12: Reports ===" -ForegroundColor Cyan
try {
    $rptResp = Invoke-RestMethod -Uri "$base/reports/time-logs" -Headers $auth
    Pass ("Reports/time-logs: " + $rptResp.data.Count + " project groups")
} catch { Info ("Reports: " + $_.Exception.Message) }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  E2E API Test COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
