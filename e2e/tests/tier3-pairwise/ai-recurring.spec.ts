import { test, expect } from '@playwright/test';

test('Accept AI Suggestion for a Recurring Task', async ({ page }) => {
  await page.goto('/');

  // Trigger an AI suggestion
  await page.getByRole('button', { name: 'AI Assistant' }).click();
  await page.getByRole('button', { name: 'Suggest Habits' }).click();
  
  // Accept it
  const suggestion = page.getByText('Drink 2L Water (Daily)');
  await expect(suggestion).toBeVisible();
  await suggestion.locator('..').getByRole('button', { name: 'Accept' }).click();

  // Verify the correct recurring sequence is generated in the calendar
  await page.getByRole('link', { name: 'Calendar' }).click();
  await page.getByRole('button', { name: 'Week' }).click();
  
  const tasks = page.locator('text=Drink 2L Water');
  // At least 7 instances in a week view
  expect(await tasks.count()).toBeGreaterThanOrEqual(7);
});
