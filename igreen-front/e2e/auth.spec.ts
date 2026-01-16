import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByText('iGreen+ Ticket Management')).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Mock login API to handle validation
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

    await page.click('button[type="submit"]');

    // Check for validation error
    const errorText = page.getByText(/required/i);
    await expect(errorText).toBeVisible();
  });

  test('should successfully login and redirect to dashboard', async ({ page }) => {
    // Mock successful login
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

    // Mock current user API
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

    await page.getByLabel(/username/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await page.waitForURL('/dashboard');
    await expect(page.getByText(/Welcome Back/i)).toBeVisible();
  });

  test('should show error message on failed login', async ({ page }) => {
    // Mock failed login
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid credentials',
          code: '401',
        }),
      });
    });

    await page.getByLabel(/username/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });

  test('should toggle remember me checkbox', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: /remember me/i });

    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('should select country from dropdown', async ({ page }) => {
    const countryDropdown = page.getByRole('combobox');
    await countryDropdown.click();

    await expect(page.getByText('Thailand')).toBeVisible();
    await expect(page.getByText('Indonesia')).toBeVisible();
    await expect(page.getByText('Brazil')).toBeVisible();
    await expect(page.getByText('Mexico')).toBeVisible();

    await page.getByText('Indonesia').click();
    await expect(countryDropdown).toContainText('Indonesia');
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.getByRole('button', { name: /forgot password/i });
    await expect(forgotPasswordLink).toBeVisible();
  });
});
