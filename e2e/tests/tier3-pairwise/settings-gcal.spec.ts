import { test, expect } from '@playwright/test';

test('Disconnect Google Calendar from Settings clears Events', async ({ page }) => {
  await page.goto('/');

  // Connect GCal and verify events populate
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Integrations' }).click();
  await page.getByRole('button', { name: 'Connect Google Calendar' }).click();
  
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByText('Team Standup (GCal)')).toBeVisible();

  // Navigate to settings, disconnect GCal
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Integrations' }).click();
  await page.getByRole('button', { name: 'Disconnect Google Calendar' }).click();
  await page.getByRole('button', { name: 'Confirm Disconnect' }).click();

  // Verify events immediately disappear from dashboard without page reload
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByText('Team Standup (GCal)')).toBeHidden();
});
