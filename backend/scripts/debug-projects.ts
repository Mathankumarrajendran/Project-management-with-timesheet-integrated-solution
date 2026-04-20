
// @ts-nocheck
async function debugProjects() {
    try {
        const baseUrl = 'http://localhost:5000/api';

        const post = async (url, body, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${baseUrl}${url}`, { method: 'POST', headers, body: JSON.stringify(body) });
            return { ok: res.ok, status: res.status, data: await res.json() };
        };

        const get = async (url, token) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${baseUrl}${url}`, { method: 'GET', headers });
            return { ok: res.ok, status: res.status, data: await res.json() };
        };

        // 1. Login
        console.log('🔑 Logging in...');
        const login = await post('/auth/login', { email: 'admin@pm-system.com', password: 'Admin@123456' });
        if (!login.ok) throw new Error(`Login failed: ${login.status}`);
        const token = login.data.data.token;
        console.log('✅ Logged in');

        // 2. Get Projects
        console.log('📂 Fetching Projects...');
        const projectsRes = await get('/projects', token);
        if (!projectsRes.ok) throw new Error(`Get Projects failed: ${projectsRes.status}`);
        const projects = projectsRes.data.data.projects;
        console.log(`✅ Found ${projects.length} projects`);

        if (projects.length === 0) {
            console.log('⚠️ No projects to test detail view');
            return;
        }

        // 3. Get Project Dashboard for first project
        const pid = projects[0].id;
        console.log(`🔍 Fetching Dashboard for Project ID: ${pid} (${projects[0].name})...`);
        const dashRes = await get(`/dashboard/project/${pid}`, token);

        if (dashRes.ok) {
            console.log('✅ Dashboard Fetch Success!');
            console.log('Data keys:', Object.keys(dashRes.data.data));
        } else {
            console.error('❌ Dashboard Fetch Failed!');
            console.error('Status:', dashRes.status);
            console.error('Response:', dashRes.data);
        }

    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

debugProjects();
