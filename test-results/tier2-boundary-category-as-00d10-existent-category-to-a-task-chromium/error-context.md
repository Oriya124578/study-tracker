# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tier2-boundary\category-assignment.spec.ts >> Assign Categories to Tasks - Boundary & Corner Cases >> should reject assigning a non-existent category to a task
- Location: e2e\tests\tier2-boundary\category-assignment.spec.ts:31:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Add Task")')

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
  3  | test.describe('Assign Categories to Tasks - Boundary & Corner Cases', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/tasks');
  6  |   });
  7  | 
  8  |   test('should handle assigning the maximum allowed number of categories to a single task', async ({ page }) => {
  9  |     await page.click('button:has-text("Add Task")');
  10 |     await page.fill('input[name="taskName"]', 'Multi-category Task');
  11 |     
  12 |     for (let i = 1; i <= 10; i++) {
  13 |         await page.click('button:has-text("Assign Category")');
  14 |         await page.click(`text=Category ${i}`);
  15 |     }
  16 |     
  17 |     await page.click('button:has-text("Assign Category")');
  18 |     await expect(page.locator('text=Maximum number of categories reached')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('should correctly handle deleting a category that is currently assigned to a task', async ({ page }) => {
  22 |     await page.goto('/categories');
  23 |     await page.click('button[aria-label="Delete AssignedCategory"]');
  24 |     await page.click('button:has-text("Confirm")');
  25 |     
  26 |     await page.goto('/tasks');
  27 |     await page.click('text=Task with AssignedCategory');
  28 |     await expect(page.locator('text=AssignedCategory')).not.toBeVisible();
  29 |   });
  30 | 
  31 |   test('should reject assigning a non-existent category to a task', async ({ page }) => {
> 32 |     await page.click('button:has-text("Add Task")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  33 |     await page.fill('input[name="categorySearch"]', 'NonExistent12345');
  34 |     await expect(page.locator('text=No categories found')).toBeVisible();
  35 |   });
  36 | 
  37 |   test('should handle unassigning the last category from a task (empty category state)', async ({ page }) => {
  38 |     await page.click('text=Task with One Category');
  39 |     await page.click('button[aria-label="Remove Category"]');
  40 |     await expect(page.locator('text=No categories assigned')).toBeVisible();
  41 |   });
  42 | 
  43 |   test('should prevent assigning the same category to a task multiple times', async ({ page }) => {
  44 |     await page.click('text=Task for Duplicate Category');
  45 |     await page.click('button:has-text("Assign Category")');
  46 |     await page.click('text=Work');
  47 |     await page.click('button:has-text("Assign Category")');
  48 |     
  49 |     const workOption = page.locator('div[role="option"]:has-text("Work")');
  50 |     if (await workOption.isVisible()) {
  51 |         await workOption.click();
  52 |         await expect(page.locator('text=Category already assigned')).toBeVisible();
  53 |     }
  54 |   });
  55 | });
  56 | 
```