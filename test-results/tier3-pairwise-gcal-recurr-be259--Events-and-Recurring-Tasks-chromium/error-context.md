# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier3-pairwise\gcal-recurring.spec.ts >> Overlap Handling of GCal Events and Recurring Tasks
- Location: e2e\tests\tier3-pairwise\gcal-recurring.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'New Task' })
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
  3  | test('Overlap Handling of GCal Events and Recurring Tasks', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Create a recurring task overlapping with a known Google Calendar synced event
> 7  |   await page.getByRole('button', { name: 'New Task' }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   await page.getByLabel('Task Name').fill('Lunch Break');
  9  |   await page.getByLabel('Recurring').check();
  10 |   await page.getByLabel('Frequency').selectOption('Daily');
  11 |   await page.getByLabel('Time').fill('12:00');
  12 |   await page.getByRole('button', { name: 'Create Task' }).click();
  13 | 
  14 |   // Connect GCal
  15 |   await page.getByRole('button', { name: 'Settings' }).click();
  16 |   await page.getByRole('link', { name: 'Integrations' }).click();
  17 |   await page.getByRole('button', { name: 'Connect Google Calendar' }).click();
  18 | 
  19 |   // Verify UI handles visual overlap gracefully in Day view
  20 |   await page.getByRole('link', { name: 'Calendar' }).click();
  21 |   await page.getByRole('button', { name: 'Day' }).click();
  22 |   
  23 |   const gcalEvent = page.getByText('GCal Meeting (12:00 PM)');
  24 |   const recurringTask = page.getByText('Lunch Break');
  25 |   
  26 |   // Both should be visible and not completely obscure each other
  27 |   await expect(gcalEvent).toBeVisible();
  28 |   await expect(recurringTask).toBeVisible();
  29 |   
  30 |   // Check in Week view
  31 |   await page.getByRole('button', { name: 'Week' }).click();
  32 |   await expect(gcalEvent.first()).toBeVisible();
  33 |   await expect(recurringTask.first()).toBeVisible();
  34 | });
  35 | 
```