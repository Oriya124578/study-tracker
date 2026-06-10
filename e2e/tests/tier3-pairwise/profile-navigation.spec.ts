import { test, expect } from '@playwright/test';

test('Persistent Profile Photo Sync across Routes', async ({ page }) => {
  await page.goto('/');

  // Sync profile photo
  await page.getByRole('button', { name: 'Profile' }).click();
  await page.getByRole('button', { name: 'Sync Avatar' }).click();
  
  const avatar = page.locator('.user-avatar');
  await expect(avatar).toHaveAttribute('src', /avatar-synced/);

  // Navigate rapidly through settings routes
  await page.getByRole('button', { name: 'Settings' }).click();
  
  const routes = ['Account', 'Preferences', 'Integrations', 'Notifications', 'Privacy', 'Security', 'Billing', 'Advanced'];
  
  for (const route of routes) {
    await page.getByRole('link', { name: route }).click();
    await expect(page.getByRole('heading', { name: route })).toBeVisible();
    await expect(avatar).toHaveAttribute('src', /avatar-synced/);
  }

  // Main application views
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(avatar).toHaveAttribute('src', /avatar-synced/);
  
  await page.getByRole('link', { name: 'Calendar' }).click();
  await expect(avatar).toHaveAttribute('src', /avatar-synced/);
});
