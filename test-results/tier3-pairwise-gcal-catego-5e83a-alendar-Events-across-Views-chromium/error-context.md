# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier3-pairwise\gcal-category-views.spec.ts >> Assign Categories to Google Calendar Events across Views
- Location: e2e\tests\tier3-pairwise\gcal-category-views.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Settings' })
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
  3  | test('Assign Categories to Google Calendar Events across Views', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Sync a Google Calendar event (mocked through UI interactions)
> 7  |   await page.getByRole('button', { name: 'Settings' }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   await page.getByRole('link', { name: 'Integrations' }).click();
  9  |   await page.getByRole('button', { name: 'Connect Google Calendar' }).click();
  10 |   await expect(page.getByText('Connected to Google Calendar')).toBeVisible();
  11 | 
  12 |   // Navigate to Calendar and find an imported event
  13 |   await page.getByRole('link', { name: 'Calendar' }).click();
  14 |   const event = page.getByText('Team Meeting (GCal)');
  15 |   await event.click();
  16 | 
  17 |   // Assign custom category
  18 |   await page.getByRole('button', { name: 'Edit Event' }).click();
  19 |   await page.getByLabel('Category').selectOption('Work');
  20 |   await page.getByRole('button', { name: 'Save' }).click();
  21 | 
  22 |   // Switch between Month, Week, and Day views to ensure event retains label
  23 |   // Month View
  24 |   await page.getByRole('button', { name: 'Month' }).click();
  25 |   await expect(event).toHaveAttribute('data-category', 'Work');
  26 | 
  27 |   // Week View
  28 |   await page.getByRole('button', { name: 'Week' }).click();
  29 |   await expect(event).toHaveAttribute('data-category', 'Work');
  30 | 
  31 |   // Day View
  32 |   await page.getByRole('button', { name: 'Day' }).click();
  33 |   await expect(event).toHaveAttribute('data-category', 'Work');
  34 | });
  35 | 
```