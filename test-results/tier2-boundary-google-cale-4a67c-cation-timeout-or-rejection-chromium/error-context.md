# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier2-boundary\google-calendar.spec.ts >> Google Calendar Integration - Boundary & Corner Cases >> should gracefully handle Google Calendar authentication timeout or rejection
- Location: e2e\tests\tier2-boundary\google-calendar.spec.ts:8:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Connect Google Calendar")')

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
  3  | test.describe('Google Calendar Integration - Boundary & Corner Cases', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/integrations/google-calendar');
  6  |   });
  7  | 
  8  |   test('should gracefully handle Google Calendar authentication timeout or rejection', async ({ page }) => {
> 9  |     await page.click('button:has-text("Connect Google Calendar")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  10 |     await expect(page.locator('text=Authentication failed or timed out')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should correctly handle syncing an event with an extremely long title and description', async ({ page }) => {
  14 |     await page.goto('/calendar');
  15 |     await page.click('button:has-text("New Event")');
  16 |     await page.fill('input[name="title"]', 'A'.repeat(500));
  17 |     await page.fill('textarea[name="description"]', 'B'.repeat(10000));
  18 |     await page.click('button:has-text("Save to Google Calendar")');
  19 |     await expect(page.locator('text=Event synced successfully')).toBeVisible();
  20 |   });
  21 | 
  22 |   test('should handle rate limits (429 Too Many Requests) gracefully during mass sync', async ({ page }) => {
  23 |     await page.goto('/integrations/google-calendar');
  24 |     await page.click('button:has-text("Sync All Events")');
  25 |     await page.route('**/api/calendar/sync', route => {
  26 |         route.fulfill({ status: 429, body: 'Too Many Requests' });
  27 |     });
  28 |     await expect(page.locator('text=Sync paused due to rate limits. Retrying shortly.')).toBeVisible();
  29 |   });
  30 | 
  31 |   test('should handle syncing a calendar with zero events', async ({ page }) => {
  32 |     await page.click('button:has-text("Sync Calendar")');
  33 |     await expect(page.locator('text=No new events to sync')).toBeVisible();
  34 |   });
  35 | 
  36 |   test('should handle simultaneous offline creation of events and conflicting Google Calendar sync', async ({ page }) => {
  37 |     await page.context().setOffline(true);
  38 |     await page.goto('/calendar');
  39 |     await page.click('button:has-text("New Event")');
  40 |     await page.fill('input[name="title"]', 'Offline Event');
  41 |     await page.click('button:has-text("Save")');
  42 |     
  43 |     await page.context().setOffline(false);
  44 |     await page.click('button:has-text("Sync Calendar")');
  45 |     await expect(page.locator('text=Conflict detected').or(page.locator('text=Event synced successfully'))).toBeVisible();
  46 |   });
  47 | });
  48 | 
```