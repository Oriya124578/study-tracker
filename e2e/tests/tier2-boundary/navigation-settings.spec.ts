import { test, expect } from '@playwright/test';

test.describe('Navigation & 8 Settings Routes - Boundary & Corner Cases', () => {
  test('should handle rapid switching between all 8 settings routes continuously', async ({ page }) => {
    await page.goto('/settings');
    const routes = ['Profile', 'Account', 'Preferences', 'Notifications', 'Privacy', 'Security', 'Integrations', 'Billing'];
    for (let i = 0; i < 3; i++) {
        for (const route of routes) {
            await page.click(`text=${route}`);
        }
    }
    await expect(page.locator('text=Billing')).toBeVisible();
  });

  test('should maintain settings form state when navigating away and immediately back', async ({ page }) => {
    await page.goto('/settings/profile');
    await page.fill('input[name="bio"]', 'Temporary bio text');
    await page.click('text=Notifications');
    await page.click('text=Profile');
    await expect(page.locator('input[name="bio"]')).toHaveValue('Temporary bio text');
  });

  test('should handle deep-linking directly to a non-existent settings route (404/redirect)', async ({ page }) => {
    await page.goto('/settings/non-existent-route');
    await expect(page.locator('text=Page not found').or(page.locator('text=Settings'))).toBeVisible();
  });

  test('should gracefully handle network interruption while saving settings', async ({ page }) => {
    await page.goto('/settings/preferences');
    await page.context().setOffline(true);
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Network error, please try again')).toBeVisible();
    await page.context().setOffline(false);
  });

  test('should correctly render very long text inputs in settings fields without breaking layout', async ({ page }) => {
    await page.goto('/settings/profile');
    const longText = 'a'.repeat(5000);
    await page.fill('textarea[name="description"]', longText);
    await page.click('button:has-text("Save")');
    const bbox = await page.locator('textarea[name="description"]').boundingBox();
    expect(bbox?.width).toBeLessThan(2000);
  });
});
