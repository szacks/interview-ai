import { test as base, expect } from '@playwright/test';

/**
 * Extended test fixtures for authentication testing
 * Provides common utilities and test data
 */

type AuthFixtures = {
  authenticatedPage: void;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to app
    await page.goto('/');

    // Wait for app to load
    await page.waitForLoadState('networkidle');

    // Check if already logged in
    const isLoggedIn = await page.evaluate(() => {
      return !!localStorage.getItem('auth-storage');
    });

    if (!isLoggedIn) {
      // You would need to set up a test user account first
      // For now, we'll skip authenticated tests if no user exists
      console.log('Warning: No authenticated user available for testing');
    }

    await use();
  },
});

/**
 * Test data fixtures
 */
export const testData = {
  // Test credentials
  validAdmin: {
    email: 'admin@example.com',
    password: 'TestPassword123!',
    companyName: 'Test Company',
    adminName: 'Admin User',
  },

  validInterviewer: {
    email: 'interviewer@example.com',
    password: 'TestPassword123!',
    name: 'Interviewer User',
  },

  invalidCredentials: {
    email: 'nonexistent@example.com',
    password: 'WrongPassword123!',
  },

  invalidEmail: {
    email: 'not-an-email',
    password: 'TestPassword123!',
  },

  passwordResetEmail: {
    email: 'admin@example.com',
  },
};

/**
 * Common test selectors
 */
export const selectors = {
  // Login page
  loginEmailInput: 'input[name="email"]',
  loginPasswordInput: 'input[name="password"]',
  loginSubmitButton: 'button:has-text("Sign in")',
  forgotPasswordLink: 'a:has-text("Forgot password")',
  signupLink: 'a:has-text("Sign up")',

  // Signup page
  signupCompanyInput: 'input[name="companyName"]',
  signupAdminNameInput: 'input[name="adminName"]',
  signupEmailInput: 'input[name="email"]',
  signupPasswordInput: 'input[name="password"]',
  signupConfirmPasswordInput: 'input[name="confirmPassword"]',
  signupSubmitButton: 'button:has-text("Create Account")',

  // Dashboard
  dashboardTitle: 'h1:has-text("Dashboard")',
  logoutButton: 'button:has-text("Logout")',
  sidebarTeamLink: 'a:has-text("Team Management")',

  // Error messages
  errorAlert: '.bg-red-50',
  fieldError: '.text-red-600',
};

/**
 * Common helper functions
 */
export async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Sign in")');
  await page.waitForNavigation();
}

export async function logout(page: any) {
  await page.click('button:has-text("Logout")');
  await page.waitForNavigation();
}

export async function fillLoginForm(page: any, email: string, password: string) {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
}

export async function fillSignupForm(
  page: any,
  companyName: string,
  adminName: string,
  email: string,
  password: string,
  confirmPassword: string
) {
  await page.fill('input[name="companyName"]', companyName);
  await page.fill('input[name="adminName"]', adminName);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', confirmPassword);
}

export { expect };
