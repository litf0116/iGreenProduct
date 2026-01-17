import { test, expect } from '@playwright/test';

test.describe('Settings Page - SLA Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

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

    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display SLA Configuration tab and items', async ({ page }) => {
    // Mock SLA configs API
    await page.route(/.*\/api\/configs\/sla-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { priority: 'P1', responseTimeMinutes: 30, completionTimeHours: 2 },
            { priority: 'P2', responseTimeMinutes: 120, completionTimeHours: 8 },
            { priority: 'P3', responseTimeMinutes: 240, completionTimeHours: 24 },
            { priority: 'P4', responseTimeMinutes: 480, completionTimeHours: 48 },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Verify SLA tab is displayed
    await expect(page.getByRole('tab', { name: /sla configuration/i })).toBeVisible();

    // Click on SLA Configuration tab
    await page.getByRole('tab', { name: /sla configuration/i }).click();

    // Verify table headers using columnheader role
    await expect(page.getByRole('columnheader', { name: /priority/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /response time/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /resolution time/i })).toBeVisible();

    // Verify SLA items are displayed with exact match for priority badges
    await expect(page.getByRole('cell', { name: 'P1' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'P2' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'P3' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'P4' })).toBeVisible();

    // Verify edit buttons exist (one per row) - use button with title or by locating all buttons in the table body
    const editButtons = page.locator('table tbody tr button');
    await expect(editButtons).toHaveCount(4);
  });

  test('should edit SLA configuration and update list', async ({ page }) => {
    // Mock initial SLA configs
    await page.route(/.*\/api\/configs\/sla-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { priority: 'P1', responseTimeMinutes: 30, completionTimeHours: 2 },
            { priority: 'P2', responseTimeMinutes: 120, completionTimeHours: 8 },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on SLA Configuration tab
    await page.getByRole('tab', { name: /sla configuration/i }).click();

    // Wait for table to load
    await expect(page.getByRole('cell', { name: 'P1' })).toBeVisible({ timeout: 5000 });

    // Click edit button for P1 row (first button in the P1 row)
    const p1Row = page.locator('table tbody tr').filter({ has: page.getByRole('cell', { name: 'P1' }) });
    await p1Row.locator('button').click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Edit SLA for P1')).toBeVisible();

    // Verify input fields exist (using spinbutton role for number inputs)
    const responseTimeInput = page.getByRole('dialog').getByRole('spinbutton').first();
    const completionTimeInput = page.getByRole('dialog').getByRole('spinbutton').nth(1);
    await expect(responseTimeInput).toBeVisible();
    await expect(completionTimeInput).toBeVisible();

    // Clear and enter new values
    await responseTimeInput.fill('45');
    await completionTimeInput.fill('4');

    // Mock save API - capture request and return updated data
    let capturedRequestBody: any = null;
    await page.route(/.*\/api\/configs\/sla-configs.*/, async (route) => {
      if (route.request().method() === 'POST') {
        capturedRequestBody = await route.request().postData();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              priority: 'P1',
              responseTimeMinutes: 45,
              completionTimeHours: 4,
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
            data: [
              { priority: 'P1', responseTimeMinutes: 45, completionTimeHours: 4 },
              { priority: 'P2', responseTimeMinutes: 120, completionTimeHours: 8 },
            ],
            code: '200',
          }),
        });
      }
    });

    // Click save button
    await page.getByRole('dialog').getByRole('button', { name: /save changes/i }).click();

    // Verify API was called with correct data
    expect(capturedRequestBody).not.toBeNull();
    const requestBody = JSON.parse(capturedRequestBody);
    expect(requestBody.priority).toBe('P1');
    expect(requestBody.responseTimeMinutes).toBe(45);
    expect(requestBody.completionTimeHours).toBe(4);

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify the list is updated
    const updatedP1Row = page.locator('table tbody tr').filter({ has: page.getByRole('cell', { name: 'P1' }) });
    await expect(updatedP1Row.locator('td').nth(1)).toContainText('45m');
    await expect(updatedP1Row.locator('td').nth(2)).toContainText('4h');
  });

  test('should cancel SLA edit without saving', async ({ page }) => {
    // Mock initial SLA configs
    await page.route(/.*\/api\/configs\/sla-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { priority: 'P2', responseTimeMinutes: 120, completionTimeHours: 8 },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on SLA Configuration tab
    await page.getByRole('tab', { name: /sla configuration/i }).click();

    // Wait for table to load
    await expect(page.getByRole('cell', { name: 'P2' })).toBeVisible({ timeout: 5000 });

    // Click edit button for P2 row (first button in the P2 row)
    const p2Row = page.locator('table tbody tr').filter({ has: page.getByRole('cell', { name: 'P2' }) });
    await p2Row.locator('button').click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Change values using spinbutton role
    const responseTimeInput = page.getByRole('dialog').getByRole('spinbutton').first();
    const completionTimeInput = page.getByRole('dialog').getByRole('spinbutton').nth(1);
    await responseTimeInput.fill('180');
    await completionTimeInput.fill('12');

    // Click cancel button
    await page.getByRole('dialog').getByRole('button', { name: /cancel/i }).click();

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify original values are still displayed
    const p2RowAfter = page.locator('table tbody tr').filter({ has: page.getByRole('cell', { name: 'P2' }) });
    await expect(p2RowAfter.locator('td').nth(1)).toContainText('120m');
    await expect(p2RowAfter.locator('td').nth(2)).toContainText('8h');
  });

  test('should switch between tabs on settings page', async ({ page }) => {
    // Mock all config APIs
    await page.route(/.*\/api\/configs\/sla-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [{ priority: 'P1', responseTimeMinutes: 30, completionTimeHours: 2 }],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/configs\/problem-types.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [{ id: '1', name: 'Hardware Failure', description: 'Hardware related issues' }],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/configs\/site-level-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [{ id: '1', levelName: 'VIP Level', description: 'VIP Sites', maxConcurrentTickets: 10, escalationTimeHours: 2 }],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Verify all tabs are visible
    await expect(page.getByRole('tab', { name: /sla configuration/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /problem types/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /site levels/i })).toBeVisible();

    // Click on Problem Types tab
    await page.getByRole('tab', { name: /problem types/i }).click();
    await expect(page.getByRole('cell', { name: 'Hardware Failure' })).toBeVisible({ timeout: 5000 });

    // Click on Site Levels tab
    await page.getByRole('tab', { name: /site levels/i }).click();
    await expect(page.getByRole('cell', { name: 'VIP Level' })).toBeVisible({ timeout: 5000 });

    // Click back on SLA Configuration tab
    await page.getByRole('tab', { name: /sla configuration/i }).click();
    await expect(page.getByRole('cell', { name: 'P1' })).toBeVisible({ timeout: 5000 });
  });

  // Problem Types Tests
  test('should load and display problem types data', async ({ page }) => {
    // Mock problem types API
    await page.route(/.*\/api\/configs\/problem-types.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', name: 'Hardware Failure', description: 'Hardware related issues' },
            { id: '2', name: 'Software Bug', description: 'Software application bugs' },
            { id: '3', name: 'Network Issue', description: 'Network connectivity problems' },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on Problem Types tab
    await page.getByRole('tab', { name: /problem types/i }).click();

    // Verify table headers
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /description/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /actions/i })).toBeVisible();

    // Verify problem types are displayed
    await expect(page.getByRole('cell', { name: 'Hardware Failure' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Software Bug' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Network Issue' })).toBeVisible();

    // Verify edit and delete buttons exist
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(3);
  });

  test('should add new problem type', async ({ page }) => {
    // Mock initial problem types
    await page.route(/.*\/api\/configs\/problem-types.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', name: 'Hardware Failure', description: 'Hardware related issues' },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on Problem Types tab
    await page.getByRole('tab', { name: /problem types/i }).click();

    // Wait for table to load
    await expect(page.getByRole('cell', { name: 'Hardware Failure' })).toBeVisible({ timeout: 5000 });

    // Click Add Type button
    await page.getByRole('button', { name: /add type/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add Problem Type')).toBeVisible();

    // Get input fields using textbox role
    const nameInput = page.getByRole('dialog').getByRole('textbox').first();
    const descriptionInput = page.getByRole('dialog').getByRole('textbox').nth(1);
    await expect(nameInput).toBeVisible();
    await expect(descriptionInput).toBeVisible();

    // Mock create API
    let capturedRequestBody: any = null;
    let createApiCalled = false;
    await page.route(/.*\/api\/configs\/problem-types.*/, async (route) => {
      if (route.request().method() === 'POST') {
        capturedRequestBody = await route.request().postData();
        createApiCalled = true;
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              id: '2',
              name: 'Power Outage',
              description: 'Electrical power failure',
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
            data: [
              { id: '1', name: 'Hardware Failure', description: 'Hardware related issues' },
              { id: '2', name: 'Power Outage', description: 'Electrical power failure' },
            ],
            code: '200',
          }),
        });
      }
    });

    // Fill in the form
    await nameInput.fill('Power Outage');
    await descriptionInput.fill('Electrical power failure');

    // Click save button
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    // Wait for API call to complete
    await expect(async () => {
      expect(createApiCalled).toBe(true);
    }).toPass({ timeout: 5000 });

    // Verify API was called with correct data
    expect(capturedRequestBody).not.toBeNull();
    const requestBody = JSON.parse(capturedRequestBody);
    expect(requestBody.name).toBe('Power Outage');
    expect(requestBody.description).toBe('Electrical power failure');

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify new problem type is added to the list
    await expect(page.getByRole('cell', { name: 'Power Outage', exact: true })).toBeVisible();
  });

  test('should edit problem type', async ({ page }) => {
    // Mock initial problem types
    await page.route(/.*\/api\/configs\/problem-types.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', name: 'Hardware Failure', description: 'Hardware related issues' },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on Problem Types tab
    await page.getByRole('tab', { name: /problem types/i }).click();

    // Wait for table to load
    await expect(page.getByRole('cell', { name: 'Hardware Failure' })).toBeVisible({ timeout: 5000 });

    // Click edit button for Hardware Failure
    const row = page.locator('table tbody tr').filter({ has: page.getByRole('cell', { name: 'Hardware Failure' }) });
    await row.locator('button').first().click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Edit Problem Type')).toBeVisible();

    // Get input fields
    const nameInput = page.getByRole('dialog').getByRole('textbox').first();
    const descriptionInput = page.getByRole('dialog').getByRole('textbox').nth(1);

    // Verify existing values are populated
    await expect(nameInput).toHaveValue('Hardware Failure');
    await expect(descriptionInput).toHaveValue('Hardware related issues');

    // Mock update API
    let capturedRequestBody: any = null;
    await page.route(/.*\/api\/configs\/problem-types.*/, async (route) => {
      if (route.request().method() === 'POST') {
        capturedRequestBody = await route.request().postData();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              id: '1',
              name: 'Hardware Issue',
              description: 'Updated description',
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
            data: [
              { id: '1', name: 'Hardware Issue', description: 'Updated description' },
            ],
            code: '200',
          }),
        });
      }
    });

    // Update values
    await nameInput.fill('Hardware Issue');
    await descriptionInput.fill('Updated description');

    // Click save button
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    // Verify API was called
    expect(capturedRequestBody).not.toBeNull();
    const requestBody = JSON.parse(capturedRequestBody);
    expect(requestBody.name).toBe('Hardware Issue');
    expect(requestBody.description).toBe('Updated description');

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify the list is updated
    await expect(page.getByRole('cell', { name: 'Hardware Issue', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Updated description', exact: true })).toBeVisible();
  });

  test('should delete problem type', async ({ page }) => {
    // Mock initial problem types
    await page.route(/.*\/api\/configs\/problem-types.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', name: 'Hardware Failure', description: 'Hardware related issues' },
            { id: '2', name: 'Software Bug', description: 'Software application bugs' },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on Problem Types tab
    await page.getByRole('tab', { name: /problem types/i }).click();

    // Wait for table to load
    await expect(page.getByRole('cell', { name: 'Hardware Failure' })).toBeVisible({ timeout: 5000 });

    // Verify both items exist
    await expect(page.getByRole('cell', { name: 'Hardware Failure' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Software Bug' })).toBeVisible();

    // Click delete button for Hardware Failure (second button in the row)
    const row = page.locator('table tbody tr').filter({ has: page.getByRole('cell', { name: 'Hardware Failure' }) });
    await row.locator('button').nth(1).click();

    // Verify alert dialog opens
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText('Are you sure?')).toBeVisible();
    await expect(page.getByText(/permanently delete/i)).toBeVisible();

    // Mock delete API
    let deleteMethod = '';
    await page.route(/.*\/api\/configs\/problem-types.*/, async (route) => {
      if (route.request().method() === 'DELETE') {
        deleteMethod = 'DELETE';
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
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
            data: [
              { id: '2', name: 'Software Bug', description: 'Software application bugs' },
            ],
            code: '200',
          }),
        });
      }
    });

    // Click confirm delete
    await page.getByRole('alertdialog').getByRole('button', { name: /delete/i }).click();

    // Verify delete API was called
    expect(deleteMethod).toBe('DELETE');

    // Verify alert dialog is closed
    await expect(page.getByRole('alertdialog')).not.toBeVisible();

    // Verify the item is removed from the list
    await expect(page.getByRole('cell', { name: 'Hardware Failure' })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'Software Bug' })).toBeVisible();
  });

  // Site Levels Tests
  test('should load and display site levels data', async ({ page }) => {
    // Mock site levels API
    await page.route(/.*\/api\/configs\/site-level-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', levelName: 'VIPLevel', description: 'VIP Sites', maxConcurrentTickets: 10, escalationTimeHours: 2 },
            { id: '2', levelName: 'Standard', description: 'Regular sites', maxConcurrentTickets: 5, escalationTimeHours: 4 },
            { id: '3', levelName: 'Remote', description: 'Remote locations', maxConcurrentTickets: 3, escalationTimeHours: 8 },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on Site Levels tab
    await page.getByRole('tab', { name: /site levels/i }).click();

    // Verify table headers
    await expect(page.getByRole('columnheader', { name: /level name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /description/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /sla multiplier/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /actions/i })).toBeVisible();

    // Verify site levels are displayed using exact match
    await expect(page.getByRole('cell', { name: 'VIPLevel', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Standard', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Remote', exact: true })).toBeVisible();

    // Verify edit and delete buttons exist
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(3);
  });

  test('should add new site level', async ({ page }) => {
    // Mock initial site levels
    await page.route(/.*\/api\/configs\/site-level-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', levelName: 'VIPLevel', description: 'VIP Sites', maxConcurrentTickets: 10, escalationTimeHours: 2 },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on Site Levels tab
    await page.getByRole('tab', { name: /site levels/i }).click();

    // Wait for table to load
    await expect(page.getByRole('cell', { name: 'VIPLevel', exact: true })).toBeVisible({ timeout: 5000 });

    // Click Add Level button
    await page.getByRole('button', { name: /add level/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add Site Level')).toBeVisible();

    // Get input fields using textbox and spinbox roles
    const nameInput = page.getByRole('dialog').getByRole('textbox').first();
    const descriptionInput = page.getByRole('dialog').getByRole('textbox').nth(1);
    const maxTicketsInput = page.getByRole('dialog').getByRole('spinbutton').first();
    const escalationInput = page.getByRole('dialog').getByRole('spinbutton').nth(1);

    await expect(nameInput).toBeVisible();
    await expect(descriptionInput).toBeVisible();
    await expect(maxTicketsInput).toBeVisible();
    await expect(escalationInput).toBeVisible();

    // Mock create API
    let capturedRequestBody: any = null;
    await page.route(/.*\/api\/configs\/site-level-configs.*/, async (route) => {
      if (route.request().method() === 'POST') {
        capturedRequestBody = await route.request().postData();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              id: '2',
              levelName: 'Critical',
              description: 'Critical infrastructure sites',
              maxConcurrentTickets: 15,
              escalationTimeHours: 1,
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
            data: [
              { id: '1', levelName: 'VIPLevel', description: 'VIP Sites', maxConcurrentTickets: 10, escalationTimeHours: 2 },
              { id: '2', levelName: 'Critical', description: 'Critical infrastructure sites', maxConcurrentTickets: 15, escalationTimeHours: 1 },
            ],
            code: '200',
          }),
        });
      }
    });

    // Fill in the form
    await nameInput.fill('Critical');
    await descriptionInput.fill('Critical infrastructure sites');
    await maxTicketsInput.fill('15');
    await escalationInput.fill('1');

    // Click save button
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    // Verify API was called with correct data
    expect(capturedRequestBody).not.toBeNull();
    const requestBody = JSON.parse(capturedRequestBody);
    expect(requestBody.levelName).toBe('Critical');
    expect(requestBody.description).toBe('Critical infrastructure sites');
    expect(requestBody.maxConcurrentTickets).toBe(15);
    expect(requestBody.escalationTimeHours).toBe(1);

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify new site level is added to the list
    await expect(page.getByRole('cell', { name: 'Critical', exact: true })).toBeVisible();
  });

  test('should edit site level', async ({ page }) => {
    // Mock initial site levels
    await page.route(/.*\/api\/configs\/site-level-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', levelName: 'StandardLevel', description: 'Regular sites', maxConcurrentTickets: 5, escalationTimeHours: 4 },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on Site Levels tab
    await page.getByRole('tab', { name: /site levels/i }).click();

    // Wait for table to load
    await expect(page.getByRole('cell', { name: 'StandardLevel', exact: true })).toBeVisible({ timeout: 5000 });

    // Click edit button for Standard
    const row = page.locator('table tbody tr').filter({ has: page.getByRole('cell', { name: 'StandardLevel', exact: true }) });
    await row.locator('button').first().click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Edit Site Level')).toBeVisible();

    // Get input fields
    const nameInput = page.getByRole('dialog').getByRole('textbox').first();
    const descriptionInput = page.getByRole('dialog').getByRole('textbox').nth(1);
    const maxTicketsInput = page.getByRole('dialog').getByRole('spinbutton').first();
    const escalationInput = page.getByRole('dialog').getByRole('spinbutton').nth(1);

    // Mock update API
    let capturedRequestBody: any = null;
    await page.route(/.*\/api\/configs\/site-level-configs.*/, async (route) => {
      if (route.request().method() === 'POST') {
        capturedRequestBody = await route.request().postData();
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              id: '1',
              levelName: 'Premium',
              description: 'Premium tier sites',
              maxConcurrentTickets: 8,
              escalationTimeHours: 3,
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
            data: [
              { id: '1', levelName: 'Premium', description: 'Premium tier sites', maxConcurrentTickets: 8, escalationTimeHours: 3 },
            ],
            code: '200',
          }),
        });
      }
    });

    // Update values
    await nameInput.fill('Premium');
    await descriptionInput.fill('Premium tier sites');
    await maxTicketsInput.fill('8');
    await escalationInput.fill('3');

    // Click save button
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    // Verify API was called
    expect(capturedRequestBody).not.toBeNull();
    const requestBody = JSON.parse(capturedRequestBody);
    expect(requestBody.levelName).toBe('Premium');
    expect(requestBody.description).toBe('Premium tier sites');
    expect(requestBody.maxConcurrentTickets).toBe(8);
    expect(requestBody.escalationTimeHours).toBe(3);

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify the list is updated
    await expect(page.getByRole('cell', { name: 'Premium', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Premium tier sites', exact: true })).toBeVisible();
  });

  test('should delete site level', async ({ page }) => {
    // Mock initial site levels
    await page.route(/.*\/api\/configs\/site-level-configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', levelName: 'VIPLevel', description: 'VIP Sites', maxConcurrentTickets: 10, escalationTimeHours: 2 },
            { id: '2', levelName: 'Standard', description: 'Regular sites', maxConcurrentTickets: 5, escalationTimeHours: 4 },
          ],
          code: '200',
        }),
      });
    });

    // Navigate to settings page
    await page.getByRole('button', { name: /system settings/i }).click();
    await page.waitForURL('/settings');

    // Click on Site Levels tab
    await page.getByRole('tab', { name: /site levels/i }).click();

    // Wait for table to load
    await expect(page.getByRole('cell', { name: 'VIPLevel', exact: true })).toBeVisible({ timeout: 5000 });

    // Verify both items exist
    await expect(page.getByRole('cell', { name: 'VIPLevel', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Standard' })).toBeVisible();

    // Click delete button for VIPLevel (second button in the row)
    const row = page.locator('table tbody tr').filter({ has: page.getByRole('cell', { name: 'VIPLevel', exact: true }) });
    await row.locator('button').nth(1).click();

    // Verify alert dialog opens
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText('Are you sure?')).toBeVisible();
    await expect(page.getByText(/permanently delete/i)).toBeVisible();

    // Mock delete API
    let deleteMethod = '';
    await page.route(/.*\/api\/configs\/site-level-configs.*/, async (route) => {
      if (route.request().method() === 'DELETE') {
        deleteMethod = 'DELETE';
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
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
            data: [
              { id: '2', levelName: 'Standard', description: 'Regular sites', maxConcurrentTickets: 5, escalationTimeHours: 4 },
            ],
            code: '200',
          }),
        });
      }
    });

    // Click confirm delete
    await page.getByRole('alertdialog').getByRole('button', { name: /delete/i }).click();

    // Verify delete API was called
    expect(deleteMethod).toBe('DELETE');

    // Verify alert dialog is closed
    await expect(page.getByRole('alertdialog')).not.toBeVisible();

    // Verify the item is removed from the list
    await expect(page.getByRole('cell', { name: 'VIPLevel', exact: true })).not.toBeVisible();
    await expect(page.getByRole('cell', { name: 'Standard' })).toBeVisible();
  });
});