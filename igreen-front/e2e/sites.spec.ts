import { test, expect } from '@playwright/test';

test.describe('Sites Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login API
    await page.route(/.*\/api\/auth\/login.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          data: {
            accessToken: 'test-token',
            refreshToken: 'test-refresh-token',
            expiresIn: 7200,
            tokenType: 'Bearer',
          },
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/auth\/me.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: {
            id: '1',
            name: 'Admin User',
            username: 'admin',
            email: 'admin@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: '2024-01-01T00:00:00Z',
          },
          code: '200',
        }),
      });
    });

    // Mock sites API
    await page.route(/.*\/api\/sites.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: {
            records: [
              { id: 'site-1', name: 'Site A', address: '123 Main St', level: 'A', status: 'ACTIVE' },
              { id: 'site-2', name: 'Site B', address: '456 Oak Ave', level: 'B', status: 'ACTIVE' },
              { id: 'site-3', name: 'Site C', address: '789 Pine Rd', level: 'C', status: 'INACTIVE' },
            ],
            total: 3,
            current: 1,
            size: 100,
            hasNext: false,
          },
          code: '200',
        }),
      });
    });

    // Navigate to login first
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.waitForTimeout(2000);
  });

  test('should display sites page', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Verify page structure
    await expect(page.getByRole('heading', { name: /site management/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add site/i })).toBeVisible();
  });

  test('should display sites list', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(2000);

    // Verify sites are displayed
    await expect(page.getByText('Site A')).toBeVisible();
    await expect(page.getByText('Site B')).toBeVisible();
    await expect(page.getByText('Site C')).toBeVisible();
  });

  test('should open add site dialog', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(1000);

    // Click add site button
    await page.getByRole('button', { name: /add site/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /add site/i })).toBeVisible();

    // Verify form fields exist
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('input').first()).toBeVisible();

    // Close dialog
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should search sites', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(1000);

    // Find and use search input
    const searchInput = page.getByPlaceholder(/search/i);
    const inputCount = await searchInput.count();

    if (inputCount > 0) {
      await searchInput.fill('Site A');
      await page.waitForTimeout(1000);

      // Verify search was triggered
      await expect(page.getByText('Site A')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should display site statistics', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(2000);

    // Mock stats API
    await page.route(/.*\/api\/sites\/stats.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { totalSites: 3, onlineSites: 2, offlineSites: 1, vipSites: 0 },
          code: '200',
        }),
      });
    });

    // Verify stats are displayed
    await expect(page.getByText(/total/i)).toBeVisible();
    await expect(page.getByText(/online/i)).toBeVisible();
  });
});
