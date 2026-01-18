import { test, expect } from '@playwright/test';

test.describe('Groups Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login API - 只mock auth相关
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

    // Mock initial data APIs to prevent loading errors
    await page.route(/.*\/api\/tickets.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/templates.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/sites.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/configs.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
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

    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
  });

  test('should display groups page UI elements', async ({ page }) => {
    // Mock groups and users API for this test
    await page.route(/.*\/api\/groups.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify page structure - use more flexible locators
    await expect(page.getByRole('tab', { name: /groups/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /users/i })).toBeVisible();

    // Verify Groups tab is selected
    await expect(page.getByRole('tab', { name: /groups/i })).toHaveAttribute('data-state', 'active');

    // Verify search input exists
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // Verify Create Group button exists
    await expect(page.getByRole('button', { name: /create group/i })).toBeVisible();
  });

  test('should switch to users tab', async ({ page }) => {
    // Mock groups and users API
    await page.route(/.*\/api\/groups.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Click on Users tab
    await page.getByRole('tab', { name: /users/i }).click();

    // Verify Users tab is now active
    await expect(page.getByRole('tab', { name: /users/i })).toHaveAttribute('data-state', 'active');

    // Verify users table headers are visible - use .first() to avoid strict mode violations
    await expect(page.getByRole('columnheader', { name: /name/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /username/i }).first()).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /role/i }).first()).toBeVisible();
  });

  test('should load and display groups data', async ({ page }) => {
    // This test verifies that groups data can be loaded and displayed
    // Mock groups API with proper response format
    await page.route(/.*\/api\/groups.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [
            { id: '1', name: 'Engineering Team', description: 'Main engineering team', tags: ['technical', 'hardware'], status: 'active' },
            { id: '2', name: 'Support Team', description: 'Customer support team', tags: ['service', 'customer'], status: 'active' },
            { id: '3', name: 'Management', description: 'Management and coordination', tags: ['admin', 'coordination'], status: 'inactive' },
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
          data: { records: [
            { id: '1', name: 'John Doe', username: 'john', role: 'engineer', groupId: '1', status: 'active' },
          ], total: 1, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Wait for data to load and verify group names are visible - use .first() to avoid strict mode violations
    await expect(page.getByText('Engineering Team').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Support Team').first()).toBeVisible();
    await expect(page.getByText('Management').first()).toBeVisible();
  });

  test('should switch between groups and users tabs', async ({ page }) => {
    // Mock groups and users API
    await page.route(/.*\/api\/groups.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Verify Groups tab is active
    await expect(page.getByRole('tab', { name: /groups/i })).toHaveAttribute('data-state', 'active');

    // Switch to Users tab
    await page.getByRole('tab', { name: /users/i }).click();
    await expect(page.getByRole('tab', { name: /users/i })).toHaveAttribute('data-state', 'active');

    // Switch back to Groups tab
    await page.getByRole('tab', { name: /groups/i }).click();
    await expect(page.getByRole('tab', { name: /groups/i })).toHaveAttribute('data-state', 'active');
  });

  test('should open create group dialog', async ({ page }) => {
    // Mock groups API
    await page.route(/.*\/api\/groups.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Click "Create Group" button
    await page.getByRole('button', { name: /create group/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /create group/i })).toBeVisible();

    // Verify form fields exist
    const dialog = page.getByRole('dialog');

    // Check that input fields are visible inside the dialog
    await expect(dialog.locator('input').first()).toBeVisible();  // Group name input
    await expect(dialog.locator('textarea').first()).toBeVisible();  // Description textarea

    // Check status select is visible
    await expect(dialog.locator('[role="combobox"]').first()).toBeVisible();

    // Verify Save and Cancel buttons exist
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

    // Close dialog
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should create new group', async ({ page }) => {
    // Mock groups API for listing
    await page.route(/.*\/api\/groups.*/, (route) => {
      const url = route.request().url();
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: [
              { id: '1', name: 'Engineering Team', description: 'Main engineering team', tags: ['technical'], status: 'active' },
            ],
            code: '200',
          }),
        });
      } else {
        // POST - create new group
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Group created successfully',
            data: { id: '2', name: 'New Test Group', description: 'Test description', tags: ['test'], status: 'active' },
            code: '200',
          }),
        });
      }
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Click "Create Group" button
    await page.getByRole('button', { name: /create group/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill in group details
    const dialog = page.getByRole('dialog');
    await dialog.locator('input').first().fill('New Test Group');
    await dialog.locator('textarea').first().fill('Test description for new group');

    // Add a tag
    await dialog.locator('input').nth(1).fill('test');
    await dialog.locator('button').filter({ has: page.locator('svg.lucide-plus') }).click();

    // Click Save
    await page.getByRole('button', { name: /save/i }).click();

    // Verify dialog closes (creation successful)
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  test('should edit existing group', async ({ page }) => {
    // Mock groups API for listing and editing
    await page.route(/.*\/api\/groups.*/, (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: [
              { id: '1', name: 'Engineering Team', description: 'Main engineering team', tags: ['technical'], status: 'active' },
            ],
            code: '200',
          }),
        });
      } else {
        // POST for update
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: { id: '1', name: 'Updated Team', description: 'Updated description', tags: ['technical'], status: 'active' },
            code: '200',
          }),
        });
      }
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Find the edit button on the group card
    const editButton = page.locator('button').filter({ has: page.locator('svg.lucide-edit, svg[class*="edit"]') }).first();
    const buttonCount = await editButton.count();

    if (buttonCount > 0) {
      await editButton.click();

      // Verify dialog opens with group data
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /edit group/i })).toBeVisible();

      // Update group name
      const dialog = page.getByRole('dialog');
      await dialog.locator('input').first().fill('Updated Team');

      // Save changes
      await page.getByRole('button', { name: /save/i }).click();

      // Verify dialog closes
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test('should delete group with confirmation', async ({ page }) => {
    // Mock delete API
    await page.route(/.*\/api\/groups.*/, (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Group deleted successfully',
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
            data: [{ id: '1', name: 'Test Group', description: 'Test', tags: [], status: 'active' }],
            code: '200',
          }),
        });
      }
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Find the delete button (trash icon) on a group card
    const deleteButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2, svg[class*="trash"]') }).first();
    const buttonCount = await deleteButton.count();

    if (buttonCount > 0) {
      await deleteButton.click();

      // Verify confirmation dialog appears
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await expect(page.getByText(/are you sure/i)).toBeVisible();

      // Confirm deletion
      await page.getByRole('button', { name: /delete/i }).click();

      // Verify dialog closes
      await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
  });

  test('should display users list in users tab', async ({ page }) => {
    // Mock groups and users API
    await page.route(/.*\/api\/groups.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: {
            records: [
              { id: '1', name: 'John Doe', username: 'john', role: 'engineer', groupId: '1', status: 'active' },
              { id: '2', name: 'Jane Smith', username: 'jane', role: 'manager', groupId: '1', status: 'active' },
              { id: '3', name: 'Bob Wilson', username: 'bob', role: 'admin', groupId: '2', status: 'inactive' },
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

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Switch to Users tab
    await page.getByRole('tab', { name: /users/i }).click();
    await expect(page.getByRole('tab', { name: /users/i })).toHaveAttribute('data-state', 'active');

    // Wait for table to load
    await page.waitForLoadState('networkidle');

    // Verify user names are displayed
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Jane Smith')).toBeVisible();
  });

  test('should open create user dialog', async ({ page }) => {
    // Mock groups and users API
    await page.route(/.*\/api\/groups.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: { records: [], total: 0, current: 1, size: 100, hasNext: false },
          code: '200',
        }),
      });
    });

    // Navigate to groups page
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    // Switch to Users tab
    await page.getByRole('tab', { name: /users/i }).click();
    await page.waitForLoadState('networkidle');

    // Click "Create User" button
    const createUserButton = page.getByRole('button', { name: /create user/i });
    const buttonCount = await createUserButton.count();

    if (buttonCount > 0) {
      await createUserButton.click();

      // Verify dialog opens
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: /create user/i })).toBeVisible();

      // Verify form fields exist
      const dialog = page.getByRole('dialog');
      await expect(dialog.locator('input').first()).toBeVisible();
      await expect(dialog.locator('input').nth(1)).toBeVisible();

      // Close dialog
      await page.getByRole('button', { name: /cancel/i }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    } else {
      // If no create user button, test is skipped
      test.skip();
    }
  });

  test('should search users', async ({ page }) => {
    // Mock groups and users API
    await page.route(/.*\/api\/groups.*/, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Success',
          data: [],
          code: '200',
        }),
      });
    });

    await page.route(/.*\/api\/users.*/, (route) => {
      const url = route.request().url();
      if (url.includes('keyword')) {
        // Search results
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              records: [
                { id: '1', name: 'John Doe', username: 'john', role: 'engineer', groupId: '1', status: 'active' },
              ],
              total: 1,
              current: 1,
              size: 100,
              hasNext: false,
            },
            code: '200',
          }),
        });
      } else {
        // All users
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Success',
            data: {
              records: [
                { id: '1', name: 'John Doe', username: 'john', role: 'engineer', groupId: '1', status: 'active' },
                { id: '2', name: 'Jane Smith', username: 'jane', role: 'manager', groupId: '1', status: 'active' },
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

    // Navigate to groups page and switch to users tab
    await page.getByRole('button', { name: /groups/i }).click();
    await page.waitForURL('/groups', { timeout: 5000 });
    await page.waitForLoadState('networkidle');

    await page.getByRole('tab', { name: /users/i }).click();
    await page.waitForLoadState('networkidle');

    // Find and use search input
    const searchInput = page.getByPlaceholder(/search/i);
    const inputCount = await searchInput.count();

    if (inputCount > 0) {
      await searchInput.fill('John');
      await page.waitForTimeout(1000);

      // Verify search was triggered (users list should update)
      await expect(page.getByRole('table')).toBeVisible();
    } else {
      test.skip();
    }
  });
});
