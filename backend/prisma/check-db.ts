import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('Checking last 5 tasks...');
    const tasks = await prisma.task.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { project: true }
    });
    console.log(`Found ${tasks.length} tasks.`);
    tasks.forEach(t => {
        console.log(`Task: ${t.title}`);
        console.log(`Priority: ${t.priority}`);
        console.log(`SLA Target: ${t.slaTargetHours}`);
        console.log(`SLA Status: ${t.slaStatus}`);
        console.log(`SLA Start: ${t.slaStartTime}`);
        console.log(`SLA End: ${t.slaEndTime}`);
        console.log(`Project Policy: ${JSON.stringify(t.project.slaPolicy)}`);
        console.log('---');
    });
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
