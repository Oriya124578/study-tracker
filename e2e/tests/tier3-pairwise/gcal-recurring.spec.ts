import { test, expect } from '@playwright/test';

test('Overlap Handling of GCal Events and Recurring Tasks', async ({ page }) => {
  await page.goto('/');

  // Create a recurring task overlapping with a known Google Calendar synced event
  await page.getByRole('button', { name: 'New Task' }).click();
  await page.getByLabel('Task Name').fill('Lunch Break');
  await page.getByLabel('Recurring').check();
  await page.getByLabel('Frequency').selectOption('Daily');
  await page.getByLabel('Time').fill('12:00');
  await page.getByRole('button', { name: 'Create Task' }).click();

  // Connect GCal
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Integrations' }).click();
  await page.getByRole('button', { name: 'Connect Google Calendar' }).click();

  // Verify UI handles visual overlap gracefully in Day view
  await page.getByRole('link', { name: 'Calendar' }).click();
  await page.getByRole('button', { name: 'Day' }).click();
  
  const gcalEvent = page.getByText('GCal Meeting (12:00 PM)');
  const recurringTask = page.getByText('Lunch Break');
  
  // Both should be visible and not completely obscure each other
  await expect(gcalEvent).toBeVisible();
  await expect(recurringTask).toBeVisible();
  
  // Check in Week view
  await page.getByRole('button', { name: 'Week' }).click();
  await expect(gcalEvent.first()).toBeVisible();
  await expect(recurringTask.first()).toBeVisible();
});
