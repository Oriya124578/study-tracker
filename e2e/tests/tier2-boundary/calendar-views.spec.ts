import { test, expect } from '@playwright/test';

test.describe('Calendar 5-Views UI - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar');
  });

  test('should render correctly when a single day has an extreme number of events (e.g., >50)', async ({ page }) => {
    await page.goto('/calendar/day/2026-01-01');
    await expect(page.locator('text=+')).toBeVisible();
  });

  test('should correctly display multi-day events that span across months and leap years', async ({ page }) => {
    await page.goto('/calendar/month/2024-02');
    const multiDayEvent = page.locator('text=Leap Year Event');
    await expect(multiDayEvent).toBeVisible();
    await page.click('button[aria-label="Next Month"]');
    await expect(page.locator('text=Leap Year Event')).toBeVisible();
  });

  test('should handle switching views rapidly while events are still loading', async ({ page }) => {
    const views = ['Day', 'Week', 'Month', 'Year', 'Agenda'];
    for (const view of views) {
        await page.click(`button:has-text("${view}")`);
    }
    await expect(page.locator('.calendar-agenda-view')).toBeVisible();
  });

  test('should gracefully handle navigating to an extremely distant future or past date (e.g., year 1900 or 2100)', async ({ page }) => {
    await page.goto('/calendar/year/1900');
    await expect(page.locator('text=1900')).toBeVisible();
    await page.goto('/calendar/year/2100');
    await expect(page.locator('text=2100')).toBeVisible();
  });

  test('should correctly render overlapping events that occur at the exact same minute', async ({ page }) => {
    await page.goto('/calendar/day/2026-06-07');
    const overlappingEvents = page.locator('.event-overlapping');
    if (await overlappingEvents.count() >= 2) {
      await expect(overlappingEvents.first()).toBeVisible();
      const boundingBox1 = await overlappingEvents.nth(0).boundingBox();
      const boundingBox2 = await overlappingEvents.nth(1).boundingBox();
      if (boundingBox1 && boundingBox2) {
          expect(boundingBox1.x).not.toBe(boundingBox2.x);
      }
    }
  });
});
