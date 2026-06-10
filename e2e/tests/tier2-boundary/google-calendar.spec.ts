import { test, expect } from '@playwright/test';

test.describe('Google Calendar Integration - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/integrations/google-calendar');
  });

  test('should gracefully handle Google Calendar authentication timeout or rejection', async ({ page }) => {
    await page.click('button:has-text("Connect Google Calendar")');
    await expect(page.locator('text=Authentication failed or timed out')).toBeVisible();
  });

  test('should correctly handle syncing an event with an extremely long title and description', async ({ page }) => {
    await page.goto('/calendar');
    await page.click('button:has-text("New Event")');
    await page.fill('input[name="title"]', 'A'.repeat(500));
    await page.fill('textarea[name="description"]', 'B'.repeat(10000));
    await page.click('button:has-text("Save to Google Calendar")');
    await expect(page.locator('text=Event synced successfully')).toBeVisible();
  });

  test('should handle rate limits (429 Too Many Requests) gracefully during mass sync', async ({ page }) => {
    await page.goto('/integrations/google-calendar');
    await page.click('button:has-text("Sync All Events")');
    await page.route('**/api/calendar/sync', route => {
        route.fulfill({ status: 429, body: 'Too Many Requests' });
    });
    await expect(page.locator('text=Sync paused due to rate limits. Retrying shortly.')).toBeVisible();
  });

  test('should handle syncing a calendar with zero events', async ({ page }) => {
    await page.click('button:has-text("Sync Calendar")');
    await expect(page.locator('text=No new events to sync')).toBeVisible();
  });

  test('should handle simultaneous offline creation of events and conflicting Google Calendar sync', async ({ page }) => {
    await page.context().setOffline(true);
    await page.goto('/calendar');
    await page.click('button:has-text("New Event")');
    await page.fill('input[name="title"]', 'Offline Event');
    await page.click('button:has-text("Save")');
    
    await page.context().setOffline(false);
    await page.click('button:has-text("Sync Calendar")');
    await expect(page.locator('text=Conflict detected').or(page.locator('text=Event synced successfully'))).toBeVisible();
  });
});
