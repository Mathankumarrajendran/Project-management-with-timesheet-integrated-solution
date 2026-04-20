-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'FINANCE_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'EMPLOYEE', 'CLIENT', 'AUDITOR');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('BILLABLE', 'NON_BILLABLE', 'INTERNAL');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('ON_TRACK', 'AT_RISK', 'OFF_TRACK');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('DEVELOPMENT', 'TESTING', 'DESIGN', 'DOCUMENTATION', 'BUG_FIX', 'ENHANCEMENT', 'MEETING', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'APPROVED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SlaStatus" AS ENUM ('NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'BREACHED');

-- CreateEnum
CREATE TYPE "TimeLogStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'L1_APPROVED', 'L1_REJECTED', 'L2_APPROVED', 'L2_REJECTED', 'LOCKED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FIXED_PRICE', 'TIME_AND_MATERIAL', 'RETAINER', 'DEDICATED_TEAM');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department" TEXT,
    "managerId" INTEGER,
    "hourlyRate" DECIMAL(10,2),
    "profilePicture" TEXT,
    "phone" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "twoFaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFaSecret" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "billingAddress" TEXT,
    "paymentTerms" TEXT,
    "contractType" "ContractType",
    "contractValue" DECIMAL(15,2),
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "projectType" TEXT,
    "billingType" "BillingType" NOT NULL DEFAULT 'BILLABLE',
    "projectManagerId" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budgetHours" DECIMAL(10,2),
    "budgetAmount" DECIMAL(15,2),
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "healthStatus" "HealthStatus" NOT NULL DEFAULT 'ON_TRACK',
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slaPolicy" JSONB,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "joinedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "TaskType" NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" INTEGER,
    "estimatedHours" DECIMAL(10,2),
    "actualHours" DECIMAL(10,2),
    "dueDate" TIMESTAMP(3),
    "slaTargetHours" INTEGER,
    "slaStartTime" TIMESTAMP(3),
    "slaEndTime" TIMESTAMP(3),
    "slaStatus" "SlaStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "parentTaskId" INTEGER,
    "sprintId" INTEGER,
    "storyPoints" INTEGER,
    "tags" TEXT[],
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "approvedBy" INTEGER,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "clientId" INTEGER,
    "projectId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "status" "TimeLogStatus" NOT NULL DEFAULT 'DRAFT',
    "weeklyTimesheetId" INTEGER,
    "monthlyTimesheetId" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "l1ApproverId" INTEGER,
    "l1ApprovedAt" TIMESTAMP(3),
    "l1RejectionReason" TEXT,
    "l2ApproverId" INTEGER,
    "l2ApprovedAt" TIMESTAMP(3),
    "l2RejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyTimesheet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "weekEndDate" DATE NOT NULL,
    "totalHours" DECIMAL(10,2) NOT NULL,
    "billableHours" DECIMAL(10,2) NOT NULL,
    "status" "TimeLogStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "l1ApproverId" INTEGER,
    "l1ApprovedAt" TIMESTAMP(3),
    "l1RejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyTimesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyTimesheet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalHours" DECIMAL(10,2) NOT NULL,
    "billableHours" DECIMAL(10,2) NOT NULL,
    "utilization" DECIMAL(5,2) NOT NULL,
    "overtimeHours" DECIMAL(10,2),
    "status" "TimeLogStatus" NOT NULL DEFAULT 'DRAFT',
    "compiledAt" TIMESTAMP(3),
    "l2ApproverId" INTEGER,
    "l2ApprovedAt" TIMESTAMP(3),
    "l2RejectionReason" TEXT,
    "payrollExported" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyTimesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "plannedPoints" INTEGER,
    "completedPoints" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_employeeId_idx" ON "User"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_code_key" ON "Client"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");

-- CreateIndex
CREATE INDEX "Client_code_idx" ON "Client"("code");

-- CreateIndex
CREATE INDEX "Client_name_idx" ON "Client"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE INDEX "Project_code_idx" ON "Project"("code");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_projectManagerId_idx" ON "Project"("projectManagerId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_code_key" ON "Task"("code");

-- CreateIndex
CREATE INDEX "Task_code_idx" ON "Task"("code");

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Task_assignedTo_idx" ON "Task"("assignedTo");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_slaStatus_idx" ON "Task"("slaStatus");

-- CreateIndex
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment"("taskId");

-- CreateIndex
CREATE INDEX "Attachment_taskId_idx" ON "Attachment"("taskId");

-- CreateIndex
CREATE INDEX "TimeLog_userId_idx" ON "TimeLog"("userId");

-- CreateIndex
CREATE INDEX "TimeLog_projectId_idx" ON "TimeLog"("projectId");

-- CreateIndex
CREATE INDEX "TimeLog_date_idx" ON "TimeLog"("date");

-- CreateIndex
CREATE INDEX "TimeLog_status_idx" ON "TimeLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TimeLog_userId_date_taskId_key" ON "TimeLog"("userId", "date", "taskId");

-- CreateIndex
CREATE INDEX "WeeklyTimesheet_userId_idx" ON "WeeklyTimesheet"("userId");

-- CreateIndex
CREATE INDEX "WeeklyTimesheet_weekStartDate_idx" ON "WeeklyTimesheet"("weekStartDate");

-- CreateIndex
CREATE INDEX "WeeklyTimesheet_status_idx" ON "WeeklyTimesheet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTimesheet_userId_weekStartDate_key" ON "WeeklyTimesheet"("userId", "weekStartDate");

-- CreateIndex
CREATE INDEX "MonthlyTimesheet_userId_idx" ON "MonthlyTimesheet"("userId");

-- CreateIndex
CREATE INDEX "MonthlyTimesheet_month_year_idx" ON "MonthlyTimesheet"("month", "year");

-- CreateIndex
CREATE INDEX "MonthlyTimesheet_status_idx" ON "MonthlyTimesheet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyTimesheet_userId_month_year_key" ON "MonthlyTimesheet"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "Sprint_projectId_idx" ON "Sprint"("projectId");

-- CreateIndex
CREATE INDEX "Sprint_status_idx" ON "Sprint"("status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_weeklyTimesheetId_fkey" FOREIGN KEY ("weeklyTimesheetId") REFERENCES "WeeklyTimesheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeLog" ADD CONSTRAINT "TimeLog_monthlyTimesheetId_fkey" FOREIGN KEY ("monthlyTimesheetId") REFERENCES "MonthlyTimesheet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyTimesheet" ADD CONSTRAINT "WeeklyTimesheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyTimesheet" ADD CONSTRAINT "MonthlyTimesheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
