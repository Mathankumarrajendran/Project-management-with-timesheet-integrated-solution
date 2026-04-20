// @ts-nocheck
async function testApi() {
    try {
        const baseUrl = 'http://localhost:5000/api';

        // Helper for fetch
        const post = async (url: string, body: any, token?: string) => {
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${baseUrl}${url}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'API Error');
            return data;
        };

        // 1. Authenticate
        console.log('🔑 Logging in...');
        const loginRes = await post('/auth/login', {
            email: 'admin@pm-system.com',
            password: 'Admin@123456'
        });
        const token = loginRes.data.token;
        console.log('✅ Logged in');

        // 1.5 Create Client
        console.log('cl Creating Client...');
        const clientRes = await post('/clients', {
            name: `SLA Test Client ${Date.now()}`,
            code: `SLA-CL-${Date.now()}`, // Unique code
            contactEmail: 'test@example.com'
        }, token);
        const client = clientRes.data;
        console.log('✅ Created Client:', client.id);

        // 2. Create Project
        console.log('pj Creating Project with SLA Policy...');
        const projectRes = await post('/projects', {
            name: 'SLA API Test Project',
            code: `API-SLA-${Date.now()}`,
            clientId: client.id,
            slaPolicy: { HIGH: 5, MEDIUM: 10, LOW: 20 }
        }, token);
        const project = projectRes.data;
        console.log('✅ Created Project:', project.id);

        // 3. Create Task
        console.log('tk Creating High Priority Task...');
        const taskRes = await post('/tasks', {
            projectId: project.id,
            title: 'API High Task',
            taskType: 'DEVELOPMENT',
            priority: 'HIGH',
            estimatedHours: 10
        }, token);
        const task = taskRes.data;

        console.log(`Checking Task SLA: Target=${task.slaTargetHours}, Status=${task.slaStatus}`);

        if (task.slaTargetHours === 5 && task.slaStatus === 'ON_TRACK') {
            console.log('🏆 SUCCESS: SLA Target matches Policy (5h)!');
        } else {
            console.error('❌ FAILURE: SLA mismatch!', task);
            process.exit(1);
        }

    } catch (e: any) {
        console.error('Test Failed:', e.message);
        process.exit(1);
    }
}

testApi();
