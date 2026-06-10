import { test, expect } from '@playwright/test';

test.describe('Category Management (CRUD) - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/categories');
  });

  test('should reject category creation with empty name', async ({ page }) => {
    await page.click('button:has-text("Add Category")');
    await page.fill('input[name="categoryName"]', '');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Category name cannot be empty')).toBeVisible();
  });

  test('should reject category creation with name exceeding maximum length (e.g., 255 chars)', async ({ page }) => {
    await page.click('button:has-text("Add Category")');
    const longName = 'a'.repeat(256);
    await page.fill('input[name="categoryName"]', longName);
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Category name must be less than 255 characters')).toBeVisible();
  });

  test('should handle creating a category with special characters and emojis', async ({ page }) => {
    await page.click('button:has-text("Add Category")');
    const specialName = 'Food 🍔!@#$%^&*()_+';
    await page.fill('input[name="categoryName"]', specialName);
    await page.click('button:has-text("Save")');
    await expect(page.locator(`text=${specialName}`)).toBeVisible();
  });

  test('should reject creating a duplicate category name', async ({ page }) => {
    await page.click('button:has-text("Add Category")');
    await page.fill('input[name="categoryName"]', 'Duplicate');
    await page.click('button:has-text("Save")');
    
    await page.click('button:has-text("Add Category")');
    await page.fill('input[name="categoryName"]', 'Duplicate');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Category already exists')).toBeVisible();
  });

  test('should handle rapid consecutive category deletions (prevent double-delete race condition)', async ({ page }) => {
    const deleteButtons = page.locator('button[aria-label="Delete Category DeleteTest"]');
    if (await deleteButtons.count() > 0) {
        await Promise.all([
          deleteButtons.first().click(),
          deleteButtons.first().click(),
        ]);
        await expect(page.locator('text=Category deleted successfully')).toHaveCount(1);
    }
  });
});
