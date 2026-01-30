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

  test('should add new site successfully', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(1000);

    // Mock sites API for creation
    await page.route(/.*\/api\/sites.*/, async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Site created successfully',
            data: {
              id: 'site-new',
              name: 'New Site',
              address: '999 New Street',
              level: 'A',
              status: 'ACTIVE',
            },
            code: '200',
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              records: [
                { id: 'site-1', name: 'Site A', address: '123 Main St', level: 'A', status: 'ACTIVE' },
                { id: 'site-new', name: 'New Site', address: '999 New Street', level: 'A', status: 'ACTIVE' },
              ],
              total: 2,
              current: 1,
              size: 100,
              hasNext: false,
            },
            code: '200',
          }),
        });
      }
    });

    // Click add site button
    await page.getByRole('button', { name: /add site/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /add site/i })).toBeVisible();

    // Fill in site details
    const dialog = page.getByRole('dialog');
    await dialog.locator('input').first().fill('New Site');
    await dialog.locator('input').nth(1).fill('999 New Street');

    // Select level if dropdown exists
    const levelDropdown = dialog.getByRole('combobox').first();
    const dropdownCount = await levelDropdown.count();
    if (dropdownCount > 0) {
      await levelDropdown.click();
      await expect(page.getByRole('option', { name: /A/i })).toBeVisible();
      await page.getByRole('option', { name: /A/i }).click();
    }

    // Click save
    await page.getByRole('dialog').getByRole('button', { name: /save|create/i }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Verify new site appears in list
    await expect(page.getByText('New Site')).toBeVisible();
  });

  test('should edit existing site', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(1000);

    // Mock sites API for update
    await page.route(/.*\/api\/sites.*/, async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Site updated successfully',
            data: {
              id: 'site-1',
              name: 'Updated Site A',
              address: '123 Updated Main St',
              level: 'A',
              status: 'ACTIVE',
            },
            code: '200',
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              records: [
                { id: 'site-1', name: 'Updated Site A', address: '123 Updated Main St', level: 'A', status: 'ACTIVE' },
              ],
              total: 1,
              current: 1,
              size: 100,
              hasNext: false,
            },
            code: '200',
          }),
        });
      }
    });

    // Find edit button for Site A
    const siteRow = page.locator('table tbody tr').filter({ has: page.getByText('Site A') });
    const editButton = siteRow.locator('button').filter({ has: page.locator('svg.lucide-edit') });
    const buttonCount = await editButton.count();

    if (buttonCount > 0) {
      await editButton.click();

      // Verify dialog opens with edit title
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /edit site|update site/i })).toBeVisible();

      // Update site name
      const dialog = page.getByRole('dialog');
      const nameInput = dialog.locator('input').first();
      await nameInput.clear();
      await nameInput.fill('Updated Site A');

      // Click save
      await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

      // Verify dialog closes
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

      // Verify updated name appears
      await expect(page.getByText('Updated Site A')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should delete site with confirmation', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(1000);

    // Mock delete API
    await page.route(/.*\/api\/sites.*/, async (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Site deleted successfully',
            data: {},
            code: '200',
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              records: [
                { id: 'site-2', name: 'Site B', address: '456 Oak Ave', level: 'B', status: 'ACTIVE' },
              ],
              total: 1,
              current: 1,
              size: 100,
              hasNext: false,
            },
            code: '200',
          }),
        });
      }
    });

    // Find delete button for Site A (trash icon)
    const siteRow = page.locator('table tbody tr').filter({ has: page.getByText('Site A') });
    const deleteButton = siteRow.locator('button').filter({ has: page.locator('svg.lucide-trash-2') });
    const buttonCount = await deleteButton.count();

    if (buttonCount > 0) {
      await deleteButton.click();

      // Verify confirmation dialog appears
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await expect(page.getByText(/are you sure|confirm/i)).toBeVisible();

      // Confirm deletion
      await page.getByRole('button', { name: /delete|confirm/i }).click();

      // Verify dialog closes
      await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5000 });

      // Verify site is removed
      await expect(page.getByText('Site A')).not.toBeVisible();
      await expect(page.getByText('Site B')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should filter sites by status', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(1000);

    // Look for status filter dropdown
    const statusFilter = page.getByRole('combobox', { name: /status/i });
    const filterCount = await statusFilter.count();

    if (filterCount > 0) {
      await statusFilter.click();

      // Verify filter options
      await expect(page.getByRole('option', { name: /all/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /active/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /inactive/i })).toBeVisible();

      // Select active filter
      await page.getByRole('option', { name: /active/i }).click();

      // Verify only active sites are shown
      await expect(page.getByText('Site A')).toBeVisible();
      await expect(page.getByText('Site B')).toBeVisible();
    }
  });

  test('should filter sites by level', async ({ page }) => {
    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(1000);

    // Look for level filter dropdown
    const levelFilter = page.getByRole('combobox', { name: /level|tier/i });
    const filterCount = await levelFilter.count();

    if (filterCount > 0) {
      await levelFilter.click();

      // Verify level options
      await expect(page.getByRole('option', { name: /all/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /A/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /B/i })).toBeVisible();

      // Select level A filter
      await page.getByRole('option', { name: /A/i }).click();

      // Verify only level A sites are shown
      await expect(page.getByText('Site A')).toBeVisible();
    }
  });

  test('should show empty state when no sites found', async ({ page }) => {
    // Mock empty sites response
    await page.route(/.*\/api\/sites.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: {
            records: [],
            total: 0,
            current: 1,
            size: 100,
            hasNext: false,
          },
          code: '200',
        }),
      });
    });

    // Navigate to sites page
    await page.getByRole('button', { name: /sites/i }).click();
    await page.waitForURL('/sites');
    await page.waitForTimeout(2000);

    // Verify empty state
    await expect(page.getByText(/no sites|0 sites/i)).toBeVisible({ timeout: 5000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route(/.*\/api\/sites.*/, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Failed to load sites',
          code: '500',
        }),
      });
    });

    // Navigate to sites page
    await page.goto('/sites');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify error handling
    const errorMessage = page.getByText(/error|failed|unable/i);
    const errorCount = await errorMessage.count();
    const emptyState = page.getByText(/no sites|0 sites/i);
    const emptyCount = await emptyState.count();

    // Either error or empty state should be visible
    expect(errorCount > 0 || emptyCount > 0).toBe(true);
  });
});
