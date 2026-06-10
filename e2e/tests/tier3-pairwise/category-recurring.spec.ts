import { test, expect } from '@playwright/test';

test('Edit and Delete Category Assigned to a Recurring Task', async ({ page }) => {
  await page.goto('/');

  // Create a category
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Categories' }).click();
  await page.getByRole('button', { name: 'New Category' }).click();
  await page.getByLabel('Category Name').fill('Fitness');
  await page.getByLabel('Color').fill('#ff0000');
  await page.getByRole('button', { name: 'Save' }).click();

  // Create a recurring task
  await page.getByRole('link', { name: 'Tasks' }).click();
  await page.getByRole('button', { name: 'New Task' }).click();
  await page.getByLabel('Task Name').fill('Morning Run');
  await page.getByLabel('Category').selectOption('Fitness');
  await page.getByLabel('Recurring').check();
  await page.getByLabel('Frequency').selectOption('Daily');
  await page.getByRole('button', { name: 'Create Task' }).click();

  // Modify the category color/name
  await page.getByRole('link', { name: 'Categories' }).click();
  await page.getByText('Fitness').click();
  await page.getByLabel('Category Name').fill('Cardio');
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify future instances update
  await page.getByRole('link', { name: 'Calendar' }).click();
  await expect(page.getByText('Morning Run').first()).toHaveAttribute('data-category', 'Cardio');

  // Delete the category
  await page.getByRole('link', { name: 'Categories' }).click();
  await page.getByText('Cardio').click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Confirm Delete' }).click();

  // Verify recurring instances handle the deleted reference gracefully
  await page.getByRole('link', { name: 'Calendar' }).click();
  await expect(page.getByText('Morning Run').first()).toBeVisible();
  await expect(page.getByText('Morning Run').first()).not.toHaveAttribute('data-category', 'Cardio');
});
