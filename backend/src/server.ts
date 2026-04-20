import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import clientRoutes from './routes/clientRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import timeLogRoutes from './routes/timeLogRoutes';
import sprintRoutes from './routes/sprintRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import reportRoutes from './routes/reportRoutes';
import timesheetRoutes from './routes/timesheetRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        // Allow any vercel.app subdomain
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-logs', timeLogRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch all
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((error: any, _req: any, res: any, _next: any) => {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
});

// ─── Startup DB sync: ensure Sprint table exists (migration may not have run) ──
async function ensureSprintTable() {
    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();
    try {
        await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Sprint" (
                "id"               SERIAL PRIMARY KEY,
                "projectId"        INTEGER NOT NULL,
                "name"             TEXT NOT NULL,
                "goal"             TEXT,
                "startDate"        TIMESTAMP(3) NOT NULL,
                "endDate"          TIMESTAMP(3) NOT NULL,
                "status"           TEXT NOT NULL DEFAULT 'PLANNING',
                "plannedPoints"    INTEGER,
                "completedPoints"  INTEGER,
                "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Sprint_projectId_fkey" FOREIGN KEY ("projectId")
                    REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE
            );
        `);
        await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Sprint_projectId_idx" ON "Sprint"("projectId");`);
        await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Sprint_status_idx" ON "Sprint"("status");`);
        // Add sprintId FK on Task if missing
        await db.$executeRawUnsafe(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'Task_sprintId_fkey'
                ) THEN
                    ALTER TABLE "Task"
                    ADD CONSTRAINT "Task_sprintId_fkey"
                    FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id")
                    ON DELETE SET NULL ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
        console.log('✅ Sprint table ensured');
    } catch (e: any) {
        console.warn('⚠️  Sprint table init warning:', e.message);
    } finally {
        await db.$disconnect();
    }
}

app.listen(PORT, async () => {
    await ensureSprintTable();
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Frontend  URLs: http://localhost:3000, http://localhost:3001`);
});

export default app;
