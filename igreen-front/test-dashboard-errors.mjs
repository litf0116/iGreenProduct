import { chromium } from 'playwright';

async function testDashboardErrors() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];

    page.on('response', async (response) => {
        if (response.status() >= 400) {
            const url = response.url();
            const status = response.status();
            const body = await response.text().catch(() => 'Unable to read body');
            errors.push(`[${status}] ${url}\nBody: ${body.substring(0, 500)}`);
        }
    });

    try {
        console.log('1. Navigating to login page...');
        await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);

        console.log('2. Filling login form...');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');

        console.log('3. Clicking login button...');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(5000);

        console.log('4. Navigating to dashboard...');
        await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(5000);

        console.log('\n=== Errors Found ===');
        if (errors.length === 0) {
            console.log('No errors found');
        } else {
            errors.forEach(e => console.log(e + '\n'));
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testDashboardErrors();
