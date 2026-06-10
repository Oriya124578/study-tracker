# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier3-pairwise\ai-recurring.spec.ts >> Accept AI Suggestion for a Recurring Task
- Location: e2e\tests\tier3-pairwise\ai-recurring.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'AI Assistant' })

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
  3  | test('Accept AI Suggestion for a Recurring Task', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Trigger an AI suggestion
> 7  |   await page.getByRole('button', { name: 'AI Assistant' }).click();
     |                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   await page.getByRole('button', { name: 'Suggest Habits' }).click();
  9  |   
  10 |   // Accept it
  11 |   const suggestion = page.getByText('Drink 2L Water (Daily)');
  12 |   await expect(suggestion).toBeVisible();
  13 |   await suggestion.locator('..').getByRole('button', { name: 'Accept' }).click();
  14 | 
  15 |   // Verify the correct recurring sequence is generated in the calendar
  16 |   await page.getByRole('link', { name: 'Calendar' }).click();
  17 |   await page.getByRole('button', { name: 'Week' }).click();
  18 |   
  19 |   const tasks = page.locator('text=Drink 2L Water');
  20 |   // At least 7 instances in a week view
  21 |   expect(await tasks.count()).toBeGreaterThanOrEqual(7);
  22 | });
  23 | 
```