# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier3-pairwise\category-recurring.spec.ts >> Edit and Delete Category Assigned to a Recurring Task
- Location: e2e\tests\tier3-pairwise\category-recurring.spec.ts:3:1

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
  3  | test('Edit and Delete Category Assigned to a Recurring Task', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Create a category
> 7  |   await page.getByRole('button', { name: 'Settings' }).click();
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  8  |   await page.getByRole('link', { name: 'Categories' }).click();
  9  |   await page.getByRole('button', { name: 'New Category' }).click();
  10 |   await page.getByLabel('Category Name').fill('Fitness');
  11 |   await page.getByLabel('Color').fill('#ff0000');
  12 |   await page.getByRole('button', { name: 'Save' }).click();
  13 | 
  14 |   // Create a recurring task
  15 |   await page.getByRole('link', { name: 'Tasks' }).click();
  16 |   await page.getByRole('button', { name: 'New Task' }).click();
  17 |   await page.getByLabel('Task Name').fill('Morning Run');
  18 |   await page.getByLabel('Category').selectOption('Fitness');
  19 |   await page.getByLabel('Recurring').check();
  20 |   await page.getByLabel('Frequency').selectOption('Daily');
  21 |   await page.getByRole('button', { name: 'Create Task' }).click();
  22 | 
  23 |   // Modify the category color/name
  24 |   await page.getByRole('link', { name: 'Categories' }).click();
  25 |   await page.getByText('Fitness').click();
  26 |   await page.getByLabel('Category Name').fill('Cardio');
  27 |   await page.getByRole('button', { name: 'Save' }).click();
  28 | 
  29 |   // Verify future instances update
  30 |   await page.getByRole('link', { name: 'Calendar' }).click();
  31 |   await expect(page.getByText('Morning Run').first()).toHaveAttribute('data-category', 'Cardio');
  32 | 
  33 |   // Delete the category
  34 |   await page.getByRole('link', { name: 'Categories' }).click();
  35 |   await page.getByText('Cardio').click();
  36 |   await page.getByRole('button', { name: 'Delete' }).click();
  37 |   await page.getByRole('button', { name: 'Confirm Delete' }).click();
  38 | 
  39 |   // Verify recurring instances handle the deleted reference gracefully
  40 |   await page.getByRole('link', { name: 'Calendar' }).click();
  41 |   await expect(page.getByText('Morning Run').first()).toBeVisible();
  42 |   await expect(page.getByText('Morning Run').first()).not.toHaveAttribute('data-category', 'Cardio');
  43 | });
  44 | 
```