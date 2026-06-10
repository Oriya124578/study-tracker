import { test, expect } from '@playwright/test';

test.describe('Recurring Tasks - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks/recurring');
  });

  test('should handle creating a recurring task with an end date in the past', async ({ page }) => {
    await page.click('button:has-text("New Recurring Task")');
    await page.fill('input[name="taskName"]', 'Past End Date Task');
    await page.fill('input[name="endDate"]', '2000-01-01');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=End date cannot be in the past')).toBeVisible();
  });

  test('should correctly generate instances for a daily recurring task spanning across a leap year/day (Feb 29)', async ({ page }) => {
    await page.goto('/calendar/month/2024-02');
    await expect(page.locator('div[data-date="2024-02-29"] .recurring-task-instance')).toBeVisible();
  });

  test('should handle modifying a single instance of a recurring task without breaking the series', async ({ page }) => {
    await page.goto('/tasks');
    await page.click('text=Daily Workout (Instance)');
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="taskName"]', 'Daily Workout - Modified');
    await page.click('button:has-text("Save Only This Instance")');
    await expect(page.locator('text=Daily Workout - Modified')).toBeVisible();
  });

  test('should prevent creating a recurring task with zero interval (e.g., every 0 days)', async ({ page }) => {
    await page.click('button:has-text("New Recurring Task")');
    await page.fill('input[name="taskName"]', 'Zero Interval Task');
    await page.fill('input[name="interval"]', '0');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Interval must be greater than 0')).toBeVisible();
  });

  test('should handle deleting a recurring task series that has thousands of future instances', async ({ page }) => {
    await page.click('text=Infinite Task Series');
    await page.click('button:has-text("Delete Series")');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text=Series deleted successfully')).toBeVisible();
  });
});
