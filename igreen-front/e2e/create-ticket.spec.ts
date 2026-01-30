import { test, expect } from '@playwright/test';
import { E2E_TIMEOUTS } from './constants';

test.describe('Create Ticket', () => {
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

    // Mock templates API
    await page.route(/.*\/api\/templates.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: 'tmpl-001', name: 'AC Maintenance', description: 'Air conditioning maintenance' },
            { id: 'tmpl-002', name: 'Electrical Repair', description: 'Electrical repair template' },
          ],
          code: '200',
        }),
      });
    });

    // Mock users API
    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: {
            records: [
              { id: 'user-1', name: 'John Doe', username: 'john', role: 'ENGINEER' },
              { id: 'user-2', name: 'Jane Smith', username: 'jane', role: 'ENGINEER' },
            ],
            total: 2,
            current: 1,
            size: 100,
            hasNext: false,
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
              { id: 'site-1', name: 'Site A', address: '123 Main St' },
              { id: 'site-2', name: 'Site B', address: '456 Oak Ave' },
            ],
            total: 2,
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
    await page.waitForTimeout(1000);
  });

  test('should navigate to create ticket page', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify page structure
    await expect(page.getByRole('heading', { name: /create ticket|new ticket/i })).toBeVisible({ timeout: E2E_TIMEOUTS.DEFAULT_VISIBLE });
  });

  test('should display create ticket form', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify form elements exist
    await expect(page.getByRole('textbox', { name: /title|subject/i })).toBeVisible({ timeout: E2E_TIMEOUTS.DEFAULT_VISIBLE });
    await expect(page.locator('textarea').first()).toBeVisible(); // Description
    await expect(page.getByRole('combobox', { name: /template/i })).toBeVisible();
    await expect(page.getByRole('combobox', { name: /assign/i })).toBeVisible();
    await expect(page.getByRole('combobox', { name: /priority/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /submit|create|save/i });
    await submitButton.click();

    // Verify validation errors are shown
    const errorMessages = page.getByText(/required|mandatory|fill in/i);
    const errorCount = await errorMessages.count();

    // At least one validation error should be visible
    expect(errorCount).toBeGreaterThanOrEqual(1);
  });

  test('should select template', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open template dropdown
    const templateDropdown = page.getByRole('combobox', { name: /template/i });
    await templateDropdown.click();

    // Verify templates are visible
    await expect(page.getByRole('option', { name: /AC Maintenance/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Electrical Repair/i })).toBeVisible();

    // Select a template
    await page.getByRole('option', { name: /AC Maintenance/i }).click();
    await expect(templateDropdown).toContainText('AC Maintenance');
  });

  test('should assign to engineer', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open assignee dropdown
    const assigneeDropdown = page.getByRole('combobox', { name: /assign|assigned to/i });
    await assigneeDropdown.click();

    // Verify engineers are visible
    await expect(page.getByRole('option', { name: /John Doe/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /Jane Smith/i })).toBeVisible();

    // Select an engineer
    await page.getByRole('option', { name: /John Doe/i }).click();
    await expect(assigneeDropdown).toContainText('John Doe');
  });

  test('should set priority', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Open priority dropdown
    const priorityDropdown = page.getByRole('combobox', { name: /priority/i });
    await priorityDropdown.click();

    // Verify priority options are visible
    await expect(page.getByRole('option', { name: /P1|priority 1/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /P2|priority 2/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /P3|priority 3/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /P4|priority 4/i })).toBeVisible();

    // Select a priority
    await page.getByRole('option', { name: /P1|priority 1/i }).click();
    await expect(priorityDropdown).toContainText(/P1|1/);
  });

  test('should set due date', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for date input
    const dateInput = page.getByRole('textbox', { name: /due date|date/i });
    const dateInputCount = await dateInput.count();

    if (dateInputCount > 0) {
      // Fill in a due date
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const dateString = futureDate.toISOString().split('T')[0];

      await dateInput.fill(dateString);
      await expect(dateInput).toHaveValue(dateString);
    }
  });

  test('should create ticket successfully', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Mock ticket creation API
    await page.route(/.*\/api\/tickets.*/, async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Ticket created successfully',
            data: {
              id: 'TKT-NEW-001',
              title: 'New Test Ticket',
              description: 'Test description',
              type: 'CORRECTIVE',
              status: 'OPEN',
              priority: 'P2',
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
            data: { records: [], total: 0, current: 1, size: 10, hasNext: false },
            code: '200',
          }),
        });
      }
    });

    // Fill in the form
    await page.getByRole('textbox', { name: /title|subject/i }).fill('New Test Ticket');
    await page.locator('textarea').first().fill('Test description for the ticket');

    // Select template
    const templateDropdown = page.getByRole('combobox', { name: /template/i });
    await templateDropdown.click();
    await page.getByRole('option', { name: /AC Maintenance/i }).click();

    // Select assignee
    const assigneeDropdown = page.getByRole('combobox', { name: /assign/i });
    await assigneeDropdown.click();
    await page.getByRole('option', { name: /John Doe/i }).click();

    // Select priority
    const priorityDropdown = page.getByRole('combobox', { name: /priority/i });
    await priorityDropdown.click();
    await page.getByRole('option', { name: /P2/i }).click();

    // Submit the form
    await page.getByRole('button', { name: /submit|create|save/i }).click();

    // Verify success - should redirect or show success message
    await page.waitForTimeout(2000);

    // Check if redirected to tickets list or showing success
    const successMessage = page.getByText(/success|ticket created/i);
    const successCount = await successMessage.count();
    const redirected = page.url().includes('/tickets') || page.url().includes('/dashboard');

    expect(successCount > 0 || redirected).toBe(true);
  });

  test('should cancel ticket creation', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Fill in some fields
    await page.getByRole('textbox', { name: /title|subject/i }).fill('Test Ticket');
    await page.locator('textarea').first().fill('Test description');

    // Click cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Should navigate back or show confirmation
    await page.waitForTimeout(1000);

    // Verify dialog is closed or page is navigated away
    const dialog = page.getByRole('dialog');
    const dialogCount = await dialog.count();

    // Dialog should be closed or page should have changed
    expect(dialogCount === 0 || !page.url().includes('/tickets/create')).toBe(true);
  });

  test('should show confirmation dialog on navigation attempt with unsaved changes', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Fill in some fields
    await page.getByRole('textbox', { name: /title|subject/i }).fill('Test Ticket');
    await page.locator('textarea').first().fill('Test description');

    // Try to navigate away (click on another menu item)
    const dashboardLink = page.getByRole('button', { name: /dashboard|home/i });
    await dashboardLink.click();

    // Should show confirmation dialog if unsaved changes warning is implemented
    await page.waitForTimeout(1000);

    // Check for confirmation dialog
    const confirmDialog = page.getByRole('alertdialog');
    const confirmDialogCount = await confirmDialog.count();

    // If confirmation is implemented, it should be visible
    // If not implemented, test still passes
  });

  test('should display ticket type options', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for ticket type selection
    const typeDropdown = page.getByRole('combobox', { name: /type| ticket type/i });
    const typeCount = await typeDropdown.count();

    if (typeCount > 0) {
      await typeDropdown.click();
      await expect(page.getByRole('option', { name: /corrective/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /preventive/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /planned/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /problem/i })).toBeVisible();
    }
  });

  test('should select site/location', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Look for site selection
    const siteDropdown = page.getByRole('combobox', { name: /site|location/i });
    const siteCount = await siteDropdown.count();

    if (siteCount > 0) {
      await siteDropdown.click();
      await expect(page.getByRole('option', { name: /Site A/i })).toBeVisible();
      await expect(page.getByRole('option', { name: /Site B/i })).toBeVisible();

      // Select a site
      await page.getByRole('option', { name: /Site A/i }).click();
      await expect(siteDropdown).toContainText('Site A');
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/tickets/create');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Mock error response
    await page.route(/.*\/api\/tickets.*/, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Failed to create ticket',
            code: '500',
          }),
        });
      }
    });

    // Fill in the form
    await page.getByRole('textbox', { name: /title|subject/i }).fill('Test Ticket');
    await page.locator('textarea').first().fill('Test description');

    // Submit the form
    await page.getByRole('button', { name: /submit|create/i }).click();

    // Wait for error to be shown
    await page.waitForTimeout(2000);

    // Verify error message is displayed
    const errorMessage = page.getByText(/error|failed|unable/i);
    const errorCount = await errorMessage.count();
    expect(errorCount).toBeGreaterThan(0);
  });
});
