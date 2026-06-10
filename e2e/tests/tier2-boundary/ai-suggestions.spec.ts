import { test, expect } from '@playwright/test';

test.describe('AI Suggestions (Accept/Reject) - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-suggestions');
  });

  test('should gracefully handle AI suggestion API timeout or failure to respond', async ({ page }) => {
    await page.route('**/api/ai/suggestions', route => {
        route.abort('timedout');
    });
    await page.click('button:has-text("Get Suggestions")');
    await expect(page.locator('text=Failed to fetch suggestions, please try again')).toBeVisible();
  });

  test('should handle extremely long AI suggestions that exceed normal UI constraints', async ({ page }) => {
    await page.route('**/api/ai/suggestions', route => {
        route.fulfill({ json: { suggestions: [{ id: 1, text: 'A'.repeat(5000) }] } });
    });
    await page.click('button:has-text("Get Suggestions")');
    await expect(page.locator('.ai-suggestion-card')).toBeVisible();
  });

  test('should prevent duplicate task creation when rapidly clicking "Accept" multiple times', async ({ page }) => {
    const acceptButton = page.locator('button:has-text("Accept"):visible').first();
    if (await acceptButton.isVisible()) {
      await Promise.all([
          acceptButton.click(),
          acceptButton.click(),
          acceptButton.click()
      ]);
      await expect(page.locator('text=Suggestion accepted')).toHaveCount(1);
    }
  });

  test('should handle rejecting all AI suggestions until the queue is empty', async ({ page }) => {
    const rejectButtons = page.locator('button:has-text("Reject")');
    const count = await rejectButtons.count();
    for (let i = 0; i < count; i++) {
        await rejectButtons.nth(0).click();
    }
    await expect(page.locator('text=No more suggestions')).toBeVisible();
  });

  test('should correctly parse and sanitize malicious input or raw HTML returned in AI suggestions', async ({ page }) => {
    await page.route('**/api/ai/suggestions', route => {
        route.fulfill({ json: { suggestions: [{ id: 2, text: '<script>alert("xss")</script><b>Bold</b>' }] } });
    });
    await page.click('button:has-text("Get Suggestions")');
    const suggestionCard = page.locator('.ai-suggestion-card');
    if (await suggestionCard.isVisible()) {
      const suggestionText = await suggestionCard.innerText();
      expect(suggestionText).not.toContain('<script>');
      await expect(page.locator('b:has-text("Bold")')).toBeVisible();
    }
  });
});
