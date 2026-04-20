import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create Super Admin user
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@pm-system.com' },
        update: {},
        create: {
            email: 'admin@pm-system.com',
            password: await bcrypt.hash('Admin@123456', 10),
            firstName: 'Super',
            lastName: 'Admin',
            employeeId: 'EMP001',
            role: Role.SUPER_ADMIN,
            department: 'Management',
            status: UserStatus.ACTIVE,
        },
    });
    console.log('✅ Created Super Admin:', superAdmin.email);

    // Create Finance Admin
    const financeAdmin = await prisma.user.upsert({
        where: { email: 'finance@pm-system.com' },
        update: {},
        create: {
            email: 'finance@pm-system.com',
            password: await bcrypt.hash('Finance@123', 10),
            firstName: 'Finance',
            lastName: 'Admin',
            employeeId: 'EMP002',
            role: Role.FINANCE_ADMIN,
            department: 'Finance',
            status: UserStatus.ACTIVE,
        },
    });
    console.log('✅ Created Finance Admin:', financeAdmin.email);

    // Create Project Manager
    const projectManager = await prisma.user.upsert({
        where: { email: 'pm@pm-system.com' },
        update: {},
        create: {
            email: 'pm@pm-system.com',
            password: await bcrypt.hash('PM@123456', 10),
            firstName: 'Project',
            lastName: 'Manager',
            employeeId: 'EMP003',
            role: Role.PROJECT_MANAGER,
            department: 'Engineering',
            status: UserStatus.ACTIVE,
            hourlyRate: 50,
        },
    });
    console.log('✅ Created Project Manager:', projectManager.email);

    // Create Team Lead
    const teamLead = await prisma.user.upsert({
        where: { email: 'lead@pm-system.com' },
        update: {},
        create: {
            email: 'lead@pm-system.com',
            password: await bcrypt.hash('Lead@123456', 10),
            firstName: 'Team',
            lastName: 'Lead',
            employeeId: 'EMP004',
            role: Role.TEAM_LEAD,
            department: 'Engineering',
            status: UserStatus.ACTIVE,
            hourlyRate: 40,
            managerId: projectManager.id,
        },
    });
    console.log('✅ Created Team Lead:', teamLead.email);

    // Create Employee
    const employee = await prisma.user.upsert({
        where: { email: 'employee@pm-system.com' },
        update: {},
        create: {
            email: 'employee@pm-system.com',
            password: await bcrypt.hash('Employee@123', 10),
            firstName: 'John',
            lastName: 'Doe',
            employeeId: 'EMP005',
            role: Role.EMPLOYEE,
            department: 'Engineering',
            status: UserStatus.ACTIVE,
            hourlyRate: 30,
            managerId: teamLead.id,
        },
    });
    console.log('✅ Created Employee:', employee.email);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Users Created:');
    console.log('━'.repeat(60));
    console.log('Super Admin  : admin@pm-system.com     / Admin@123456');
    console.log('Finance Admin: finance@pm-system.com   / Finance@123');
    console.log('Project Mgr  : pm@pm-system.com        / PM@123456');
    console.log('Team Lead    : lead@pm-system.com      / Lead@123456');
    console.log('Employee     : employee@pm-system.com  / Employee@123');
    console.log('━'.repeat(60));
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
