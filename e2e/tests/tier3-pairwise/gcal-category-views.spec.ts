import { test, expect } from '@playwright/test';

test('Assign Categories to Google Calendar Events across Views', async ({ page }) => {
  await page.goto('/');

  // Sync a Google Calendar event (mocked through UI interactions)
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Integrations' }).click();
  await page.getByRole('button', { name: 'Connect Google Calendar' }).click();
  await expect(page.getByText('Connected to Google Calendar')).toBeVisible();

  // Navigate to Calendar and find an imported event
  await page.getByRole('link', { name: 'Calendar' }).click();
  const event = page.getByText('Team Meeting (GCal)');
  await event.click();

  // Assign custom category
  await page.getByRole('button', { name: 'Edit Event' }).click();
  await page.getByLabel('Category').selectOption('Work');
  await page.getByRole('button', { name: 'Save' }).click();

  // Switch between Month, Week, and Day views to ensure event retains label
  // Month View
  await page.getByRole('button', { name: 'Month' }).click();
  await expect(event).toHaveAttribute('data-category', 'Work');

  // Week View
  await page.getByRole('button', { name: 'Week' }).click();
  await expect(event).toHaveAttribute('data-category', 'Work');

  // Day View
  await page.getByRole('button', { name: 'Day' }).click();
  await expect(event).toHaveAttribute('data-category', 'Work');
});
