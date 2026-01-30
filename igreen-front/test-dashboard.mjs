import { chromium } from 'playwright';

async function testDashboard() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    const networkErrors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()}`);
        }
    });

    page.on('pageerror', error => {
        errors.push(`Page Error: ${error.message}`);
    });

    page.on('requestfailed', request => {
        networkErrors.push(`Request Failed: ${request.url()} - ${request.failure()?.errorMessage}`);
    });

    try {
        console.log('Navigating to http://localhost:3001/dashboard...');
        await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);

        console.log('\n=== Page Title ===');
        console.log(await page.title());

        console.log('\n=== Console Errors ===');
        if (errors.length === 0) {
            console.log('No console errors found');
        } else {
            errors.forEach(e => console.log(e));
        }

        console.log('\n=== Network Errors ===');
        if (networkErrors.length === 0) {
            console.log('No network errors found');
        } else {
            networkErrors.forEach(e => console.log(e));
        }

        console.log('\n=== Page Content Preview ===');
        const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'No content');
        console.log(bodyText);

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testDashboard();
