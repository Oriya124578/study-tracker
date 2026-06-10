# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier2-boundary\recurring-tasks.spec.ts >> Recurring Tasks - Boundary & Corner Cases >> should handle modifying a single instance of a recurring task without breaking the series
- Location: e2e\tests\tier2-boundary\recurring-tasks.spec.ts:21:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Daily Workout (Instance)')
    - waiting for" http://localhost:5173/" navigation to finish...
    - navigated to "http://localhost:5173/"

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
  3  | test.describe('Recurring Tasks - Boundary & Corner Cases', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/tasks/recurring');
  6  |   });
  7  | 
  8  |   test('should handle creating a recurring task with an end date in the past', async ({ page }) => {
  9  |     await page.click('button:has-text("New Recurring Task")');
  10 |     await page.fill('input[name="taskName"]', 'Past End Date Task');
  11 |     await page.fill('input[name="endDate"]', '2000-01-01');
  12 |     await page.click('button:has-text("Save")');
  13 |     await expect(page.locator('text=End date cannot be in the past')).toBeVisible();
  14 |   });
  15 | 
  16 |   test('should correctly generate instances for a daily recurring task spanning across a leap year/day (Feb 29)', async ({ page }) => {
  17 |     await page.goto('/calendar/month/2024-02');
  18 |     await expect(page.locator('div[data-date="2024-02-29"] .recurring-task-instance')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('should handle modifying a single instance of a recurring task without breaking the series', async ({ page }) => {
  22 |     await page.goto('/tasks');
> 23 |     await page.click('text=Daily Workout (Instance)');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  24 |     await page.click('button:has-text("Edit")');
  25 |     await page.fill('input[name="taskName"]', 'Daily Workout - Modified');
  26 |     await page.click('button:has-text("Save Only This Instance")');
  27 |     await expect(page.locator('text=Daily Workout - Modified')).toBeVisible();
  28 |   });
  29 | 
  30 |   test('should prevent creating a recurring task with zero interval (e.g., every 0 days)', async ({ page }) => {
  31 |     await page.click('button:has-text("New Recurring Task")');
  32 |     await page.fill('input[name="taskName"]', 'Zero Interval Task');
  33 |     await page.fill('input[name="interval"]', '0');
  34 |     await page.click('button:has-text("Save")');
  35 |     await expect(page.locator('text=Interval must be greater than 0')).toBeVisible();
  36 |   });
  37 | 
  38 |   test('should handle deleting a recurring task series that has thousands of future instances', async ({ page }) => {
  39 |     await page.click('text=Infinite Task Series');
  40 |     await page.click('button:has-text("Delete Series")');
  41 |     await page.click('button:has-text("Confirm")');
  42 |     await expect(page.locator('text=Series deleted successfully')).toBeVisible();
  43 |   });
  44 | });
  45 | 
```