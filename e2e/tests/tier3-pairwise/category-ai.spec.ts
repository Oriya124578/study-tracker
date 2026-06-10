import { test, expect } from '@playwright/test';

test('Categorize Accepted AI Suggestions', async ({ page }) => {
  await page.goto('/');

  // Create a custom category first
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Categories' }).click();
  await page.getByRole('button', { name: 'New Category' }).click();
  await page.getByLabel('Category Name').fill('Wellness');
  await page.getByRole('button', { name: 'Save' }).click();

  // Receive AI suggestions and accept them
  await page.getByRole('button', { name: 'AI Assistant' }).click();
  await page.getByRole('button', { name: 'Suggest Tasks' }).click();
  await page.getByRole('button', { name: 'Accept "Meditate"' }).click();

  // Immediately assign custom category to the newly created task
  await page.getByRole('link', { name: 'Tasks' }).click();
  await page.getByText('Meditate').click();
  await page.getByRole('button', { name: 'Edit Task' }).click();
  await page.getByLabel('Category').selectOption('Wellness');
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify categories persist after reloading
  await page.reload();
  await page.getByRole('link', { name: 'Tasks' }).click();
  await expect(page.getByText('Meditate')).toBeVisible();
  await page.getByText('Meditate').click();
  await expect(page.getByLabel('Category')).toHaveValue('Wellness');
});
