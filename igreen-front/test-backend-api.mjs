import { chromium } from 'playwright';

async function testBackendAPIs() {
    console.log('=== Testing Backend APIs ===\n');

    // Test 1: SLA Configs API
    console.log('1. Testing GET /api/configs/sla-configs');
    try {
        const response = await fetch('http://localhost:8000/api/configs/sla-configs');
        const data = await response.json();
        console.log('   Status:', response.status);
        console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } catch (error) {
        console.log('   Error:', error.message);
    }

    // Test 2: Tickets Stats API
    console.log('\n2. Testing GET /api/tickets/stats');
    try {
        const response = await fetch('http://localhost:8000/api/tickets/stats');
        const data = await response.json();
        console.log('   Status:', response.status);
        console.log('   Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('   Error:', error.message);
    }

    // Test 3: Sites API
    console.log('\n3. Testing GET /api/sites');
    try {
        const response = await fetch('http://localhost:8000/api/sites');
        const data = await response.json();
        console.log('   Status:', response.status);
        console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } catch (error) {
        console.log('   Error:', error.message);
    }

    // Test 4: Login API (will fail due to CORS)
    console.log('\n4. Testing POST /api/auth/login (CORS test)');
    try {
        const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123', country: 'CN' })
        });
        console.log('   Status:', response.status);
        console.log('   Response:', JSON.stringify(await response.json(), null, 2).substring(0, 200) + '...');
    } catch (error) {
        console.log('   Error:', error.message);
    }
}

testBackendAPIs();
