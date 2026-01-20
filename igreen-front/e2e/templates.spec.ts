import { test, expect } from '@playwright/test';

test.describe('Template Management', () => {
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
            {
              id: 'tmpl-001',
              name: 'AC Maintenance',
              description: 'Air conditioning maintenance template',
              steps: [
                { id: 'step-1', name: 'Inspect Unit', description: 'Visual inspection', fields: [] },
              ],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: 'tmpl-002',
              name: 'Electrical Repair',
              description: 'Electrical repair template',
              steps: [],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
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

  test('should display template management page', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify page structure
    await expect(page.getByRole('heading', { name: /templates/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create template/i })).toBeVisible();
  });

  test('should display templates list', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify templates are displayed
    await expect(page.getByText('AC Maintenance')).toBeVisible();
    await expect(page.getByText('Electrical Repair')).toBeVisible();
    await expect(page.getByText('Air conditioning maintenance template')).toBeVisible();
    await expect(page.getByText('Electrical repair template')).toBeVisible();
  });

  test('should show template count', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify template count is displayed
    await expect(page.getByText(/2 templates/i)).toBeVisible();
  });

  test('should open create template dialog', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Click create template button
    await page.getByRole('button', { name: /create template/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /create template/i })).toBeVisible();

    // Verify form fields exist
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox').first()).toBeVisible(); // Template name
    await expect(dialog.locator('textarea').first()).toBeVisible(); // Description

    // Verify buttons exist
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

    // Close dialog
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should create new template with steps and fields', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Mock templates API for creation
    await page.route(/.*\/api\/templates.*/, async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Template created successfully',
            data: {
              id: 'tmpl-003',
              name: 'Plumbing Repair',
              description: 'Plumbing repair template',
              steps: [
                {
                  id: 'step-new-1',
                  name: 'Initial Assessment',
                  description: 'Assess the problem',
                  fields: [
                    { id: 'field-1', name: 'Issue Description', type: 'text', required: true },
                  ],
                },
              ],
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
              {
                id: 'tmpl-001',
                name: 'AC Maintenance',
                description: 'Air conditioning maintenance template',
                steps: [{ id: 'step-1', name: 'Inspect Unit', description: 'Visual inspection', fields: [] }],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
              {
                id: 'tmpl-003',
                name: 'Plumbing Repair',
                description: 'Plumbing repair template',
                steps: [
                  {
                    id: 'step-new-1',
                    name: 'Initial Assessment',
                    description: 'Assess the problem',
                    fields: [{ id: 'field-1', name: 'Issue Description', type: 'text', required: true }],
                  },
                ],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
            ],
            code: '200',
          }),
        });
      }
    });

    // Click create template button
    await page.getByRole('button', { name: /create template/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill template details
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox').first().fill('Plumbing Repair');
    await dialog.locator('textarea').first().fill('Plumbing repair template');

    // Add a step
    await dialog.getByRole('button', { name: /add step/i }).click();

    // Wait for step to appear
    await expect(dialog.locator('input[placeholder*="Step Name"]').first()).toBeVisible({ timeout: 3000 });

    // Fill step details
    await dialog.locator('input[placeholder*="Step Name"]').first().fill('Initial Assessment');
    await dialog.locator('textarea[placeholder*="Step Description"]').fill('Assess the problem');

    // Add a field
    const fieldsSection = dialog.locator('text=Fields').locator('..').locator('..');
    await fieldsSection.locator('button').filter({ has: page.locator('svg.lucide-plus') }).click();

    // Fill field name
    await dialog.locator('input[placeholder="Field name"]').fill('Issue Description');

    // Set field as required
    await dialog.locator('label', { hasText: /required/i }).locator('..').locator('checkbox').check();

    // Click save
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Verify new template appears in list
    await expect(page.getByText('Plumbing Repair')).toBeVisible();
  });

  test('should edit existing template', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Click edit button on AC Maintenance template
    const acTemplate = page.getByText('AC Maintenance').locator('../..');
    await acTemplate.locator('button').filter({ has: page.locator('svg.lucide-edit') }).click();

    // Verify dialog opens with edit title
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /edit template/i })).toBeVisible();

    // Update template name
    await page.getByRole('dialog').getByRole('textbox').first().fill('AC Maintenance Updated');

    // Click save
    await page.getByRole('dialog').getByRole('button', { name: /save/i }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  test('should delete template with confirmation', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Mock delete API
    await page.route(/.*\/api\/templates.*/, async (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Template deleted successfully',
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
            data: [
              {
                id: 'tmpl-002',
                name: 'Electrical Repair',
                description: 'Electrical repair template',
                steps: [],
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
            ],
            code: '200',
          }),
        });
      }
    });

    // Click delete button on AC Maintenance template
    const acTemplate = page.getByText('AC Maintenance').locator('../..');
    await acTemplate.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).click();

    // Verify confirmation dialog appears
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await expect(page.getByText(/are you sure/i)).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: /delete/i }).click();

    // Verify dialog closes
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 5000 });

    // Verify template is removed
    await expect(page.getByText('AC Maintenance')).not.toBeVisible();
    await expect(page.getByText('Electrical Repair')).toBeVisible();
  });

  test('should add multiple steps to template', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Click create template button
    await page.getByRole('button', { name: /create template/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill basic info
    await page.getByRole('dialog').getByRole('textbox').first().fill('Multi-Step Template');
    await page.getByRole('dialog').locator('textarea').first().fill('Template with multiple steps');

    // Add first step
    await page.getByRole('dialog').getByRole('button', { name: /add step/i }).click();
    await page.getByRole('dialog').locator('input[placeholder*="Step Name"]').first().fill('Step 1');

    // Add second step
    await page.getByRole('dialog').getByRole('button', { name: /add step/i }).click();
    await page.getByRole('dialog').locator('input[placeholder*="Step Name"]').nth(1).fill('Step 2');

    // Add third step
    await page.getByRole('dialog').getByRole('button', { name: /add step/i }).click();
    await page.getByRole('dialog').locator('input[placeholder*="Step Name"]').nth(2).fill('Step 3');

    // Verify all steps are visible
    await expect(page.getByRole('dialog').locator('input[placeholder*="Step Name"]').first()).toHaveValue('Step 1');
    await expect(page.getByRole('dialog').locator('input[placeholder*="Step Name"]').nth(1)).toHaveValue('Step 2');
    await expect(page.getByRole('dialog').locator('input[placeholder*="Step Name"]').nth(2)).toHaveValue('Step 3');

    // Cancel dialog
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should display step count on template cards', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // AC Maintenance has 1 step (badge shows "1")
    const acTemplate = page.getByText('AC Maintenance').locator('../..');
    await expect(acTemplate.locator('text=1')).toBeVisible();

    // Electrical Repair has 0 steps (badge shows "0")
    const erTemplate = page.getByText('Electrical Repair').locator('../..');
    await expect(erTemplate.locator('text=0')).toBeVisible();
  });

  test('should show empty state when no templates', async ({ page }) => {
    // Mock empty templates response
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

    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify empty state
    await expect(page.getByText(/0 templates/i)).toBeVisible();
  });

  test('should switch between different field types', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    // Click create template button
    await page.getByRole('button', { name: /create template/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Add a step
    await page.getByRole('dialog').getByRole('button', { name: /add step/i }).click();

    // Add a field
    const dialog = page.getByRole('dialog');
    const addFieldButton = dialog.locator('button').filter({ has: page.locator('svg.lucide-plus') }).nth(1);
    await addFieldButton.click();

    // Open field type dropdown
    const selectTrigger = dialog.locator('[role="combobox"]').first();
    await selectTrigger.click();

    // Verify all field types are visible
    await expect(page.getByRole('option', { name: /text/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /number/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /date/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /location/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /photo/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /signature/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /face recognition/i })).toBeVisible();

    // Cancel dialog
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /cancel/i }).click();
  });

  test('should show step description and field details', async ({ page }) => {
    // Navigate directly to templates page
    await page.goto('/templates');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify template descriptions are displayed
    await expect(page.getByText('Air conditioning maintenance template')).toBeVisible();
    await expect(page.getByText('Electrical repair template')).toBeVisible();

    // Verify step names are displayed
    await expect(page.getByText('1. Inspect Unit')).toBeVisible();
  });
});
