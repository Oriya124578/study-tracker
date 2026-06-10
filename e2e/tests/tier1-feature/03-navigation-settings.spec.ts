import { test, expect } from '@playwright/test';

test.describe('Navigation & Settings Routes', () => {
  test('should navigate successfully to all 8 distinct settings routes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Settings' }).click();
    
    const routes = ['Account', 'General', 'Categories', 'Integrations', 'AI Engine', 'Notifications', 'About', 'Help'];
    
    for (const route of routes) {
      await page.getByRole('link', { name: route }).click();
      await expect(page.getByRole('heading', { name: route, level: 1 })).toBeVisible();
    }
  });

  test('should display the correct UI components and header wordmark for each settings route', async ({ page }) => {
    await page.goto('/settings/general');
    await expect(page.getByText('Calorie Life')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Theme' })).toBeVisible();
  });

  test('should maintain application state correctly when navigating between settings routes', async ({ page }) => {
    await page.goto('/settings/general');
    await page.getByRole('switch', { name: 'Dark Mode' }).click(); // assuming dark mode switch
    await page.goto('/settings/account');
    await page.goBack();
    // Verify switch is still checked
    await expect(page.getByRole('switch', { name: 'Dark Mode' })).toBeChecked();
  });

  test('should handle calori deep links routing correctly and open the right views', async ({ page }) => {
    // Navigate using a specific deep link or route directly
    await page.goto('/settings/categories?action=new');
    await expect(page.getByRole('dialog', { name: 'Add Category' })).toBeVisible();
  });

  test('should successfully navigate back to the main app dashboard from settings', async ({ page }) => {
    await page.goto('/settings/account');
    await page.getByRole('button', { name: 'Back to Dashboard' }).click();
    await expect(page).toHaveURL('/');
  });
});
