# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier2-boundary\calendar-views.spec.ts >> Calendar 5-Views UI - Boundary & Corner Cases >> should handle switching views rapidly while events are still loading
- Location: e2e\tests\tier2-boundary\calendar-views.spec.ts:21:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Day")')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]:
    - text: calori
    - generic [ref=e7]: life
  - paragraph [ref=e8]: התחבר כדי להמשיך לנהל את היום שלך
  - generic [ref=e9]:
    - generic [ref=e10]:
      - text: אימייל
      - textbox "כתובת אימייל" [ref=e11]
    - generic [ref=e12]:
      - text: סיסמה
      - textbox "סיסמה (מינימום 6 תווים)" [ref=e13]
    - button "התחבר" [ref=e14]
  - generic [ref=e19]: או
  - button "התחבר עם Google" [ref=e20]:
    - img [ref=e21]
    - text: התחבר עם Google
  - generic [ref=e26]:
    - button "אין לך חשבון? הרשם עכשיו" [ref=e27] [cursor=pointer]
    - button "שכחת סיסמה? שחזר כאן" [ref=e28] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Calendar 5-Views UI - Boundary & Corner Cases', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/calendar');
  6  |   });
  7  | 
  8  |   test('should render correctly when a single day has an extreme number of events (e.g., >50)', async ({ page }) => {
  9  |     await page.goto('/calendar/day/2026-01-01');
  10 |     await expect(page.locator('text=+')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should correctly display multi-day events that span across months and leap years', async ({ page }) => {
  14 |     await page.goto('/calendar/month/2024-02');
  15 |     const multiDayEvent = page.locator('text=Leap Year Event');
  16 |     await expect(multiDayEvent).toBeVisible();
  17 |     await page.click('button[aria-label="Next Month"]');
  18 |     await expect(page.locator('text=Leap Year Event')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('should handle switching views rapidly while events are still loading', async ({ page }) => {
  22 |     const views = ['Day', 'Week', 'Month', 'Year', 'Agenda'];
  23 |     for (const view of views) {
> 24 |         await page.click(`button:has-text("${view}")`);
     |                    ^ Error: page.click: Test timeout of 30000ms exceeded.
  25 |     }
  26 |     await expect(page.locator('.calendar-agenda-view')).toBeVisible();
  27 |   });
  28 | 
  29 |   test('should gracefully handle navigating to an extremely distant future or past date (e.g., year 1900 or 2100)', async ({ page }) => {
  30 |     await page.goto('/calendar/year/1900');
  31 |     await expect(page.locator('text=1900')).toBeVisible();
  32 |     await page.goto('/calendar/year/2100');
  33 |     await expect(page.locator('text=2100')).toBeVisible();
  34 |   });
  35 | 
  36 |   test('should correctly render overlapping events that occur at the exact same minute', async ({ page }) => {
  37 |     await page.goto('/calendar/day/2026-06-07');
  38 |     const overlappingEvents = page.locator('.event-overlapping');
  39 |     if (await overlappingEvents.count() >= 2) {
  40 |       await expect(overlappingEvents.first()).toBeVisible();
  41 |       const boundingBox1 = await overlappingEvents.nth(0).boundingBox();
  42 |       const boundingBox2 = await overlappingEvents.nth(1).boundingBox();
  43 |       if (boundingBox1 && boundingBox2) {
  44 |           expect(boundingBox1.x).not.toBe(boundingBox2.x);
  45 |       }
  46 |     }
  47 |   });
  48 | });
  49 | 
```