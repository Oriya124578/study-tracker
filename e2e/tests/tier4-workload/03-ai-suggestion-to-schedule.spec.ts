import { test, expect } from '@playwright/test';

test.describe('Workflow 3: Receive an AI suggestion, accept it, which creates a categorized recurring task, and view it in Schedule view', () => {
  test('should process AI suggestion into categorized recurring task and show in schedule', async ({ page }) => {
    await page.goto('/');

    // 1. Receive and accept an AI suggestion (F8: AI Suggestions (Accept/Reject))
    await page.getByRole('link', { name: /suggestions/i }).click();
    
    const suggestionCard = page.locator('.ai-suggestion', { hasText: 'Start a 30-minute daily walk' });
    await expect(suggestionCard).toBeVisible();
    
    // Accept suggestion
    await suggestionCard.getByRole('button', { name: /accept/i }).click();

    // 2. Modifying the generated task parameters (F1: Category Management, F2: Assign Categories, F7: Recurring Tasks)
    await expect(page.getByRole('dialog', { name: /configure task/i })).toBeVisible();
    
    // Ensure it's set as recurring
    await expect(page.getByLabel(/recurrence/i)).toHaveValue('daily');
    
    // Assign a category (F2) and potentially create a new one (F1) if needed, but let's just assign
    await page.getByLabel(/category/i).selectOption('Health');
    
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/suggestion converted to task/i)).toBeVisible();

    // 3. View in Schedule view (F6: Calendar 5-Views UI)
    await page.getByRole('link', { name: /calendar/i }).click();
    await page.getByRole('button', { name: /schedule view/i }).click();
    
    // Check if the recurring task is present in the schedule list
    await expect(page.getByText('Start a 30-minute daily walk').first()).toBeVisible();
  });
});
