import { test, expect } from '@playwright/test';

test.describe('Assign Categories to Tasks', () => {
  test('should allow assigning an existing category to a new task via a select modal or chips', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Task Title' }).fill('Task with Category');
    
    await page.getByRole('button', { name: 'Assign Category' }).click();
    await page.getByRole('button', { name: 'Work' }).click();
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    await expect(page.getByText('Task with Category')).toBeVisible();
    await expect(page.getByText('Work')).toBeVisible();
  });

  test('should update a task to add or remove category assignments', async ({ page }) => {
    await page.goto('/');
    const task = page.getByRole('listitem').filter({ hasText: 'Existing Task' });
    await task.click(); // Open task details
    
    await page.getByRole('button', { name: 'Assign Category' }).click();
    await page.getByRole('button', { name: 'Personal' }).click();
    
    // Close modal or save
    await page.getByRole('button', { name: 'Close' }).click();
    
    await expect(page.getByText('Personal')).toBeVisible();
  });

  test('should display the correct category chips on a categorized task in the list', async ({ page }) => {
    await page.goto('/');
    const task = page.getByRole('listitem').filter({ hasText: 'Categorized Task' });
    await expect(task.getByText('Work')).toBeVisible();
  });

  test('should persist category assignments after a page reload', async ({ page }) => {
    await page.goto('/');
    // Assuming task is created with category 'Personal'
    await page.reload();
    const task = page.getByRole('listitem').filter({ hasText: 'Task with Category' });
    await expect(task.getByText('Personal')).toBeVisible();
  });

  test('should handle tasks with multiple categories assigned correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Task Title' }).fill('Multi-category Task');
    
    await page.getByRole('button', { name: 'Assign Category' }).click();
    await page.getByRole('button', { name: 'Work' }).click();
    await page.getByRole('button', { name: 'Personal' }).click();
    
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    const task = page.getByRole('listitem').filter({ hasText: 'Multi-category Task' });
    await expect(task.getByText('Work')).toBeVisible();
    await expect(task.getByText('Personal')).toBeVisible();
  });
});
