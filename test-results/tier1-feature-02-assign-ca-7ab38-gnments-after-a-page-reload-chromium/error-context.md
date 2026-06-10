# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier1-feature\02-assign-categories.spec.ts >> Assign Categories to Tasks >> should persist category assignments after a page reload
- Location: e2e\tests\tier1-feature\02-assign-categories.spec.ts:37:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('listitem').filter({ hasText: 'Task with Category' }).getByText('Personal')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('listitem').filter({ hasText: 'Task with Category' }).getByText('Personal')

```

```yaml
- text: calori life
- paragraph: התחבר כדי להמשיך לנהל את היום שלך
- text: אימייל
- textbox "כתובת אימייל"
- text: סיסמה
- textbox "סיסמה (מינימום 6 תווים)"
- button "התחבר"
- text: או
- button "התחבר עם Google"
- button "אין לך חשבון? הרשם עכשיו"
- button "שכחת סיסמה? שחזר כאן"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Assign Categories to Tasks', () => {
  4  |   test('should allow assigning an existing category to a new task via a select modal or chips', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await page.getByRole('button', { name: 'New Task' }).click();
  7  |     await page.getByRole('textbox', { name: 'Task Title' }).fill('Task with Category');
  8  |     
  9  |     await page.getByRole('button', { name: 'Assign Category' }).click();
  10 |     await page.getByRole('button', { name: 'Work' }).click();
  11 |     await page.getByRole('button', { name: 'Save Task' }).click();
  12 |     
  13 |     await expect(page.getByText('Task with Category')).toBeVisible();
  14 |     await expect(page.getByText('Work')).toBeVisible();
  15 |   });
  16 | 
  17 |   test('should update a task to add or remove category assignments', async ({ page }) => {
  18 |     await page.goto('/');
  19 |     const task = page.getByRole('listitem').filter({ hasText: 'Existing Task' });
  20 |     await task.click(); // Open task details
  21 |     
  22 |     await page.getByRole('button', { name: 'Assign Category' }).click();
  23 |     await page.getByRole('button', { name: 'Personal' }).click();
  24 |     
  25 |     // Close modal or save
  26 |     await page.getByRole('button', { name: 'Close' }).click();
  27 |     
  28 |     await expect(page.getByText('Personal')).toBeVisible();
  29 |   });
  30 | 
  31 |   test('should display the correct category chips on a categorized task in the list', async ({ page }) => {
  32 |     await page.goto('/');
  33 |     const task = page.getByRole('listitem').filter({ hasText: 'Categorized Task' });
  34 |     await expect(task.getByText('Work')).toBeVisible();
  35 |   });
  36 | 
  37 |   test('should persist category assignments after a page reload', async ({ page }) => {
  38 |     await page.goto('/');
  39 |     // Assuming task is created with category 'Personal'
  40 |     await page.reload();
  41 |     const task = page.getByRole('listitem').filter({ hasText: 'Task with Category' });
> 42 |     await expect(task.getByText('Personal')).toBeVisible();
     |                                              ^ Error: expect(locator).toBeVisible() failed
  43 |   });
  44 | 
  45 |   test('should handle tasks with multiple categories assigned correctly', async ({ page }) => {
  46 |     await page.goto('/');
  47 |     await page.getByRole('button', { name: 'New Task' }).click();
  48 |     await page.getByRole('textbox', { name: 'Task Title' }).fill('Multi-category Task');
  49 |     
  50 |     await page.getByRole('button', { name: 'Assign Category' }).click();
  51 |     await page.getByRole('button', { name: 'Work' }).click();
  52 |     await page.getByRole('button', { name: 'Personal' }).click();
  53 |     
  54 |     await page.getByRole('button', { name: 'Save Task' }).click();
  55 |     
  56 |     const task = page.getByRole('listitem').filter({ hasText: 'Multi-category Task' });
  57 |     await expect(task.getByText('Work')).toBeVisible();
  58 |     await expect(task.getByText('Personal')).toBeVisible();
  59 |   });
  60 | });
  61 | 
```