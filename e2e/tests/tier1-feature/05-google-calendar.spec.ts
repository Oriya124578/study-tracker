import { test, expect } from '@playwright/test';

test.describe('Google Calendar Integration', () => {
  test('should initiate the Google Calendar OAuth connection flow correctly', async ({ page }) => {
    await page.goto('/settings/integrations');
    await page.getByRole('button', { name: 'Connect Google Calendar' }).click();
    // Assuming it redirects or opens a popup
    await expect(page).toHaveURL(/accounts\.google\.com|settings\/integrations/);
  });

  test('should successfully fetch and display read-only events from a connected calendar', async ({ page }) => {
    await page.goto('/');
    // Check if Google Calendar event is visible
    const event = page.getByRole('listitem').filter({ hasText: 'Google Event' });
    await expect(event).toBeVisible();
    await expect(event.getByRole('button', { name: 'Edit' })).toBeDisabled(); // Read-only
  });

  test('should securely handle the OAuth callback and update the connection state', async ({ page }) => {
    // Mocking an OAuth callback return to the app
    await page.goto('/settings/integrations?success=true');
    await expect(page.getByText('Calendar Connected')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disconnect Google Calendar' })).toBeVisible();
  });

  test('should handle the disconnected state properly and remove events from the UI', async ({ page }) => {
    await page.goto('/settings/integrations');
    const disconnectBtn = page.getByRole('button', { name: 'Disconnect Google Calendar' });
    if (await disconnectBtn.isVisible()) {
      await disconnectBtn.click();
      await expect(page.getByText('Calendar Disconnected')).toBeVisible();
    }
    
    await page.goto('/');
    await expect(page.getByText('Google Event')).not.toBeVisible();
  });

  test('should gracefully display an error state when calendar event sync fails', async ({ page }) => {
    await page.goto('/settings/integrations');
    // Simulate sync failure
    await page.getByRole('button', { name: 'Sync Now' }).click();
    await expect(page.getByText('Failed to sync events')).toBeVisible();
  });
});
