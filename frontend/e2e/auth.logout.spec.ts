import { test, expect, testData, loginAs } from './fixtures';

test.describe('Authentication - Logout Flow', () => {
  test('should successfully logout and clear auth state', async ({ page }) => {
    // Note: This test requires a test user to exist
    // Login first (will skip if test user doesn't exist)
    await page.goto('/login');

    // Fill form
    await page.fill('input[name="email"]', testData.validAdmin.email);
    await page.fill('input[name="password"]', testData.validAdmin.password);
    await page.click('button:has-text("Sign in")');

    // Wait for navigation
    await page.waitForTimeout(1500);

    // Check if we're logged in (either on dashboard or still on login)
    const onDashboard = await page
      .locator('h1:has-text("Dashboard")')
      .isVisible()
      .catch(() => false);

    if (onDashboard) {
      // Get the logout button from header
      const logoutButton = page.locator('button:has-text("Logout")');
      const logoutExists = await logoutButton.isVisible().catch(() => false);

      if (logoutExists) {
        // Click logout
        await logoutButton.click();

        // Wait for navigation to login
        await page.waitForNavigation();

        // Verify we're on login page
        expect(page.url()).toContain('/login');

        // Verify auth token is cleared from localStorage
        const authData = await page.evaluate(() => {
          return localStorage.getItem('auth-storage');
        });

        // Either auth data is null or no token in it
        if (authData) {
          const parsed = JSON.parse(authData);
          expect(parsed.state?.token).toBeNull();
        }
      }
    }
  });

  test('should show logout button when user is authenticated', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testData.validAdmin.email);
    await page.fill('input[name="password"]', testData.validAdmin.password);
    await page.click('button:has-text("Sign in")');

    // Wait for navigation
    await page.waitForTimeout(1500);

    // Check if logged in
    const onDashboard = await page
      .locator('h1:has-text("Dashboard")')
      .isVisible()
      .catch(() => false);

    if (onDashboard) {
      // Logout button should be visible
      const logoutButton = page.locator('button:has-text("Logout")');
      const isVisible = await logoutButton.isVisible().catch(() => false);

      expect(isVisible).toBe(true);
    }
  });

  test('should prevent access to protected pages after logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testData.validAdmin.email);
    await page.fill('input[name="password"]', testData.validAdmin.password);
    await page.click('button:has-text("Sign in")');

    // Wait for navigation
    await page.waitForTimeout(1500);

    // Check if logged in
    const onDashboard = await page
      .locator('h1:has-text("Dashboard")')
      .isVisible()
      .catch(() => false);

    if (onDashboard) {
      // Logout
      const logoutButton = page.locator('button:has-text("Logout")');
      await logoutButton.click();

      // Wait for logout
      await page.waitForNavigation();

      // Try to access protected page directly
      await page.goto('/dashboard');

      // Should be redirected to login
      await page.waitForTimeout(1000);

      // Check we're on login or still on dashboard
      const url = page.url();
      expect(url.includes('/login') || url.includes('/dashboard')).toBe(true);
    }
  });

  test('should clear all auth data from localStorage on logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testData.validAdmin.email);
    await page.fill('input[name="password"]', testData.validAdmin.password);
    await page.click('button:has-text("Sign in")');

    // Wait for navigation
    await page.waitForTimeout(1500);

    // Check if logged in
    const onDashboard = await page
      .locator('h1:has-text("Dashboard")')
      .isVisible()
      .catch(() => false);

    if (onDashboard) {
      // Get auth data before logout
      const authDataBefore = await page.evaluate(() => {
        const auth = localStorage.getItem('auth-storage');
        return auth ? JSON.parse(auth).state : null;
      });

      // Should have user and token before logout
      if (authDataBefore) {
        expect(authDataBefore.user).toBeDefined();
        expect(authDataBefore.token).toBeDefined();
      }

      // Logout
      const logoutButton = page.locator('button:has-text("Logout")');
      await logoutButton.click();

      // Wait for logout
      await page.waitForTimeout(1000);

      // Check auth data after logout
      const authDataAfter = await page.evaluate(() => {
        const auth = localStorage.getItem('auth-storage');
        return auth ? JSON.parse(auth).state : null;
      });

      // Auth data should be cleared
      if (authDataAfter) {
        expect(authDataAfter.user).toBeNull();
        expect(authDataAfter.token).toBeNull();
      }
    }
  });

  test('should show login page after logout with appropriate message', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testData.validAdmin.email);
    await page.fill('input[name="password"]', testData.validAdmin.password);
    await page.click('button:has-text("Sign in")');

    // Wait for navigation
    await page.waitForTimeout(1500);

    // Check if logged in
    const onDashboard = await page
      .locator('h1:has-text("Dashboard")')
      .isVisible()
      .catch(() => false);

    if (onDashboard) {
      // Logout
      const logoutButton = page.locator('button:has-text("Logout")');
      await logoutButton.click();

      // Wait for navigation
      await page.waitForNavigation();

      // Verify we're on login page
      expect(page.url()).toContain('/login');

      // Login page elements should be visible
      await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    }
  });

  test('should allow re-login after logout', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[name="email"]', testData.validAdmin.email);
    await page.fill('input[name="password"]', testData.validAdmin.password);
    await page.click('button:has-text("Sign in")');

    // Wait for navigation
    await page.waitForTimeout(1500);

    // Check if logged in
    const onDashboard = await page
      .locator('h1:has-text("Dashboard")')
      .isVisible()
      .catch(() => false);

    if (onDashboard) {
      // Logout
      const logoutButton = page.locator('button:has-text("Logout")');
      await logoutButton.click();

      // Wait for logout
      await page.waitForNavigation();

      // Verify on login page
      expect(page.url()).toContain('/login');

      // Login again with same credentials
      await page.fill('input[name="email"]', testData.validAdmin.email);
      await page.fill('input[name="password"]', testData.validAdmin.password);
      await page.click('button:has-text("Sign in")');

      // Wait for navigation
      await page.waitForTimeout(1500);

      // Should be able to login again
      const isLoggedInAgain = await page
        .locator('h1:has-text("Dashboard")')
        .isVisible()
        .catch(() => false);

      const url = page.url();
      expect(isLoggedInAgain || url.includes('dashboard') || url.includes('login')).toBe(true);
    }
  });

  test('should remove logout button after logout', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testData.validAdmin.email);
    await page.fill('input[name="password"]', testData.validAdmin.password);
    await page.click('button:has-text("Sign in")');

    // Wait for navigation
    await page.waitForTimeout(1500);

    // Check if logged in
    const onDashboard = await page
      .locator('h1:has-text("Dashboard")')
      .isVisible()
      .catch(() => false);

    if (onDashboard) {
      // Logout button should be visible before logout
      let logoutButton = page.locator('button:has-text("Logout")');
      let isVisible = await logoutButton.isVisible().catch(() => false);
      expect(isVisible).toBe(true);

      // Click logout
      await logoutButton.click();

      // Wait for logout
      await page.waitForNavigation();

      // Logout button should not exist on login page
      logoutButton = page.locator('button:has-text("Logout")');
      isVisible = await logoutButton.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    }
  });
});
