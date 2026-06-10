import { test, expect } from '@playwright/test';

test('Verify Recurring Tasks across all 5 Calendar Views', async ({ page }) => {
  await page.goto('/');

  // Create a daily and a weekly recurring task
  await page.getByRole('button', { name: 'New Task' }).click();
  await page.getByLabel('Task Name').fill('Daily Reading');
  await page.getByLabel('Recurring').check();
  await page.getByLabel('Frequency').selectOption('Daily');
  await page.getByRole('button', { name: 'Create Task' }).click();

  await page.getByRole('button', { name: 'New Task' }).click();
  await page.getByLabel('Task Name').fill('Weekly Review');
  await page.getByLabel('Recurring').check();
  await page.getByLabel('Frequency').selectOption('Weekly');
  await page.getByRole('button', { name: 'Create Task' }).click();

  await page.getByRole('link', { name: 'Calendar' }).click();

  // Day View
  await page.getByRole('button', { name: 'Day' }).click();
  await expect(page.getByText('Daily Reading').first()).toBeVisible();

  // Week View
  await page.getByRole('button', { name: 'Week' }).click();
  await expect(page.getByText('Daily Reading').first()).toBeVisible();
  await expect(page.getByText('Weekly Review').first()).toBeVisible();

  // Month View
  await page.getByRole('button', { name: 'Month' }).click();
  await expect(page.getByText('Daily Reading').first()).toBeVisible();
  await expect(page.getByText('Weekly Review').first()).toBeVisible();

  // Schedule View
  await page.getByRole('button', { name: 'Schedule' }).click();
  await expect(page.getByText('Daily Reading').first()).toBeVisible();
  await expect(page.getByText('Weekly Review').first()).toBeVisible();

  // Agenda View
  await page.getByRole('button', { name: 'Agenda' }).click();
  await expect(page.getByText('Daily Reading').first()).toBeVisible();
  await expect(page.getByText('Weekly Review').first()).toBeVisible();
});
