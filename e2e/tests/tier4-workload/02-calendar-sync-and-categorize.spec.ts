import { test, expect } from '@playwright/test';

test.describe('Workflow 2: Connect Google Calendar, view an event in the Week view, and add a category to it', () => {
  test('should connect calendar, display events in week view, and allow categorization', async ({ page }) => {
    await page.goto('/');

    // 1. Connect Google Calendar (F5: Google Calendar Integration)
    await page.getByRole('link', { name: /settings/i }).click();
    await page.getByRole('link', { name: /integrations/i }).click();
    await page.getByRole('button', { name: /connect google calendar/i }).click();
    
    // Simulating OAuth return
    await expect(page.getByText(/google calendar connected/i)).toBeVisible();

    // 2. View event in Week view (F6: Calendar 5-Views UI)
    await page.getByRole('link', { name: /calendar/i }).click();
    await page.getByRole('button', { name: /week view/i }).click();
    
    // Find a mock event that was synced
    const eventLocator = page.getByRole('button', { name: /team meeting/i });
    await expect(eventLocator).toBeVisible();

    // 3. Add a category to the event (F2: Assign Categories to Tasks)
    await eventLocator.click();
    
    // Modal opens
    await expect(page.getByRole('dialog', { name: /event details/i })).toBeVisible();
    
    // Select category
    await page.getByLabel(/category/i).selectOption('Work');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText(/event updated successfully/i)).toBeVisible();
  });
});
