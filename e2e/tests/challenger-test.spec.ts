import { test, expect } from '@playwright/test';

test('Verify /settings/categories navigation', async ({ page }) => {
  // Go to the deep link
  await page.goto('/settings/categories');
  
  // The app takes some time to load due to mock delays or auth
  // Wait for the SettingsView to appear. We can look for the BackButton or the Header.
  await page.waitForTimeout(2000);
  
  // Since it might bounce, wait until URL stabilizes
  await expect(page).toHaveURL(/\/settings\/categories/);
  
  // Verify it's actually showing the categories settings
  // The word "קטגוריות תיוג" should be visible (Hebrew for Category Management)
  const isHebrew = await page.getByText('קטגוריות תיוג').isVisible();
  expect(isHebrew).toBe(true);
});
