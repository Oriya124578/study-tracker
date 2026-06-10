# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier3-pairwise\views-recurring.spec.ts >> Verify Recurring Tasks across all 5 Calendar Views
- Location: e2e\tests\tier3-pairwise\views-recurring.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'New Task' })

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
  3  | test('Verify Recurring Tasks across all 5 Calendar Views', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Create a daily and a weekly recurring task
> 7  |   await page.getByRole('button', { name: 'New Task' }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   await page.getByLabel('Task Name').fill('Daily Reading');
  9  |   await page.getByLabel('Recurring').check();
  10 |   await page.getByLabel('Frequency').selectOption('Daily');
  11 |   await page.getByRole('button', { name: 'Create Task' }).click();
  12 | 
  13 |   await page.getByRole('button', { name: 'New Task' }).click();
  14 |   await page.getByLabel('Task Name').fill('Weekly Review');
  15 |   await page.getByLabel('Recurring').check();
  16 |   await page.getByLabel('Frequency').selectOption('Weekly');
  17 |   await page.getByRole('button', { name: 'Create Task' }).click();
  18 | 
  19 |   await page.getByRole('link', { name: 'Calendar' }).click();
  20 | 
  21 |   // Day View
  22 |   await page.getByRole('button', { name: 'Day' }).click();
  23 |   await expect(page.getByText('Daily Reading').first()).toBeVisible();
  24 | 
  25 |   // Week View
  26 |   await page.getByRole('button', { name: 'Week' }).click();
  27 |   await expect(page.getByText('Daily Reading').first()).toBeVisible();
  28 |   await expect(page.getByText('Weekly Review').first()).toBeVisible();
  29 | 
  30 |   // Month View
  31 |   await page.getByRole('button', { name: 'Month' }).click();
  32 |   await expect(page.getByText('Daily Reading').first()).toBeVisible();
  33 |   await expect(page.getByText('Weekly Review').first()).toBeVisible();
  34 | 
  35 |   // Schedule View
  36 |   await page.getByRole('button', { name: 'Schedule' }).click();
  37 |   await expect(page.getByText('Daily Reading').first()).toBeVisible();
  38 |   await expect(page.getByText('Weekly Review').first()).toBeVisible();
  39 | 
  40 |   // Agenda View
  41 |   await page.getByRole('button', { name: 'Agenda' }).click();
  42 |   await expect(page.getByText('Daily Reading').first()).toBeVisible();
  43 |   await expect(page.getByText('Weekly Review').first()).toBeVisible();
  44 | });
  45 | 
```