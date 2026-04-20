/**
 * Temporary script: create Sprint table via Prisma's $executeRawUnsafe
 * Run once: npx ts-node src/scripts/create-sprint-table.ts
 */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    console.log('Creating Sprint table...');
    await prisma.$executeRawUnsafe(`
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

    // Create index on projectId
    await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Sprint_projectId_idx" ON "Sprint"("projectId");
    `);
    await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "Sprint_status_idx" ON "Sprint"("status");
    `);

    // Make sure Task.sprintId FK exists (add if missing)
    await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'Task_sprintId_fkey'
            ) THEN
                ALTER TABLE "Task"
                ADD CONSTRAINT "Task_sprintId_fkey"
                FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id")
                ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;
        END$$;
    `);

    console.log('✅ Sprint table created successfully!');
}

main()
    .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
