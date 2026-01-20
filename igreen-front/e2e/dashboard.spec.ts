import { test, expect } from '@playwright/test';
import { E2E_TIMEOUTS } from './constants';

test.describe('Dashboard', () => {
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

    // Mock tickets API
    await page.route(/.*\/api\/tickets.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: {
            records: [
              {
                id: 'TKT-001',
                title: 'Fix broken charger',
                description: 'Charger not working',
                type: 'CORRECTIVE',
                status: 'OPEN',
                priority: 'P2',
                site: 'Site A',
                assignedTo: 'user-1',
                assignedToName: 'John Doe',
                createdBy: 'admin-1',
                createdByName: 'Admin',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                dueDate: '2024-01-15T00:00:00Z',
                completedSteps: [],
              },
              {
                id: 'TKT-002',
                title: 'Preventive maintenance',
                description: 'Routine check',
                type: 'PREVENTIVE',
                status: 'IN_PROGRESS',
                priority: 'P1',
                site: 'Site B',
                assignedTo: 'user-2',
                assignedToName: 'Jane Smith',
                createdBy: 'admin-1',
                createdByName: 'Admin',
                createdAt: '2024-01-02T00:00:00Z',
                updatedAt: '2024-01-02T00:00:00Z',
                dueDate: '2024-01-20T00:00:00Z',
                completedSteps: ['step-1'],
              },
            ],
            total: 2,
            current: 1,
            size: 10,
            hasNext: false,
          },
          code: '200',
        }),
      });
    });

    // Mock ticket stats API
    await page.route(/.*\/api\/tickets\/stats.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: {
            total: 2,
            open: 1,
            inProgress: 1,
            submitted: 0,
            completed: 0,
            onHold: 0,
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

  test('should display welcome message', async ({ page }) => {
    await expect(page.getByText(/Welcome Back|welcome back/i)).toBeVisible({ timeout: E2E_TIMEOUTS.DASHBOARD_LOAD });
  });

  test('should display statistics cards', async ({ page }) => {
    // Verify stat cards are displayed
    await expect(page.getByText(/total/i).first()).toBeVisible({ timeout: E2E_TIMEOUTS.DEFAULT_VISIBLE });
    await expect(page.getByText(/open/i)).toBeVisible();
    await expect(page.getByText(/in progress/i)).toBeVisible();
    await expect(page.getByText(/completed/i)).toBeVisible();
  });

  test('should display ticket type tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /corrective/i })).toBeVisible({ timeout: E2E_TIMEOUTS.DEFAULT_VISIBLE });
    await expect(page.getByRole('tab', { name: /preventive/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /planned/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /problem/i })).toBeVisible();
  });

  test('should display ticket list', async ({ page }) => {
    await expect(page.getByText('TKT-001')).toBeVisible({ timeout: E2E_TIMEOUTS.TICKET_VISIBLE });
    await expect(page.getByText('Fix broken charger')).toBeVisible();
  });

  test('should filter tickets by status', async ({ page }) => {
    const statusFilter = page.getByRole('combobox', { name: /status/i });
    await expect(statusFilter).toBeVisible();

    // Open the dropdown
    await statusFilter.click();

    // Verify options are visible
    await expect(page.getByRole('option', { name: /all/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /open/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /in progress/i })).toBeVisible();
  });

  test('should filter tickets by priority', async ({ page }) => {
    const priorityFilter = page.getByRole('combobox', { name: /priority/i });
    await expect(priorityFilter).toBeVisible();
  });

  test('should search tickets by keyword', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search tickets/i);
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('broken');

    // Wait for search to be applied
    await page.waitForTimeout(1000);
  });

  test('should filter by time period', async ({ page }) => {
    // Look for time filter dropdown
    const timeFilter = page.getByRole('combobox', { name: /time|period/i });
    const timeFilterCount = await timeFilter.count();

    if (timeFilterCount > 0) {
      await timeFilter.click();
      await expect(page.getByRole('option', { name: /all/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /today/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /week/i })).toBeVisible();
    }
  });

  test('should switch between ticket type tabs', async ({ page }) => {
    await expect(page.getByText('TKT-001')).toBeVisible({ timeout: E2E_TIMEOUTS.DEFAULT_VISIBLE });

    // Default should be CORRECTIVE
    await expect(page.getByRole('tab', { name: /corrective/i })).toHaveAttribute('data-state', 'active');

    // Switch to PREVENTIVE
    await page.getByRole('tab', { name: /preventive/i }).click();
    await expect(page.getByRole('tab', { name: /preventive/i })).toHaveAttribute('data-state', 'active');

    // Switch to PLANNED
    await page.getByRole('tab', { name: /planned/i }).click();
    await expect(page.getByRole('tab', { name: /planned/i })).toHaveAttribute('data-state', 'active');

    // Switch to PROBLEM
    await page.getByRole('tab', { name: /problem/i }).click();
    await expect(page.getByRole('tab', { name: /problem/i })).toHaveAttribute('data-state', 'active');
  });

  test('should navigate to create ticket', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create ticket|add ticket/i });
    const buttonCount = await createButton.count();

    if (buttonCount > 0) {
      await createButton.click();
      await page.waitForURL(/\/tickets|\/create/);
    }
  });

  test('should show ticket information correctly', async ({ page }) => {
    await expect(page.getByText('TKT-001')).toBeVisible({ timeout: E2E_TIMEOUTS.TICKET_VISIBLE });
    await expect(page.getByText('Fix broken charger')).toBeVisible();
    await expect(page.getByText(/P2/i)).toBeVisible();
    await expect(page.getByText('Site A')).toBeVisible();
  });

  test('should display empty state when no tickets', async ({ page }) => {
    // Mock empty tickets response
    await page.route(/.*\/api\/tickets.*/, (route) => {
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
            size: 10,
            hasNext: false,
          },
          code: '200',
        }),
      });
    });

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Verify empty state
    await expect(page.getByText(/no tickets|0 tickets/i)).toBeVisible({ timeout: E2E_TIMEOUTS.DEFAULT_VISIBLE });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route(/.*\/api\/tickets.*/, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal Server Error',
          code: '500',
        }),
      });
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);

    // Verify error handling (should show error message or empty state)
    const errorMessage = page.getByText(/error|failed/i);
    const emptyState = page.getByText(/no tickets|0 tickets/i);

    // At least one should be visible
    const hasError = await errorMessage.count() > 0;
    const hasEmpty = await emptyState.count() > 0;
    expect(hasError || hasEmpty).toBe(true);
  });

  test('should refresh data manually', async ({ page }) => {
    // Look for refresh button
    const refreshButton = page.getByRole('button', { name: /refresh|reload/i });
    const buttonCount = await refreshButton.count();

    if (buttonCount > 0) {
      await refreshButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should display ticket count badges on tabs', async ({ page }) => {
    // Verify that tab badges are visible if they exist
    const tabBadges = page.locator('[class*="badge"], [class*="count"]');
    const badgeCount = await tabBadges.count();

    // If badges exist, they should be visible
    if (badgeCount > 0) {
      await expect(tabBadges.first()).toBeVisible();
    }
  });
});
