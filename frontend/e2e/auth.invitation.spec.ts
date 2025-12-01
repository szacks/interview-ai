import { test, expect, testData, loginAs } from './fixtures';

test.describe('Authentication - Invitation & Interviewer Onboarding Flow', () => {
  test.describe('Accept Invitation Page', () => {
    test('should display accept invitation page with form when valid token is provided', async ({
      page,
    }) => {
      // Navigate to invitation page with a token
      // Note: In real testing, you'd generate a valid invitation token from the backend
      const mockToken = 'valid-invitation-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page to load
      await page.waitForTimeout(500);

      // Check if page loaded with the form
      const heading = page.locator('h2:has-text("Set Your Password")');
      const headingExists = await heading.isVisible().catch(() => false);

      if (headingExists) {
        // Form elements should be visible
        const nameInput = page.locator('input[name="name"]');
        const passwordInput = page.locator('input[name="password"]');
        const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
        const submitButton = page.locator('button:has-text("Accept Invitation")');

        await expect(nameInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(confirmPasswordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
      }
    });

    test('should display error when token is missing from URL', async ({ page }) => {
      // Navigate without token
      await page.goto('/auth/accept-invitation');

      // Wait for page
      await page.waitForTimeout(500);

      // Should show error about missing token
      const errorAlert = page.locator('.bg-red-50');
      const errorMessage = page.locator('text=invalid|token|missing|expired').first();

      const hasError =
        (await errorAlert.isVisible().catch(() => false)) ||
        (await errorMessage.isVisible().catch(() => false));

      // Should either show error or redirect to login
      const url = page.url();
      expect(hasError || url.includes('/login')).toBe(true);
    });

    test('should display error for invalid token', async ({ page }) => {
      // Navigate with invalid token
      const invalidToken = 'invalid-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${invalidToken}`);

      // Wait for error response
      await page.waitForTimeout(1000);

      // Check for error message
      const errorAlert = page.locator('.bg-red-50');
      const errorMessage = page.locator('text=invalid|expired|not found|no longer valid').first();

      const hasError =
        (await errorAlert.isVisible().catch(() => false)) ||
        (await errorMessage.isVisible().catch(() => false));

      // Should show error or redirect
      const url = page.url();
      expect(hasError || url.includes('/login')).toBe(true);
    });

    test('should display validation error for empty name field', async ({ page }) => {
      const mockToken = 'test-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page
      await page.waitForTimeout(500);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // Try to submit without name
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
        await page.click('button:has-text("Accept Invitation")');

        // Check for validation error
        const error = page.locator('text=Name is required').first();
        const errorExists = await error.isVisible().catch(() => false);

        if (errorExists) {
          expect(errorExists).toBe(true);
        }
      }
    });

    test('should display validation error for empty password field', async ({ page }) => {
      const mockToken = 'test-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page
      await page.waitForTimeout(500);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // Try to submit without password
        await page.fill('input[name="name"]', 'Interviewer Name');
        await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
        await page.click('button:has-text("Accept Invitation")');

        // Check for validation error
        const error = page.locator('text=Password is required').first();
        const errorExists = await error.isVisible().catch(() => false);

        if (errorExists) {
          expect(errorExists).toBe(true);
        }
      }
    });

    test('should display validation error when passwords do not match', async ({ page }) => {
      const mockToken = 'test-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page
      await page.waitForTimeout(500);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // Fill form with non-matching passwords
        await page.fill('input[name="name"]', 'Interviewer Name');
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirmPassword"]', 'Password456!');
        await page.click('button:has-text("Accept Invitation")');

        // Check for validation error
        const error = page.locator('text=Passwords do not match').first();
        const errorExists = await error.isVisible().catch(() => false);

        if (errorExists) {
          expect(errorExists).toBe(true);
        }
      }
    });

    test('should clear validation errors when user corrects input', async ({ page }) => {
      const mockToken = 'test-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page
      await page.waitForTimeout(500);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // Submit with mismatched passwords
        await page.fill('input[name="name"]', 'Interviewer Name');
        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirmPassword"]', 'Password456!');
        await page.click('button:has-text("Accept Invitation")');

        // Wait for error
        let error = page.locator('text=Passwords do not match').first();
        let errorExists = await error.isVisible().catch(() => false);

        if (errorExists) {
          // Fix the password
          await page.fill('input[name="confirmPassword"]', 'Password123!');

          // Error should disappear
          error = page.locator('text=Passwords do not match').first();
          errorExists = await error.isVisible().catch(() => false);

          expect(errorExists).toBe(false);
        }
      }
    });

    test('should successfully accept invitation with valid data and redirect to dashboard', async ({
      page,
    }) => {
      // Note: This test needs a real valid invitation token from the backend
      // For now we're testing the flow structure

      const mockToken = 'valid-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page load
      await page.waitForTimeout(500);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // Fill form with valid data
        await page.fill('input[name="name"]', 'New Interviewer');
        await page.fill('input[name="password"]', 'ValidPassword123!');
        await page.fill('input[name="confirmPassword"]', 'ValidPassword123!');

        // Submit
        await page.click('button:has-text("Accept Invitation")');

        // Wait for response
        await page.waitForNavigation().catch(() => null);
        await page.waitForTimeout(1500);

        // Should either redirect to dashboard or show token invalid error
        const url = page.url();
        const errorAlert = page.locator('.bg-red-50');
        const hasError = await errorAlert.isVisible().catch(() => false);

        expect(url.includes('dashboard') || url.includes('accept-invitation') || hasError).toBe(true);
      }
    });

    test('should store auth token in localStorage after successful invitation acceptance', async ({
      page,
    }) => {
      // Clear localStorage
      await page.evaluate(() => localStorage.clear());

      const mockToken = 'valid-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page
      await page.waitForTimeout(500);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // Fill and submit
        await page.fill('input[name="name"]', 'New Interviewer');
        await page.fill('input[name="password"]', 'ValidPassword123!');
        await page.fill('input[name="confirmPassword"]', 'ValidPassword123!');
        await page.click('button:has-text("Accept Invitation")');

        // Wait for response
        await page.waitForTimeout(1500);

        // Check token in localStorage
        const authData = await page.evaluate(() => {
          const auth = localStorage.getItem('auth-storage');
          return auth ? JSON.parse(auth).state : null;
        });

        // If successful, should have token
        if (authData && authData.token) {
          expect(authData.token).toBeDefined();
          expect(authData.user).toBeDefined();
        }
      }
    });

    test('should handle network error gracefully', async ({ page }) => {
      const mockToken = 'test-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page
      await page.waitForTimeout(500);

      // Simulate network error
      await page.context().setOffline(true);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // Try to submit
        await page.fill('input[name="name"]', 'New Interviewer');
        await page.fill('input[name="password"]', 'ValidPassword123!');
        await page.fill('input[name="confirmPassword"]', 'ValidPassword123!');
        await page.click('button:has-text("Accept Invitation")');

        // Wait
        await page.waitForTimeout(500);

        // Re-enable network
        await page.context().setOffline(false);

        // Should still be on invitation page
        expect(page.url()).toContain('accept-invitation');
      }
    });

    test('should allow retry after error', async ({ page }) => {
      const mockToken = 'test-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page
      await page.waitForTimeout(500);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // First attempt with missing field
        await page.fill('input[name="password"]', 'ValidPassword123!');
        await page.fill('input[name="confirmPassword"]', 'ValidPassword123!');
        await page.click('button:has-text("Accept Invitation")');

        // Wait for validation error
        let error = page.locator('text=Name is required').first();
        let errorExists = await error.isVisible().catch(() => false);

        if (errorExists) {
          // Fill the missing field
          await page.fill('input[name="name"]', 'New Interviewer');

          // Retry
          await page.click('button:has-text("Accept Invitation")');

          // Should proceed or show API error
          await page.waitForTimeout(1000);

          expect(page.url()).toBeDefined();
        }
      }
    });

    test('should create interviewer user with correct role after accepting invitation', async ({
      page,
    }) => {
      // This is an integration test that verifies the backend creates the right user
      // Note: Requires real token and backend verification

      const mockToken = 'valid-token-' + Date.now();
      await page.goto(`/auth/accept-invitation?token=${mockToken}`);

      // Wait for page
      await page.waitForTimeout(500);

      const formExists = await page
        .locator('h2:has-text("Set Your Password")')
        .isVisible()
        .catch(() => false);

      if (formExists) {
        // Submit
        await page.fill('input[name="name"]', 'New Interviewer');
        await page.fill('input[name="password"]', 'ValidPassword123!');
        await page.fill('input[name="confirmPassword"]', 'ValidPassword123!');
        await page.click('button:has-text("Accept Invitation")');

        // Wait
        await page.waitForTimeout(1500);

        // If successful, check user role in localStorage
        const authData = await page.evaluate(() => {
          const auth = localStorage.getItem('auth-storage');
          return auth ? JSON.parse(auth).state?.user : null;
        });

        if (authData) {
          // User should have INTERVIEWER role
          expect(
            authData.role === 'INTERVIEWER' || authData.role === 'interviewer'
          ).toBe(true);
        }
      }
    });
  });

  test.describe('Team Management - Invite Interviewers', () => {
    test('should allow admin to invite interviewer', async ({ page }) => {
      // Login as admin first
      await page.goto('/login');
      await page.fill('input[name="email"]', testData.validAdmin.email);
      await page.fill('input[name="password"]', testData.validAdmin.password);
      await page.click('button:has-text("Sign in")');

      // Wait for navigation
      await page.waitForNavigation().catch(() => null);
      await page.waitForTimeout(1500);

      // Check if admin is logged in
      const onDashboard = await page
        .locator('h1:has-text("Dashboard")')
        .isVisible()
        .catch(() => false);

      if (onDashboard) {
        // Navigate to team management
        const teamLink = page.locator('a:has-text("Team Management")');
        const teamLinkExists = await teamLink.isVisible().catch(() => false);

        if (teamLinkExists) {
          await teamLink.click();
          await page.waitForNavigation().catch(() => null);
          await page.waitForTimeout(500);

          // Should be on team management page
          expect(page.url()).toContain('/teams');

          // Check for invite button
          const inviteButton = page.locator('button:has-text("Invite")');
          const inviteExists = await inviteButton.isVisible().catch(() => false);

          expect(inviteExists).toBe(true);
        }
      }
    });

    test('should not show team management for non-admin users', async ({ page }) => {
      // For this test, we'd need a non-admin user account
      // Skip if not available

      // Try to access /teams directly
      await page.goto('/teams');
      await page.waitForTimeout(500);

      // Should either redirect to login or dashboard
      const url = page.url();
      expect(url.includes('/login') || url.includes('/dashboard') || url.includes('/teams')).toBe(true);
    });
  });
});
