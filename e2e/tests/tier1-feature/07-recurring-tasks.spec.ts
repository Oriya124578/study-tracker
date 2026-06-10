import { test, expect } from '@playwright/test';

test.describe('Recurring Tasks', () => {
  test('should create a recurring task with a specific interval and type', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'New Task' }).click();
    await page.getByRole('textbox', { name: 'Task Title' }).fill('Weekly Team Sync');
    
    await page.getByRole('button', { name: 'Repeat' }).click();
    await page.getByRole('option', { name: 'Weekly' }).click();
    
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    await expect(page.getByText('Weekly Team Sync')).toBeVisible();
    await expect(page.locator('.recurring-icon')).toBeVisible();
  });

  test('should correctly generate and display future instances of a recurring task in the calendar', async ({ page }) => {
    await page.goto('/');
    // Check next week view
    await page.getByRole('button', { name: 'Next Week' }).click();
    
    await expect(page.getByText('Weekly Team Sync')).toBeVisible();
  });

  test('should allow editing a single specific instance of a recurring task without affecting others', async ({ page }) => {
    await page.goto('/');
    const task = page.getByText('Weekly Team Sync').first();
    await task.click();
    
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('textbox', { name: 'Task Title' }).fill('Weekly Team Sync (Updated)');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    const dialog = page.getByRole('dialog', { name: 'Edit Recurring Task' });
    await dialog.getByRole('button', { name: 'This event only' }).click();
    
    await expect(page.getByText('Weekly Team Sync (Updated)')).toBeVisible();
  });

  test('should allow editing all future instances of a recurring task from a given point', async ({ page }) => {
    await page.goto('/');
    const task = page.getByText('Weekly Team Sync').first();
    await task.click();
    
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('textbox', { name: 'Task Title' }).fill('Weekly Sync V2');
    await page.getByRole('button', { name: 'Save Task' }).click();
    
    const dialog = page.getByRole('dialog', { name: 'Edit Recurring Task' });
    await dialog.getByRole('button', { name: 'This and following events' }).click();
    
    await expect(page.getByText('Weekly Sync V2')).toBeVisible();
  });

  test('should delete all subsequent instances when a recurring task series is terminated', async ({ page }) => {
    await page.goto('/');
    const task = page.getByText('Weekly Sync V2').first();
    await task.click();
    
    await page.getByRole('button', { name: 'Delete' }).click();
    
    const dialog = page.getByRole('dialog', { name: 'Delete Recurring Task' });
    await dialog.getByRole('button', { name: 'This and following events' }).click();
    
    await expect(page.getByText('Weekly Sync V2')).not.toBeVisible();
  });
});
