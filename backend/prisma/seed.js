const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    const defaultAdminPassword = await bcrypt.hash('Admin@123456', 10);
    const defaultFinancePassword = await bcrypt.hash('Finance@123', 10);
    const defaultPmPassword = await bcrypt.hash('PM@123456', 10);
    const defaultLeadPassword = await bcrypt.hash('Lead@123456', 10);
    const defaultEmpPassword = await bcrypt.hash('Employee@123', 10);

    // Create / Reset Super Admin user
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@pm-system.com' },
        update: { password: defaultAdminPassword },
        create: {
            email: 'admin@pm-system.com',
            password: defaultAdminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            employeeId: 'EMP001',
            role: 'SUPER_ADMIN',
            department: 'Management',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Created/Updated Super Admin:', superAdmin.email);

    // Create / Reset Finance Admin
    const financeAdmin = await prisma.user.upsert({
        where: { email: 'finance@pm-system.com' },
        update: { password: defaultFinancePassword },
        create: {
            email: 'finance@pm-system.com',
            password: defaultFinancePassword,
            firstName: 'Finance',
            lastName: 'Admin',
            employeeId: 'EMP002',
            role: 'FINANCE_ADMIN',
            department: 'Finance',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Created/Updated Finance Admin:', financeAdmin.email);

    // Create / Reset Project Manager
    const projectManager = await prisma.user.upsert({
        where: { email: 'pm@pm-system.com' },
        update: { password: defaultPmPassword },
        create: {
            email: 'pm@pm-system.com',
            password: defaultPmPassword,
            firstName: 'Project',
            lastName: 'Manager',
            employeeId: 'EMP003',
            role: 'PROJECT_MANAGER',
            department: 'Engineering',
            status: 'ACTIVE',
            hourlyRate: 50,
        },
    });
    console.log('✅ Created/Updated Project Manager:', projectManager.email);

    // Create / Reset Team Lead
    const teamLead = await prisma.user.upsert({
        where: { email: 'lead@pm-system.com' },
        update: { password: defaultLeadPassword },
        create: {
            email: 'lead@pm-system.com',
            password: defaultLeadPassword,
            firstName: 'Team',
            lastName: 'Lead',
            employeeId: 'EMP004',
            role: 'TEAM_LEAD',
            department: 'Engineering',
            status: 'ACTIVE',
            hourlyRate: 40,
            managerId: projectManager.id,
        },
    });
    console.log('✅ Created/Updated Team Lead:', teamLead.email);

    // Create / Reset Employee
    const employee = await prisma.user.upsert({
        where: { email: 'employee@pm-system.com' },
        update: { password: defaultEmpPassword },
        create: {
            email: 'employee@pm-system.com',
            password: defaultEmpPassword,
            firstName: 'John',
            lastName: 'Doe',
            employeeId: 'EMP005',
            role: 'EMPLOYEE',
            department: 'Engineering',
            status: 'ACTIVE',
            hourlyRate: 30,
            managerId: teamLead.id,
        },
    });
    console.log('✅ Created/Updated Employee:', employee.email);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Users Created/Reset:');
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
