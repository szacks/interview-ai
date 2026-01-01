import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  // Basic check that the page loads without errors
  await expect(page).not.toHaveTitle(/Error/);
});
