import { test, expect } from '@playwright/test';

test.describe('Workflow 1: Setup profile, create custom categories, and assign them to a recurring task', () => {
  test('should allow user to update profile photo, create categories and assign them to a new recurring task', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // 1. Setup profile (F4: Profile Photo Sync)
    await page.getByRole('link', { name: /settings/i }).click();
    await page.getByRole('link', { name: /profile/i }).click();
    const fileInput = page.locator('input[type="file"]');
    // Assuming user can upload a file, simulating an event or using setInputFiles
    // We just mock the UI interaction
    await fileInput.setInputFiles({
      name: 'profile.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content')
    });
    await page.getByRole('button', { name: /save profile/i }).click();
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible();

    // 2. Create custom categories (F1: Category Management)
    await page.getByRole('link', { name: /categories/i }).click();
    await page.getByRole('button', { name: /new category/i }).click();
    await page.getByLabel(/category name/i).fill('Morning Routine');
    await page.getByLabel(/color/i).fill('#ff0000');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText('Morning Routine')).toBeVisible();

    // 3. Assign to a recurring task (F2: Assign Categories to Tasks, F7: Recurring Tasks)
    await page.getByRole('link', { name: /tasks/i }).click();
    await page.getByRole('button', { name: /new task/i }).click();
    await page.getByLabel(/task name/i).fill('Drink Water');
    
    // Select recurring
    await page.getByLabel(/recurrence/i).selectOption('daily');
    
    // Assign category
    await page.getByLabel(/category/i).selectOption('Morning Routine');
    
    await page.getByRole('button', { name: /save task/i }).click();
    await expect(page.getByText(/task created successfully/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Drink Water' })).toBeVisible();
  });
});
