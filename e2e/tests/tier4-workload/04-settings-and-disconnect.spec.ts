import { test, expect } from '@playwright/test';

test.describe('Workflow 4: Navigate through all settings routes, updating profile photo, and disconnecting Google Calendar', () => {
  test('should verify 8 settings routes, upload photo, and disconnect calendar', async ({ page }) => {
    await page.goto('/');

    // 1. Navigate to Settings (F3: Navigation & 8 Settings Routes)
    await page.getByRole('link', { name: /settings/i }).click();

    // Verify all 8 routes
    const routes = [
      'Profile',
      'Account',
      'Appearance',
      'Notifications',
      'Integrations',
      'Privacy',
      'Data Export',
      'About'
    ];

    for (const route of routes) {
      const link = page.getByRole('link', { name: new RegExp(route, 'i') });
      await link.click();
      await expect(page.getByRole('heading', { name: new RegExp(route, 'i') })).toBeVisible();
    }

    // 2. Update profile photo (F4: Profile Photo Sync)
    await page.getByRole('link', { name: /profile/i }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'new_avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-png-content')
    });
    await page.getByRole('button', { name: /save profile/i }).click();
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible();

    // 3. Disconnect Google Calendar (F5: Google Calendar Integration)
    await page.getByRole('link', { name: /integrations/i }).click();
    
    const disconnectBtn = page.getByRole('button', { name: /disconnect google calendar/i });
    if (await disconnectBtn.isVisible()) {
      await disconnectBtn.click();
      
      // Confirm disconnect
      await page.getByRole('button', { name: /confirm disconnect/i }).click();
      
      await expect(page.getByText(/google calendar disconnected/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /connect google calendar/i })).toBeVisible();
    } else {
      // It's already disconnected or button isn't found
      await expect(page.getByRole('button', { name: /connect google calendar/i })).toBeVisible();
    }
  });
});
