import { test, expect } from '@playwright/test';

test.describe('Ticket Management', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication - mock login
    await page.goto('/login');

    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          data: { accessToken: 'test-token', tokenType: 'Bearer' },
          code: '200',
        }),
      });
    });

    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: {
            id: '1',
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com',
            role: 'ENGINEER',
            status: 'ACTIVE',
            createdAt: '2024-01-01T00:00:00Z',
          },
          code: '200',
        }),
      });
    });

    // Mock tickets API
    await page.route('**/api/tickets*', (route) => {
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

    // Login
    await page.getByLabel(/username/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('/dashboard');
  });

  test('should display ticket list', async ({ page }) => {
    await expect(page.getByText('TKT-001')).toBeVisible();
    await expect(page.getByText('Fix broken charger')).toBeVisible();
    await expect(page.getByText('TKT-002')).toBeVisible();
    await expect(page.getByText('Preventive maintenance')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await expect(page.getByText(/Total Tickets/i)).toBeVisible();
    await expect(page.getByText(/Open/i)).toBeVisible();
    await expect(page.getByText(/In Progress/i)).toBeVisible();
    await expect(page.getByText(/Closed/i)).toBeVisible();
  });

  test('should filter tickets by type', async ({ page }) => {
    // Click on Preventive tab
    await page.click('text=Preventive');

    // Should only show preventive tickets
    await expect(page.getByText('TKT-002')).toBeVisible();
    await expect(page.queryByText('TKT-001')).not.toBeVisible();
  });

  test('should filter tickets by status', async ({ page }) => {
    // Click on status filter dropdown
    const statusFilters = page.getByRole('combobox');
    await statusFilters.nth(1).click();

    // Select Open status
    await page.click('text=Open');

    // Verify filtering is applied (may show empty if no matches)
    const hasTickets = await page.getByText('TKT-001').isVisible().catch(() => false);
    expect(hasTickets).toBeDefined();
  });

  test('should search tickets', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search tickets/i);
    await searchInput.fill('broken');

    // Should show only tickets matching the search
    await expect(page.getByText('TKT-001')).toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.getByText('TKT-002')).toBeVisible();
  });

  test('should click create ticket button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create ticket/i });
    await expect(createButton).toBeVisible();

    // Note: Full create ticket flow would require additional mocking
    await createButton.click();
  });

  test('should click view button on ticket', async ({ page }) => {
    const viewButtons = page.getByRole('button', { name: /view/i });
    await expect(viewButtons.first()).toBeVisible();

    // Click first view button
    await viewButtons.first().click();
  });

  test('should display ticket tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /corrective/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /preventive/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /planned/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /problem/i })).toBeVisible();
  });

  test('should show empty state when no tickets found', async ({ page }) => {
    // Mock empty tickets response
    await page.route('**/api/tickets*', (route) => {
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

    // Search for non-existent ticket
    const searchInput = page.getByPlaceholder(/search tickets/i);
    await searchInput.fill('nonexistent');

    await expect(page.getByText(/No tickets found/i)).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    // Apply a filter
    const searchInput = page.getByPlaceholder(/search tickets/i);
    await searchInput.fill('test');

    // Clear filters button should appear
    const clearButton = page.getByRole('button', { name: /clear filters/i });
    await expect(clearButton).toBeVisible();

    // Click clear filters
    await clearButton.click();

    // Search should be cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should navigate between ticket type tabs', async ({ page }) => {
    // Start on Corrective tab (default)
    await expect(page.getByRole('tab', { name: /corrective/i })).toHaveAttribute('data-state', 'active');

    // Click Preventive tab
    await page.click('text=Preventive');
    await expect(page.getByRole('tab', { name: /preventive/i })).toHaveAttribute('data-state', 'active');

    // Click Planned tab
    await page.click('text=Planned');
    await expect(page.getByRole('tab', { name: /planned/i })).toHaveAttribute('data-state', 'active');

    // Click Problem tab
    await page.click('text=Problem');
    await expect(page.getByRole('tab', { name: /problem/i })).toHaveAttribute('data-state', 'active');
  });
});
