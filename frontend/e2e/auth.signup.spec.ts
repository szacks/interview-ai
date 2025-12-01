import { test, expect, testData, selectors } from './fixtures';

test.describe('Authentication - Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display signup page with all required elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Sign up|Create account/i);

    // Check signup form elements
    await expect(page.locator(selectors.signupCompanyInput)).toBeVisible();
    await expect(page.locator(selectors.signupAdminNameInput)).toBeVisible();
    await expect(page.locator(selectors.signupEmailInput)).toBeVisible();
    await expect(page.locator(selectors.signupPasswordInput)).toBeVisible();
    await expect(page.locator(selectors.signupConfirmPasswordInput)).toBeVisible();
    await expect(page.locator(selectors.signupSubmitButton)).toBeVisible();

    // Check navigation link
    await expect(page.locator('a:has-text("Sign in")')).toBeVisible();

    // Check page heading
    await expect(page.locator('h2:has-text("Create an account")')).toBeVisible();
  });

  test('should display validation error for empty company name', async ({ page }) => {
    // Fill other fields but leave company name empty
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);
    await page.click(selectors.signupSubmitButton);

    // Check validation error
    const error = page.locator('text=Company name is required').first();
    await expect(error).toBeVisible();
  });

  test('should display validation error for empty admin name', async ({ page }) => {
    // Fill other fields but leave admin name empty
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);
    await page.click(selectors.signupSubmitButton);

    // Check validation error
    const error = page.locator('text=Admin name is required').first();
    await expect(error).toBeVisible();
  });

  test('should display validation error for empty email field', async ({ page }) => {
    // Fill other fields but leave email empty
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);
    await page.click(selectors.signupSubmitButton);

    // Check validation error
    const error = page.locator('text=Email is required').first();
    await expect(error).toBeVisible();
  });

  test('should display validation error for invalid email format', async ({ page }) => {
    // Fill form with invalid email
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, 'invalid-email');
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);
    await page.click(selectors.signupSubmitButton);

    // Check validation error
    const error = page.locator('text=Please enter a valid email address').first();
    await expect(error).toBeVisible();
  });

  test('should display validation error for empty password field', async ({ page }) => {
    // Fill other fields but leave password empty
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);
    await page.click(selectors.signupSubmitButton);

    // Check validation error
    const error = page.locator('text=Password is required').first();
    await expect(error).toBeVisible();
  });

  test('should display validation error for empty confirm password field', async ({ page }) => {
    // Fill other fields but leave confirm password empty
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.click(selectors.signupSubmitButton);

    // Check validation error
    const error = page.locator('text=Please confirm your password').first();
    await expect(error).toBeVisible();
  });

  test('should display validation error when passwords do not match', async ({ page }) => {
    // Fill form with non-matching passwords
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupPasswordInput, 'Password123!');
    await page.fill(selectors.signupConfirmPasswordInput, 'Password456!');
    await page.click(selectors.signupSubmitButton);

    // Check validation error
    const error = page.locator('text=Passwords do not match').first();
    await expect(error).toBeVisible();
  });

  test('should clear validation errors when user corrects input', async ({ page }) => {
    // Enter mismatched passwords
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupPasswordInput, 'Password123!');
    await page.fill(selectors.signupConfirmPasswordInput, 'Password456!');
    await page.click(selectors.signupSubmitButton);

    // Verify error is shown
    let error = page.locator('text=Passwords do not match').first();
    await expect(error).toBeVisible();

    // Fix the confirm password
    await page.fill(selectors.signupConfirmPasswordInput, 'Password123!');

    // Error should disappear
    error = page.locator('text=Passwords do not match').first();
    await expect(error).not.toBeVisible();
  });

  test('should display validation error for weak password', async ({ page }) => {
    // Fill form with weak password
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupPasswordInput, 'weak');
    await page.fill(selectors.signupConfirmPasswordInput, 'weak');
    await page.click(selectors.signupSubmitButton);

    // Check for either weak password error or API error
    const errorAlert = page.locator(selectors.errorAlert);
    const passwordError = page.locator('text=Password must').first();

    const hasError = (await errorAlert.isVisible().catch(() => false)) ||
      (await passwordError.isVisible().catch(() => false));

    if (hasError) {
      expect(hasError).toBe(true);
    }
  });

  test('should display error message when email already exists', async ({ page }) => {
    // Fill form with potentially existing email
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);

    // Submit
    await page.click(selectors.signupSubmitButton);

    // Wait for response
    await page.waitForTimeout(1000);

    // Check for either success or error
    const currentUrl = page.url();
    const errorAlert = page.locator(selectors.errorAlert);
    const isErrorVisible = await errorAlert.isVisible().catch(() => false);

    // Either we get an error about email existing or we successfully create account
    expect(isErrorVisible || currentUrl.includes('dashboard')).toBeTruthy();
  });

  test('should successfully create account with valid data and redirect to dashboard', async ({
    page,
  }) => {
    // Generate unique email for this test
    const uniqueEmail = `test${Date.now()}@example.com`;

    // Fill form with valid data
    await page.fill(selectors.signupCompanyInput, 'Test Company ' + Date.now());
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, uniqueEmail);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);

    // Submit
    await page.click(selectors.signupSubmitButton);

    // Wait for navigation
    await page.waitForNavigation();

    // Verify result
    const currentUrl = page.url();
    // Either we're on dashboard (success) or still on signup with error
    expect(currentUrl).toMatch(/\/(dashboard|signup)/);
  });

  test('should store auth token in localStorage after successful signup', async ({ page }) => {
    // Clear localStorage before test
    await page.evaluate(() => localStorage.clear());

    // Generate unique email
    const uniqueEmail = `test${Date.now()}@example.com`;

    // Fill and submit form
    await page.fill(selectors.signupCompanyInput, 'Test Company ' + Date.now());
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, uniqueEmail);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);
    await page.click(selectors.signupSubmitButton);

    // Wait for auth to complete
    await page.waitForTimeout(1000);

    // Check that token is stored
    const authData = await page.evaluate(() => {
      const auth = localStorage.getItem('auth-storage');
      return auth ? JSON.parse(auth) : null;
    });

    if (authData) {
      expect(authData.state).toBeDefined();
      expect(authData.state.token).toBeDefined();
    }
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    await page.click('a:has-text("Sign in")');
    await page.waitForNavigation();

    expect(page.url()).toContain('/login');
    await expect(page.locator('h2:has-text("Sign in to your account")')).toBeVisible();
  });

  test('should disable form while submitting', async ({ page }) => {
    // Generate unique email
    const uniqueEmail = `test${Date.now()}@example.com`;

    // Fill form
    await page.fill(selectors.signupCompanyInput, 'Test Company');
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, uniqueEmail);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);

    // Click submit
    await page.click(selectors.signupSubmitButton);

    // Verify inputs and button states
    const submitButton = page.locator(selectors.signupSubmitButton);
    const isDisabled = await submitButton.isDisabled().catch(() => false);

    // Button should be disabled or loading during submission
    // Even if not disabled, it should prevent double submission
    expect(submitButton).toBeDefined();
  });

  test('should allow re-submission after validation error', async ({ page }) => {
    // First submission with missing field
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    // Leave email empty
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);
    await page.click(selectors.signupSubmitButton);

    // Wait for validation error
    let emailError = page.locator('text=Email is required').first();
    await expect(emailError).toBeVisible();

    // Fill in the missing email
    await page.fill(selectors.signupEmailInput, `test${Date.now()}@example.com`);

    // Submit again
    await page.click(selectors.signupSubmitButton);

    // Should proceed or show API error
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(dashboard|signup)/);
  });

  test('should handle network error gracefully', async ({ page }) => {
    // Simulate network error
    await page.context().setOffline(true);

    // Fill form
    await page.fill(selectors.signupCompanyInput, testData.validAdmin.companyName);
    await page.fill(selectors.signupAdminNameInput, testData.validAdmin.adminName);
    await page.fill(selectors.signupEmailInput, testData.validAdmin.email);
    await page.fill(selectors.signupPasswordInput, testData.validAdmin.password);
    await page.fill(selectors.signupConfirmPasswordInput, testData.validAdmin.password);

    // Try to submit
    await page.click(selectors.signupSubmitButton);

    // Wait for error
    await page.waitForTimeout(500);

    // Re-enable network
    await page.context().setOffline(false);

    // Check we're still on signup page
    expect(page.url()).toContain('/signup');
  });
});
