import { test, expect } from '@playwright/test';

test.describe('Assign Categories to Tasks - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks');
  });

  test('should handle assigning the maximum allowed number of categories to a single task', async ({ page }) => {
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="taskName"]', 'Multi-category Task');
    
    for (let i = 1; i <= 10; i++) {
        await page.click('button:has-text("Assign Category")');
        await page.click(`text=Category ${i}`);
    }
    
    await page.click('button:has-text("Assign Category")');
    await expect(page.locator('text=Maximum number of categories reached')).toBeVisible();
  });

  test('should correctly handle deleting a category that is currently assigned to a task', async ({ page }) => {
    await page.goto('/categories');
    await page.click('button[aria-label="Delete AssignedCategory"]');
    await page.click('button:has-text("Confirm")');
    
    await page.goto('/tasks');
    await page.click('text=Task with AssignedCategory');
    await expect(page.locator('text=AssignedCategory')).not.toBeVisible();
  });

  test('should reject assigning a non-existent category to a task', async ({ page }) => {
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="categorySearch"]', 'NonExistent12345');
    await expect(page.locator('text=No categories found')).toBeVisible();
  });

  test('should handle unassigning the last category from a task (empty category state)', async ({ page }) => {
    await page.click('text=Task with One Category');
    await page.click('button[aria-label="Remove Category"]');
    await expect(page.locator('text=No categories assigned')).toBeVisible();
  });

  test('should prevent assigning the same category to a task multiple times', async ({ page }) => {
    await page.click('text=Task for Duplicate Category');
    await page.click('button:has-text("Assign Category")');
    await page.click('text=Work');
    await page.click('button:has-text("Assign Category")');
    
    const workOption = page.locator('div[role="option"]:has-text("Work")');
    if (await workOption.isVisible()) {
        await workOption.click();
        await expect(page.locator('text=Category already assigned')).toBeVisible();
    }
  });
});
