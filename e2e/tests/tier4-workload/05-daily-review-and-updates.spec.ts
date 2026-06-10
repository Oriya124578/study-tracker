import { test, expect } from '@playwright/test';

test.describe('Workflow 5: Edit category, verify updates in 5-Views UI, modify recurring task, and reject an AI suggestion', () => {
  test('should handle daily review tasks spanning categories, calendar views, recurring tasks, and AI suggestions', async ({ page }) => {
    await page.goto('/');

    // 1. Edit a category (F1: Category Management)
    await page.getByRole('link', { name: /categories/i }).click();
    await page.getByRole('button', { name: /edit category 'fitness'/i }).click();
    await page.getByLabel(/color/i).fill('#00ff00');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(/category updated successfully/i)).toBeVisible();

    // 2. Verify updates in 5-Views UI (F6: Calendar 5-Views UI)
    await page.getByRole('link', { name: /calendar/i }).click();
    
    const views = ['Day View', 'Week View', 'Month View', 'Year View', 'Schedule View'];
    for (const view of views) {
      await page.getByRole('button', { name: new RegExp(view, 'i') }).click();
      // Verifying the view has rendered by checking for a common element or a specific title
      // We assume there's a heading indicating the current view or the events show up
      await expect(page.locator('.calendar-container')).toBeVisible();
    }

    // 3. Modify recurring task (F7: Recurring Tasks)
    await page.getByRole('link', { name: /tasks/i }).click();
    await page.getByRole('button', { name: /edit task 'morning workout'/i }).click();
    
    // Change recurrence from daily to weekly
    await page.getByLabel(/recurrence/i).selectOption('weekly');
    await page.getByRole('button', { name: /save task/i }).click();
    await expect(page.getByText(/task updated successfully/i)).toBeVisible();

    // 4. Reject an AI suggestion (F8: AI Suggestions (Accept/Reject))
    await page.getByRole('link', { name: /suggestions/i }).click();
    
    const suggestionCard = page.locator('.ai-suggestion', { hasText: 'Try a low-carb diet today' });
    await expect(suggestionCard).toBeVisible();
    
    await suggestionCard.getByRole('button', { name: /reject/i }).click();
    
    // Suggestion should disappear
    await expect(suggestionCard).not.toBeVisible();
    await expect(page.getByText(/suggestion dismissed/i)).toBeVisible();
  });
});
