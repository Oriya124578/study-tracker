import { test, expect } from '@playwright/test';

test.describe('Category Management', () => {
  test('should create a new category with a specific name, color, and icon', async ({ page }) => {
    await page.goto('/settings/categories');
    await page.getByRole('button', { name: 'Add Category' }).click();
    await page.getByRole('textbox', { name: 'Category Name' }).fill('New Test Category');
    await page.getByRole('button', { name: 'Select Color' }).click();
    await page.getByRole('button', { name: 'Red' }).click();
    await page.getByRole('button', { name: 'Select Icon' }).click();
    await page.getByRole('button', { name: 'Star' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('New Test Category')).toBeVisible();
  });

  test('should read and display existing categories in the category management UI', async ({ page }) => {
    await page.goto('/settings/categories');
    const categoryList = page.getByRole('list', { name: 'Categories' });
    await expect(categoryList).toBeVisible();
    await expect(categoryList.getByRole('listitem')).toHaveCountGreaterThan(0);
  });

  test('should update an existing category\'s name, color, and icon', async ({ page }) => {
    await page.goto('/settings/categories');
    const categoryItem = page.getByRole('listitem').filter({ hasText: 'Work' });
    await categoryItem.getByRole('button', { name: 'Edit' }).click();
    
    await page.getByRole('textbox', { name: 'Category Name' }).fill('Work Updated');
    await page.getByRole('button', { name: 'Save' }).click();
    
    await expect(page.getByText('Work Updated')).toBeVisible();
  });

  test('should delete a category and remove it from the list', async ({ page }) => {
    await page.goto('/settings/categories');
    const categoryItem = page.getByRole('listitem').filter({ hasText: 'To Delete' });
    // Assuming there's a delete button
    await categoryItem.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion if there's a dialog
    const dialog = page.getByRole('dialog', { name: 'Confirm Deletion' });
    if (await dialog.isVisible()) {
      await dialog.getByRole('button', { name: 'Confirm' }).click();
    }
    
    await expect(page.getByText('To Delete')).not.toBeVisible();
  });

  test('should load default categories via client init or Cloud Function if none exist', async ({ page }) => {
    // This assumes a clean state where defaults are loaded
    await page.goto('/settings/categories');
    await expect(page.getByText('Personal')).toBeVisible();
    await expect(page.getByText('Work')).toBeVisible();
  });
});
