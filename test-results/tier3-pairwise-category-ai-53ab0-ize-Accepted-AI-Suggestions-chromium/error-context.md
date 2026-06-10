# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier3-pairwise\category-ai.spec.ts >> Categorize Accepted AI Suggestions
- Location: e2e\tests\tier3-pairwise\category-ai.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Settings' })

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
  3  | test('Categorize Accepted AI Suggestions', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Create a custom category first
> 7  |   await page.getByRole('button', { name: 'Settings' }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   await page.getByRole('link', { name: 'Categories' }).click();
  9  |   await page.getByRole('button', { name: 'New Category' }).click();
  10 |   await page.getByLabel('Category Name').fill('Wellness');
  11 |   await page.getByRole('button', { name: 'Save' }).click();
  12 | 
  13 |   // Receive AI suggestions and accept them
  14 |   await page.getByRole('button', { name: 'AI Assistant' }).click();
  15 |   await page.getByRole('button', { name: 'Suggest Tasks' }).click();
  16 |   await page.getByRole('button', { name: 'Accept "Meditate"' }).click();
  17 | 
  18 |   // Immediately assign custom category to the newly created task
  19 |   await page.getByRole('link', { name: 'Tasks' }).click();
  20 |   await page.getByText('Meditate').click();
  21 |   await page.getByRole('button', { name: 'Edit Task' }).click();
  22 |   await page.getByLabel('Category').selectOption('Wellness');
  23 |   await page.getByRole('button', { name: 'Save' }).click();
  24 | 
  25 |   // Verify categories persist after reloading
  26 |   await page.reload();
  27 |   await page.getByRole('link', { name: 'Tasks' }).click();
  28 |   await expect(page.getByText('Meditate')).toBeVisible();
  29 |   await page.getByText('Meditate').click();
  30 |   await expect(page.getByLabel('Category')).toHaveValue('Wellness');
  31 | });
  32 | 
```